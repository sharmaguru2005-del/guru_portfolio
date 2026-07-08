/**
 * Gurunarayan Sharma - Revamped Interaction Controller
 * Combines dynamic categorization, subpage routing, video thumbnail rendering,
 * circular reveal page transitions, search, scroll active highlight, and 3D fanning card tilts.
 */

let lastClickX = window.innerWidth / 2;
let lastClickY = window.innerHeight / 2;

let currentImageIndex = 0;
let activeProject = null;
let touchStartX = 0;
let touchEndX = 0;
let lastWheelTime = 0;
let videosUnlocked = false;

// Permanent project ordering mapping
const PROJECT_ORDER = [
  "rivea",
  "glow-skin",
  "mush",
  "rydr",
  "social-media",
  "real-state",
  "boat",
  "ai-photography"
];

// Predefined metadata mapping to enhance the dynamically loaded global PORTFOLIO_VIDEOS array
function processVideosDatabase() {
  if (typeof PORTFOLIO_VIDEOS === "undefined") return;

  const VIDEO_MAP = {
    "1.Rivea Product Showcase ad.mp4": { title: "Rivea Product Showcase", isHorizontal: false, locked: false, filePath: "./AI%20videos/1.Rivea%20Product%20Showcase%20ad.mp4" },
    "2.Rivea Skincare.mp4": { title: "Rivea Skincare Campaign", isHorizontal: false, locked: false, filePath: "./AI%20videos/2.Rivea%20Skincare.mp4" },
    "3.DJGF Show.mp4": { title: "DJGF Show", isHorizontal: false, locked: false, filePath: "./AI%20videos/3.DJGF%20Show.mp4" },
    "4.VIVI Honey.mp4": { title: "VIVI Honey Commercial", isHorizontal: false, locked: false, filePath: "./AI%20videos/4.VIVI%20Honey.mp4" },
    "boAt.mp4": { title: "boAt Wearables Campaign", isHorizontal: true, locked: true, filePath: "./AI%20videos/boAt.mp4" },
    "Burger ad.mp4": { title: "Burger Gourmet Campaign", isHorizontal: true, locked: true, filePath: "./AI%20videos/Burger%20ad.mp4" },
    "daWg.mp4": { title: "daWg Campaign", isHorizontal: false, locked: true, filePath: "./AI%20videos/daWg.mp4" },
    "Mother' Day video.mp4": { title: "Mother's Day Special", isHorizontal: false, locked: false, filePath: "./AI%20videos/Mother%27%20Day%20video.mp4" }
  };

  PORTFOLIO_VIDEOS.forEach((video) => {
    const enhancement = VIDEO_MAP[video.name];
    if (enhancement) {
      video.title = enhancement.title;
      video.locked = videosUnlocked ? false : enhancement.locked;
      video.isHorizontal = enhancement.isHorizontal;
      video.filePath = enhancement.filePath;
    } else {
      video.isHorizontal = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Sort projects permanently according to the defined manual order
  if (typeof PORTFOLIO_PROJECTS !== "undefined") {
    PORTFOLIO_PROJECTS.sort((a, b) => {
      const idxA = PROJECT_ORDER.indexOf(a.id);
      const idxB = PROJECT_ORDER.indexOf(b.id);
      return (idxA > -1 ? idxA : 99) - (idxB > -1 ? idxB : 99);
    });
  }

  // Merge dynamic video database with premium titles and aspect ratios
  processVideosDatabase();

  // Global click tracker for circular transitions coordinates
  document.addEventListener("click", (e) => {
    lastClickX = e.clientX;
    lastClickY = e.clientY;
  });

  // Global keydown listener for subpage gallery cycling
  document.addEventListener("keydown", (e) => {
    if (!activeProject) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      navigateGallery(1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      navigateGallery(-1);
    } else if (e.key === "Escape") {
      window.location.hash = "";
    }
  });

  initLoader();
  initCustomCursor();
  initRevealAnimations();
  initActiveNavHighlight();
  initPortfolioMaster();
  initVideosShowcase();
  initUnlockModal();
  initRouter();
  initMagneticButtons();

  // Fullscreen Video Player modal event bindings
  const videoModal = document.getElementById("videoModal");
  const videoModalClose = document.getElementById("videoModalClose");
  if (videoModal && videoModalClose) {
    videoModalClose.addEventListener("click", closeVideoModal);
    videoModal.addEventListener("click", (e) => {
      if (e.target === videoModal) closeVideoModal();
    });
  }

  // Password Unlock system event bindings
  const pwSubmitBtn = document.getElementById("videoUnlockSubmitBtn");
  const pwInput = document.getElementById("videoPasswordInput");
  const feedback = document.getElementById("passwordFeedback");
  const cancelBtn = document.getElementById("unlockModalCancel");

  if (pwSubmitBtn && pwInput) {
    const handleUnlockSubmit = () => {
      const enteredText = pwInput.value.trim();
      if (!enteredText) return;

      const hash = customHash(enteredText);
      const targetHash = 3317510227;

      if (hash === targetHash) {
        feedback.style.display = "none";
        pwInput.value = "";
        videosUnlocked = true;
        closeUnlockModal();

        // Re-evaluate locked parameters & recompile video showcase grids
        processVideosDatabase();
        initVideosShowcase();
      } else {
        feedback.innerHTML = "Incorrect password.<br>Please try again.";
        feedback.style.display = "block";
        pwInput.value = "";
        pwInput.focus();
      }
    };

    pwSubmitBtn.addEventListener("click", handleUnlockSubmit);
    pwInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleUnlockSubmit();
      }
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeUnlockModal);
  }
});

