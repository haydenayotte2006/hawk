
/* Easy portfolio updater: renders thumbnails/creators from portfolio-data.js and creators-data.js. */
(function () {
  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char];
    });
  }

  function shuffle(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function normalizePath(path) {
    if (!path) return "";
    return String(path);
  }

  function renderCreators() {
    const track = document.querySelector(".creator-track");
    if (!track || !Array.isArray(window.creatorImages)) return;

    const list = window.creatorImages.filter(Boolean);
    const doubled = list.concat(list);
    track.innerHTML = doubled.map(function (src, index) {
      return '<span class="creator-avatar" aria-hidden="true"><img src="' + normalizePath(src) + '" alt="Creator profile ' + ((index % list.length) + 1) + '" loading="lazy" decoding="async"></span>';
    }).join("");
  }

  function renderGrid(grid) {
    if (!grid || !Array.isArray(window.portfolioItems)) return;

    const isPortfolioPage = grid.classList.contains("portfolio-grid");
    const items = shuffle(window.portfolioItems);

    grid.innerHTML = items.map(function (item) {
      const category = escapeHtml((item.category || "gaming").toLowerCase());
      const title = escapeHtml(item.title || "Untitled Thumbnail");
      const subtitle = escapeHtml(item.subtitle || "");
      const image = normalizePath(item.image || "");
      const label = category.toUpperCase();

      if (isPortfolioPage) {
        return '<article class="thumb-card video-card" data-category="' + category + '">' +
          '<div class="thumb image-thumb"><img src="' + image + '" alt="' + title + ' thumbnail" loading="lazy" decoding="async"></div>' +
          '<h3>' + title + '</h3><p>' + subtitle + '</p>' +
        '</article>';
      }

      return '<article class="video-card" data-category="' + category + '">' +
        '<div class="yt-thumb image-thumb"><img src="' + image + '" alt="' + title + ' thumbnail" loading="lazy" decoding="async"><small>' + label + '</small></div>' +
        '<h3>' + title + '</h3><p>' + subtitle + '</p>' +
      '</article>';
    }).join("");
  }

  function renderPortfolioData() {
    renderCreators();
    document.querySelectorAll(".video-grid, .portfolio-grid").forEach(renderGrid);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderPortfolioData);
  } else {
    renderPortfolioData();
  }
})();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const tiltCard = document.querySelector('.tilt-card');
if (tiltCard && !reduceMotion) {
  tiltCard.addEventListener('mousemove', (event) => {
    const rect = tiltCard.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 10;
    const rotateX = ((0.5 - y / rect.height)) * 10;
    tiltCard.style.animation = 'none';
    tiltCard.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });

  tiltCard.addEventListener('mouseleave', () => {
    tiltCard.style.transform = '';
    tiltCard.style.animation = 'cardFloat 5s ease-in-out infinite';
  });
}

// Clean 0.5s cross-page fade. No overlay, no delayed second animation.
document.querySelectorAll('a[href$=".html"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    const currentPage = window.location.pathname.split('/').pop() || '/';

    if (!href || href === currentPage || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;

    event.preventDefault();
    document.body.classList.add('page-leaving');
    window.setTimeout(() => {
      window.location.href = href;
    }, reduceMotion ? 0 : 500);
  });
});

window.addEventListener('pageshow', () => {
  document.body.classList.remove('page-leaving');
});

// Category filters for both the home feed and the portfolio page.
document.querySelectorAll('.feed-tabs').forEach((tabGroup) => {
  const tabs = Array.from(tabGroup.querySelectorAll('.feed-tab'));
  const grid = tabGroup.parentElement.querySelector('#thumbnailGrid, .video-grid, .portfolio-grid');
  if (!tabs.length || !grid) return;

  const cards = Array.from(grid.querySelectorAll('.video-card'));

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter || 'all';

      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });

      grid.classList.add('is-filtering');

      cards.forEach((card) => {
        const categories = (card.dataset.category || '').split(/\s+/).filter(Boolean);
        const shouldShow = filter === 'all' || categories.includes(filter);

        card.classList.remove('is-showing');

        if (shouldShow) {
          card.classList.remove('is-hidden', 'is-hiding');
          requestAnimationFrame(() => card.classList.add('is-showing'));
        } else {
          card.classList.add('is-hiding');
          window.setTimeout(() => {
            if (card.classList.contains('is-hiding')) card.classList.add('is-hidden');
          }, 170);
        }
      });

      window.setTimeout(() => grid.classList.remove('is-filtering'), 360);
    });
  });
});

