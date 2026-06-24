document.addEventListener('DOMContentLoaded', function () {

  // --- SLIDER ---
  const slides = document.querySelectorAll('.partitura-slide');
  const prevBtn = document.querySelector('.slider-prev');
  const nextBtn = document.querySelector('.slider-next');
  const slider = document.querySelector('.partitura-slider');
  let current = 0;

  // Segue il bordo destro reale dell'immagine attiva (varia in base
  // alle dimensioni intrinseche dell'immagine e al layout disponibile)
  function positionNextArrow() {
    if (!nextBtn || !slider) return;
    const activeImg = slider.querySelector('.partitura-slide.active img');
    if (!activeImg) return;

    const imgRect = activeImg.getBoundingClientRect();
    const sliderRect = slider.getBoundingClientRect();
    const left = imgRect.right - sliderRect.left - nextBtn.offsetWidth - 10;
    nextBtn.style.left = Math.max(0, left) + 'px';
  }

  function showSlide(n) {
    slides.forEach(s => s.classList.remove('active'));
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    positionNextArrow();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => showSlide(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showSlide(current + 1));

  // Nascondi frecce se c'è una sola immagine
  if (slides.length <= 1) {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
  } else {
    const activeImg = slider && slider.querySelector('.partitura-slide.active img');
    if (activeImg) {
      if (activeImg.complete) {
        positionNextArrow();
      } else {
        activeImg.addEventListener('load', positionNextArrow);
      }
    }
    window.addEventListener('resize', positionNextArrow);
  }

  // --- MATERIALI ---
  const materialeButtons = document.querySelectorAll('.materiale-btn');
  const modal = document.getElementById('materiale-modal');

  if (materialeButtons.length && modal) {
    const modalBody = modal.querySelector('.materiale-modal-body');
    const modalClose = modal.querySelector('.materiale-modal-close');
    const modalOverlay = modal.querySelector('.materiale-modal-overlay');

    const closeModal = () => modal.classList.remove('open');

    const createItemEl = (path, type, label) => {
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(type)) {
        const img = document.createElement('img');
        img.src = path;
        img.alt = label;
        return img;
      }
      if (type === 'pdf') {
        const iframe = document.createElement('iframe');
        iframe.src = path;
        return iframe;
      }
      if (['mp3', 'wav', 'ogg'].includes(type)) {
        const audioEl = document.createElement('audio');
        audioEl.src = path;
        audioEl.controls = true;
        return audioEl;
      }
      const link = document.createElement('a');
      link.href = path;
      link.textContent = 'Apri file';
      link.target = '_blank';
      link.rel = 'noopener';
      return link;
    };

    const openModal = (items, label) => {
      modalBody.innerHTML = '';

      items.forEach(item => {
        const wrapper = document.createElement('div');
        wrapper.className = 'materiale-item';
        wrapper.appendChild(createItemEl(item.path, item.type, label));
        modalBody.appendChild(wrapper);
      });

      modal.classList.add('open');
    };

    materialeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        let items = [];
        try { items = JSON.parse(btn.dataset.items || '[]'); } catch (e) {}
        openModal(items, btn.dataset.label);
      });
    });

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
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

  // Waveform reale, derivata dal contenuto dell'audio
  const canvas = document.getElementById('waveform-canvas');
  if (canvas && waveformDiv) {
    const barWidth = 2;
    const barGap = 2;
    const W = waveformDiv.offsetWidth || 600;
    const bars = Math.max(40, Math.floor(W / (barWidth + barGap)));

    const drawWaveform = (peaks) => {
      const dpr = window.devicePixelRatio || 1;
      const H = waveformDiv.offsetHeight || 48;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      const maxPeak = Math.max(...peaks) || 1;
      const step = W / peaks.length;
      ctx.lineCap = 'round';
      ctx.lineWidth = barWidth;
      ctx.strokeStyle = 'rgba(240, 236, 228, 0.45)';
      peaks.forEach((p, i) => {
        const x = i * step + step / 2;
        const h = Math.max(barWidth, (p / maxPeak) * H * 0.85);
        ctx.beginPath();
        ctx.moveTo(x, (H - h) / 2);
        ctx.lineTo(x, (H + h) / 2);
        ctx.stroke();
      });
    };

    const computePeaks = (audioBuffer, barCount) => {
      const data = audioBuffer.getChannelData(0);
      const blockSize = Math.floor(data.length / barCount);
      const peaks = [];
      for (let i = 0; i < barCount; i++) {
        const start = i * blockSize;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(data[start + j]);
        }
        peaks.push(sum / blockSize);
      }
      return peaks;
    };

    fetch(audio.currentSrc || audio.src)
      .then(res => res.arrayBuffer())
      .then(buf => {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const actx = new AudioCtx();
        return actx.decodeAudioData(buf);
      })
      .then(audioBuffer => drawWaveform(computePeaks(audioBuffer, bars)))
      .catch(() => {
        // Fallback: linea piatta se l'analisi dell'audio non è disponibile
        drawWaveform(new Array(bars).fill(1));
      });
  }

});