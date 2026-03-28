document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const introScreen = document.getElementById('introScreen');
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
  const hamburger = document.getElementById('hamburger');
  const logoContainer = document.querySelector('.logo-container');
  const navLinks = document.querySelector('.nav-links');
  const navLinkItems = document.querySelectorAll('.nav-link');
  const navbar = document.querySelector('.navbar');
  const sections = document.querySelectorAll('section[id]');
  const typingElement = document.querySelector('.typing');
  const subtitleTypingElement = document.querySelector('.subtitle-typing');
  const statNumbers = document.querySelectorAll('.stat-number');
  const contactForm = document.getElementById('contact-form');
  const formMessage = document.getElementById('formMessage');
  const isFileProtocol = window.location.protocol === 'file:';
  const isLocalBrowserPreview =
    ['localhost', '127.0.0.1'].includes(window.location.hostname) &&
    window.location.port &&
    window.location.port !== '3000';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const apiBaseUrls =
    isFileProtocol || isLocalBrowserPreview
      ? ['http://localhost:3000', 'http://127.0.0.1:3000']
      : [''];
  const introDisplayTime = prefersReducedMotion ? 1500 : 20000;
  const introFadeTime = prefersReducedMotion ? 0 : 700;
  let introTimerId = null;
  let introFadeTimerId = null;
  let initialIntroStarted = false;

  function clearIntroTimers() {
    window.clearTimeout(introTimerId);
    window.clearTimeout(introFadeTimerId);
  }

  function startIntroVisuals() {
    if (!introScreen) return;
    introScreen.classList.remove('is-playing');
    void introScreen.offsetWidth;
    introScreen.classList.add('is-playing');
  }

  function endIntro(onComplete) {
    if (!body.classList.contains('intro-active')) {
      onComplete?.();
      return;
    }

    body.classList.add('intro-closing');

    introFadeTimerId = window.setTimeout(() => {
      body.classList.remove('intro-active', 'intro-closing');
      body.classList.add('intro-revealed');
      introScreen?.classList.remove('is-playing');
      onComplete?.();
    }, introFadeTime);
  }

  function playIntro(onComplete, displayTime = introDisplayTime) {
    if (!introScreen) {
      onComplete?.();
      return;
    }

    clearIntroTimers();
    body.classList.remove('intro-revealed');
    body.classList.add('intro-active');
    body.classList.remove('intro-closing');
    startIntroVisuals();

    introTimerId = window.setTimeout(() => {
      endIntro(onComplete);
    }, displayTime);
  }

  function startInitialIntro() {
    if (!introScreen || initialIntroStarted) return;
    initialIntroStarted = true;
    window.requestAnimationFrame(() => {
      playIntro();
    });
  }

  if (introScreen) {
    if (document.readyState === 'complete') {
      startInitialIntro();
    } else {
      window.addEventListener('load', startInitialIntro, { once: true });
    }
  }

  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  function setTheme(theme) {
    const isLight = theme === 'light';
    body.classList.toggle('light-theme', isLight);

    if (themeIcon) {
      themeIcon.classList.toggle('fa-sun', isLight);
      themeIcon.classList.toggle('fa-moon', !isLight);
    }

    localStorage.setItem('theme', theme);
  }

  setTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = body.classList.contains('light-theme') ? 'dark' : 'light';
      setTheme(nextTheme);
    });
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
      body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });
  }

  if (logoContainer) {
    logoContainer.addEventListener('click', (event) => {
      event.preventDefault();
      hamburger?.classList.remove('active');
      navLinks?.classList.remove('active');
      body.style.overflow = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      playIntro(() => {
        window.location.hash = 'home';
      }, prefersReducedMotion ? 1200 : 6000);
    });
  }

  navLinkItems.forEach((link) => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('active');
      navLinks?.classList.remove('active');
      body.style.overflow = '';
    });
  });

  window.addEventListener(
    'scroll',
    () => {
      if (!navbar) return;
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    },
    { passive: true }
  );

  function updateActiveNavLink() {
    const scrollPosition = window.scrollY + 140;
    let activeId = '';

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        activeId = section.id;
      }
    });

    navLinkItems.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${activeId}`;
      link.classList.toggle('active', isActive);
    });
  }

  updateActiveNavLink();

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });

  function startHeroTextCycle(titleElement, subtitleElement, items, options = {}) {
    if (!titleElement || !subtitleElement || !items.length) return;

    const displayTime = options.displayTime ?? 2600;
    const transitionTime = options.transitionTime ?? 360;
    let itemIndex = 0;

    function applyItem(index) {
      titleElement.textContent = items[index].title;
      subtitleElement.textContent = items[index].subtitle;
    }

    function togglePhase(className, enabled) {
      titleElement.classList.toggle(className, enabled);
      subtitleElement.classList.toggle(className, enabled);
    }

    applyItem(itemIndex);

    function showNextItem() {
      window.setTimeout(() => {
        togglePhase('text-cycle-exit', true);

        window.setTimeout(() => {
          itemIndex = (itemIndex + 1) % items.length;
          applyItem(itemIndex);
          togglePhase('text-cycle-exit', false);
          togglePhase('text-cycle-enter', true);

          window.setTimeout(() => {
            togglePhase('text-cycle-enter', false);
            showNextItem();
          }, transitionTime);
        }, transitionTime);
      }, displayTime);
    }

    showNextItem();
  }

  startHeroTextCycle(
    typingElement,
    subtitleTypingElement,
    [
      {
        title: 'MERN Stack Developer',
        subtitle: 'Building scalable full-stack applications',
      },
      {
        title: 'Cloud & DevOps Engineer',
        subtitle: 'Automating reliable cloud deployments',
      },
      {
        title: 'Full Stack Developer',
        subtitle: 'Crafting modern, user-focused experiences',
      },
    ],
    { displayTime: 2600, transitionTime: 420 }
  );

  const statsObserver =
    statNumbers.length > 0
      ? new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;

              const target = Number(entry.target.dataset.count || 0);
              const duration = 1200;
              const start = performance.now();

              function update(now) {
                const progress = Math.min((now - start) / duration, 1);
                entry.target.textContent = String(Math.round(target * progress));

                if (progress < 1) {
                  requestAnimationFrame(update);
                }
              }

              requestAnimationFrame(update);
              observer.unobserve(entry.target);
            });
          },
          { threshold: 0.5 }
        )
      : null;

  statNumbers.forEach((item) => statsObserver?.observe(item));

  if (contactForm && formMessage) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = (document.getElementById('name')?.value || '').trim();
      const email = (document.getElementById('email')?.value || '').trim();
      const subject = (document.getElementById('subject')?.value || '').trim();
      const message = (document.getElementById('message')?.value || '').trim();

      if (!name || !email || !message) {
        showMessage('Please fill in all required fields.', 'error');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
      }

      const submitButton = contactForm.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
      }

      try {
        let response = null;
        let payload = {};
        let lastError = null;

        for (const apiBaseUrl of apiBaseUrls) {
          try {
            response = await fetch(`${apiBaseUrl}/api/contact`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name, email, subject, message }),
            });
            payload = await response.json().catch(() => ({}));
            lastError = null;
            break;
          } catch (error) {
            lastError = error;
          }
        }

        if (!response) {
          throw lastError || new Error('Backend unreachable');
        }

        if (!response.ok) {
          if (response.status === 404) {
            showMessage('Start the Node server with npm.cmd run dev and open http://localhost:3000.', 'error');
            return;
          }

          if (response.status === 503) {
            showMessage(payload.error || 'MongoDB is not connected yet. Check your server and database.', 'error');
            return;
          }

          showMessage(payload.error || 'Failed to send message. Please try again.', 'error');
          return;
        }

        showMessage(payload.message || "Thanks for reaching out. I'll get back to you soon.", 'success');
        contactForm.reset();
      } catch (error) {
        showMessage('Backend server is not reachable. Run npm.cmd run dev, then open http://127.0.0.1:3000 or http://localhost:3000.', 'error');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    });
  }

  function showMessage(message, type) {
    if (!formMessage) return;
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;

    window.setTimeout(() => {
      formMessage.className = 'form-message';
    }, 4000);
  }
});
