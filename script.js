/* ═══════════════════════════════════════════════════════════
   CONFIGURATION
══════════════════════════════════════════════════════════════ */

/*
  GOOGLE FORM SETUP — follow these steps once:

  1. Go to forms.google.com → Create a new form with 4 fields:
       Field 1: "Name"     (Short answer)
       Field 2: "Email"    (Short answer)
       Field 3: "Subject"  (Short answer)
       Field 4: "Message"  (Paragraph)

  2. Click the 3-dot menu (⋮) in the top right → "Get pre-filled link"
     Fill dummy text in each field → click "Get Link" → copy the URL.

  3. From the URL, extract each "entry.XXXXXXXXXX" value.
     Example URL looks like:
     https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?
       usp=pp_url
       &entry.123456789=Name+Here
       &entry.987654321=email%40here.com
       ...

  4. Paste your form's base URL (ending in /formResponse) into
     GOOGLE_FORM_URL below, and paste each entry ID.

  5. In Form Settings → Responses, enable "Collect email addresses: Off"
     so anyone can submit without a Google account.
*/

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdZaH_svPudD52AJCswhtHJno5KriadKpt5dez-NSncRKWxKw/formResponse';
const ENTRY_NAME        = 'entry.829646381';   
const ENTRY_EMAIL       = 'entry.1112051136';   
const ENTRY_SUBJECT     = 'entry.1891753752';   
const ENTRY_MESSAGE     = 'entry.456460114';   

/* ═══════════════════════════════════════════════════════════
   PAGE NAVIGATION
══════════════════════════════════════════════════════════════ */
const PAGE_IDS = {
  about:   'page-about',
  research:'page-research',
  gis:     'page-gis',
  gallery: 'page-gallery',
  contact: 'page-contact'
};
const PAGE_ORDER    = ['about','research','gis','gallery','contact'];
const ANIM_MS       = 480;

let current         = 'about';
let isTransitioning = false;

function showPage(key) {
  const el = document.getElementById(PAGE_IDS[key]);
  el.classList.add('active');
  el.classList.remove('leaving','entering');
}
function hidePage(key) {
  const el = document.getElementById(PAGE_IDS[key]);
  el.classList.remove('active','leaving','entering');
}

function goToPage(key) {
  if (key === current || isTransitioning) return;
  isTransitioning = true;

  const outEl = document.getElementById(PAGE_IDS[current]);
  const inEl  = document.getElementById(PAGE_IDS[key]);

  outEl.classList.add('leaving');

  setTimeout(() => {
    outEl.classList.remove('active','leaving');
    inEl.classList.add('active','entering');

    if (key === 'research') initResearchAnim();
    if (key === 'gis')      initGISAnim();
    if (key === 'gallery')  initGallery();

    window.scrollTo({ top: 0, behavior: 'instant' });

    setTimeout(() => {
      inEl.classList.remove('entering');
      isTransitioning = false;
    }, ANIM_MS);
  }, ANIM_MS);

  current = key;
  document.getElementById('nav-select').value = key;
  document.getElementById('back-nav').classList.toggle('visible', key !== 'about');
}

function goBack() {
  const idx = PAGE_ORDER.indexOf(current);
  if (idx > 0) goToPage(PAGE_ORDER[idx - 1]);
}

/* ═══════════════════════════════════════════════════════════
   PAGE 2 — Research scroll animation
══════════════════════════════════════════════════════════════ */
let researchObserver = null;

function initResearchAnim() {
  if (researchObserver) researchObserver.disconnect();
  const notes = document.querySelectorAll('.research-note');
  notes.forEach(n => n.classList.remove('torn-in','torn-out'));

  researchObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('torn-in');
        e.target.classList.remove('torn-out');
      } else {
        const r = e.target.getBoundingClientRect();
        if (r.top < 0) {
          e.target.classList.add('torn-out');
          e.target.classList.remove('torn-in');
        } else {
          e.target.classList.remove('torn-in','torn-out');
        }
      }
    });
  }, { threshold: 0.12, rootMargin: '-30px 0px' });

  notes.forEach(n => researchObserver.observe(n));
}

/* ═══════════════════════════════════════════════════════════
   PAGE 3 — GIS staggered entrance
══════════════════════════════════════════════════════════════ */
function initGISAnim() {
  const cards = document.querySelectorAll('.flip-card');
  cards.forEach(c => {
    c.style.transition = 'none';
    c.style.opacity    = '0';
    c.style.transform  = 'translateY(24px)';
  });
  cards.forEach((c, i) => {
    setTimeout(() => {
      c.style.transition = 'opacity 0.48s ease, transform 0.48s cubic-bezier(.22,.82,.22,1)';
      c.style.opacity    = '1';
      c.style.transform  = 'translateY(0)';
    }, i * 70 + 80);
  });
}

