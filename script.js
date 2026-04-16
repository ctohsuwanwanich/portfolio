/* ═══════════════════════════════════════════════════════════
   CONFIGURATION — Google Form
══════════════════════════════════════════════════════════════ */
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdZaH_svPudD52AJCswhtHJno5KriadKpt5dez-NSncRKWxKw/formResponse';
const ENTRY_NAME    = 'entry.829646381';
const ENTRY_EMAIL   = 'entry.1112051136';
const ENTRY_SUBJECT = 'entry.1891753752';
const ENTRY_MESSAGE = 'entry.456460114';

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
const PAGE_ORDER    = ['about', 'research', 'gis', 'gallery', 'contact'];
const ANIM_MS       = 480;

let current         = 'about';
let isTransitioning = false;

function showPage(key) {
  var el = document.getElementById(PAGE_IDS[key]);
  el.classList.add('active');
  el.classList.remove('leaving', 'entering');
}
function hidePage(key) {
  var el = document.getElementById(PAGE_IDS[key]);
  el.classList.remove('active', 'leaving', 'entering');
}

function goToPage(key) {
  if (key === current || isTransitioning) return;
  isTransitioning = true;

  var outEl = document.getElementById(PAGE_IDS[current]);
  var inEl  = document.getElementById(PAGE_IDS[key]);

  outEl.classList.add('leaving');

  setTimeout(function() {
    outEl.classList.remove('active', 'leaving');
    inEl.classList.add('active', 'entering');

    if (key === 'research') initResearchAnim();
    if (key === 'gis')      initGISAnim();
    if (key === 'gallery')  initGallery();

    window.scrollTo({ top: 0, behavior: 'instant' });

    setTimeout(function() {
      inEl.classList.remove('entering');
      isTransitioning = false;
    }, ANIM_MS);
  }, ANIM_MS);

  current = key;
  document.getElementById('nav-select').value = key;
  var backNav = document.getElementById('back-nav');
  if (key !== 'about') {
    backNav.classList.add('visible');
  } else {
    backNav.classList.remove('visible');
  }
}

function goBack() {
  var idx = PAGE_ORDER.indexOf(current);
  if (idx > 0) goToPage(PAGE_ORDER[idx - 1]);
}

/* ═══════════════════════════════════════════════════════════
   PAGE 2 — Research scroll animation
══════════════════════════════════════════════════════════════ */
var researchObserver = null;

function initResearchAnim() {
  if (researchObserver) researchObserver.disconnect();
  var notes = document.querySelectorAll('.research-note');
  notes.forEach(function(n) {
    n.classList.remove('torn-in', 'torn-out');
  });

  researchObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('torn-in');
        e.target.classList.remove('torn-out');
      } else {
        var r = e.target.getBoundingClientRect();
        if (r.top < 0) {
          e.target.classList.add('torn-out');
          e.target.classList.remove('torn-in');
        } else {
          e.target.classList.remove('torn-in', 'torn-out');
        }
      }
    });
  }, { threshold: 0.12, rootMargin: '-30px 0px' });

  notes.forEach(function(n) { researchObserver.observe(n); });
}

/* ═══════════════════════════════════════════════════════════
   PAGE 3 — GIS staggered entrance
══════════════════════════════════════════════════════════════ */
function initGISAnim() {
  var cards = document.querySelectorAll('.flip-card');
  cards.forEach(function(c) {
    c.style.transition = 'none';
    c.style.opacity    = '0';
    c.style.transform  = 'translateY(24px)';
  });
  cards.forEach(function(c, i) {
    setTimeout(function() {
      c.style.transition = 'opacity 0.48s ease, transform 0.48s cubic-bezier(.22,.82,.22,1)';
      c.style.opacity    = '1';
      c.style.transform  = 'translateY(0)';
    }, i * 70 + 80);
  });
}

/* Flip cards — click toggle for touch devices */
document.querySelectorAll('.flip-card').forEach(function(card) {
  card.addEventListener('click', function() {
    card.classList.toggle('flipped');
  });
});

/* ═══════════════════════════════════════════════════════════
   PAGE 4 — Gallery & Lightbox
══════════════════════════════════════════════════════════════ */
var galleryImages = [];
var lbIndex = 0;

function initGallery() {
  var items = document.querySelectorAll('.gallery-item');
  galleryImages = Array.from(items).map(function(el) {
    return el.querySelector('img').src;
  });

  items.forEach(function(item, i) {
    item.style.opacity   = '0';
    item.style.transform = 'translateY(18px)';
    setTimeout(function() {
      item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      item.style.opacity    = '1';
      item.style.transform  = 'translateY(0)';
    }, i * 55 + 60);

    item.addEventListener('click', function() { openLightbox(i); });
  });
}

function openLightbox(idx) {
  lbIndex = idx;
  var lb  = document.getElementById('lightbox');
  var img = document.getElementById('lb-img');
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
  var name    = document.getElementById('cf-name').value.trim();
  var email   = document.getElementById('cf-email').value.trim();
  var subject = document.getElementById('cf-subject').value.trim();
  var message = document.getElementById('cf-message').value.trim();
  var errEl   = document.getElementById('form-error');

  if (!name || !email || !message) {
    errEl.style.display = 'block';
    highlightEmpty(['cf-name', 'cf-email', 'cf-message']);
    return;
  }
  errEl.style.display = 'none';

  var iframe = document.getElementById('gf-iframe');

  var form = document.createElement('form');
  form.method  = 'POST';
  form.action  = GOOGLE_FORM_URL;
  form.target  = 'gf-iframe';

  var fields = [
    [ENTRY_NAME,    name],
    [ENTRY_EMAIL,   email],
    [ENTRY_SUBJECT, subject || '(no subject)'],
    [ENTRY_MESSAGE, message]
  ];
  fields.forEach(function(pair) {
    var input = document.createElement('input');
    input.type  = 'hidden';
    input.name  = pair[0];
    input.value = pair[1];
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);

  setTimeout(function() {
    document.getElementById('contact-form-view').style.display    = 'none';
    document.getElementById('contact-success-view').style.display = 'block';
  }, 600);
}

function highlightEmpty(ids) {
  ids.forEach(function(id) {
    var el = document.getElementById(id);
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
  ['cf-name', 'cf-email', 'cf-subject', 'cf-message'].forEach(function(id) {
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