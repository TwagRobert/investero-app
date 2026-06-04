/**
 * UPLUS – Community Finance Platform
 * Main JavaScript: Navigation, animations, counters, FAQ, testimonials, forms
 * Vanilla JS, no dependencies
 */

(function () {
  'use strict';

  /* ============================================================
     UTILITY FUNCTIONS
  ============================================================ */

  /**
   * Throttle a function call
   */
  function throttle(fn, delay) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        fn.apply(this, args);
      }
    };
  }

  /**
   * Debounce a function call
   */
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /**
   * Check if reduced motion is preferred
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ============================================================
     NAVIGATION
  ============================================================ */

  const header     = document.getElementById('site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks   = document.getElementById('nav-links');
  const allNavLinks = document.querySelectorAll('.nav-link, .nav-cta-btn');

  /**
   * Header scroll state
   */
  function handleHeaderScroll() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', throttle(handleHeaderScroll, 50), { passive: true });
  handleHeaderScroll(); // run on init

  /**
   * Mobile menu toggle
   */
  function openMenu() {
    navLinks.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', function () {
    const isOpen = this.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  // Close mobile menu when a nav link is clicked
  allNavLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on outside click
  document.addEventListener('click', function (e) {
    if (
      navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // Close menu on ESC key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMenu();
      menuToggle.focus();
    }
  });

  /**
   * Active nav link highlighting based on scroll position
   */
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNavLink() {
    const scrollPos = window.scrollY + 100;

    sections.forEach(function (section) {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = document.querySelector('.nav-link[href="#' + id + '"]');

      if (link) {
        if (scrollPos >= top && scrollPos < bottom) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  }

  window.addEventListener('scroll', throttle(updateActiveNavLink, 100), { passive: true });

  /* ============================================================
     SCROLL ANIMATIONS (INTERSECTION OBSERVER)
  ============================================================ */

  const animatedEls = document.querySelectorAll('[data-animate]');

  if ('IntersectionObserver' in window && !prefersReducedMotion()) {
    const animObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el    = entry.target;
          const delay = parseInt(el.getAttribute('data-delay') || 0, 10);
          setTimeout(function () {
            el.classList.add('is-visible');
          }, delay);
          animObserver.unobserve(el);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    animatedEls.forEach(function (el) {
      animObserver.observe(el);
    });
  } else {
    // No animation support: show all immediately
    animatedEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ============================================================
     ANIMATED STATISTICS COUNTER
  ============================================================ */

  const statNumbers = document.querySelectorAll('.stat-number[data-count]');

  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-count'), 10);
    const prefix   = el.getAttribute('data-prefix') || '';
    const suffix   = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const start    = performance.now();

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutExpo(progress);
      const current  = Math.round(eased * target);

      el.textContent = prefix + current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window && !prefersReducedMotion()) {
    const statsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(function (el) {
      statsObserver.observe(el);
    });
  } else {
    statNumbers.forEach(function (el) {
      const prefix = el.getAttribute('data-prefix') || '';
      const target = el.getAttribute('data-count');
      const suffix = el.getAttribute('data-suffix') || '';
      el.textContent = prefix + parseInt(target, 10).toLocaleString() + suffix;
    });
  }

  /* ============================================================
     FAQ ACCORDION
  ============================================================ */

  const faqItems = document.querySelectorAll('[data-faq]');

  faqItems.forEach(function (item) {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!btn || !answer) return;

    btn.addEventListener('click', function () {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      faqItems.forEach(function (other) {
        if (other !== item) {
          const otherBtn    = other.querySelector('.faq-question');
          const otherAnswer = other.querySelector('.faq-answer');
          if (otherBtn && otherAnswer) {
            otherBtn.setAttribute('aria-expanded', 'false');
            otherAnswer.hidden = true;
            otherAnswer.style.maxHeight = '';
          }
        }
      });

      // Toggle current
      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        answer.hidden = true;
      } else {
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
        // Animate open
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });

    // Handle transition end to collapse properly
    answer.addEventListener('transitionend', function () {
      if (btn.getAttribute('aria-expanded') === 'true') {
        // Allow for content resize
        answer.style.maxHeight = 'none';
      }
    });
  });

  /* ============================================================
     TESTIMONIALS CAROUSEL
  ============================================================ */

  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const testimonialDots  = document.querySelectorAll('.t-dot');
  let currentTestimonial = 0;
  let testimonialTimer;

  function showTestimonial(index) {
    // Remove active from all
    testimonialCards.forEach(function (card) {
      card.classList.remove('active-t');
    });
    testimonialDots.forEach(function (dot) {
      dot.classList.remove('active-dot');
      dot.setAttribute('aria-selected', 'false');
    });

    // Activate target
    if (testimonialCards[index]) {
      testimonialCards[index].classList.add('active-t');
    }
    if (testimonialDots[index]) {
      testimonialDots[index].classList.add('active-dot');
      testimonialDots[index].setAttribute('aria-selected', 'true');
    }

    currentTestimonial = index;
  }

  function nextTestimonial() {
    const next = (currentTestimonial + 1) % testimonialCards.length;
    showTestimonial(next);
  }

  function startTestimonialTimer() {
    clearInterval(testimonialTimer);
    testimonialTimer = setInterval(nextTestimonial, 5500);
  }

  // Dot clicks
  testimonialDots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      const index = parseInt(this.getAttribute('data-index'), 10);
      showTestimonial(index);
      startTestimonialTimer(); // restart timer
    });
  });

  // Start auto-rotation
  if (testimonialCards.length > 1) {
    startTestimonialTimer();
  }

  // Keyboard support for dots
  testimonialDots.forEach(function (dot, i) {
    dot.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') {
        const next = (i + 1) % testimonialDots.length;
        testimonialDots[next].focus();
        showTestimonial(next);
      } else if (e.key === 'ArrowLeft') {
        const prev = (i - 1 + testimonialDots.length) % testimonialDots.length;
        testimonialDots[prev].focus();
        showTestimonial(prev);
      }
    });
  });

  /* ============================================================
     CONTACT FORM VALIDATION & SUBMISSION
  ============================================================ */

  const contactForm  = document.getElementById('contact-form');
  const formSuccess  = document.getElementById('form-success');
  const submitBtn    = document.getElementById('submit-btn');

  if (contactForm) {
    function getFieldError(field) {
      const value = field.value.trim();
      const type  = field.type;
      const name  = field.name;

      if (field.required && !value) {
        return 'This field is required.';
      }

      if (type === 'email' && value) {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(value)) {
          return 'Please enter a valid email address.';
        }
      }

      if (name === 'name' && value && value.length < 2) {
        return 'Name must be at least 2 characters.';
      }

      if (name === 'message' && value && value.length < 10) {
        return 'Message must be at least 10 characters.';
      }

      return '';
    }

    function showFieldError(field, message) {
      const errorEl = document.getElementById(field.name + '-error');
      field.classList.toggle('error', !!message);
      if (errorEl) {
        errorEl.textContent = message;
      }
    }

    function validateField(field) {
      const error = getFieldError(field);
      showFieldError(field, error);
      return !error;
    }

    // Live validation on blur
    ['name', 'email', 'message'].forEach(function (name) {
      const field = contactForm.querySelector('[name="' + name + '"]');
      if (field) {
        field.addEventListener('blur', function () {
          validateField(this);
        });
        field.addEventListener('input', function () {
          if (this.classList.contains('error')) {
            validateField(this);
          }
        });
      }
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Validate all required fields
      const requiredFields = contactForm.querySelectorAll('[required]');
      let isValid = true;

      requiredFields.forEach(function (field) {
        if (!validateField(field)) {
          isValid = false;
        }
      });

      if (!isValid) return;

      // Simulate submission
      const btnText    = submitBtn.querySelector('.btn-text');
      const btnLoading = submitBtn.querySelector('.btn-loading');

      submitBtn.disabled = true;
      btnText.hidden     = true;
      btnLoading.hidden  = false;

      // Simulate async API call
      setTimeout(function () {
        submitBtn.disabled = false;
        btnText.hidden     = false;
        btnLoading.hidden  = true;

        contactForm.reset();
        formSuccess.hidden = false;
        formSuccess.focus();

        // Hide success message after 6s
        setTimeout(function () {
          formSuccess.hidden = true;
        }, 6000);
      }, 1600);
    });
  }

  /* ============================================================
     NEWSLETTER FORM
  ============================================================ */

  const newsletterForm = document.querySelector('.newsletter-form');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = this.querySelector('input[type="email"]');
      const btn   = this.querySelector('.nl-btn');

      if (!input || !input.value.trim()) return;

      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(input.value.trim())) {
        input.style.borderColor = '#e53e3e';
        setTimeout(() => { input.style.borderColor = ''; }, 2000);
        return;
      }

      const original = btn.textContent;
      btn.textContent = '✓';
      btn.style.background = '#00b894';
      input.value = '';

      setTimeout(function () {
        btn.textContent = original;
        btn.style.background = '';
      }, 3000);
    });
  }

  /* ============================================================
     BACK TO TOP BUTTON
  ============================================================ */

  const backToTop = document.getElementById('back-to-top');

  function handleBackToTop() {
    if (window.scrollY > 400) {
      backToTop.hidden = false;
    } else {
      backToTop.hidden = true;
    }
  }

  window.addEventListener('scroll', throttle(handleBackToTop, 100), { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     SMOOTH SCROLL FOR ANCHOR LINKS
  ============================================================ */

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerH  = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '72',
          10
        );
        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });

        // Update focus for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.addEventListener('blur', function once() {
          target.removeAttribute('tabindex');
          target.removeEventListener('blur', once);
        });
      }
    });
  });

  /* ============================================================
     FOOTER YEAR
  ============================================================ */

  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ============================================================
     PARALLAX HERO SHAPES (subtle, only if motion ok)
  ============================================================ */

  if (!prefersReducedMotion()) {
    const shapes = document.querySelectorAll('.hero-bg-shapes .shape');

    window.addEventListener('scroll', throttle(function () {
      const scrollY = window.scrollY;
      shapes.forEach(function (shape, i) {
        const speed = 0.08 + i * 0.04;
        const y     = scrollY * speed;
        shape.style.transform = 'translateY(' + y + 'px)';
      });
    }, 16), { passive: true });

    // Subtle mouse parallax on hero
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      heroSection.addEventListener('mousemove', throttle(function (e) {
        const rect = heroSection.getBoundingClientRect();
        const cx   = rect.width  / 2;
        const cy   = rect.height / 2;
        const dx   = (e.clientX - rect.left - cx) / cx;
        const dy   = (e.clientY - rect.top  - cy) / cy;

        shapes.forEach(function (shape, i) {
          const depth = (i + 1) * 4;
          shape.style.transform = 'translate(' + (dx * depth) + 'px, ' + (dy * depth) + 'px)';
        });
      }, 30));
    }
  }

  /* ============================================================
     SERVICE CARDS – KEYBOARD ACCESSIBLE HOVER EFFECT
  ============================================================ */

  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(function (card) {
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        const link = card.querySelector('.service-link');
        if (link) {
          e.preventDefault();
          link.click();
        }
      }
    });
  });

  /* ============================================================
     INTERSECTION OBSERVER: Gallery items stagger
  ============================================================ */

  if ('IntersectionObserver' in window && !prefersReducedMotion()) {
    const galleryItems = document.querySelectorAll('.gallery-item');

    const galleryObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, idx) {
        if (entry.isIntersecting) {
          setTimeout(function () {
            entry.target.style.opacity    = '1';
            entry.target.style.transform  = 'scale(1)';
          }, idx * 80);
          galleryObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    galleryItems.forEach(function (item) {
      item.style.opacity   = '0';
      item.style.transform = 'scale(0.96)';
      item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      galleryObserver.observe(item);
    });
  }

  /* ============================================================
     PHONE MOCKUP INTERACTION
  ============================================================ */

  const phoneMockup = document.querySelector('.phone-mockup');
  if (phoneMockup && !prefersReducedMotion()) {
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
      heroVisual.addEventListener('mousemove', function (e) {
        const rect = heroVisual.getBoundingClientRect();
        const cx   = rect.width  / 2;
        const cy   = rect.height / 2;
        const dx   = ((e.clientX - rect.left) - cx) / cx;
        const dy   = ((e.clientY - rect.top)  - cy) / cy;
        const rx   = -dy * 8;
        const ry   =  dx * 8;
        phoneMockup.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      });

      heroVisual.addEventListener('mouseleave', function () {
        phoneMockup.style.transform = '';
        phoneMockup.style.transition = 'transform 0.5s ease';
        setTimeout(function () {
          phoneMockup.style.transition = '';
        }, 500);
      });
    }
  }

  /* ============================================================
     LOGO HOVER ANIMATION
  ============================================================ */

  const logoMarks = document.querySelectorAll('.logo-mark');
  logoMarks.forEach(function (mark) {
    mark.parentElement.addEventListener('mouseenter', function () {
      mark.style.transform = 'scale(1.1)';
      mark.style.transition = 'transform 0.2s ease';
    });
    mark.parentElement.addEventListener('mouseleave', function () {
      mark.style.transform = '';
    });
  });

  /* ============================================================
     ACCESSIBILITY: SKIP TO MAIN CONTENT LINK
  ============================================================ */

  // Create skip link if it doesn't exist
  if (!document.querySelector('.skip-link')) {
    const skipLink = document.createElement('a');
    skipLink.href       = '#main-content';
    skipLink.className  = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
      position: fixed;
      top: -60px;
      left: 0;
      z-index: 9999;
      padding: 0.75rem 1.5rem;
      background: var(--color-accent, #00b894);
      color: white;
      font-weight: 700;
      font-size: 0.875rem;
      border-radius: 0 0 8px 0;
      transition: top 0.2s ease;
      text-decoration: none;
    `;

    skipLink.addEventListener('focus', function () {
      this.style.top = '0';
    });

    skipLink.addEventListener('blur', function () {
      this.style.top = '-60px';
    });

    document.body.prepend(skipLink);
  }

  /* ============================================================
     INIT COMPLETE LOG
  ============================================================ */

  console.log('%c Uplus ✓ ', 'background:#1a475f;color:#00b894;padding:4px 8px;border-radius:4px;font-weight:bold;font-size:12px;', 'Community Finance Platform — JS loaded');

})();
