(() => {
  const CONTENT = window.TONI_CONTENT;
  if (!CONTENT) return;
  const {site, projects} = CONTENT;
  let currentLang = (() => { try { return localStorage.getItem('toniLang') || 'sq'; } catch(e) { return 'sq'; } })();
  let currentProject = null;
  let lightboxIndex = 0;

  const $ = (s) => document.querySelector(s);
  const esc = (value) => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const t = (obj) => typeof obj === 'string' ? obj : (obj?.[currentLang] ?? '');

  function renderStaticContent(){
    document.querySelectorAll('[data-nav]').forEach(el => { el.textContent = t(site.nav[el.dataset.nav]); });
    $('#hero-title').textContent = t(site.hero.title);
    $('#hero-description').textContent = t(site.hero.description);
    $('#hero-projects-cta').textContent = t(site.hero.projects_cta);
    $('#hero-contact-cta').textContent = t(site.hero.contact_cta);

    const stats = $('#statsGrid');
    stats.innerHTML = site.stats.map((s) => `<div class="stat"><strong>${esc(t(s[0]))}</strong><span>${esc(t(s[1]))}</span></div>`).join('');

    $('#about-eyebrow').textContent = t(site.about.eyebrow);
    $('#about-title').textContent = t(site.about.title);
    $('#about-description').textContent = t(site.about.description);
    $('#about-image').alt = t(site.about.image_alt);

    $('#services-eyebrow').textContent = t(site.services.eyebrow);
    $('#services-title').textContent = t(site.services.title);
    $('#services-description').textContent = t(site.services.description);
    $('#servicesGrid').innerHTML = site.services.items.map(([sq,en,num]) => `<article class="service"><span class="service-num">${num}</span><h3>${esc(currentLang==='sq'?sq:en)}</h3></article>`).join('');

    $('#projects-eyebrow').textContent = t(site.projects.eyebrow);
    $('#projects-title').textContent = t(site.projects.title);

    $('#heritage-eyebrow').textContent = t(site.heritage.eyebrow);
    $('#heritage-title').textContent = t(site.heritage.title);
    $('#heritage-description').textContent = t(site.heritage.description);
    $('#heritageList').innerHTML = site.heritage.list.map(([a,b]) => `<div><strong>${esc(t(a))}</strong><span>${esc(t(b))}</span></div>`).join('');

    $('#contact-eyebrow').textContent = t(site.contact.eyebrow);
    $('#contact-description').textContent = t(site.contact.description);
    $('#phone-label').textContent = t(site.contact.phone_label);
    $('#location-label').textContent = t(site.contact.location_label);
    $('#location-text').textContent = t(site.contact.location);
    $('#facebook-label').textContent = t(site.contact.facebook_label);
    $('#facebook-link').textContent = site.contact.facebook_text;

    $('#footer-tagline').textContent = ` · ${t(site.footer.tagline)}`;
    $('#footer-rights').textContent = t(site.footer.rights);
    $('#footer-location').textContent = t(site.footer.location);
    $('#modal-eyebrow').textContent = currentLang==='sq' ? 'Detajet e projektit' : 'Project details';
    $('#langBtn').textContent = currentLang === 'sq' ? 'EN' : 'SQ';
  }

  function renderProjects(){
    const grid = $('#projectGrid');
    grid.innerHTML = projects.map(p => {
      const title = currentLang==='sq' ? p.title : p.title_en;
      const loc = currentLang==='sq' ? p.location : p.location_en;
      const cat = currentLang==='sq' ? p.category : p.category_en;
      const desc = currentLang==='sq' ? p.description : p.description_en;
      return `<article class="project-card" data-project="${p.id}">
        <div class="project-cover"><img src="${esc(p.images[0])}" alt="${esc(title)}" loading="lazy"></div>
        <div class="project-body">
          <div class="tag">${esc(cat)}</div>
          <h3>${esc(title)}</h3>
          <div class="location">${esc(loc)}</div>
          <p>${esc(desc)}</p>
          <a href="#" class="details" data-project-open="${p.id}">${currentLang==='sq'?'Shiko projektin →':'View project →'}</a>
        </div>
      </article>`;
    }).join('');
    grid.querySelectorAll('[data-project-open]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); openProject(Number(el.dataset.projectOpen)); }));
  }

  function openProject(id){
    currentProject = projects.find(p => p.id === Number(id));
    const modal = $('#projectModal');
    if (!currentProject || !modal) return;
    $('#modalTitle').textContent = currentLang==='sq' ? currentProject.title : currentProject.title_en;
    $('#modalMeta').textContent = `${currentLang==='sq'?currentProject.location:currentProject.location_en} · ${currentLang==='sq'?currentProject.category:currentProject.category_en}`;
    $('#modalCopy').textContent = currentLang==='sq' ? currentProject.description : currentProject.description_en;
    $('#modalGallery').innerHTML = currentProject.images.map((im,n) => `<img src="${esc(im)}" alt="${esc(currentLang==='sq'?currentProject.title:currentProject.title_en)} — ${n+1}" loading="lazy" data-lightbox-index="${n}">`).join('');
    $('#modalGallery').querySelectorAll('[data-lightbox-index]').forEach(img => img.addEventListener('click', () => openLightbox(Number(img.dataset.lightboxIndex))));
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  }

  function closeProject(){
    const modal = $('#projectModal'); if (!modal) return;
    modal.classList.remove('open'); modal.setAttribute('aria-hidden','true');
    closeLightbox(); document.body.style.overflow='';
  }

  function openLightbox(index){
    if (!currentProject) return;
    lightboxIndex = index;
    updateLightbox();
    const box = $('#lightbox'); box.classList.add('open'); box.setAttribute('aria-hidden','false');
  }
  function updateLightbox(){
    if (!currentProject) return;
    const img = $('#lightboxImage');
    img.src = currentProject.images[lightboxIndex];
    img.alt = `${currentLang==='sq'?currentProject.title:currentProject.title_en} — ${lightboxIndex+1}`;
    $('#lightboxCaption').textContent = `${lightboxIndex+1} / ${currentProject.images.length}`;
  }
  function closeLightbox(){ const box=$('#lightbox'); if(!box) return; box.classList.remove('open'); box.setAttribute('aria-hidden','true'); }
  function stepLightbox(delta){
    if (!currentProject) return;
    lightboxIndex = (lightboxIndex + delta + currentProject.images.length) % currentProject.images.length;
    updateLightbox();
  }

  function setLang(lang){
    currentLang = lang === 'en' ? 'en' : 'sq';
    document.documentElement.lang = currentLang;
    try { localStorage.setItem('toniLang', currentLang); } catch(e) {}
    renderStaticContent();
    renderProjects();
    if (currentProject && $('#projectModal').classList.contains('open')) openProject(currentProject.id);
  }

  document.addEventListener('DOMContentLoaded', () => {
    $('#langBtn')?.addEventListener('click', () => setLang(currentLang === 'sq' ? 'en' : 'sq'));
    const menuBtn=$('#menuBtn'), nav=$('#navLinks');
    menuBtn?.addEventListener('click',()=>{ const open=nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded',String(open)); });
    nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open'); menuBtn?.setAttribute('aria-expanded','false');}));
    $('#closeModal')?.addEventListener('click', closeProject);
    $('#projectModal')?.addEventListener('click', e => { if(e.target === $('#projectModal')) closeProject(); });
    $('#lightboxClose')?.addEventListener('click', closeLightbox);
    $('#lightboxPrev')?.addEventListener('click', ()=>stepLightbox(-1));
    $('#lightboxNext')?.addEventListener('click', ()=>stepLightbox(1));
    $('#lightbox')?.addEventListener('click', e=>{ if(e.target === $('#lightbox')) closeLightbox(); });
    document.addEventListener('keydown', e=>{
      if(e.key==='Escape'){ if($('#lightbox').classList.contains('open')) closeLightbox(); else closeProject(); }
      if($('#lightbox').classList.contains('open')){ if(e.key==='ArrowLeft') stepLightbox(-1); if(e.key==='ArrowRight') stepLightbox(1); }
    });
    renderStaticContent(); renderProjects();
  });
})();
