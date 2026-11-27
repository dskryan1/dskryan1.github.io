(() => {
  document.documentElement.classList.add('js');
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  const closeMenu = () => {
    if (!mainNav || !menuToggle) return;
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    mainNav.querySelectorAll('.has-sub').forEach((item) => {
      item.classList.remove('open-sub');
      item.querySelector('.sub-toggle')?.setAttribute('aria-expanded', 'false');
    });
  };

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    });

    // Submenus: clique abre/fecha (essencial no mobile; no desktop também funciona por hover)
    mainNav.querySelectorAll('.has-sub').forEach((item) => {
      const toggle = item.querySelector('.sub-toggle');
      toggle?.addEventListener('click', () => {
        const open = item.classList.toggle('open-sub');
        toggle.setAttribute('aria-expanded', String(open));
      });
    });

    // Fecha o menu ao clicar em um link (dentro de submenus ou não)
    mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  // ---- Pesquisa (painel abre pelo botão "Pesquisar" da barra superior) ----
  const searchToggle = document.querySelector('.topbar-search');
  const searchPanel = document.querySelector('#search-panel');
  const searchForm = document.querySelector('#site-search-form');
  const searchInput = document.querySelector('#site-search');
  const searchFeedback = document.querySelector('#search-feedback');
  const topicCards = [...document.querySelectorAll('.topic-card')];
  const noResults = document.querySelector('#no-results');

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', () => {
      const willOpen = searchPanel.hidden;
      searchPanel.hidden = !willOpen;
      searchToggle.setAttribute('aria-expanded', String(willOpen));
      if (willOpen) searchInput?.focus();
    });
  }

  const runSearch = (term) => {
    const normalized = term.trim().toLocaleLowerCase('pt-BR');
    let matches = 0;

    topicCards.forEach((card) => {
      const searchable = `${card.innerText} ${card.dataset.search || ''}`.toLocaleLowerCase('pt-BR');
      const matched = !normalized || searchable.includes(normalized);
      card.hidden = !matched;
      if (matched) matches += 1;
    });

    if (noResults) noResults.hidden = matches !== 0;
    if (searchFeedback) {
      searchFeedback.textContent = normalized
        ? `${matches} ${matches === 1 ? 'tema encontrado' : 'temas encontrados'}.`
        : '';
    }
  };

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      runSearch(searchInput.value);
      document.querySelector('#areas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    searchInput.addEventListener('input', () => {
      if (searchInput.value.trim() === '') runSearch('');
    });
  }

  // ---- Contadores da seção "Nossos Números" ----
  const counters = [...document.querySelectorAll('.counter')];
  const formatNumber = (value, decimals = 0) => value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  const animateCounter = (el) => {
    const target = Number(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = Number(el.dataset.decimals || 0);
    if (!Number.isFinite(target)) return;

    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = `${prefix}${formatNumber(target * eased, decimals)}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    counters.forEach((el) => observer.observe(el));
  }

  // ---- Newsletter (validação local; ligue a um serviço para envio real) ----
  const newsletterForm = document.querySelector('#newsletter-form');
  const newsletterFeedback = document.querySelector('#newsletter-feedback');
  if (newsletterForm && newsletterFeedback) {
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = document.querySelector('#newsletter-email');
      const valid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      newsletterFeedback.className = valid ? 'ok' : 'error';
      newsletterFeedback.textContent = valid
        ? 'Obrigado! Seu e-mail foi validado.'
        : 'Informe um e-mail válido.';
      if (valid) newsletterForm.reset();
    });
  }

  // ---- Cabeçalho com sombra ao rolar e entrada suave dos blocos ----
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const revealSelectors = '.concept-card, .stat-strip, .hope-card, .section-heading, .about-grid > *, .topic-card, .feature-grid > *, .genetics-card, .research-card, .treatment-block, .number-card, .newsletter-grid > *, .sources-layout > *, .pros-cons > div';
  document.querySelectorAll(revealSelectors).forEach((el) => {
    el.classList.add('reveal');
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal') || c === el);
    el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 4) * 90}ms`);
  });
  const revealEls = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  // ---- Barra de progresso e menu com seção ativa ----
  const progress = document.querySelector('.scroll-progress');
  if (progress) {
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0}%`;
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  if (mainNav && 'IntersectionObserver' in window) {
    const sections = ['quem-somos', 'areas', 'incuraveis', 'cancer', 'genoma', 'pesquisas', 'hiv', 'numeros', 'novidades', 'fontes']
      .map((id) => document.getElementById(id)).filter(Boolean);
    const setActive = (id) => {
      mainNav.querySelectorAll('.active').forEach((el) => el.classList.remove('active'));
      mainNav.querySelectorAll(`a[href="#${id}"]`).forEach((link) => {
        link.classList.add('active');
        link.closest('.has-sub')?.classList.add('active');
      });
    };
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((section) => spy.observe(section));
  }

  // ---- Voltar ao topo ----
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    const toggleBackToTop = () => backToTop.classList.toggle('visible', window.scrollY > 500);
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
})();