/* -----------------------------------------------
   1. Loader Controller
   ----------------------------------------------- */
function initLoader() {
  const loader = document.getElementById("loader");
  if (loader) {
    window.addEventListener("load", () => {
      setTimeout(() => {
        loader.classList.add("loaded");
      }, 600);
    });
    setTimeout(() => {
      loader.classList.add("loaded");
    }, 2500); // safety fallback
  }
}

/* -----------------------------------------------
   2. Custom Cursor
   ----------------------------------------------- */
function initCustomCursor() {
  const cursor = document.getElementById("customCursor");
  if (!cursor) return;

  let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
  const speed = 0.12;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  attachCursorHoverListeners();
}

function attachCursorHoverListeners() {
  const cursor = document.getElementById("customCursor");
  if (!cursor) return;

  const interactives = document.querySelectorAll("a, button, .project-card, .video-card, .menu-toggle, .filmstrip-thumb, .contact-card");
  interactives.forEach((el) => {
    if (el.dataset.cursorBound) return;
    el.dataset.cursorBound = "true";

    el.addEventListener("mouseenter", () => {
      cursor.classList.add("hovered");
      const glowColor = el.style.getPropertyValue("--brand-glow") || el.style.getPropertyValue("--project-hover-accent");
      if (glowColor) {
        cursor.style.setProperty("--cursor-color", glowColor);
        cursor.classList.add("color-accent");
      }
    });

    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("hovered");
      cursor.classList.remove("color-accent");
      cursor.style.removeProperty("--cursor-color");
    });
  });
}

/* -----------------------------------------------
   3. IntersectionObserver Reveal & Active Scroll Highlighting
   ----------------------------------------------- */
function initRevealAnimations() {
  const reveals = document.querySelectorAll(".reveal-fade-up");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: "0px 0px -50px 0px"
  });

  reveals.forEach((el) => revealObserver.observe(el));

  // Header scroll transition
  const header = document.querySelector("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Mobile menu toggle
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      menuToggle.classList.toggle("active");
      navLinks.classList.toggle("active");
    });
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        menuToggle.classList.remove("active");
        navLinks.classList.remove("active");
      });
    });
  }
}

function initActiveNavHighlight() {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-links a");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: "-20% 0px -50% 0px"
  });

  sections.forEach((sec) => observer.observe(sec));
}

