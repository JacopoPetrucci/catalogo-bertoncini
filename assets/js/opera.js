document.addEventListener('DOMContentLoaded', function () {

  // --- SLIDER ---
  const slides = document.querySelectorAll('.partitura-slide');
  const prevBtn = document.querySelector('.slider-prev');
  const nextBtn = document.querySelector('.slider-next');
  let current = 0;

  function showSlide(n) {
    slides.forEach(s => s.classList.remove('active'));
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
  }

  if (prevBtn) prevBtn.addEventListener('click', () => showSlide(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showSlide(current + 1));

  // Nascondi frecce se c'è una sola immagine
  if (slides.length <= 1) {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
  }

  // --- PLAYER AUDIO ---
  const audio = document.getElementById('audio-el');
  if (!audio) return;

  const playBtn    = document.getElementById('ap-play');
  const iconPlay   = document.getElementById('icon-play');
  const iconPause  = document.getElementById('icon-pause');
  const current_t  = document.getElementById('ap-current');
  const duration_t = document.getElementById('ap-duration');
  const progressOverlay = document.getElementById('ap-progress-overlay');
  const waveformDiv = document.getElementById('ap-waveform');

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  // Play/Pause
  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      iconPlay.style.display = 'none';
      iconPause.style.display = 'block';
    } else {
      audio.pause();
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
    }
  });

  // Durata
  audio.addEventListener('loadedmetadata', () => {
    duration_t.textContent = formatTime(audio.duration);
  });

  // Aggiornamento tempo e progress
  audio.addEventListener('timeupdate', () => {
    current_t.textContent = formatTime(audio.currentTime);
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progressOverlay.style.width = pct + '%';
  });

  // Click sulla waveform per saltare
  waveformDiv.addEventListener('click', (e) => {
    const rect = waveformDiv.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  });

  // Reset icona a fine traccia
  audio.addEventListener('ended', () => {
    iconPlay.style.display = 'block';
    iconPause.style.display = 'none';
  });

  // Waveform simulata (barre casuali che rappresentano l'ampiezza)
  const canvas = document.getElementById('waveform-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth || 600;
    const H = canvas.offsetHeight || 48;
    canvas.width = W;
    canvas.height = H;
    const bars = 120;
    const barW = W / bars - 1;
    for (let i = 0; i < bars; i++) {
      const h = Math.random() * H * 0.7 + H * 0.1;
      ctx.fillStyle = 'rgba(240, 236, 228, 0.35)';
      ctx.fillRect(i * (barW + 1), (H - h) / 2, barW, h);
    }
  }

});