/* Flip cards — click toggle for touch devices */
document.querySelectorAll('.flip-card').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('flipped'));
});

/* ═══════════════════════════════════════════════════════════
   PAGE 4 — Gallery & Lightbox
══════════════════════════════════════════════════════════════ */
let galleryImages = [];
let lbIndex = 0;

function initGallery() {
  const items = document.querySelectorAll('.gallery-item');
  galleryImages = Array.from(items).map(el => el.querySelector('img').src);

  items.forEach((item, i) => {
    /* stagger-in each item */
    item.style.opacity   = '0';
    item.style.transform = 'translateY(18px)';
    setTimeout(() => {
      item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      item.style.opacity    = '1';
      item.style.transform  = 'translateY(0)';
    }, i * 55 + 60);

    /* lightbox click */
    item.addEventListener('click', () => openLightbox(i));
  });
}

function openLightbox(idx) {
  lbIndex = idx;
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lb-img');
  img.src = galleryImages[idx];
  lb.classList.add('open');
  document.addEventListener('keydown', lbKeyHandler);
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.removeEventListener('keydown', lbKeyHandler);
}
function shiftLightbox(dir) {
  lbIndex = (lbIndex + dir + galleryImages.length) % galleryImages.length;
  document.getElementById('lb-img').src = galleryImages[lbIndex];
}
function lbKeyHandler(e) {
  if (e.key === 'ArrowRight') shiftLightbox(1);
  if (e.key === 'ArrowLeft')  shiftLightbox(-1);
  if (e.key === 'Escape')     closeLightbox();
}

/* ═══════════════════════════════════════════════════════════
   PAGE 5 — Contact: Google Form submission
══════════════════════════════════════════════════════════════ */
function sendContactForm() {
  const name    = document.getElementById('cf-name').value.trim();
  const email   = document.getElementById('cf-email').value.trim();
  const subject = document.getElementById('cf-subject').value.trim();
  const message = document.getElementById('cf-message').value.trim();
  const errEl   = document.getElementById('form-error');

  if (!name || !email || !message) {
    errEl.style.display = 'block';
    highlightEmpty(['cf-name','cf-email','cf-message']);
    return;
  }
  errEl.style.display = 'none';

  /*
    We submit to Google Forms via a hidden <iframe> to avoid a
    page redirect. Google Forms accepts cross-origin POST to the
    /formResponse endpoint — it just returns a CORS-blocked
    response which we intentionally ignore.
  */
  const iframe = document.getElementById('gf-iframe') || createIframe();

  const form = document.createElement('form');
  form.method  = 'POST';
  form.action  = GOOGLE_FORM_URL;
  form.target  = 'gf-iframe';

  const fields = [
    [ENTRY_NAME,    name],
    [ENTRY_EMAIL,   email],
    [ENTRY_SUBJECT, subject || '(no subject)'],
    [ENTRY_MESSAGE, message]
  ];
  fields.forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type  = 'hidden';
    input.name  = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);

  /* Show success after short delay (form posts async via iframe) */
  setTimeout(() => {
    document.getElementById('contact-form-view').style.display    = 'none';
    document.getElementById('contact-success-view').style.display = 'block';
  }, 600);
}

function createIframe() {
  const iframe = document.createElement('iframe');
  iframe.name  = 'gf-iframe';
  iframe.id    = 'gf-iframe';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  return iframe;
}

function highlightEmpty(ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) {
      el.style.borderColor = '#a02820';
      el.style.boxShadow   = '0 0 0 3px rgba(160,40,32,0.1)';
      el.addEventListener('input', function clear() {
        el.style.borderColor = '';
        el.style.boxShadow   = '';
        el.removeEventListener('input', clear);
      });
    }
  });
}

function resetContactForm() {
  ['cf-name','cf-email','cf-subject','cf-message'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('contact-form-view').style.display    = 'block';
  document.getElementById('contact-success-view').style.display = 'none';
  document.getElementById('form-error').style.display           = 'none';
}

/* ═══════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════ */
(function init() {
  Object.keys(PAGE_IDS).forEach(hidePage);
  showPage('about');
  document.getElementById('nav-select').value = 'about';
  document.getElementById('back-nav').classList.remove('visible');
})();