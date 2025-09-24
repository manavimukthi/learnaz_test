// LearnAZ interactions: theme, nav, updates feed, prompt lab, newsletter
(function () {
  const doc = document;

  // Theme handling
  const root = doc.documentElement;
  const themeToggle = doc.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('learnaz:theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    root.setAttribute('data-theme', savedTheme);
  }
  updateThemeIcon();
  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('learnaz:theme', next);
    updateThemeIcon();
  });
  function updateThemeIcon() {
    if (!themeToggle) return;
    const isDark = root.getAttribute('data-theme') !== 'light';
    themeToggle.textContent = isDark ? '🌗' : '🌞';
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  // Mobile nav toggle
  const navToggle = doc.querySelector('.nav-toggle');
  const navLinks = doc.querySelector('.nav-links');
  navToggle?.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navLinks?.classList.toggle('show');
  });

  // Animated stats
  const counters = [
    { id: 'statUpdates', target: 24 },
    { id: 'statPrompts', target: 48 },
    { id: 'statSubs', target: 1200 }
  ];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounters();
        io.disconnect();
      }
    });
  });
  const statsEl = doc.querySelector('.stats');
  if (statsEl) io.observe(statsEl);
  function animateCounters() {
    counters.forEach(({ id, target }) => {
      const el = doc.getElementById(id);
      if (!el) return;
      const duration = 900 + Math.random() * 700;
      const start = performance.now();
      const startVal = 0;
      function step(now) {
        const p = Math.min(1, (now - start) / duration);
        const ease = 1 - Math.pow(1 - p, 3);
        const val = Math.floor(startVal + (target - startVal) * ease);
        el.textContent = val.toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  // Mock updates data
  const updatesData = [
    { title: 'Open multimodal model hits new benchmark', summary: 'A compact multimodal transformer surpasses prior open baselines on reasoning tasks.', date: '2025-09-18', tags: ['Models','Research'] },
    { title: 'Agent frameworks get workflow graphs', summary: 'Visual DAG builders arrive for orchestrating tool-using LLM agents with retries and guards.', date: '2025-09-16', tags: ['Tools','Product'] },
    { title: 'Policy: AI transparency rules drafted', summary: 'Draft policy calls for eval reporting and safety disclosures for high-risk models.', date: '2025-09-14', tags: ['Policy'] },
    { title: 'Vector DB adds hybrid search', summary: 'Combines dense and sparse retrieval with auto-weighting for better recall.', date: '2025-09-12', tags: ['Tools'] },
    { title: 'Research roundup: toolformer variants', summary: 'Self-annotation for API calls boosts math and coding accuracy.', date: '2025-09-10', tags: ['Research'] },
  ];

  const updatesFeed = doc.getElementById('updatesFeed');
  const searchInput = doc.getElementById('searchInput');
  const tagFilter = doc.getElementById('tagFilter');
  let currentQuery = '';
  let currentTag = '';

  function renderUpdates(items) {
    if (!updatesFeed) return;
    updatesFeed.innerHTML = '';
    if (!items.length) {
      const empty = doc.createElement('div');
      empty.className = 'card';
      empty.textContent = 'No updates found.';
      updatesFeed.appendChild(empty);
      return;
    }
    items.forEach((u, idx) => {
      const card = doc.createElement('article');
      card.className = 'card update';
      card.setAttribute('role', 'listitem');
      card.tabIndex = 0;
      card.setAttribute('aria-label', 'Open details');
      const h4 = doc.createElement('h4');
      h4.textContent = u.title;
      const meta = doc.createElement('div');
      meta.className = 'tags';
      const date = new Date(u.date).toLocaleDateString();
      const dateTag = chip(date);
      meta.appendChild(dateTag);
      u.tags.forEach(t => meta.appendChild(chip(t)));
      const p = doc.createElement('p');
      p.textContent = u.summary;
      card.append(h4, meta, p);
      card.addEventListener('click', () => openModal(u));
      card.addEventListener('keypress', (e)=>{ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(u); } });
      updatesFeed.appendChild(card);
    });
  }
  function chip(text) {
    const el = doc.createElement('span');
    el.className = 'tag';
    el.textContent = text;
    return el;
  }
  function applyFilters() {
    const q = currentQuery.trim().toLowerCase();
    const t = currentTag.trim();
    const filtered = updatesData.filter(u => {
      const matchesQuery = !q || (u.title + ' ' + u.summary).toLowerCase().includes(q);
      const matchesTag = !t || u.tags.includes(t);
      return matchesQuery && matchesTag;
    });
    renderUpdates(filtered);
  }
  searchInput?.addEventListener('input', (e) => {
    currentQuery = e.target.value;
    applyFilters();
  });
  tagFilter?.addEventListener('change', (e) => {
    currentTag = e.target.value;
    applyFilters();
  });
  renderUpdates(updatesData);

  // Modal logic
  const modal = doc.getElementById('updateModal');
  const modalClose = doc.getElementById('modalClose');
  const modalTitle = doc.getElementById('modalTitle');
  const modalMeta = doc.getElementById('modalMeta');
  const modalAbout = doc.getElementById('modalAbout');
  const modalImage = doc.getElementById('modalImage');
  const modalBody = doc.getElementById('modalBody');
  function openModal(update){
    if (!modal) return;
    modalTitle && (modalTitle.textContent = update.title);
    if (modalMeta) {
      modalMeta.innerHTML = '';
      modalMeta.appendChild(chip(new Date(update.date).toLocaleDateString()));
      update.tags.forEach(t=> modalMeta.appendChild(chip(t)));
    }
    if (modalAbout) modalAbout.textContent = update.about || '';
    if (modalImage) {
      const src = update.image || 'ai.png';
      modalImage.src = src;
      modalImage.alt = update.title || 'Update image';
      modalImage.style.display = '';
      modalImage.onerror = () => { modalImage.src = 'ai.png'; };
    }
    modalBody && (modalBody.textContent = update.summary || update.details || '');
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  }
  function closeModal(){ if (!modal) return; modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); }
  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e)=>{ if (e.target === modal) closeModal(); });

  // Prompt Lab
  const promptForm = doc.getElementById('promptForm');
  const objective = doc.getElementById('objective');
  const audience = doc.getElementById('audience');
  const tone = doc.getElementById('tone');
  const constraints = doc.getElementById('constraints');
  const context = doc.getElementById('context');
  const promptResult = doc.getElementById('promptResult');
  const loadTemplate = doc.getElementById('loadTemplate');
  const copyPrompt = doc.getElementById('copyPrompt');
  const savePrompt = doc.getElementById('savePrompt');

  const TEMPLATES = [
    {
      name: 'Research Summary',
      objective: 'Summarize latest research paper into actionable insights',
      audience: 'Product managers and engineers',
      tone: 'analytical',
      constraints: '300 words max, include 3 bullet points and 2 citations',
      context: 'Paper title: Example; Key method: Example; Dataset: Example.'
    },
    {
      name: 'Marketing Copy',
      objective: 'Write landing page hero copy for an AI feature',
      audience: 'Startup founders',
      tone: 'persuasive',
      constraints: 'Two options, <= 30 words each',
      context: 'Feature: real-time AI agents; Benefit: automate workflows; USP: safe + reliable.'
    }
  ];

  loadTemplate?.addEventListener('click', () => {
    const tpl = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    setValue(objective, tpl.objective);
    setValue(audience, tpl.audience);
    setValue(tone, tpl.tone);
    setValue(constraints, tpl.constraints);
    setValue(context, tpl.context);
  });

  promptForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = getFormData();
    const prompt = composePrompt(data);
    if (promptResult) promptResult.textContent = prompt;
  });

  copyPrompt?.addEventListener('click', async () => {
    const text = promptResult?.textContent || '';
    if (!text) return;
    try { await navigator.clipboard.writeText(text); toast('Prompt copied'); } catch {}
  });

  savePrompt?.addEventListener('click', () => {
    const text = promptResult?.textContent || '';
    if (!text) return;
    const saved = JSON.parse(localStorage.getItem('learnaz:savedPrompts') || '[]');
    saved.unshift({ text, ts: Date.now() });
    localStorage.setItem('learnaz:savedPrompts', JSON.stringify(saved.slice(0, 50)));
    toast('Saved locally');
  });

  function getFormData() {
    return {
      objective: valueOf(objective),
      audience: valueOf(audience),
      tone: valueOf(tone),
      constraints: valueOf(constraints),
      context: valueOf(context)
    };
  }
  function composePrompt(d) {
    const lines = [];
    if (d.objective) lines.push(`Objective: ${d.objective}`);
    if (d.audience) lines.push(`Audience: ${d.audience}`);
    if (d.tone) lines.push(`Style & Tone: ${d.tone}`);
    if (d.constraints) lines.push(`Constraints: ${d.constraints}`);
    if (d.context) lines.push(`Context:\n${d.context}`);
    lines.push('Deliverable: Provide a clear, structured response. Think step-by-step.');
    return lines.join('\n');
  }

  function valueOf(el) { return (el && 'value' in el) ? String(el.value || '').trim() : ''; }
  function setValue(el, v) { if (el && 'value' in el) el.value = v; }

  // Newsletter subscribe (mock)
  const subscribeForm = doc.getElementById('subscribeForm');
  const email = doc.getElementById('email');
  const subscribeMessage = doc.getElementById('subscribeMessage');
  subscribeForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const addr = valueOf(email);
    if (!isValidEmail(addr)) {
      setMessage('Please enter a valid email.');
      return;
    }
    setMessage('Subscribing…');
    await delay(800);
    setMessage('You are subscribed! Check your inbox.');
    email && (email.value = '');
  });
  function setMessage(msg) { if (subscribeMessage) subscribeMessage.textContent = msg; }
  function isValidEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }
  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  // Footer year
  const year = doc.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Toast helper
  let toastTimeout;
  function toast(message) {
    let el = doc.getElementById('toast');
    if (!el) {
      el = doc.createElement('div');
      el.id = 'toast';
      el.style.position = 'fixed';
      el.style.bottom = '18px';
      el.style.left = '50%';
      el.style.transform = 'translateX(-50%)';
      el.style.background = 'rgba(0,0,0,0.8)';
      el.style.color = 'white';
      el.style.padding = '10px 14px';
      el.style.borderRadius = '12px';
      el.style.zIndex = '9999';
      el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.35)';
      doc.body.appendChild(el);
    }
    el.textContent = message;
    el.style.opacity = '1';
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { el.style.opacity = '0'; }, 1500);
  }
})();

