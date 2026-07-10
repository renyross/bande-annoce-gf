const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.sqlite');
const EMAILS_LOG_FILE = path.join(__dirname, 'sent_emails.json');

// Middleware for JSON parsing and urlencoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Initialization
const db = new DatabaseSync(DB_FILE);
db.exec(`
  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    slot TEXT NOT NULL,
    people_count INTEGER NOT NULL,
    rgpd_consent INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Valid slots list
const VALID_SLOTS = [
  "12h00 – 13h30",
  "13h30 – 15h00",
  "15h00 – 16h30",
  "16h30 – 18h00",
  "18h00 – 19h30",
  "19h30 – 20h00"
];
const MAX_CAPACITY = 200;

// Helper to normalize slots (replace normal dashes/hyphens with en-dashes and spaces)
function normalizeSlot(slot) {
  if (!slot) return "";
  // Normalise spaces around hyphens or en-dashes
  return slot.replace(/\s*[-–—]\s*/, " – ").trim();
}

// Basic Authentication Middleware for Admin routes
function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Galactik Football"');
    return res.status(401).send('Authentification requise.');
  }

  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  const user = auth[0];
  const pass = auth[1];

  const adminUser = 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'galactik2027';

  if (user === adminUser && pass === adminPass) {
    return next();
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Galactik Football"');
    return res.status(401).send('Identifiants incorrects.');
  }
}

// Helper to get occupancy statistics for all slots
function getSlotsStats() {
  const stats = [];
  const query = db.prepare('SELECT SUM(people_count) as total FROM reservations WHERE slot = ?');
  
  for (const slot of VALID_SLOTS) {
    const row = query.get(slot);
    const registered = row && row.total ? parseInt(row.total, 10) : 0;
    stats.push({
      slot,
      capacity: MAX_CAPACITY,
      registered,
      remaining: Math.max(0, MAX_CAPACITY - registered)
    });
  }
  return stats;
}

// Helper to log sent emails to a file
function logEmailToFile(to, subject, body) {
  let emails = [];
  try {
    if (fs.existsSync(EMAILS_LOG_FILE)) {
      const content = fs.readFileSync(EMAILS_LOG_FILE, 'utf8');
      emails = JSON.parse(content);
    }
  } catch (err) {
    console.error("Erreur de lecture du journal des emails :", err);
  }

  emails.push({
    id: Date.now(),
    to,
    subject,
    body,
    sentAt: new Date().toISOString()
  });

  try {
    fs.writeFileSync(EMAILS_LOG_FILE, JSON.stringify(emails, null, 2), 'utf8');
  } catch (err) {
    console.error("Erreur d'écriture du journal des emails :", err);
  }
}

// Route to get slot availability
app.get('/api/slots', (req, res) => {
  try {
    const stats = getSlotsStats();
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible de récupérer les créneaux." });
  }
});

// Route to register a visitor
app.post('/api/register', async (req, res) => {
  try {
    let { firstname, lastname, email, phone, slot, people_count, rgpd_consent } = req.body;

    // Normalization and validation
    firstname = (firstname || "").trim();
    lastname = (lastname || "").trim();
    email = (email || "").trim().toLowerCase();
    phone = (phone || "").trim();
    slot = normalizeSlot(slot);
    const peopleCount = parseInt(people_count, 10);

    if (!firstname || !lastname || !email || !phone || !slot || isNaN(peopleCount) || !rgpd_consent) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires, y compris le consentement RGPD." });
    }

    if (peopleCount < 1 || peopleCount > 10) {
      return res.status(400).json({ error: "Le nombre de personnes doit être compris entre 1 et 10." });
    }

    if (!VALID_SLOTS.includes(slot)) {
      return res.status(400).json({ error: "Le créneau sélectionné est invalide." });
    }

    // Check availability
    const countQuery = db.prepare('SELECT SUM(people_count) as total FROM reservations WHERE slot = ?');
    const countRow = countQuery.get(slot);
    const currentTotal = countRow && countRow.total ? parseInt(countRow.total, 10) : 0;

    if (currentTotal + peopleCount > MAX_CAPACITY) {
      const remaining = Math.max(0, MAX_CAPACITY - currentTotal);
      return res.status(400).json({ 
        error: `Le créneau est complet ou ne dispose pas de suffisamment de places. Places restantes : ${remaining}.` 
      });
    }

    // Insert reservation
    const insertStmt = db.prepare(`
      INSERT INTO reservations (firstname, lastname, email, phone, slot, people_count, rgpd_consent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(firstname, lastname, email, phone, slot, peopleCount, rgpd_consent ? 1 : 0);

    // Email content
    const emailSubject = "Confirmation de réservation - Pop-up Store Galactik Football";
    const emailBody = `Bonjour ${firstname} ${lastname},

Votre inscription au pop-up store Galactik Football est confirmée. Merci de vous présenter à l’heure du créneau réservé.

Récapitulatif de votre réservation :
- Événement : Pop-up Store Galactik Football chez Decathlon
- Créneau : ${slot}
- Nombre de personnes : ${peopleCount}
- Téléphone : ${phone}

Merci pour votre réservation, et à bientôt dans l'univers du Flux !
L'équipe Galactik Football`;

    // Attempt to send email
    let emailSent = false;
    logEmailToFile(email, emailSubject, emailBody);

    try {
      // Configuration via variables d'environnement (si existantes)
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '1025', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        } : undefined
      });

      // Si les variables d'environnement SMTP ne sont pas fournies, on simule l'envoi
      if (process.env.SMTP_HOST) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"Galactik Football Store" <no-reply@galactikfootball.com>',
          to: email,
          subject: emailSubject,
          text: emailBody
        });
        emailSent = true;
      } else {
        console.log(`[Email Simulation] Envoi à ${email} :`);
        console.log(`Sujet : ${emailSubject}`);
        console.log(`Corps :\n${emailBody}`);
        console.log(`------------------------------------------`);
      }
    } catch (mailErr) {
      console.error("Erreur lors de l'envoi de l'email de confirmation :", mailErr);
      // On n'annule pas la réservation si l'email échoue, pour la résilience.
    }

    res.json({
      success: true,
      message: "Votre inscription au pop-up store Galactik Football est confirmée. Merci de vous présenter à l’heure du créneau réservé.",
      emailSent
    });

  } catch (err) {
    console.error("Erreur d'inscription :", err);
    res.status(500).json({ error: "Une erreur interne est survenue lors de l'inscription." });
  }
});

