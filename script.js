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
let touchStartY = 0;
let touchEndY = 0;
let lastWheelTime = 0;
let activeTransitionId = 0;
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

// Global preloaded images cache
const PRELOADED_IMAGES = {};

// Predefined metadata mapping to enhance the dynamically loaded global PORTFOLIO_VIDEOS array
function processVideosDatabase() {
  if (typeof PORTFOLIO_VIDEOS === "undefined") return;

  const VIDEO_MAP = {
    "1.Rivea Product Showcase ad.mp4": { title: "Rivea Product Showcase", isHorizontal: false, locked: false, filePath: "./AI%20videos/1.Rivea%20Product%20Showcase%20ad.mp4" },
    "2.Rivea Skincare.mp4": { title: "Rivea Skincare Campaign", isHorizontal: false, locked: false, filePath: "./AI%20videos/2.Rivea%20Skincare.mp4" },
    "3.DJGF Show.mp4": { title: "DJGF Show", isHorizontal: false, locked: false, filePath: "./AI%20videos/3.DJGF%20Show.mp4" },
    "4.VIVI Honey.mp4": { title: "VIVI Honey Commercial", isHorizontal: false, locked: false, filePath: "./AI%20videos/4.VIVI%20Honey.mp4" },
    "boAt.mp4": { title: "boAt Campaign", isHorizontal: true, locked: true, filePath: "./AI%20videos/boAt.mp4" },

    "Burger ad.mp4": { title: "Burger Campaign", isHorizontal: true, locked: true, filePath: "./AI%20videos/Burger%20ad.mp4" },
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

  // Global keydown listener for subpage gallery cycling and modal closures
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const videoModal = document.getElementById("videoModal");
      if (videoModal && videoModal.classList.contains("active")) {
        closeVideoModal();
        e.preventDefault();
        return;
      }
      if (activeProject) {
        window.location.hash = "";
        e.preventDefault();
        return;
      }
    }

    if (!activeProject) return;
    if (e.key === "ArrowRight") {
      navigateGallery(1);
    } else if (e.key === "ArrowLeft") {
      navigateGallery(-1);
    }
  });

  initLoader();
  initCustomCursor();
  initRevealAnimations();
  initSubtleParallax();
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
let revealObserver = null;

function observeElementForReveal(el) {
  if (revealObserver) {
    revealObserver.observe(el);
  }
}