/* -----------------------------------------------
   4. Portfolio Master Grid (Masonry Columns)
   ----------------------------------------------- */
function initPortfolioMaster() {
  const grid = document.getElementById("allProjectsGrid");
  const searchInput = document.getElementById("projectSearch");
  const filterBtns = document.querySelectorAll(".portfolio-master .filter-btn");

  if (!grid) return;

  let activeCategoryFilter = "all";
  let activeSearchTerm = "";

  renderMasterGrid();

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      activeSearchTerm = e.target.value.toLowerCase();
      animateFilterUpdate();
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategoryFilter = btn.getAttribute("data-filter");
      animateFilterUpdate();
    });
  });

  function animateFilterUpdate() {
    grid.style.opacity = "0.2";
    grid.style.transform = "translateY(10px)";
    grid.style.transition = "opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)";

    setTimeout(() => {
      renderMasterGrid();
      grid.style.opacity = "1";
      grid.style.transform = "translateY(0)";
      attachCursorHoverListeners();
    }, 300);
  }

  function renderMasterGrid() {
    grid.innerHTML = "";

    const filtered = PORTFOLIO_PROJECTS.filter((project) => {
      // 1. Category Filter checks
      const isAI = project.category.toLowerCase().includes("ai") || 
                   project.folder === "AI Photography" || 
                   project.folder === "Glow Skin" || 
                   project.folder === "Rivea";
      
      if (activeCategoryFilter === "design" && isAI) return false;
      if (activeCategoryFilter === "ai" && !isAI) return false;

      // 2. Search match
      if (activeSearchTerm) {
        const titleMatch = project.title.toLowerCase().includes(activeSearchTerm);
        const catMatch = project.category.toLowerCase().includes(activeSearchTerm);
        const toolsMatch = project.tools.toLowerCase().includes(activeSearchTerm);
        return titleMatch || catMatch || toolsMatch;
      }

      return true;
    });

    // Asymmetric Masonry layout using column bins
    const numCols = window.innerWidth <= 768 ? 1 : (window.innerWidth <= 1024 ? 2 : 3);
    const cols = [];
    for (let i = 0; i < numCols; i++) {
      const colDiv = document.createElement("div");
      colDiv.className = "masonry-column";
      grid.appendChild(colDiv);
      cols.push({ el: colDiv, height: 0 });
    }

    filtered.forEach((project) => {
      const coverImage = project.images[0];
      const normHeight = 1 / coverImage.aspectRatio;
      
      // Find shortest column to place next card (keeps offsets natural)
      let targetCol = cols[0];
      for (let i = 1; i < cols.length; i++) {
        if (cols[i].height < targetCol.height) {
          targetCol = cols[i];
        }
      }

      const card = createProjectCardElement(project);
      targetCol.el.appendChild(card);
      targetCol.height += normHeight;
    });

    // Initialize 3D dynamic tilt interaction
    initCardTilt();
    lazyLoadProjectImages();
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderMasterGrid, 250);
  });
}

/* -----------------------------------------------
   5. Project Card Element Creator
   ----------------------------------------------- */
