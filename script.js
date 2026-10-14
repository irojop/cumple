const screens = document.querySelectorAll(".screen");
const music = document.getElementById("music");
const musicBtn = document.getElementById("musicBtn");
const gift = document.getElementById("gift");
const finalMessage = document.getElementById("finalMessage");
const restart = document.getElementById("restart");
const hearts = document.getElementById("hearts");

let musicStarted = false;

function showScreen(id) {
  screens.forEach(screen => screen.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function startMusic() {
  if (!musicStarted) {
    music.play().then(() => {
      musicStarted = true;
      updateMusicButton();
    }).catch(() => {
      // El navegador puede bloquear el audio; el botón permite activarlo manualmente.
    });
  }
}

function updateMusicButton() {
  const playing = !music.paused;
  musicBtn.textContent = playing ? "🔊" : "🔇";
  musicBtn.setAttribute("aria-pressed", String(playing));
  musicBtn.setAttribute("aria-label", playing ? "Pausar música" : "Activar música");
}

document.querySelectorAll("[data-next]").forEach(button => {
  button.addEventListener("click", () => {
    startMusic();
    const next = button.dataset.next;
    showScreen(next);

    if (next === "cumple") {
      launchConfetti();
    }
  });
});

musicBtn.addEventListener("click", async () => {
  if (music.paused) {
    try {
      await music.play();
    } catch (e) {
      console.log("No se pudo iniciar el audio:", e);
    }
  } else {
    music.pause();
  }
  updateMusicButton();
});

music.addEventListener("play", updateMusicButton);
music.addEventListener("pause", updateMusicButton);

gift.addEventListener("click", () => {
  if (gift.classList.contains("opened")) return;

  gift.classList.add("opened");
  launchConfetti();
  setTimeout(() => {
    finalMessage.classList.add("show");
    document.querySelector(".tap-hint").style.display = "none";
    finalMessage.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 650);
});

restart.addEventListener("click", () => {
  gift.classList.remove("opened");
  finalMessage.classList.remove("show");
  document.querySelector(".tap-hint").style.display = "";
  showScreen("inicio");
});

function launchConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;

  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const pieces = Array.from({ length: 150 }, () => ({
    x: innerWidth / 2 + (Math.random() - .5) * 100,
    y: innerHeight * .35,
    vx: (Math.random() - .5) * 10,
    vy: Math.random() * -10 - 3,
    gravity: .22 + Math.random() * .12,
    size: 5 + Math.random() * 7,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - .5) * .3,
    life: 100 + Math.random() * 50,
    shape: Math.random() > .5 ? "rect" : "circle"
  }));

  let frame = 0;

  function draw() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    pieces.forEach(p => {
      p.x += p.vx;
      p.vy += p.gravity;
      p.y += p.vy;
      p.rotation += p.spin;
      p.life--;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      const colors = ["#f4a6c1", "#e8c77b", "#ffffff", "#d96b96", "#bda4f5"];
      ctx.fillStyle = colors[Math.floor((p.x + p.y + frame) / 17) % colors.length];

      if (p.shape === "rect") {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * .55);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    frame++;
    if (pieces.some(p => p.life > 0 && p.y < innerHeight + 40)) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
    }
  }

  draw();
}

function createHeart() {
  const heart = document.createElement("span");
  heart.className = "floating-heart";
  heart.textContent = Math.random() > .5 ? "♥" : "♡";
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.fontSize = (12 + Math.random() * 18) + "px";
  heart.style.animationDuration = (7 + Math.random() * 7) + "s";
  heart.style.color = Math.random() > .5 ? "#f4a6c1" : "#e8c77b";
  hearts.appendChild(heart);

  setTimeout(() => heart.remove(), 15000);
}

setInterval(createHeart, 1100);


// Galería en grupos de cuatro fotografías por página (20 fotos = 5 páginas).
const gallery = document.querySelector(".gallery");
if (gallery) {
  const galleryCards = Array.from(gallery.querySelectorAll(".photo-card"));
  const galleryPrev = document.getElementById("galleryPrev");
  const galleryNext = document.getElementById("galleryNext");
  const galleryPageInfo = document.getElementById("galleryPageInfo");
  const photosPerPage = 4;
  const totalPages = Math.ceil(galleryCards.length / photosPerPage);
  let galleryPage = 0;

  function renderGalleryPage() {
    const start = galleryPage * photosPerPage;
    const end = Math.min(start + photosPerPage, galleryCards.length);
    galleryCards.forEach((card, index) => {
      card.hidden = index < start || index >= end;
    });
    galleryPrev.disabled = galleryPage === 0;
    galleryNext.disabled = galleryPage >= totalPages - 1;
    galleryPageInfo.textContent = `Página ${galleryPage + 1} de ${totalPages} · Fotos ${start + 1}–${end} de ${galleryCards.length}`;
  }

  galleryPrev.addEventListener("click", () => {
    if (galleryPage > 0) { galleryPage--; renderGalleryPage(); }
  });
  galleryNext.addEventListener("click", () => {
    if (galleryPage < totalPages - 1) { galleryPage++; renderGalleryPage(); }
  });
  renderGalleryPage();
}