// Admin Route to get dashboard statistics
app.get('/api/admin/stats', adminAuth, (req, res) => {
  try {
    const stats = getSlotsStats();
    
    const totalQuery = db.prepare('SELECT COUNT(*) as count, SUM(people_count) as total_people FROM reservations');
    const totalRow = totalQuery.get();
    
    res.json({
      slots: stats,
      totalReservations: totalRow ? (totalRow.count || 0) : 0,
      totalPeople: totalRow ? (totalRow.total_people || 0) : 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible de charger les statistiques d'administration." });
  }
});

// Admin Route to get list of registrations
app.get('/api/admin/registrations', adminAuth, (req, res) => {
  try {
    const query = db.prepare('SELECT * FROM reservations ORDER BY created_at DESC');
    const rows = query.all();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible de charger les inscriptions." });
  }
});

// Admin Route to delete a registration
app.delete('/api/admin/registrations/:id', adminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const deleteStmt = db.prepare('DELETE FROM reservations WHERE id = ?');
    deleteStmt.run(id);
    res.json({ success: true, message: "Inscription supprimée avec succès." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible de supprimer l'inscription." });
  }
});

// Admin Route to get simulated/logged emails
app.get('/api/admin/emails', adminAuth, (req, res) => {
  try {
    if (fs.existsSync(EMAILS_LOG_FILE)) {
      const content = fs.readFileSync(EMAILS_LOG_FILE, 'utf8');
      res.json(JSON.parse(content));
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

// Admin Route to export CSV
app.get('/api/admin/export-csv', adminAuth, (req, res) => {
  try {
    const query = db.prepare('SELECT id, firstname, lastname, email, phone, slot, people_count, created_at FROM reservations ORDER BY slot ASC');
    const rows = query.all();

    // Entêtes CSV
    const headers = ["ID", "Prénom", "Nom", "E-mail", "Téléphone", "Créneau", "Nombre de personnes", "Date d'inscription"];
    
    // Construction des lignes CSV avec échappement
    const csvRows = [headers.join(';')];
    for (const row of rows) {
      const values = [
        row.id,
        `"${row.firstname.replace(/"/g, '""')}"`,
        `"${row.lastname.replace(/"/g, '""')}"`,
        `"${row.email.replace(/"/g, '""')}"`,
        `"${row.phone.replace(/"/g, '""')}"`,
        `"${row.slot.replace(/"/g, '""')}"`,
        row.people_count,
        row.created_at
      ];
      csvRows.push(values.join(';'));
    }

    // Ajout du BOM UTF-8 (\uFEFF) pour le support correct des accents dans Excel
    const csvContent = '\uFEFF' + csvRows.join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="inscriptions_pop_up_store.csv"');
    res.status(200).send(csvContent);

  } catch (err) {
    console.error("Erreur export CSV :", err);
    res.status(500).send("Impossible de générer l'export CSV.");
  }
});

// Admin route frontend page
app.get('/admin', adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve static assets
app.use(express.static(__dirname));

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Serveur Galactik Football actif sur le port ${PORT}`);
  console.log(`Accueil : http://localhost:${PORT}`);
  console.log(`Espace Admin : http://localhost:${PORT}/admin`);
  console.log(`Identifiants : admin / galactik2027`);
  console.log(`==================================================`);
});