function createProjectCardElement(project) {
  const card = document.createElement("div");
  card.className = "project-card";
  card.style.setProperty("--project-hover-accent", `var(--theme-${project.theme})`);
  card.setAttribute("data-name", project.id);
  card.setAttribute("tabindex", "0");

  const coverImage = project.images[0];
  const pb = (1 / coverImage.aspectRatio) * 100;

  const img1 = coverImage.filePath;
  const img2 = project.images[1] ? project.images[1].filePath : img1;
  const img3 = project.images[2] ? project.images[2].filePath : img1;

  card.innerHTML = `
    <div class="project-img-wrapper" style="padding-bottom: ${pb}%;">
      <div class="project-img-stack">
        <img class="project-img stack-img stack-img-1" data-src="${img1}" alt="${project.title}" loading="lazy" />
        <img class="project-img stack-img stack-img-2" data-src="${img2}" alt="${project.title}" loading="lazy" />
        <img class="project-img stack-img stack-img-3" data-src="${img3}" alt="${project.title}" loading="lazy" />
      </div>
    </div>
    <div class="project-info">
      <div class="project-accent-line"></div>
      <h4 class="project-title">${project.title}</h4>
    </div>
  `;

  // Fade-in onLoad event listener setup
  card.querySelectorAll(".project-img").forEach((img) => {
    img.addEventListener("load", () => {
      img.classList.add("loaded");
    });
  });

  // Click & Keypress activation
  const navigate = () => {
    window.location.hash = `#/project/${encodeURIComponent(project.id)}`;
  };
  card.addEventListener("click", navigate);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate();
    }
  });

  return card;
}

/* -----------------------------------------------
   6. Dynamic 3D Card Hover Tilt
   ----------------------------------------------- */
function initCardTilt() {
  const cards = document.querySelectorAll(".project-card");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      // Calculate tilts (capped at 12 degrees max rotation for premium subtleness)
      const rotateX = (yc - y) / 12;
      const rotateY = (x - xc) / 12;

      const stack = card.querySelector(".project-img-stack");
      if (stack) {
        stack.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      }
    });

    card.addEventListener("mouseleave", () => {
      const stack = card.querySelector(".project-img-stack");
      if (stack) {
        stack.style.transform = "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      }
    });
  });
}

/* -----------------------------------------------
   7. AI Video Showcase
   ----------------------------------------------- */
function initVideosShowcase() {
  const grid = document.getElementById("videoGrid");
  if (!grid) return;

  grid.innerHTML = "";

  // Sort: unlocked first (locked === false comes before locked === true)
  PORTFOLIO_VIDEOS.sort((a, b) => {
    if (a.locked === b.locked) return 0;
    return a.locked ? 1 : -1;
  });

  // viewport intersection observer to manage mobile loops
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const v = entry.target.querySelector(".portfolio-video");
      if (v) {
        if (entry.isIntersecting) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      }
    });
  }, { threshold: 0.5 });

  PORTFOLIO_VIDEOS.forEach((video) => {
    const card = document.createElement("div");
    card.className = `video-card ${video.isHorizontal ? 'horizontal-video' : 'vertical-video'}`;
    card.style.setProperty("--project-hover-accent", "var(--theme-skincare)");
    card.setAttribute("tabindex", "0");

    const thumbId = `thumb-${video.name.replace(/[^a-zA-Z0-9]/g, "-")}`;

    card.innerHTML = `
      <div class="video-preview-container">
        ${video.locked ? `
          <div class="thumbnail-wrapper">
            <img class="video-thumbnail blurred" id="${thumbId}" src="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 9 16%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23222%22/></svg>" alt="${video.title}" />
            <div class="lock-overlay">
              <span class="lock-icon">🔒</span>
              <span class="lock-title">Locked Showcase</span>
              <span class="lock-subtitle">Enter the access password or contact Gurunarayan to unlock.</span>
            </div>
          </div>
        ` : `
          <video class="portfolio-video" src="${video.filePath}" preload="metadata" muted loop playsinline></video>
        `}
      </div>
      <div class="video-info">
        <div class="project-accent-line"></div>
        <span class="video-category">Motion Showcase</span>
        <h4 class="video-title">${video.title}</h4>
      </div>
    `;

    if (video.locked) {
      // Async frame capture to construct native uncropped B&W blurred overlays
      setTimeout(() => {
        captureVideoFrame(video.filePath, (dataUrl) => {
          if (dataUrl) {
            const img = document.getElementById(thumbId);
            if (img) img.src = dataUrl;
          }
        });
      }, 50);

      const triggerUnlock = () => openUnlockModal(video);
      card.addEventListener("click", triggerUnlock);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          triggerUnlock();
        }
      });
      card.style.cursor = "pointer";
    } else {
      const triggerPlay = () => openVideoModal(video.filePath);
      card.addEventListener("click", triggerPlay);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          triggerPlay();
        }
      });
      card.style.cursor = "pointer";

      // Hover controls for desktop preview Loops
      card.addEventListener("mouseenter", () => {
        const v = card.querySelector(".portfolio-video");
        if (v) v.play().catch(() => {});
      });
      card.addEventListener("mouseleave", () => {
        const v = card.querySelector(".portfolio-video");
        if (v) {
          v.pause();
          v.currentTime = 0;
        }
      });

      // Viewport listener for mobile playback triggers
      videoObserver.observe(card);
    }

    grid.appendChild(card);
  });
}


