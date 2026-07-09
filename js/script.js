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
      trailerVideo.src = 'assets/video/GALACTIK_FOOTBALL_—_TEASER_s.mp4';
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
        openVideoModal('assets/video/GALACTIK_FOOTBALL_—_TEASER_s.mp4');
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
})();