function sendMessage(event) {
  event.preventDefault();
  const note = document.getElementById('formNote');
  if (note) note.textContent = 'Message ready — connect this form to Formspree, Netlify Forms, or your own backend before publishing.';
  event.target.reset();
}

// Smooth live Mac-style creator dock magnification. Values are tweened lightly so it stays fluid, not jumpy.
const creatorDock = document.querySelector('.creator-dock');
const creatorAvatars = creatorDock ? Array.from(creatorDock.querySelectorAll('.creator-avatar')) : [];
let dockAnimationFrame;
const dockState = new WeakMap();

function lerp(current, target, amount) {
  return current + (target - current) * amount;
}

function updateCreatorDockMagnification() {
  if (!creatorDock || !creatorAvatars.length) return;

  const dockRect = creatorDock.getBoundingClientRect();
  const centerX = dockRect.left + dockRect.width / 2;
  const influence = Math.max(180, dockRect.width * 0.36);

  creatorAvatars.forEach((avatar) => {
    const rect = avatar.getBoundingClientRect();
    const avatarCenter = rect.left + rect.width / 2;
    const distance = Math.abs(centerX - avatarCenter);
    const proximity = Math.max(0, 1 - distance / influence);
    const eased = proximity * proximity * (3 - 2 * proximity);

    const target = {
      scale: 0.9 + eased * 0.48,
      opacity: 0.7 + eased * 0.3,
      saturation: 0.92 + eased * 0.12,
      brightness: 1 + eased * 0.03,
      blur: 0,
      z: 1 + Math.round(eased * 12)
    };

    const current = dockState.get(avatar) || target;
    const next = {
      scale: lerp(current.scale, target.scale, 0.18),
      opacity: lerp(current.opacity, target.opacity, 0.18),
      saturation: lerp(current.saturation, target.saturation, 0.18),
      brightness: lerp(current.brightness, target.brightness, 0.18),
      blur: 0,
      z: target.z
    };

    dockState.set(avatar, next);
    avatar.style.setProperty('--dock-scale', next.scale.toFixed(3));
    avatar.style.setProperty('--dock-y', '0px');
    avatar.style.setProperty('--dock-opacity', next.opacity.toFixed(3));
    avatar.style.setProperty('--dock-saturation', next.saturation.toFixed(3));
    avatar.style.setProperty('--dock-brightness', next.brightness.toFixed(3));
    avatar.style.setProperty('--dock-blur', '0px');
    avatar.style.setProperty('--dock-z', next.z);
  });

  dockAnimationFrame = requestAnimationFrame(updateCreatorDockMagnification);
}

if (creatorDock && creatorAvatars.length && !reduceMotion) {
  updateCreatorDockMagnification();
  window.addEventListener('resize', () => {
    cancelAnimationFrame(dockAnimationFrame);
    creatorAvatars.forEach((avatar) => dockState.delete(avatar));
    updateCreatorDockMagnification();
  }, { passive: true });
}

// Consistent pop/fade-in across every page, including Home and Portfolio.
(() => {
  if (reduceMotion) return;

  const selectors = [
    '.nav', '.brand', '.nav-links a',
    '.hero-center > *', '.creator-dock', '.hero-name', '.scroll-arrow',
    '.page-heading > *', '.feed-head > *', '.feed-tabs', '.portfolio-tabs',
    '.video-card', '.thumb-card', '.price-card', '.glass-card', '.contact-form',
    '.button-row > *', '.mini-link', '.social-actions > *', '.contact-card', '.form-row > *'
  ].join(',');

  const seen = new Set();
  const items = Array.from(document.querySelectorAll(selectors)).filter((el) => {
    if (seen.has(el)) return false;
    seen.add(el);
    return !el.closest('.is-hidden');
  });

  items.forEach((el, index) => {
    el.classList.add('motion-pop');
    el.style.setProperty('--pop-delay', `${Math.min(index * 28, 260)}ms`);
  });

  const show = (el) => el.classList.add('is-visible');

  if ('IntersectionObserver' in window) {
    const popObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show(entry.target);
          popObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    items.forEach((el) => popObserver.observe(el));
  } else {
    items.forEach(show);
  }
})();

