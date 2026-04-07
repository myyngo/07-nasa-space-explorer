// script.js - NASA Space Explorer App
// ⚠️ IMPORTANT: Replace the value below with your actual NASA API key
const API_KEY = 'mUdztpfTaOxKvhinEboTKSaa9lfzxYyrFCtTfPxC';
 
// ── EXTRA CREDIT: Random Space Facts ────────────────────────────────────────
const spaceFacts = [
  "A day on Venus is longer than a year on Venus — it rotates so slowly that the Sun rises only twice per Venusian year.",
  "Neutron stars are so dense that a teaspoon of their material would weigh about 10 million tons on Earth.",
  "The footprints left by Apollo astronauts on the Moon will last at least 100 million years — there's no wind to erode them.",
  "There are more stars in the observable universe than grains of sand on all of Earth's beaches.",
  "Jupiter's Great Red Spot is a storm that has been raging for over 350 years.",
  "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
  "Saturn's rings are mostly ice and rock, yet only about 30 feet thick in some places.",
  "One million Earths could fit inside the Sun.",
  "The coldest known place in the universe is the Boomerang Nebula at -272°C — just 1° above absolute zero.",
  "There is a giant cloud of alcohol floating in space — the Sagittarius B2 cloud contains billions of liters of ethanol.",
  "A year on Mercury is just 88 Earth days long.",
  "The Olympus Mons volcano on Mars is nearly three times the height of Mount Everest.",
];
 
function displayRandomFact() {
  const factEl = document.getElementById('space-fact');
  if (factEl) {
    const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
    factEl.textContent = randomFact;
  }
}
 
// ── NASA APOD API FETCH ──────────────────────────────────────────────────────
async function fetchAPOD(startDate, endDate) {
  const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`NASA API error (${response.status}). Check your API key and date range.`);
  }
  const data = await response.json();
  // API returns an array for date ranges, single object for one date
  return Array.isArray(data) ? data : [data];
}
 
// ── BUILD GALLERY ITEM ───────────────────────────────────────────────────────
function buildGalleryItem(item) {
  let mediaHTML;
 
  if (item.media_type === 'video') {
    // EXTRA CREDIT: Handle video entries
    const thumbUrl = item.thumbnail_url || '';
    mediaHTML = `
      <a class="video-link" href="${item.url}" target="_blank" rel="noopener noreferrer">
        ${thumbUrl ? `<img src="${thumbUrl}" alt="${item.title}" loading="lazy" />` : '<div class="video-icon-box">▶</div>'}
        <div class="video-badge">VIDEO</div>
      </a>`;
  } else {
    mediaHTML = `<img src="${item.url}" alt="${item.title}" loading="lazy" />`;
  }
 
  return `
    <div class="gallery-item"
      data-title="${encodeURIComponent(item.title)}"
      data-date="${item.date}"
      data-explanation="${encodeURIComponent(item.explanation)}"
      data-url="${item.url}"
      data-hdurl="${item.hdurl || item.url}"
      data-media-type="${item.media_type}">
      ${mediaHTML}
      <div class="gallery-caption">
        <h3>${item.title}</h3>
        <p>${item.date}</p>
      </div>
    </div>`;
}
 
// ── DISPLAY GALLERY ──────────────────────────────────────────────────────────
function displayGallery(items) {
  const gallery = document.getElementById('gallery');
 
  if (!items || items.length === 0) {
    gallery.innerHTML = '<p class="gallery-message">No images found for this date range.</p>';
    return;
  }
 
  gallery.innerHTML = items.map(buildGalleryItem).join('');
 
  // Attach click listeners for modal
  gallery.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => openModal(item.dataset));
  });
}
 
// ── MODAL ────────────────────────────────────────────────────────────────────
function openModal(data) {
  const title = decodeURIComponent(data.title);
  const date = data.date;
  const explanation = decodeURIComponent(data.explanation);
  const url = data.url;
  const hdurl = data.hdurl;
  const mediaType = data.mediaType;
 
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modal-img');
  const modalVideo = document.getElementById('modal-video');
  const modalTitle = document.getElementById('modal-title');
  const modalDate = document.getElementById('modal-date');
  const modalExplanation = document.getElementById('modal-explanation');
 
  modalTitle.textContent = title;
  modalDate.textContent = date;
  modalExplanation.textContent = explanation;
 
  if (mediaType === 'video') {
    modalImg.style.display = 'none';
    modalVideo.style.display = 'block';
    // Embed YouTube iframe if it's a YouTube URL
    modalVideo.innerHTML = `<iframe src="${url}" frameborder="0" allowfullscreen></iframe>`;
  } else {
    modalVideo.style.display = 'none';
    modalVideo.innerHTML = '';
    modalImg.style.display = 'block';
    modalImg.src = hdurl;
    modalImg.alt = title;
  }
 
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
 
function closeModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
  document.body.style.overflow = '';
 
  // Stop video playback by clearing the iframe
  const modalVideo = document.getElementById('modal-video');
  if (modalVideo) modalVideo.innerHTML = '';
}
 
// ── MAIN BUTTON HANDLER ──────────────────────────────────────────────────────
async function getSpaceImages() {
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  const gallery = document.getElementById('gallery');
 
  if (!startDate || !endDate) {
    gallery.innerHTML = '<p class="gallery-message error">⚠️ Please select both a start and end date.</p>';
    return;
  }
 
  if (startDate > endDate) {
    gallery.innerHTML = '<p class="gallery-message error">⚠️ Start date must be before end date.</p>';
    return;
  }
 
  // Show loading message
  gallery.innerHTML = '<p class="gallery-message loading">🔄 Loading space photos...</p>';
 
  try {
    const data = await fetchAPOD(startDate, endDate);
    displayGallery(data);
  } catch (error) {
    gallery.innerHTML = `<p class="gallery-message error">❌ ${error.message}</p>`;
    console.error('APOD fetch error:', error);
  }
}
 
// ── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Show a random space fact
  displayRandomFact();
 
  // Hook up the "Get Space Images" button
  // ⚠️ Check your index.html and match the button's actual id here:
  const btn = document.getElementById('fetch-btn');
  if (btn) btn.addEventListener('click', getSpaceImages);
 
  // Modal: close button
  const closeBtn = document.getElementById('modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
 
  // Modal: click outside to close
  const modal = document.getElementById('modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
 
  // Modal: Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});
 