(() => {
  'use strict';

  /* ============ HEADER: shrink on scroll ============ */
  const header = document.getElementById('site-header');
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============ MOBILE NAV TOGGLE ============ */
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
  });
  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ============ SCROLL REVEAL ============ */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }



  /* ============ RESERVATION MODAL (simulated) ============ */
  const reserveBtn = document.getElementById('reserve-btn');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const modalOk = document.getElementById('modal-ok');

  function openModal() {
    modalOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }
  function closeModal() {
    modalOverlay.hidden = true;
    document.body.style.overflow = '';
  }

  if (reserveBtn) {
    reserveBtn.addEventListener('click', () => {
      reserveBtn.classList.add('is-success');
      reserveBtn.querySelector('.btn-label').textContent = '✓ Vous êtes inscrit(e) !';
      openModal();
    });
  }
  modalClose.addEventListener('click', closeModal);
  modalOk.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalOverlay.hidden) closeModal();
  });

  /* ============ NEWSLETTER (simulated) ============ */
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterFields = document.getElementById('newsletter-fields');
  const newsletterSuccess = document.getElementById('newsletter-success');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      newsletterFields.hidden = true;
      newsletterSuccess.hidden = false;
    });
  }

  /* ============ VIDEO TRAILER MODAL ============ */
  const trailerBtn = document.getElementById('hero-trailer-btn');
  const videoModalOverlay = document.getElementById('video-modal-overlay');
  const videoModalClose = document.getElementById('video-modal-close');
  const trailerVideo = document.getElementById('trailer-video');
  const heroThumbs = document.querySelectorAll('.hero-thumb');

  const openVideoModal = (src) => {
    videoModalOverlay.hidden = false;
    if (src) {
      trailerVideo.src = src;
    } else {
      trailerVideo.src = 'assets/video/histoire.mp4';
    }
    trailerVideo.load();
    trailerVideo.play().catch(() => {});
  };

  const closeVideoModal = () => {
    videoModalOverlay.hidden = true;
    trailerVideo.pause();
    trailerVideo.currentTime = 0;
  };

  if (videoModalOverlay && trailerVideo) {
    if (trailerBtn) {
      trailerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openVideoModal('assets/video/histoire.mp4');
      });
    }

    heroThumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const thumbVid = thumb.querySelector('video');
        if (thumbVid) {
          openVideoModal(thumbVid.getAttribute('src'));
        }
      });
    });

    videoModalClose.addEventListener('click', closeVideoModal);
    videoModalOverlay.addEventListener('click', (e) => {
      if (e.target === videoModalOverlay) closeVideoModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !videoModalOverlay.hidden) closeVideoModal();
    });
  }

  /* ============ POP-UP STORE REGISTRATION ============ */
  let selectedSlot = "";
  const popupForm = document.getElementById('popup-register-form');
  const slotsGrid = document.getElementById('slots-grid');
  const slotSelect = document.getElementById('register-slot');
  const peopleSelect = document.getElementById('register-people');
  const rgpdCheckbox = document.getElementById('register-rgpd');
  const popupModal = document.getElementById('popup-modal-overlay');
  const popupModalClose = document.getElementById('popup-modal-close');
  const popupModalOk = document.getElementById('popup-modal-ok');
  
  // Validation helpers
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+0-9\s.-]{10,20}$/;
  
  function validateField(input, validationFn, errorId, errorMsg) {
    const isValid = validationFn(input);
    const formGroup = input.closest('.form-group') || input.parentElement;
    const errorSpan = document.getElementById(errorId);
    
    if (isValid) {
      if (formGroup) {
        formGroup.classList.remove('invalid');
        formGroup.classList.add('valid');
      }
      if (errorSpan) errorSpan.textContent = "";
      return true;
    } else {
      if (formGroup) {
        formGroup.classList.remove('valid');
        formGroup.classList.add('invalid');
      }
      if (errorSpan) errorSpan.textContent = errorMsg;
      return false;
    }
  }

  // Register Event Listeners for Validation on Blur
  const firstnameInput = document.getElementById('register-firstname');
  const lastnameInput = document.getElementById('register-lastname');
  const emailInput = document.getElementById('register-email');
  const phoneInput = document.getElementById('register-phone');

  if (popupForm) {
    firstnameInput.addEventListener('blur', () => {
      validateField(firstnameInput, val => val.value.trim().length > 0, 'err-firstname', 'Le prénom est requis.');
    });
    firstnameInput.addEventListener('input', () => {
      const formGroup = firstnameInput.closest('.form-group');
      if (formGroup) formGroup.classList.remove('invalid');
      document.getElementById('err-firstname').textContent = "";
    });

    lastnameInput.addEventListener('blur', () => {
      validateField(lastnameInput, val => val.value.trim().length > 0, 'err-lastname', 'Le nom est requis.');
    });
    lastnameInput.addEventListener('input', () => {
      const formGroup = lastnameInput.closest('.form-group');
      if (formGroup) formGroup.classList.remove('invalid');
      document.getElementById('err-lastname').textContent = "";
    });

    emailInput.addEventListener('blur', () => {
      validateField(emailInput, val => emailRegex.test(val.value.trim()), 'err-email', 'Veuillez saisir une adresse email valide.');
    });
    emailInput.addEventListener('input', () => {
      const formGroup = emailInput.closest('.form-group');
      if (formGroup) formGroup.classList.remove('invalid');
      document.getElementById('err-email').textContent = "";
    });

    phoneInput.addEventListener('blur', () => {
      validateField(phoneInput, val => phoneRegex.test(val.value.trim()), 'err-phone', 'Veuillez saisir un numéro de téléphone valide.');
    });
    phoneInput.addEventListener('input', () => {
      const formGroup = phoneInput.closest('.form-group');
      if (formGroup) formGroup.classList.remove('invalid');
      document.getElementById('err-phone').textContent = "";
    });

    slotSelect.addEventListener('change', () => {
      validateField(slotSelect, val => val.value !== "", 'err-slot', 'Veuillez sélectionner un créneau.');
      // Sync with card selection
      selectedSlot = slotSelect.value;
      updateGridSelection();
    });

    rgpdCheckbox.addEventListener('change', () => {
      const errorSpan = document.getElementById('err-rgpd');
      if (rgpdCheckbox.checked) {
        errorSpan.textContent = "";
      } else {
        errorSpan.textContent = "Vous devez accepter les conditions pour continuer.";
      }
    });

    // Fetch slot counts and render the grid
    let slotsData = [];
    async function fetchSlots() {
      try {
        const res = await fetch('/api/slots');
        if (!res.ok) throw new Error("Impossible de charger les créneaux.");
        slotsData = await res.json();
        renderSlotsGrid(slotsData);
        updateSelectDropdown(slotsData);
      } catch (err) {
        console.error(err);
        if (slotsGrid) {
          slotsGrid.innerHTML = `<div class="slot-loading error" style="color: var(--red);">Erreur lors de la récupération des créneaux. Veuillez rafraîchir la page.</div>`;
        }
      }
    }

    function renderSlotsGrid(slots) {
      if (!slotsGrid) return;
      slotsGrid.innerHTML = "";
      
      slots.forEach(slot => {
        const percent = Math.min(100, (slot.registered / slot.capacity) * 100);
        const isFull = slot.remaining <= 0;
        
        let statusClass = "status-available";
        let placesText = `${slot.remaining} places restantes`;
        
        if (isFull) {
          statusClass = "status-full";
          placesText = "COMPLET";
        } else if (slot.remaining < 40) {
          statusClass = "status-warning";
          placesText = `Attention, plus que ${slot.remaining} places`;
        }
        
        const isSelectedClass = selectedSlot === slot.slot ? 'selected' : '';
        const isFullClass = isFull ? 'full' : '';
        
        const card = document.createElement('div');
        card.className = `slot-card ${isFullClass} ${isSelectedClass}`;
        card.setAttribute('data-slot', slot.slot);
        card.innerHTML = `
          <div class="slot-selected-indicator"></div>
          <div class="slot-time">${slot.slot}</div>
          <div class="slot-places ${statusClass}">${placesText}</div>
          <div class="slot-progress-bar">
            <div class="slot-progress-fill" style="width: ${percent}%"></div>
          </div>
        `;
        
        if (!isFull) {
          card.addEventListener('click', () => {
            selectedSlot = slot.slot;
            slotSelect.value = slot.slot;
            // Trigger select change logic manually
            const formGroup = slotSelect.closest('.form-group');
            if (formGroup) {
              formGroup.classList.remove('invalid');
              formGroup.classList.add('valid');
            }
            document.getElementById('err-slot').textContent = "";
            updateGridSelection();
          });
        }
        
        slotsGrid.appendChild(card);
      });
    }

    function updateGridSelection() {
      const cards = slotsGrid.querySelectorAll('.slot-card');
      cards.forEach(card => {
        if (card.getAttribute('data-slot') === selectedSlot) {
          card.classList.add('selected');
        } else {
          card.classList.remove('selected');
        }
      });
    }

    function updateSelectDropdown(slots) {
      if (!slotSelect) return;
      // Preserve first disabled option
      const firstOpt = slotSelect.options[0];
      slotSelect.innerHTML = "";
      slotSelect.appendChild(firstOpt);
      
      slots.forEach(slot => {
        const option = document.createElement('option');
        option.value = slot.slot;
        const isFull = slot.remaining <= 0;
        option.textContent = `${slot.slot} (${isFull ? 'COMPLET' : slot.remaining + ' places restantes'})`;
        if (isFull) {
          option.disabled = true;
        }
        // If this slot was previously selected, keep it selected
        if (slot.slot === selectedSlot) {
          option.selected = true;
        }
        slotSelect.appendChild(option);
      });
    }

    // Modal Control Functions for Pop-up Store
    function openPopupModal() {
      if (popupModal) {
        popupModal.hidden = false;
        document.body.style.overflow = 'hidden';
        popupModalClose.focus();
      }
    }
    function closePopupModal() {
      if (popupModal) {
        popupModal.hidden = true;
        document.body.style.overflow = '';
      }
    }

    if (popupModalClose) popupModalClose.addEventListener('click', closePopupModal);
    if (popupModalOk) popupModalOk.addEventListener('click', closePopupModal);
    if (popupModal) {
      popupModal.addEventListener('click', (e) => {
        if (e.target === popupModal) closePopupModal();
      });
    }

    // Form Submit Handler
    popupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Run validation on all fields
      const isFirstnameValid = validateField(firstnameInput, val => val.value.trim().length > 0, 'err-firstname', 'Le prénom est requis.');
      const isLastnameValid = validateField(lastnameInput, val => val.value.trim().length > 0, 'err-lastname', 'Le nom est requis.');
      const isEmailValid = validateField(emailInput, val => emailRegex.test(val.value.trim()), 'err-email', 'Veuillez saisir une adresse email valide.');
      const isPhoneValid = validateField(phoneInput, val => phoneRegex.test(val.value.trim()), 'err-phone', 'Veuillez saisir un numéro de téléphone valide.');
      const isSlotValid = validateField(slotSelect, val => val.value !== "", 'err-slot', 'Veuillez sélectionner un créneau.');
      
      let isRgpdValid = true;
      const errorRgpdSpan = document.getElementById('err-rgpd');
      if (!rgpdCheckbox.checked) {
        errorRgpdSpan.textContent = "Vous devez accepter les conditions pour continuer.";
        isRgpdValid = false;
      } else {
        errorRgpdSpan.textContent = "";
      }

      if (!isFirstnameValid || !isLastnameValid || !isEmailValid || !isPhoneValid || !isSlotValid || !isRgpdValid) {
        // Focus first invalid element
        if (!isFirstnameValid) firstnameInput.focus();
        else if (!isLastnameValid) lastnameInput.focus();
        else if (!isEmailValid) emailInput.focus();
        else if (!isPhoneValid) phoneInput.focus();
        else if (!isSlotValid) slotSelect.focus();
        else if (!isRgpdValid) rgpdCheckbox.focus();
        return;
      }

      // Check current clientside availability matching requested people count
      const chosenSlotData = slotsData.find(s => s.slot === slotSelect.value);
      const requestedPeople = parseInt(peopleSelect.value, 10);
      if (chosenSlotData && chosenSlotData.remaining < requestedPeople) {
        const errorSpan = document.getElementById('err-people');
        errorSpan.textContent = `Nombre de places insuffisant (${chosenSlotData.remaining} restantes).`;
        peopleSelect.focus();
        return;
      } else {
        document.getElementById('err-people').textContent = "";
      }

      // Disable submit button during fetch
      const submitBtn = document.getElementById('submit-register-btn');
      const submitBtnLabel = submitBtn.querySelector('.btn-label');
      submitBtn.disabled = true;
      submitBtnLabel.textContent = "Traitement en cours...";
      
      const statusMessage = document.getElementById('register-status-message');
      statusMessage.style.display = "none";
      statusMessage.className = "form-status-message";

      try {
        const payload = {
          firstname: firstnameInput.value.trim(),
          lastname: lastnameInput.value.trim(),
          email: emailInput.value.trim(),
          phone: phoneInput.value.trim(),
          slot: slotSelect.value,
          people_count: requestedPeople,
          rgpd_consent: rgpdCheckbox.checked
        };

        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Success
          openPopupModal();
          popupForm.reset();
          selectedSlot = "";
          
          // Clear validation classes
          const groups = popupForm.querySelectorAll('.form-group');
          groups.forEach(g => g.classList.remove('valid', 'invalid'));
          
          // Refresh slot lists
          await fetchSlots();
        } else {
          // Error response from server
          statusMessage.style.display = "block";
          statusMessage.classList.add('error');
          statusMessage.textContent = result.error || "Une erreur est survenue lors de l'inscription.";
        }
      } catch (fetchErr) {
        console.error("Erreur réseau :", fetchErr);
        statusMessage.style.display = "block";
        statusMessage.classList.add('error');
        statusMessage.textContent = "Impossible de contacter le serveur. Veuillez vérifier votre connexion.";
      } finally {
        submitBtn.disabled = false;
        submitBtnLabel.textContent = "Confirmer mon inscription";
      }
    });

    // Initial load
    fetchSlots();
  }
})();