function captureVideoFrame(videoUrl, callback) {
  const video = document.createElement("video");
  video.src = videoUrl;
  video.crossOrigin = "anonymous";
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  
  // Seek 0.5s to capture clear branding/colors
  video.currentTime = 0.5;

  video.addEventListener("seeked", () => {
    try {
      const canvas = document.createElement("canvas");
      // Use original video frame width and height to prevent stretching thumbnails
      canvas.width = video.videoWidth || 360;
      canvas.height = video.videoHeight || 640;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      callback(dataUrl);
      
      video.src = "";
      video.load();
    } catch (e) {
      callback(null);
    }
  });

  video.addEventListener("error", () => {
    callback(null);
  });
}

/* -----------------------------------------------
   8. Premium Unlock Modal
   ----------------------------------------------- */
let activeLockedMedia = null;

function initUnlockModal() {
  const modal = document.getElementById("unlockModal");
  const closeBtn = document.getElementById("unlockModalClose");

  if (!modal) return;

  closeBtn.addEventListener("click", closeUnlockModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeUnlockModal();
  });
}

function openUnlockModal(media) {
  const modal = document.getElementById("unlockModal");
  if (!modal) return;

  activeLockedMedia = media;

  const whatsappMsg = `Hi Gurunarayan, I visited your portfolio and would like to request a password to unlock your locked motion showcase campaign: "${media.title}".`;
  const whatsappUrl = `https://wa.me/918626043915?text=${encodeURIComponent(whatsappMsg)}`;

  const waBtn = document.getElementById("whatsappUnlockBtn");
  if (waBtn) {
    waBtn.href = whatsappUrl;
  }

  modal.classList.add("active");
  document.body.classList.add("lock-scroll");
}

function closeUnlockModal() {
  const modal = document.getElementById("unlockModal");
  if (!modal) return;

  modal.classList.remove("active");
  document.body.classList.remove("lock-scroll");
  activeLockedMedia = null;
}

/* -----------------------------------------------
   9. Router & Transitions
   ----------------------------------------------- */
function initRouter() {
  window.addEventListener("hashchange", handleRouting);
  handleRouting();
}

function handleRouting() {
  const hash = window.location.hash;
  const overlay = document.getElementById("projectPageView");
  
  if (!overlay) return;

  if (hash.startsWith("#/project/")) {
    const projId = decodeURIComponent(hash.substring(10));
    const project = PORTFOLIO_PROJECTS.find(p => p.id === projId);
    
    if (project) {
      triggerCircularTransition(() => {
        renderProjectPageContent(project);
        overlay.classList.add("active");
        document.body.classList.add("lock-scroll");
        overlay.scrollTop = 0;
      });
    }
  } else {
    if (overlay.classList.contains("active")) {
      triggerCircularTransition(() => {
        overlay.classList.remove("active");
        document.body.classList.remove("lock-scroll");
        overlay.innerHTML = "";
        activeProject = null;
      });
    }
  }
}

