/* ==========================================================================
   Tri Nur Raafi — Interactive Portfolio Script
   Features:
   1. Rotating Hero Words ("Builds", "Codes", "Architects", "Solves")
   2. Web Audio API Lo-Fi Synth Player (Zero external MP3 dependency!)
   3. Project Case Study Modal Pop-up (SaranaCare, SchoolFin, Nexora AI)
   4. Live AI Token & Word Estimator
   5. Ambient Star/Cloud Canvas & Light/Dark Theme Switcher
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* --------------------------------------------------------------------------
     1. ROTATING HERO WORDS
     -------------------------------------------------------------------------- */
  const words = ["Builds.", "Codes.", "Architects.", "Solves."];
  let wordIndex = 0;
  const rotatingWordEl = document.getElementById("rotatingWord");

  if (rotatingWordEl) {
    setInterval(() => {
      rotatingWordEl.classList.add("fade-out");
      setTimeout(() => {
        wordIndex = (wordIndex + 1) % words.length;
        rotatingWordEl.textContent = words[wordIndex];
        rotatingWordEl.classList.remove("fade-out");
      }, 300);
    }, 2600);
  }

  /* --------------------------------------------------------------------------
     2. THEME TOGGLE (DARK / LIGHT)
     -------------------------------------------------------------------------- */
  const themeToggleBtn = document.getElementById("themeToggle");
  const htmlEl = document.documentElement;

  const savedTheme = localStorage.getItem("raafi_theme") || "dark";
  htmlEl.setAttribute("data-theme", savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const current = htmlEl.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      htmlEl.setAttribute("data-theme", next);
      localStorage.setItem("raafi_theme", next);
    });
  }

  /* --------------------------------------------------------------------------
     3. MOBILE NAVIGATION DIALOG
     -------------------------------------------------------------------------- */
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const closeMobileMenuBtn = document.getElementById("closeMobileMenuBtn");
  const mobileNavDialog = document.getElementById("mobileNavDialog");

  if (mobileMenuBtn && mobileNavDialog) {
    mobileMenuBtn.addEventListener("click", () => mobileNavDialog.showModal());
    closeMobileMenuBtn.addEventListener("click", () => mobileNavDialog.close());
    mobileNavDialog.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => mobileNavDialog.close());
    });
    mobileNavDialog.addEventListener("click", (e) => {
      const rect = mobileNavDialog.getBoundingClientRect();
      const inDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;
      if (!inDialog) mobileNavDialog.close();
    });
  }

  /* --------------------------------------------------------------------------
     4. MUSIC PLAYER WIDGET (HTML5 AUDIO & SYNTH FALLBACK)
     -------------------------------------------------------------------------- */
  const tracks = [
    {
      title: "Sekian, Terima Kasih",
      artist: "The Jeblogs & Lealona",
      src: "assets/audio/sekian-terima-kasih.mp3",
      duration: 207
    }
  ];

  let currentTrackIndex = 0;
  let isPlaying = false;
  let currentSeconds = 0;
  let audioCtx = null;
  let synthTimer = null;
  let progressTimer = null;
  let noteStep = 0;

  const audioEl = new Audio();
  audioEl.preload = "metadata";

  const vinylPlayer = document.getElementById("vinylPlayer");
  const vinylDisc = document.getElementById("vinylDisc");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const prevTrackBtn = document.getElementById("prevTrackBtn");
  const nextTrackBtn = document.getElementById("nextTrackBtn");
  const trackTitleEl = document.getElementById("trackTitle");
  const trackArtistEl = document.getElementById("trackArtist");
  const progressBar = document.getElementById("progressBar");
  const progressContainer = document.getElementById("progressContainer");
  const currentTimeEl = document.getElementById("currentTime");
  const totalDurationEl = document.getElementById("totalDuration");

  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  function loadTrackUI(index) {
    const t = tracks[index];
    trackTitleEl.textContent = t.title;
    trackArtistEl.textContent = t.artist;
    currentSeconds = 0;
    progressBar.style.width = "0%";
    currentTimeEl.textContent = "0:00";

    if (t.src) {
      audioEl.src = t.src;
      totalDurationEl.textContent = t.duration ? formatTime(t.duration) : "--:--";
    } else {
      audioEl.pause();
      totalDurationEl.textContent = formatTime(t.duration);
      updateProgressUI();
    }
  }

  function updateProgressUI() {
    const t = tracks[currentTrackIndex];
    const dur = t.duration || 1;
    const pct = Math.min(100, (currentSeconds / dur) * 100);
    progressBar.style.width = `${pct}%`;
    currentTimeEl.textContent = formatTime(currentSeconds);
  }

  audioEl.addEventListener("loadedmetadata", () => {
    if (tracks[currentTrackIndex].src && audioEl.duration) {
      totalDurationEl.textContent = formatTime(audioEl.duration);
    }
  });

  audioEl.addEventListener("timeupdate", () => {
    if (tracks[currentTrackIndex].src && audioEl.duration) {
      const pct = (audioEl.currentTime / audioEl.duration) * 100;
      progressBar.style.width = `${pct}%`;
      currentTimeEl.textContent = formatTime(audioEl.currentTime);
      totalDurationEl.textContent = formatTime(audioEl.duration);
    }
  });

  audioEl.addEventListener("ended", () => {
    pausePlayback();
    audioEl.currentTime = 0;
    progressBar.style.width = "0%";
    currentTimeEl.textContent = "0:00";
  });

  function playSoftNote(freq) {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.65);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.7);
  }

  const PLAY_ICON_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6,4 20,12 6,20"></polygon></svg>';
  const PAUSE_ICON_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>';

  function startPlayback() {
    isPlaying = true;
    playPauseBtn.innerHTML = PAUSE_ICON_SVG;
    if (vinylPlayer) vinylPlayer.classList.add("is-playing");
    vinylDisc.classList.add("spinning");

    const activeTrack = tracks[currentTrackIndex];

    if (activeTrack.src) {
      clearInterval(synthTimer);
      clearInterval(progressTimer);
      audioEl.play().catch((err) => {
        console.warn("Audio playback notice:", err);
      });
    } else {
      audioEl.pause();
      playSoftNote(activeTrack.notes[noteStep % activeTrack.notes.length]);

      synthTimer = setInterval(() => {
        noteStep++;
        const track = tracks[currentTrackIndex];
        if (track.notes) {
          const freq = track.notes[noteStep % track.notes.length];
          playSoftNote(freq);
        }
      }, 550);

      progressTimer = setInterval(() => {
        currentSeconds++;
        const track = tracks[currentTrackIndex];
        if (currentSeconds >= track.duration) {
          nextTrack();
        } else {
          updateProgressUI();
        }
      }, 1000);
    }
  }

  function pausePlayback() {
    isPlaying = false;
    playPauseBtn.innerHTML = PLAY_ICON_SVG;
    if (vinylPlayer) vinylPlayer.classList.remove("is-playing");
    vinylDisc.classList.remove("spinning");
    audioEl.pause();
    clearInterval(synthTimer);
    clearInterval(progressTimer);
  }

  function nextTrack() {
    audioEl.currentTime = 0;
    if (isPlaying) {
      audioEl.play().catch(() => {});
    } else {
      progressBar.style.width = "0%";
      currentTimeEl.textContent = "0:00";
    }
  }

  function prevTrack() {
    audioEl.currentTime = 0;
    if (isPlaying) {
      audioEl.play().catch(() => {});
    } else {
      progressBar.style.width = "0%";
      currentTimeEl.textContent = "0:00";
    }
  }

  if (playPauseBtn) {
    loadTrackUI(currentTrackIndex);
    playPauseBtn.addEventListener("click", () => {
      if (isPlaying) pausePlayback();
      else startPlayback();
    });
    nextTrackBtn.addEventListener("click", nextTrack);
    prevTrackBtn.addEventListener("click", prevTrack);

    progressContainer.addEventListener("click", (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      const activeTrack = tracks[currentTrackIndex];

      if (activeTrack.src) {
        if (audioEl.duration) {
          audioEl.currentTime = ratio * audioEl.duration;
        }
      } else {
        currentSeconds = Math.floor(ratio * activeTrack.duration);
        updateProgressUI();
      }
    });
  }

  /* --------------------------------------------------------------------------
     5. INTERACTIVE PROJECT MODAL (CASE STUDIES)
     -------------------------------------------------------------------------- */
  const projectData = {
    saranacare: {
      category: "SYSTEM ARCHITECTURE / FULL-STACK WEB APP",
      title: "SaranaCare — Sistem Pengaduan Fasilitas Sekolah",
      subtitle: "Platform pelaporan kerusakan sarana & prasarana sekolah terpadu dengan pelacakan siklus hidup tiket (ticket lifecycle) secara transparan & real-time.",
      idea: "Memudahkan siswa, guru, dan staf sekolah melaporkan kerusakan sarana (proyektor lab RPL, AC perpustakaan, komputer) tanpa birokrasi berbelit, sekaligus memberikan visibilitas status pengerjaan secara transparan.",
      approach: "Dirancang mulai dari pemodelan alur Flowchart Swimlane lintas peran (Siswa, Admin Sarpras, Teknisi), normalisasi skema ERD MySQL 3NF, sistem prepared statement PDO untuk keamanan query, serta State Machine untuk integritas siklus tiket.",
      tech: "PHP Native 8+ (PDO) · MySQL Relational · Swimlane & ERD Modeling · Vanilla JS · Responsive CSS",
      previewHTML: `
        <div class="modal-screenshot-frame">
          <img src="assets/img/saranacare.png" alt="Tampilan Antarmuka SaranaCare" class="modal-screenshot-img">
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <strong style="color:var(--accent-primary);">Simulasi State Machine Siklus Tiket #SC-204</strong>
          <span class="mono-tag">LIFECYCLE FLOW</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px; text-align:center; font-size:0.75rem;">
          <div style="display:flex; align-items:center; justify-content:center; gap:4px; padding:10px; border-radius:8px; background:rgba(52,211,153,0.15); border:1px solid var(--status-green);">
            1. Diajukan <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div style="display:flex; align-items:center; justify-content:center; gap:4px; padding:10px; border-radius:8px; background:rgba(52,211,153,0.15); border:1px solid var(--status-green);">
            2. Diverifikasi <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div style="display:flex; align-items:center; justify-content:center; gap:4px; padding:10px; border-radius:8px; background:rgba(251,191,36,0.2); border:1px solid var(--accent-warm); font-weight:700;">
            3. Diproses <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </div>
          <div style="padding:10px; border-radius:8px; background:rgba(148,163,184,0.1);">4. Selesai</div>
        </div>
        <div style="margin-top:12px; padding:10px; border-radius:8px; background:#090d16; font-family:var(--font-mono); font-size:0.72rem; color:#38bdf8;">
          <code>UPDATE pengaduan SET status = 'diproses', teknisi_id = 4 WHERE id = 204;</code>
        </div>
      `
    },
    schoolfin: {
      category: "FINANCIAL SYSTEM / FULL-STACK PHP & MYSQL",
      title: "SchoolFin — Sistem Keuangan & Pembayaran SPP Sekolah",
      subtitle: "Aplikasi web tata kelola administrasi keuangan sekolah, pencatatan transaksi SPP multi-pos, rekap otomatis tunggakan siswa, dan jurnal neraca otomatis.",
      idea: "Mengeliminasi pencatatan manual buku kas yang rentan salah hitung dengan sistem kasir SPP terdigitalisasi, pelacakan riwayat pembayaran per siswa, cetak kuitansi instan, dan integrasi payment gateway.",
      approach: "Mengimplementasikan arsitektur PHP Native 8+ berbasis PDO prepared statements untuk integritas data, relasi database debit-kredit otomatis, integrasi Midtrans Snap untuk pembayaran digital, dan visualisasi Chart.js untuk rekap penerimaan.",
      tech: "PHP 8 (PDO) · MySQL Relational · Chart.js · Midtrans Payment Gateway · Bootstrap 5 / Vanilla CSS",
      previewHTML: `
        <div class="modal-screenshot-frame">
          <img src="assets/img/schoolfin.png" alt="Tampilan Dashboard Keuangan SchoolFin" class="modal-screenshot-img">
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <strong style="color:#10b981;">Buku Jurnal Kas &amp; Pembayaran Real-Time</strong>
          <span class="mono-tag">AUTOMATED LEDGER</span>
        </div>
        <div style="background:#090d16; padding:12px; border-radius:8px; font-family:var(--font-mono); font-size:0.75rem; display:grid; gap:8px;">
          <div style="display:flex; justify-content:space-between; color:#34d399; border-bottom:1px solid rgba(148,163,184,0.1); padding-bottom:6px;">
            <span>TX-2026-1049 · SPP Okt (Ananda Putra - XII RPL 1)</span>
            <strong>+Rp 250.000 [LUNAS]</strong>
          </div>
          <div style="display:flex; justify-content:space-between; color:#34d399; border-bottom:1px solid rgba(148,163,184,0.1); padding-bottom:6px;">
            <span>TX-2026-1048 · SPP Okt (Siti Nurhaliza - XI TKJ 2)</span>
            <strong>+Rp 250.000 [LUNAS]</strong>
          </div>
          <div style="display:flex; justify-content:space-between; color:#fbbf24;">
            <span>TX-2026-1047 · SPP Okt (Budi Santoso - X DKV 1)</span>
            <strong>Menunggu Verifikasi</strong>
          </div>
        </div>
      `
    },
    nexora: {
      category: "CREATIVE AI / MODERN AI ASSISTANT",
      title: "Nexora AI — Modern AI Assistant & Prompt Workspace",
      subtitle: "Platform asisten AI modern bertenaga Google Gemini API dengan live token streaming, Google Search grounding, Firebase Auth, dan Cloud Firestore.",
      idea: "Menyediakan asisten AI yang responsif, cerdas, dan estetik untuk membantu pengguna dalam eksplorasi ide, debugging kode, analisis arsitektur database, serta perangkuman informasi berbasis internet real-time.",
      approach: "Mengintegrasikan Google Gemini API dengan streaming respon real-time, sistem penelusuran web via Google Search Grounding, autentikasi multi-user Firebase, serta Cloud Firestore untuk penyimpanan riwayat percakapan.",
      tech: "Google Gemini API · Firebase Authentication · Cloud Firestore · Web Search Grounding · Modern Vanilla JS",
      previewHTML: `
        <div class="modal-screenshot-frame">
          <img src="assets/img/nexora.png" alt="Tampilan Platform Nexora AI Assistant" class="modal-screenshot-img">
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <strong style="color:#a855f7;">Gemini Streaming Engine &amp; Web Grounding</strong>
          <span class="mono-tag">GEMINI 1.5 PRO · 42 TPS</span>
        </div>
        <div style="background:#090d16; border:1px solid rgba(168,85,247,0.25); padding:12px; border-radius:8px; font-size:0.78rem;">
          <div style="display:flex; align-items:center; gap:6px; color:var(--text-secondary); margin-bottom:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <em>Prompt:</em> "Optimalkan query rekap tunggakan siswa SchoolFin."
          </div>
          <div style="display:flex; align-items:flex-start; gap:6px; color:#c084fc; line-height:1.45;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0; margin-top:3px;" aria-hidden="true"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"></path></svg>
            <div><strong>Nexora AI:</strong> "Gunakan <code>LEFT JOIN</code> antara master siswa dan tabel transaksi dengan filter bulan aktif agar deteksi siswa yang belum bayar selesai dalam satu kali query terindeks."</div>
          </div>
        </div>
      `
    }
  };

  const projectModal = document.getElementById("projectModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const modalDiscussBtn = document.getElementById("modalDiscussBtn");

  document.querySelectorAll(".project-card").forEach((card) => {
    const openCardModal = () => {
      const key = card.getAttribute("data-project");
      const data = projectData[key];
      if (!data || !projectModal) return;

      document.getElementById("modalCategory").textContent = data.category;
      document.getElementById("modalTitle").textContent = data.title;
      document.getElementById("modalSubtitle").textContent = data.subtitle;
      document.getElementById("modalIdea").textContent = data.idea;
      document.getElementById("modalApproach").textContent = data.approach;
      document.getElementById("modalTech").textContent = data.tech;
      document.getElementById("modalInteractivePreview").innerHTML = data.previewHTML;

      projectModal.showModal();
    };

    card.addEventListener("click", openCardModal);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openCardModal();
      }
    });
  });

  if (closeModalBtn && projectModal) {
    closeModalBtn.addEventListener("click", () => projectModal.close());
    projectModal.addEventListener("click", (e) => {
      const rect = projectModal.getBoundingClientRect();
      const inDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;
      if (!inDialog) projectModal.close();
    });
  }

  if (modalDiscussBtn && projectModal) {
    modalDiscussBtn.addEventListener("click", () => projectModal.close());
  }

  /* --------------------------------------------------------------------------
     6. PLAYGROUND: LIVE AI TOKEN & WORD ESTIMATOR
     -------------------------------------------------------------------------- */
  const promptInput = document.getElementById("promptInput");
  const wordCountEl = document.getElementById("wordCount");
  const charCountEl = document.getElementById("charCount");
  const tokenCountEl = document.getElementById("tokenCount");

  function updateTokenStats() {
    if (!promptInput) return;
    const text = promptInput.value.trim();
    const chars = text.length;
    const words = text ? text.split(/\s+/).length : 0;
    // Standard rule of thumb: ~1 token per 4 chars or ~1.35 tokens per word
    const estTokens = text ? Math.max(1, Math.ceil(chars / 3.8)) : 0;

    wordCountEl.textContent = words;
    charCountEl.textContent = chars;
    tokenCountEl.textContent = estTokens;
  }

  if (promptInput) {
    updateTokenStats();
    promptInput.addEventListener("input", updateTokenStats);
  }


  /* --------------------------------------------------------------------------
     8. AMBIENT FLOATING PARTICLES CANVAS
     -------------------------------------------------------------------------- */
  const canvas = document.getElementById("ambientCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    for (let i = 0; i < 36; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.6,
        dx: (Math.random() - 0.5) * 0.25,
        dy: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.5 + 0.15
      });
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }
});