const discordCopyButtons = document.querySelectorAll('[data-copy-discord]');
discordCopyButtons.forEach((button) => {
  const label = button.querySelector('span');
  const originalText = label ? label.textContent : '';

  button.addEventListener('click', async () => {
    const handle = button.dataset.copyDiscord || 'hawkpsd';
    try {
      await navigator.clipboard.writeText(handle);
      button.classList.add('copied');
      if (label) label.textContent = 'Copied!';
      button.setAttribute('aria-label', `Copied Discord username: ${handle}`);
      window.setTimeout(() => {
        button.classList.remove('copied');
        if (label) label.textContent = originalText || handle;
        button.setAttribute('aria-label', `Copy Hawk Discord username: ${handle}`);
      }, 1400);
    } catch (error) {
      if (label) {
        label.textContent = 'Copy failed';
        window.setTimeout(() => { label.textContent = originalText || handle; }, 1400);
      }
    }
  });
});

// Final UX pass: calm whole-page fade, thumbnail spyglass, and no right-click menu.
(() => {
  const revealBody = () => {
    requestAnimationFrame(() => document.body.classList.add('site-loaded'));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revealBody, { once: true });
  } else {
    revealBody();
  }

  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });

  const overlay = document.createElement('div');
  overlay.className = 'spyglass-viewer';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <button class="spyglass-close" type="button" aria-label="Close thumbnail preview">×</button>
    <figure class="spyglass-frame">
      <img alt="Expanded thumbnail preview">
      <figcaption></figcaption>
    </figure>
  `;
  document.body.appendChild(overlay);

  const previewImage = overlay.querySelector('img');
  const caption = overlay.querySelector('figcaption');
  const closeButton = overlay.querySelector('.spyglass-close');

  function openSpyglass(card) {
    const img = card.querySelector('.image-thumb img');
    if (!img) return;

    const title = card.querySelector('h3')?.textContent?.trim() || img.alt || 'Thumbnail preview';
    const subtitle = card.querySelector('p')?.textContent?.trim() || '';

    previewImage.src = img.currentSrc || img.src;
    previewImage.alt = img.alt || title;
    caption.innerHTML = '';
    const titleLine = document.createElement('span');
    titleLine.className = 'spyglass-title';
    titleLine.textContent = title;
    caption.appendChild(titleLine);
    if (subtitle) {
      const subtitleLine = document.createElement('span');
      subtitleLine.className = 'spyglass-subtitle';
      subtitleLine.textContent = subtitle;
      caption.appendChild(subtitleLine);
    }

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('spyglass-open');
  }

  function closeSpyglass() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('spyglass-open');
  }

  document.querySelectorAll('.video-card .image-thumb, .thumb-card .image-thumb').forEach((thumb) => {
    thumb.setAttribute('role', 'button');
    thumb.setAttribute('tabindex', '0');
    thumb.setAttribute('aria-label', 'Open larger thumbnail preview');
    thumb.addEventListener('click', (event) => {
      event.preventDefault();
      openSpyglass(thumb.closest('.video-card, .thumb-card'));
    });
    thumb.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openSpyglass(thumb.closest('.video-card, .thumb-card'));
      }
    });
  });

  closeButton.addEventListener('click', closeSpyglass);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeSpyglass();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay.classList.contains('is-open')) closeSpyglass();
  });
})();


/* Discord copy button feedback. */
let discordCopiedTimeout;
document.querySelectorAll("[data-copy-discord]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.getAttribute("data-copy-discord") || "hawkpsd";
    const label = button.querySelector(".social-label > span") || button.querySelector(".social-label");
    const original = "hawkpsd";
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      const temp = document.createElement("textarea");
      temp.value = value;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      temp.remove();
    }
    if (label) label.textContent = "Copied!";
    button.classList.add("is-copied");
    clearTimeout(discordCopiedTimeout);
    discordCopiedTimeout = setTimeout(() => {
      if (label) label.textContent = original;
      button.classList.remove("is-copied");
    }, 1200);
  });
});


/* Scroll-progress reveal for the homepage portfolio feed.
   This makes the reveal scrub with scroll instead of snapping on/off. */
(function () {
  const feed = document.querySelector(".scroll-reactive-feed");
  if (!feed || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let ticking = false;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function updateFeedProgress() {
    const rect = feed.getBoundingClientRect();
    const viewport = window.innerHeight || document.documentElement.clientHeight;

    // Starts animating before the section reaches the viewport bottom,
    // finishes as it settles into a comfortable visible position.
    const start = viewport * 0.98;
    const end = viewport * 0.32;
    const raw = (start - rect.top) / (start - end);
    const progress = clamp(raw, 0, 1);

    feed.style.setProperty("--feed-progress", progress.toFixed(3));
    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateFeedProgress);
    }
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("load", requestUpdate);
  requestUpdate();
})();


/* Randomize portfolio thumbnail order on every page load.
   Runs on the homepage portfolio feed and the full Portfolio page. */
(function () {
  function shuffleGrid(grid) {
    if (!grid || grid.dataset.randomized === "true") return;
    const cards = Array.from(grid.children).filter((el) => el.classList && el.classList.contains("video-card"));
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    cards.forEach((card) => grid.appendChild(card));
    grid.dataset.randomized = "true";
  }

  function randomizePortfolioSections() {
    document.querySelectorAll(".video-grid, .portfolio-grid").forEach(shuffleGrid);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", randomizePortfolioSections);
  } else {
    randomizePortfolioSections();
  }
})();


/* Performance patch: stop scroll-scrub reveal from doing expensive work. */
(function () {
  function stabilizeFeed() {
    document.querySelectorAll(".scroll-reactive-feed").forEach((feed) => {
      feed.style.setProperty("--feed-progress", "1");
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", stabilizeFeed);
  } else {
    stabilizeFeed();
  }
  window.addEventListener("load", stabilizeFeed, { once: true });
})();


/* Hard performance patch: remove old reveal classes that can trigger previous effects. */
(function () {
  function disableHeavyRevealEffects() {
    document.querySelectorAll(".scroll-reactive-feed").forEach((el) => {
      el.style.setProperty("--feed-progress", "1");
      el.classList.remove("reveal");
      el.classList.add("in-view");
    });

    document.querySelectorAll(".video-card, .thumb-card").forEach((card) => {
      card.classList.remove("reveal");
      card.classList.add("in-view");
      card.style.filter = "none";
      card.style.opacity = "";
      card.style.transform = "";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", disableHeavyRevealEffects);
  } else {
    disableHeavyRevealEffects();
  }

  window.addEventListener("load", disableHeavyRevealEffects, { once: true });
})();


/* ------------------------------------------------------------------
   BUG FIX SCRIPT
   Rebinds filters and thumbnail preview after portfolio-data.js renders.
   Uses delegation, so it keeps working even when cards are rebuilt.
------------------------------------------------------------------ */
(function () {
  function closestGrid(tabGroup) {
    if (!tabGroup) return null;
    const parent = tabGroup.parentElement;
    if (!parent) return null;
    return parent.querySelector("#thumbnailGrid, .video-grid, .portfolio-grid");
  }

  function applyFilter(tab) {
    const tabGroup = tab.closest(".feed-tabs");
    const grid = closestGrid(tabGroup);
    if (!tabGroup || !grid) return;

    const filter = tab.dataset.filter || "all";
    const tabs = Array.from(tabGroup.querySelectorAll(".feed-tab"));

    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
    });

    Array.from(grid.querySelectorAll(".video-card, .thumb-card")).forEach((card) => {
      const categories = (card.dataset.category || "").toLowerCase().split(/\s+/).filter(Boolean);
      const show = filter === "all" || categories.includes(filter.toLowerCase());
      card.classList.toggle("is-hidden", !show);
      card.classList.remove("is-hiding");
      card.classList.toggle("is-showing", show);
    });
  }

  // Capture phase prevents older broken filter handlers from taking over.
  document.addEventListener("click", function (event) {
    const tab = event.target.closest(".feed-tab");
    if (!tab) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    applyFilter(tab);
  }, true);

  function ensureSpyglass() {
    let overlay = document.querySelector(".spyglass-viewer");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "spyglass-viewer";
      overlay.setAttribute("aria-hidden", "true");
      overlay.innerHTML = '<button class="spyglass-close" type="button" aria-label="Close thumbnail preview">×</button><figure class="spyglass-frame"><img alt="Expanded thumbnail preview"><figcaption></figcaption></figure>';
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function openPreview(card) {
    if (!card) return;
    const img = card.querySelector(".image-thumb img");
    if (!img) return;

    const overlay = ensureSpyglass();
    const preview = overlay.querySelector(".spyglass-frame img");
    const caption = overlay.querySelector("figcaption");
    const title = card.querySelector("h3")?.textContent?.trim() || img.alt || "Thumbnail preview";
    const subtitle = card.querySelector("p")?.textContent?.trim() || "";

    preview.src = img.currentSrc || img.src;
    preview.alt = img.alt || title;
    caption.innerHTML = '<span class="spyglass-title"></span>' + (subtitle ? '<span class="spyglass-subtitle"></span>' : "");
    caption.querySelector(".spyglass-title").textContent = title;
    if (subtitle) caption.querySelector(".spyglass-subtitle").textContent = subtitle;

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("spyglass-open");
  }

  function closePreview() {
    const overlay = document.querySelector(".spyglass-viewer");
    if (!overlay) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("spyglass-open");
  }

  document.addEventListener("click", function (event) {
    const close = event.target.closest(".spyglass-close");
    if (close || event.target.classList.contains("spyglass-viewer")) {
      event.preventDefault();
      closePreview();
      return;
    }

    const thumb = event.target.closest(".video-card .image-thumb, .thumb-card .image-thumb");
    if (!thumb) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openPreview(thumb.closest(".video-card, .thumb-card"));
  }, true);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closePreview();
    if ((event.key === "Enter" || event.key === " ") && event.target.closest(".image-thumb")) {
      event.preventDefault();
      openPreview(event.target.closest(".video-card, .thumb-card"));
    }
  }, true);

  function prepThumbs() {
    document.querySelectorAll(".image-thumb").forEach((thumb) => {
      thumb.setAttribute("role", "button");
      thumb.setAttribute("tabindex", "0");
      thumb.setAttribute("aria-label", "Open larger thumbnail preview");
    });
  }

  // Restore creator dock magnification using current avatars, even after data rendering.
  let dockRaf = null;
  const state = new WeakMap();

  function lerp(a, b, t) { return a + (b - a) * t; }

  function updateDock() {
    const dock = document.querySelector(".creator-dock");
    const avatars = dock ? Array.from(dock.querySelectorAll(".creator-avatar")) : [];
    if (!dock || !avatars.length) {
      dockRaf = requestAnimationFrame(updateDock);
      return;
    }

    const rect = dock.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const influence = Math.max(170, rect.width * .34);

    avatars.forEach((avatar) => {
      const aRect = avatar.getBoundingClientRect();
      const aCenter = aRect.left + aRect.width / 2;
      const distance = Math.abs(center - aCenter);
      const proximity = Math.max(0, 1 - distance / influence);
      const eased = proximity * proximity * (3 - 2 * proximity);

      const targetScale = .88 + eased * .52;
      const targetOpacity = .68 + eased * .32;
      const current = state.get(avatar) || { scale: targetScale, opacity: targetOpacity };
      const next = {
        scale: lerp(current.scale, targetScale, .16),
        opacity: lerp(current.opacity, targetOpacity, .16)
      };
      state.set(avatar, next);

      avatar.style.transform = "scale(" + next.scale.toFixed(3) + ")";
      avatar.style.opacity = next.opacity.toFixed(3);
      avatar.style.zIndex = String(1 + Math.round(eased * 10));
    });

    dockRaf = requestAnimationFrame(updateDock);
  }

  function removeGreyBars() {
    document.querySelectorAll(".page-transition, .transition-overlay").forEach((el) => el.remove());
    document.body.classList.remove("page-leaving");
  }

  function initBugFixes() {
    prepThumbs();
    removeGreyBars();
    if (!dockRaf) updateDock();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBugFixes);
  } else {
    initBugFixes();
  }

  window.addEventListener("load", initBugFixes);
})();


/* Creator bar guard: make sure the profile track has enough repeated items to scroll seamlessly. */
(function () {
  function fixCreatorTrackLoop() {
    const track = document.querySelector(".creator-track");
    if (!track) return;

    const avatars = Array.from(track.querySelectorAll(".creator-avatar"));
    if (!avatars.length) return;

    // If the data renderer only produced one set, duplicate it for seamless -50% scrolling.
    if (avatars.length < 12) {
      const html = track.innerHTML;
      track.innerHTML = html + html;
    }

    track.style.animationName = "hawkCreatorScrollLoop";
    track.style.animationPlayState = "running";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fixCreatorTrackLoop);
  } else {
    fixCreatorTrackLoop();
  }

  window.addEventListener("load", fixCreatorTrackLoop, { once: true });
})();