function triggerCircularTransition(callback) {
  const curtain = document.getElementById("pageCurtain");
  if (!curtain) {
    callback();
    return;
  }

  curtain.style.transition = "none";
  curtain.style.clipPath = `circle(0% at ${lastClickX}px ${lastClickY}px)`;
  curtain.offsetHeight; // force repaint

  curtain.style.transition = "clip-path 0.7s cubic-bezier(0.16, 1, 0.3, 1)";
  curtain.style.clipPath = `circle(150% at ${lastClickX}px ${lastClickY}px)`;

  setTimeout(() => {
    callback();
    curtain.style.clipPath = `circle(0% at ${lastClickX}px ${lastClickY}px)`;
    attachCursorHoverListeners();
  }, 700);
}

/* -----------------------------------------------
   10. Fullscreen Project Detail Page Generator
   ----------------------------------------------- */
function renderProjectPageContent(project) {
  activeProject = project;
  currentImageIndex = 0;
  
  const overlay = document.getElementById("projectPageView");
  if (!overlay) return;

  const index = PORTFOLIO_PROJECTS.findIndex(p => p.id === project.id);
  const prevProj = PORTFOLIO_PROJECTS[index - 1] || PORTFOLIO_PROJECTS[PORTFOLIO_PROJECTS.length - 1];
  const nextProj = PORTFOLIO_PROJECTS[index + 1] || PORTFOLIO_PROJECTS[0];

  overlay.innerHTML = `
    <div class="project-page-view-content" style="--project-hover-accent: var(--theme-${project.theme})">
      
      <!-- Close / Back Button -->
      <div class="project-page-close-container">
        <div class="container">
          <button class="project-page-close" onclick="window.location.hash = ''" aria-label="Close project view">
            &larr; Back to Projects
          </button>
        </div>
      </div>

      <!-- Main Columns Grid Layout -->
      <div class="project-page-gallery-layout container">
        
        <!-- Left Side: Uncropped Active Image Container & Thumbnail filmstrip -->
        <div class="gallery-main-area">
          <div class="main-preview-container" id="galleryContainer">
            <div class="main-preview-slide">
              <img class="main-preview-img loaded" src="${project.images[0].filePath}" alt="${project.title}" id="projectActiveImage" />
            </div>
          </div>
          
          <div class="filmstrip-container">
            <div class="filmstrip-track" id="filmstripTrack">
              ${project.images.map((img, idx) => `
                <div class="filmstrip-thumb ${idx === 0 ? 'active' : ''}" data-index="${idx}" tabindex="0">
                  <img src="${img.filePath}" alt="${project.title} gallery thumbnail ${idx + 1}" />
                </div>
              `).join("")}
            </div>
          </div>
        </div>

        <!-- Right Side: Sidebar Info & Next/Prev Controls -->
        <div class="gallery-info-area">
          <div>
            <h1 class="info-title">${project.title}</h1>
            <p class="info-desc">${project.description}</p>
          </div>

          <!-- Sibling Navigation -->
          <div class="project-sibling-nav">
            <button class="sibling-nav-btn prev" onclick="window.location.hash = '#/project/${encodeURIComponent(prevProj.id)}'" aria-label="Go to previous project">
              <span class="nav-arrow">&larr;</span>
              <div class="nav-text">
                <span class="nav-label">Previous Project</span>
                <span class="nav-proj-title">${prevProj.title}</span>
              </div>
            </button>
            
            <button class="sibling-nav-btn next" onclick="window.location.hash = '#/project/${encodeURIComponent(nextProj.id)}'" aria-label="Go to next project">
              <div class="nav-text">
                <span class="nav-label">Next Project</span>
                <span class="nav-proj-title">${nextProj.title}</span>
              </div>
              <span class="nav-arrow">&rarr;</span>
            </button>

            <!-- Bottom Back to Projects close shortcut -->
            <button class="sibling-nav-btn" onclick="window.location.hash = ''" style="justify-content: center; margin-top: 1rem; border-color: rgba(0,0,0,0.15);" aria-label="Back to main gallery">
              <span>Back to Showcase</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  `;

  // Bind Filmstrip navigation events
  const thumbs = overlay.querySelectorAll(".filmstrip-thumb");
  thumbs.forEach(thumb => {
    const handleThumbClick = () => {
      const idx = parseInt(thumb.getAttribute("data-index"), 10);
      setActiveImage(idx);
    };
    thumb.addEventListener("click", handleThumbClick);
    thumb.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleThumbClick();
      }
    });
  });

  // Bind Swipe, Touch, and Throttled Wheel events on the preview box
  const container = overlay.querySelector("#galleryContainer");
  if (container) {
    container.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipeGesture();
    }, { passive: true });

    container.addEventListener("wheel", (e) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheelTime > 800) {
        if (e.deltaY > 0) {
          navigateGallery(1);
        } else if (e.deltaY < 0) {
          navigateGallery(-1);
        }
        lastWheelTime = now;
      }
    }, { passive: false });
  }

  attachCursorHoverListeners();
}