function initRevealAnimations() {
  const reveals = document.querySelectorAll(".reveal-fade-up");
  
  let intersectQueue = [];
  let timeoutId = null;

  revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        intersectQueue.push(entry.target);
        observer.unobserve(entry.target);
      }
    });

    if (intersectQueue.length > 0) {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        const queue = [...intersectQueue];
        intersectQueue = [];
        
        queue.forEach((el, index) => {
          setTimeout(() => {
            requestAnimationFrame(() => {
              el.style.willChange = "opacity, transform, filter";
              el.classList.add("active");
              
              setTimeout(() => {
                el.style.willChange = "";
              }, 750);
            });
          }, index * 70);
        });
      }, 30);
    }
  }, {
    threshold: 0.05,
    rootMargin: "0px 0px -50px 0px"
  });

  reveals.forEach((el) => revealObserver.observe(el));

  // Header scroll transition
  const header = document.querySelector("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }, { passive: true });

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

function initSubtleParallax() {
  const parallaxEl = document.querySelector(".abstract-geometry");
  if (!parallaxEl) return;

  let ticking = false;

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const offset = Math.min(20, Math.max(-20, scrollY * 0.04));
        parallaxEl.style.transform = `translate3d(0, ${offset}px, 0)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

function initActiveNavHighlight() {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-links a");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        
        // Verify if a menu item exists for this section before updating highlights
        const hasLink = Array.from(navLinks).some(link => link.getAttribute("href") === `#${id}`);
        if (!hasLink) return;

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
      observeElementForReveal(card);
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
  card.className = "project-card reveal-fade-up";
  card.style.setProperty("--project-hover-accent", `var(--theme-${project.theme})`);
  card.setAttribute("data-name", project.id);
  card.setAttribute("tabindex", "0");
  const coverImage = project.images[0];
  const pb = (1 / coverImage.aspectRatio) * 100;

  const img1Original = coverImage.filePath;
  const img2Original = project.images[1] ? project.images[1].filePath : img1Original;
  const img3Original = project.images[2] ? project.images[2].filePath : img1Original;

  const img1Thumb = getThumbnailPath(img1Original);
  const img2Thumb = project.images[1] ? getThumbnailPath(project.images[1].filePath) : img1Thumb;
  const img3Thumb = project.images[2] ? getThumbnailPath(project.images[2].filePath) : img1Thumb;

  card.innerHTML = `
    <div class="project-img-wrapper" style="padding-bottom: ${pb}%;">
      <div class="project-img-stack">
        <img class="project-img stack-img stack-img-1" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" data-src="${img1Thumb}" onerror="this.onerror=null; this.src='${img1Original}';" alt="${project.title}" loading="lazy" decoding="async" />
        <img class="project-img stack-img stack-img-2" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" data-src="${img2Thumb}" onerror="this.onerror=null; this.src='${img2Original}';" alt="${project.title}" loading="lazy" decoding="async" />
        <img class="project-img stack-img stack-img-3" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" data-src="${img3Thumb}" onerror="this.onerror=null; this.src='${img3Original}';" alt="${project.title}" loading="lazy" decoding="async" />
      </div>
    </div>
    <div class="project-info">
      <div class="project-accent-line"></div>
      <div class="project-title-container">
        <h4 class="project-title">${project.title}</h4>
        <svg class="project-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
      </div>
    </div>
  `;
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

  // Sort: Unlocked showcase first, then Locked campaigns
  PORTFOLIO_VIDEOS.sort((a, b) => {
    return (a.locked === b.locked) ? 0 : a.locked ? 1 : -1;
  });

  let unlockedVideoIndex = 0;
  PORTFOLIO_VIDEOS.forEach((video) => {
    const card = document.createElement("div");
    card.className = `video-card reveal-fade-up ${video.isHorizontal ? 'horizontal-video' : 'vertical-video'}`;
    card.style.setProperty("--project-hover-accent", "var(--theme-skincare)");
    card.setAttribute("tabindex", "0");

    let preloadAttr = "metadata";
    if (!video.locked) {
      if (unlockedVideoIndex === 0) {
        preloadAttr = "auto";
      }
      unlockedVideoIndex++;
    }

    const isMobileVideo = window.matchMedia("(max-width: 768px)").matches;

    card.innerHTML = `
      <div class="video-preview-container">
        ${video.locked ? `
          <div class="thumbnail-wrapper">
            <div class="lock-overlay">
              <span class="lock-icon">🔒</span>
              <span class="lock-title">Locked Showcase</span>
              <span class="lock-subtitle">Enter the access password or contact Gurunarayan to unlock.</span>
            </div>
          </div>
        ` : (isMobileVideo ? `
          <div class="video-loading-placeholder">
            <div class="spinner-ring small"></div>
          </div>
          <video class="portfolio-video" src="${video.filePath}" preload="${preloadAttr}" muted loop playsinline style="opacity: 0;"></video>
        ` : `
          <video class="portfolio-video" src="${video.filePath}" preload="${preloadAttr}" muted loop playsinline></video>
        `)}
      </div>
      <div class="video-info">
        <div class="project-accent-line"></div>
        <span class="video-category">Motion Showcase</span>
        <h4 class="video-title">${video.title}</h4>
      </div>
    `;

    if (video.locked) {
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

      // Hover controls for desktop preview Loops (only for pointer: fine devices)
      if (window.matchMedia("(pointer: fine)").matches) {
        card.addEventListener("mouseenter", () => {
          const v = card.querySelector(".portfolio-video");
          if (v) v.play().catch(() => {});
        }, { passive: true });
        card.addEventListener("mouseleave", () => {
          const v = card.querySelector(".portfolio-video");
          if (v) {
            v.pause();
            v.currentTime = 0.1;
          }
        }, { passive: true });
      }
    }

    grid.appendChild(card);
    observeElementForReveal(card);

    // Skip black first frame by seeking to 0.1s once metadata loads
    const v = card.querySelector(".portfolio-video");
    if (v) {
      if (isMobileVideo) {
        const handleVideoReady = () => {
          v.style.opacity = "1";
          const placeholder = card.querySelector(".video-loading-placeholder");
          if (placeholder) placeholder.style.display = "none";
          v.removeEventListener("loadeddata", handleVideoReady);
          v.removeEventListener("canplay", handleVideoReady);
        };
        v.addEventListener("loadeddata", handleVideoReady);
        v.addEventListener("canplay", handleVideoReady);
        if (v.readyState >= 2) {
          handleVideoReady();
        }
      }

      v.addEventListener("loadedmetadata", () => {
        v.currentTime = 0.1;
      }, { once: true, passive: true });
      if (v.readyState >= 1) {
        v.currentTime = 0.1;
      }
    }
  });

  // Dynamic video buffering upgrade when approaching the viewport (Adaptive rootMargin)
  if ("IntersectionObserver" in window) {
    let margin = "300px";
    if (navigator.connection) {
      const conn = navigator.connection;
      const isSlow = conn.saveData || /^(2g|3g)/.test(conn.effectiveType || '');
      if (isSlow) {
        margin = "100px"; // Delay buffering until closer on slow connections
      }
    }

    const videoObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (video.getAttribute("preload") !== "auto") {
            video.setAttribute("preload", "auto");
          }
          // On mobile, autoplay the preview loop when it enters the viewport
          if (window.matchMedia("(pointer: coarse)").matches) {
            video.play().catch(() => {});
          } else {
            obs.unobserve(video); // Unobserve on desktop once preloaded
          }
        } else {
          // On mobile, pause the preview loop when it leaves the viewport to save resource overhead
          if (window.matchMedia("(pointer: coarse)").matches) {
            video.pause();
            video.currentTime = 0.1;
          }
        }
      });
    }, { rootMargin: margin });

    grid.querySelectorAll(".portfolio-video").forEach(video => {
      videoObserver.observe(video);
    });
  }
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
  
  // Preload first batch of nearby images immediately in the background (Network-Adaptive)
  preloadNearbyImages(0);
  
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
            <!-- Premium Floating Glass Gallery Navigation Buttons (Scoped Inside Container) -->
            ${project.images.length > 1 ? `
              <button class="gallery-nav-btn prev" aria-label="Previous image" id="galleryPrevBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
              <button class="gallery-nav-btn next" aria-label="Next image" id="galleryNextBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            ` : ''}

            <div class="main-preview-slide">
              <img class="main-preview-img" src="${project.images[0].filePath}" width="${project.images[0].width}" height="${project.images[0].height}" alt="${project.title}" id="projectActiveImage" decoding="async" fetchpriority="high" />
            </div>
          </div>
          
          <div class="filmstrip-container">
            <div class="filmstrip-track" id="filmstripTrack">
              ${project.images.map((img, idx) => `
                <div class="filmstrip-thumb ${idx === 0 ? 'active' : ''}" data-index="${idx}" tabindex="0">
                  <img src="${getThumbnailPath(img.filePath)}" onerror="this.onerror=null; this.src='${img.filePath}';" alt="${project.title} gallery thumbnail ${idx + 1}" loading="lazy" />
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

  // Bind click event listeners for the circular gallery navigation buttons
  if (project.images.length > 1) {
    const prevBtn = overlay.querySelector("#galleryPrevBtn");
    const nextBtn = overlay.querySelector("#galleryNextBtn");
    if (prevBtn) prevBtn.addEventListener("click", () => navigateGallery(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => navigateGallery(1));
  }

  // Bind onload listener for the first visible image
  const firstActiveImg = overlay.querySelector("#projectActiveImage");
  if (firstActiveImg) {
    firstActiveImg.onload = () => {
      firstActiveImg.classList.add("loaded");
    };
    if (firstActiveImg.complete) {
      firstActiveImg.classList.add("loaded");
    }
  }

  // Preload only the first visible image of the project page
  const firstImageSrc = project.images[0].filePath;
  let preloadLink = document.getElementById("project-first-image-preload");
  if (!preloadLink) {
    preloadLink = document.createElement("link");
    preloadLink.id = "project-first-image-preload";
    preloadLink.rel = "preload";
    preloadLink.as = "image";
    document.head.appendChild(preloadLink);
  }
  preloadLink.href = firstImageSrc;
  preloadLink.setAttribute("fetchpriority", "high");

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
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    container.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
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

function preloadNearbyImages(index) {
  if (!activeProject) return;
  const images = activeProject.images;
  const len = images.length;
  if (len <= 1) return;

  // Adaptive network preloading
  let preloadPrev = true;
  let preloadNext = true;

  if (navigator.connection) {
    const conn = navigator.connection;
    const isSlow = conn.saveData || /^(2g|3g)/.test(conn.effectiveType || '');
    if (isSlow) {
      preloadPrev = false; // Only preload next image on slow connections to save bandwidth
    }
  }
  
  const indicesToPreload = [];
  if (preloadNext) {
    indicesToPreload.push((index + 1) % len);
    if (preloadPrev) {
      indicesToPreload.push((index + 2) % len); // Preload next + 2 on fast networks
    }
  }
  if (preloadPrev) {
    indicesToPreload.push((index - 1 + len) % len);
  }
  
  indicesToPreload.forEach(idx => {
    const src = images[idx].filePath;
    if (!PRELOADED_IMAGES[src]) {
      const img = new Image();
      img.src = src;
      img.decoding = "async";
      img.decode()
        .then(() => {
          PRELOADED_IMAGES[src] = true;
        })
        .catch(() => {
          img.onload = () => {
            PRELOADED_IMAGES[src] = true;
          };
        });
    }
  });
  
  // Keep only nearby assets in memory (range of +/- 3)
  Object.keys(PRELOADED_IMAGES).forEach(src => {
    const isNearby = images.some((img, idx) => {
      if (img.filePath !== src) return false;
      const diff = Math.abs(idx - index);
      return diff <= 3 || diff >= len - 3;
    });
    if (!isNearby) {
      delete PRELOADED_IMAGES[src];
    }
  });
}

function setActiveImage(index) {
  if (!activeProject) return;
  if (index < 0 || index >= activeProject.images.length) return;

  currentImageIndex = index;
  const oldImg = document.getElementById("projectActiveImage");
  const thumbs = document.querySelectorAll(".filmstrip-thumb");
  const containerSlide = document.querySelector(".main-preview-slide");

  if (oldImg && containerSlide) {
    const newSrc = activeProject.images[index].filePath;
    
    // Preload adjacent images immediately (Network-Adaptive)
    preloadNearbyImages(index);

    // Track the transaction ID to prevent race conditions when clicking rapidly
    activeTransitionId++;
    const transitionId = activeTransitionId;

    const triggerCrossFade = () => {
      // Ensure we are still the active transition transaction
      if (transitionId !== activeTransitionId) return;

      const newImg = document.createElement("img");
      newImg.className = "main-preview-img incoming";
      newImg.src = newSrc;
      newImg.width = activeProject.images[index].width;
      newImg.height = activeProject.images[index].height;
      newImg.alt = activeProject.title;
      newImg.decoding = "async";
      newImg.setAttribute("fetchpriority", "high");
      newImg.setAttribute("loading", "eager");
      newImg.style.position = "absolute";

      containerSlide.appendChild(newImg);

      oldImg.id = "";
      newImg.id = "projectActiveImage";

      // Temporary will-change applied ONLY during active transition to save memory
      oldImg.style.willChange = "opacity, transform";
      newImg.style.willChange = "opacity, transform";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          oldImg.classList.remove("loaded");
          newImg.classList.remove("incoming");
          newImg.classList.add("loaded");
        });
      });

      setTimeout(() => {
        if (oldImg && oldImg.parentNode) {
          oldImg.parentNode.removeChild(oldImg);
        }
        newImg.style.position = "";
        newImg.style.willChange = ""; // Immediately remove will-change!
      }, 350);
    };

    // If already in cache (either preloaded or previously loaded), reuse instantly
    if (PRELOADED_IMAGES[newSrc] === true) {
      triggerCrossFade();
    } else {
      // Create memory image, wait for load AND decode() before starting the transition
      const tempImg = new Image();
      tempImg.src = newSrc;
      tempImg.decoding = "async";

      let attempts = 0;
      const attemptLoad = () => {
        tempImg.onload = () => {
          if (typeof tempImg.decode === "function") {
            tempImg.decode()
              .then(() => {
                if (transitionId === activeTransitionId) {
                  PRELOADED_IMAGES[newSrc] = true;
                  triggerCrossFade();
                }
              })
              .catch(() => {
                // If decode fails/aborted, fall back to onload directly
                if (transitionId === activeTransitionId) {
                  PRELOADED_IMAGES[newSrc] = true;
                  triggerCrossFade();
                }
              });
          } else {
            if (transitionId === activeTransitionId) {
              PRELOADED_IMAGES[newSrc] = true;
              triggerCrossFade();
            }
          }
        };

        tempImg.onerror = () => {
          if (attempts < 1) {
            attempts++;
            // Silent retry once
            setTimeout(() => {
              tempImg.src = "";
              tempImg.src = newSrc;
            }, 100);
          } else {
            // Keep displaying the previous image, log silently
            console.warn("Failed to load design image: " + newSrc);
          }
        };
      };

      attemptLoad();
    }
  }

  // Active thumbnail smooth tracking & centering inside the strip
  const filmstripContainer = document.querySelector(".filmstrip-container");
  const activeThumb = document.querySelector(`.filmstrip-thumb[data-index="${index}"]`);
  
  if (filmstripContainer && activeThumb) {
    const containerWidth = filmstripContainer.clientWidth;
    const thumbWidth = activeThumb.clientWidth;
    const thumbLeft = activeThumb.offsetLeft;
    const scrollTarget = thumbLeft - (containerWidth / 2) + (thumbWidth / 2);
    
    filmstripContainer.scrollTo({
      left: scrollTarget,
      behavior: "smooth"
    });
  }

  thumbs.forEach(thumb => {
    const idx = parseInt(thumb.getAttribute("data-index"), 10);
    if (idx === index) {
      thumb.classList.add("active");
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
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  
  // Differentiate horizontal swiping from vertical scrolling
  if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
    if (deltaX < 0) {
      navigateGallery(1);  // Swipe Left -> Next
    } else {
      navigateGallery(-1); // Swipe Right -> Previous
    }
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
  const spinner = document.getElementById("videoModalSpinner");
  const errorContainer = document.getElementById("videoModalError");
  if (!modal || !player) return;

  modal.classList.add("active");
  document.body.classList.add("lock-scroll");

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  if (isMobile) {
    // Mobile specific: show spinner, hide video, hide error overlay
    if (spinner) spinner.classList.add("active");
    if (errorContainer) errorContainer.style.display = "none";
    player.style.opacity = "0";

    const handleReady = () => {
      player.style.opacity = "1";
      if (spinner) spinner.classList.remove("active");
      player.removeEventListener("loadeddata", handleReady);
      player.removeEventListener("canplay", handleReady);
    };

    player.addEventListener("loadeddata", handleReady);
    player.addEventListener("canplay", handleReady);

    // Error recovery
    const handleError = () => {
      if (spinner) spinner.classList.remove("active");
      if (errorContainer) errorContainer.style.display = "flex";
      player.style.opacity = "0";
      player.removeEventListener("error", handleError);
    };
    player.addEventListener("error", handleError);

    // Swapping the source exactly once
    player.src = videoSrc;
    player.muted = false; // Allow sound on mobile modal
    player.loop = true;

    // Direct playback invocation in same user activation tick
    player.play().catch((err) => {
      console.warn("Autoplay blocked on mobile, showing player controls:", err);
      handleReady();
    });
  } else {
    // Desktop: keep the exact same original behaviour!
    if (spinner) spinner.classList.remove("active");
    if (errorContainer) errorContainer.style.display = "none";
    player.style.opacity = "1";
    player.src = videoSrc;
    player.muted = true;
    player.loop = true;
    player.play().catch(() => {});
  }
}

function closeVideoModal() {
  const modal = document.getElementById("videoModal");
  const player = document.getElementById("videoModalPlayer");
  const spinner = document.getElementById("videoModalSpinner");
  const errorContainer = document.getElementById("videoModalError");
  if (!modal || !player) return;

  player.pause();
  player.removeAttribute("src"); // Clear source and release memory
  
  modal.classList.remove("active");
  document.body.classList.remove("lock-scroll");
  
  if (spinner) spinner.classList.remove("active");
  if (errorContainer) errorContainer.style.display = "none";
  player.style.opacity = "0";
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
          img.onload = () => {
            img.classList.add("loaded");
          };
          if (img.complete) {
            img.classList.add("loaded");
          }
          img.removeAttribute("data-src");
        }
        obs.unobserve(img);
      }
    });
  }, { rootMargin: "400px" });

  document.querySelectorAll(".project-img[data-src]").forEach((img) => {
    observer.observe(img);
  });
}

/* -----------------------------------------------
   15. Lightweight Thumbnail Path Helper
   ----------------------------------------------- */
function getThumbnailPath(filePath) {
  if (!filePath) return "";
  const decoded = decodeURIComponent(filePath);
  if (decoded.toLowerCase().includes("thumbnail") || decoded.toLowerCase().includes("thumabnail")) {
    return filePath;
  }
  const parts = decoded.split('/');
  if (parts.length < 2) return filePath;

  const fileName = parts.pop();
  const lastDot = fileName.lastIndexOf('.');
  const fileBaseName = lastDot > -1 ? fileName.substring(0, lastDot) : fileName;
  
  parts.push('thumbnails');
  parts.push(fileBaseName + '.jpg');
  
  const result = parts.join('/');
  return encodeURI(result);
}