function setActiveImage(index) {
  if (!activeProject) return;
  if (index < 0 || index >= activeProject.images.length) return;

  currentImageIndex = index;
  const activeImgEl = document.getElementById("projectActiveImage");
  const thumbs = document.querySelectorAll(".filmstrip-thumb");

  if (activeImgEl) {
    activeImgEl.classList.remove("loaded");
    setTimeout(() => {
      activeImgEl.src = activeProject.images[index].filePath;
      activeImgEl.onload = () => {
        activeImgEl.classList.add("loaded");
      };
    }, 250);
  }

  thumbs.forEach(thumb => {
    const idx = parseInt(thumb.getAttribute("data-index"), 10);
    if (idx === index) {
      thumb.classList.add("active");
      thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      thumb.classList.remove("active");
    }
  });
}

function navigateGallery(direction) {
  if (!activeProject) return;
  const total = activeProject.images.length;
  let newIdx = currentImageIndex + direction;
  
  if (newIdx < 0) newIdx = total - 1;
  if (newIdx >= total) newIdx = 0;
  
  setActiveImage(newIdx);
}

function handleSwipeGesture() {
  const delta = touchEndX - touchStartX;
  if (delta < -50) {
    navigateGallery(1);
  } else if (delta > 50) {
    navigateGallery(-1);
  }
}

/* -----------------------------------------------
   11. Magnetic CTAs
   ----------------------------------------------- */
function initMagneticButtons() {
  const magnetics = document.querySelectorAll(".btn, .contact-card");
  magnetics.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const bound = btn.getBoundingClientRect();
      const x = e.clientX - bound.left - bound.width / 2;
      const y = e.clientY - bound.top - bound.height / 2;
      // Soft magnetic lift
      btn.style.transform = `translate3d(${x * 0.12}px, ${y * 0.12}px, 0)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translate3d(0px, 0px, 0px)";
    });
  });
}

/* -----------------------------------------------
   12. Fullscreen Video Player Modal Controls
   ----------------------------------------------- */
function openVideoModal(videoSrc) {
  const modal = document.getElementById("videoModal");
  const player = document.getElementById("videoModalPlayer");
  if (!modal || !player) return;

  player.src = videoSrc;
  modal.classList.add("active");
  document.body.classList.add("lock-scroll");
  player.play().catch(() => {});
}

function closeVideoModal() {
  const modal = document.getElementById("videoModal");
  const player = document.getElementById("videoModalPlayer");
  if (!modal || !player) return;

  player.pause();
  player.src = "";
  modal.classList.remove("active");
  document.body.classList.remove("lock-scroll");
}

/* -----------------------------------------------
   13. Custom Offline-Safe Password Hash Utility
   ----------------------------------------------- */
function customHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 4294967296;
  }
  return hash;
}

/* -----------------------------------------------
   14. High-Performance IntersectionObserver Lazy Loader
   ----------------------------------------------- */
function lazyLoadProjectImages() {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
        }
        obs.unobserve(img);
      }
    });
  }, { rootMargin: "120px" });

  document.querySelectorAll(".project-img[data-src]").forEach((img) => {
    observer.observe(img);
  });
}
