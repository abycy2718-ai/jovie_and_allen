"use strict";

/* =====================================================================
   YOUR PHOTOS — this is the only part you need to edit.
   1. Put a photo in photos/jovie/, photos/allen/, or photos/together/.
   2. Add or edit an entry below. Paths and filenames are case-sensitive.
   3. Set demo: false (or remove demo) when using your own photograph.

   Required: src, title. Optional: caption, alt, date, location, position.
   date is a display label, e.g. "October 2026"; it can also be left blank.
   position controls the thumbnail crop, e.g. "center 30%".
   The first image in each album also becomes its cover in the hero.
   Keep each src unique within its album so favorites have stable IDs.
   ===================================================================== */
const ALBUMS = {
  jovie: [
    {
      src: "photos/jovie/01.svg",
      title: "In her own light",
      caption: "A little sunshine, just because.",
      alt: "An illustration of pink tulips in a glass vase",
      date: "",
      location: "",
      demo: true,
    },
    {
      src: "photos/jovie/02.svg",
      title: "Small joys",
      caption: "The tiny things that make a day.",
      alt: "An illustration of wildflowers against a peach sky",
      demo: true,
    },
    {
      src: "photos/jovie/03.svg",
      title: "Dear little days",
      caption: "A page worth keeping.",
      alt: "An illustration of a letter, a flower, and a striped table",
      demo: true,
    },
  ],
  allen: [
    {
      src: "photos/allen/01.svg",
      title: "A little further",
      caption: "There is always another view.",
      alt: "An illustration of layered green mountains and a winding path",
      date: "",
      location: "",
      demo: true,
    },
    {
      src: "photos/allen/02.svg",
      title: "Taking the long way",
      caption: "For the scenery. And the stories.",
      alt: "An illustration of blue waves meeting a golden beach",
      demo: true,
    },
    {
      src: "photos/allen/03.svg",
      title: "City daydreams",
      caption: "A quiet moment in a busy world.",
      alt: "An illustration of a sunlit city through an arched window",
      demo: true,
    },
  ],
  together: [
    {
      src: "photos/together/01.svg",
      title: "Coffee for two",
      caption: "An ordinary afternoon. Our kind of perfect.",
      alt: "An illustration of two cups of coffee on a warm pink table",
      date: "",
      location: "",
      demo: true,
    },
    {
      src: "photos/together/02.svg",
      title: "Same sunset",
      caption: "Better when we’re looking at it together.",
      alt: "An illustration of a pink sun setting over a calm sea",
      demo: true,
    },
    {
      src: "photos/together/03.svg",
      title: "The sweetest things",
      caption: "You, me, and the little things in between.",
      alt: "An illustration of two cherries on a cream gingham cloth",
      demo: true,
    },
  ],
};

// Change the text inside the envelope here. It is public website content.
const LITTLE_NOTE = "Of all the places we’ll go, and all the things we’ll become, I hope we always make time for this: a slow day, a small adventure, and each other.";

/* =====================================================================
   WEBSITE BEHAVIOR — no packages, accounts, or build tools required.
   Favorites and appearance preferences are stored only in this browser.
   ===================================================================== */
(() => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const root = document.documentElement;
  const SVG_NS = "http://www.w3.org/2000/svg";
  const FAVORITES_KEY = "jovie-allen:favorites:v1";
  const THEME_KEY = "jovie-allen:theme:v1";
  const MOTION_KEY = "jovie-allen:motion:v1";
  const albumNames = { jovie: "Jovie", allen: "Allen", together: "Together" };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let storageAvailable = true;
  let motionEnabled = true;
  let activeFilter = "all";
  let toastTimer;
  let viewerPhotos = [];
  let viewerIndex = 0;
  let viewerOpener = null;
  let swipeStart = null;
  const cardMap = new Map();

  // A self-contained fallback also handles a mistyped filename gracefully.
  const fallbackSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1100" viewBox="0 0 900 1100"><rect width="900" height="1100" fill="#e8dfd5"/><circle cx="660" cy="280" r="100" fill="#d4ad9c"/><path d="M0 770 260 420 550 760 680 590 900 840v260H0Z" fill="#a3ac96"/><path d="M0 970 370 700 700 1100H0Z" fill="#7d8a79"/><rect x="184" y="920" width="532" height="75" rx="5" fill="#fff8ed"/><text x="450" y="968" text-anchor="middle" font-family="Georgia,serif" font-size="28" fill="#663949">A little space for your photo</text></svg>`;
  const FALLBACK_IMAGE = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fallbackSVG)}`;

  function getStored(key) {
    try { return localStorage.getItem(key); }
    catch { storageAvailable = false; return null; }
  }
  function setStored(key, value) {
    try { localStorage.setItem(key, value); return true; }
    catch { storageAvailable = false; return false; }
  }
  function makeIcon(name, className = "icon") {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", className);
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS(SVG_NS, "use");
    use.setAttribute("href", `#i-${name}`);
    svg.append(use);
    return svg;
  }
  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function animate(element, keyframes, options) {
    if (motionEnabled && typeof element.animate === "function") {
      element.animate(keyframes, options);
    }
  }
  function notify(message) {
    const toast = $("#toast");
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2900);
  }

  // Normalize edited entries and skip incomplete or duplicate paths.
  const seenIDs = new Set();
  const photos = Object.keys(albumNames).flatMap(album => {
    if (!Array.isArray(ALBUMS[album])) return [];
    return ALBUMS[album].flatMap((photo, index) => {
      if (!photo || typeof photo.src !== "string" || !photo.src.trim()) {
        console.warn(`Skipped an entry in ${album}: add a src path.`);
        return [];
      }
      const id = `${album}:${photo.src}`;
      if (seenIDs.has(id)) {
        console.warn(`Skipped duplicate photo path: ${photo.src}`);
        return [];
      }
      seenIDs.add(id);
      return [{ ...photo, id, album, index: index + 1, title: String(photo.title || "A little moment") }];
    });
  });
  const photoByID = new Map(photos.map(photo => [photo.id, photo]));
  function parseFavorites(raw) {
    try {
      const items = JSON.parse(raw || "[]");
      return new Set(Array.isArray(items) ? items.filter(id => photoByID.has(id)) : []);
    } catch { return new Set(); }
  }
  let favorites = parseFavorites(getStored(FAVORITES_KEY));

  function setPhotoImage(img, photo) {
    img.alt = String(photo.alt || photo.title);
    img.style.objectPosition = photo.position || "center";
    img.onerror = () => {
      img.onerror = null;
      img.src = FALLBACK_IMAGE;
      img.alt = `Photo unavailable: ${photo.title}. Check the filename in script.js.`;
    };
    img.src = photo.src;
  }
  function metadata(photo) {
    return [photo.location, photo.date, photo.demo ? "Illustrated placeholder" : ""]
      .filter(Boolean).join(" · ");
  }
  function visiblePhotos() {
    return photos.filter(photo => activeFilter === "all"
      || (activeFilter === "saved" ? favorites.has(photo.id) : photo.album === activeFilter));
  }

  function setTheme(theme) {
    const evening = theme === "evening";
    root.dataset.theme = evening ? "evening" : "day";
    const label = evening ? "Switch to daytime theme" : "Switch to evening theme";
    const button = $("#theme-toggle");
    button.setAttribute("aria-label", label);
    button.title = label;
    $("use", button).setAttribute("href", evening ? "#i-sun" : "#i-moon");
    $('meta[name="theme-color"]').content = evening ? "#24232a" : "#f7f4ec";
  }
  setTheme(getStored(THEME_KEY));
  $("#theme-toggle").addEventListener("click", () => {
    const next = root.dataset.theme === "evening" ? "day" : "evening";
    setTheme(next);
    setStored(THEME_KEY, next);
  });

  function syncMotion() {
    motionEnabled = !reducedMotion.matches && getStored(MOTION_KEY) !== "off";
    root.classList.toggle("motion-off", !motionEnabled);
    const button = $("#motion-toggle");
    button.setAttribute("aria-pressed", String(motionEnabled));
    button.disabled = reducedMotion.matches;
    $("span", button).textContent = reducedMotion.matches ? "Reduced motion" : motionEnabled ? "Pause animations" : "Enable animations";
    $("use", button).setAttribute("href", motionEnabled ? "#i-pause" : "#i-play");
    button.title = reducedMotion.matches ? "Following your device’s reduced-motion preference" : "Control decorative motion";
    if (!motionEnabled) {
      $$(".is-pending").forEach(element => element.classList.remove("is-pending"));
      if (document.getAnimations) document.getAnimations().forEach(animation => animation.cancel());
    }
  }
  syncMotion();
  $("#motion-toggle").addEventListener("click", () => {
    // The current page still responds when a browser blocks localStorage.
    const desired = !motionEnabled;
    const persisted = setStored(MOTION_KEY, desired ? "on" : "off");
    if (persisted) syncMotion();
    else {
      motionEnabled = desired && !reducedMotion.matches;
      root.classList.toggle("motion-off", !motionEnabled);
      $("#motion-toggle").setAttribute("aria-pressed", String(motionEnabled));
      $("#motion-toggle span").textContent = motionEnabled ? "Pause animations" : "Enable animations";
      $("#motion-toggle use").setAttribute("href", motionEnabled ? "#i-pause" : "#i-play");
      if (!motionEnabled && document.getAnimations) document.getAnimations().forEach(animation => animation.cancel());
    }
  });
  reducedMotion.addEventListener("change", syncMotion);

  function burstHearts(button) {
    if (!motionEnabled) return;
    const rect = button.getBoundingClientRect();
    const target = $("#heart-particles");
    for (let i = 0; i < 7; i += 1) {
      const heart = makeIcon("heart", "heart-particle");
      heart.style.left = `${rect.left + rect.width / 2}px`;
      heart.style.top = `${rect.top + rect.height / 2}px`;
      heart.style.setProperty("--dx", `${(i - 3) * 17}px`);
      heart.style.setProperty("--dy", `${-38 - Math.random() * 42}px`);
      heart.style.setProperty("--spin", `${(i - 3) * 14}deg`);
      target.append(heart);
      setTimeout(() => heart.remove(), 950);
    }
  }
  function updateSaveButtons() {
    $$("[data-save-id]").forEach(button => {
      const photo = photoByID.get(button.dataset.saveId);
      if (!photo) return;
      const saved = favorites.has(photo.id);
      button.setAttribute("aria-pressed", String(saved));
      button.setAttribute("aria-label", `${saved ? "Unsave" : "Save"} ${photo.title}`);
      button.title = saved ? "Remove from saved photos" : "Save in this browser";
      if (button.id === "lightbox-save") $("span", button).textContent = saved ? "Saved" : "Save";
    });
    $("[data-filter-count='saved']").textContent = String(favorites.size);
  }
  function toggleFavorite(photo, button) {
    const added = !favorites.has(photo.id);
    if (added) favorites.add(photo.id);
    else favorites.delete(photo.id);
    const persisted = setStored(FAVORITES_KEY, JSON.stringify([...favorites]));
    if (added) burstHearts(button);
    updateSaveButtons();
    applyFilter(false);
    if (activeFilter === "saved" && !added && !$("#lightbox").open) {
      $("[data-filter='saved']").focus({ preventScroll: true });
    }
    const place = persisted && storageAvailable ? "this browser" : "this visit only";
    notify(added ? `Saved in ${place}.` : "Removed from saved photos.");
  }

  function makePhotoCard(photo) {
    const card = makeElement("figure", "photo-card reveal");
    card.dataset.photoId = photo.id;
    const opener = makeElement("button", "photo-open");
    opener.type = "button";
    opener.setAttribute("aria-label", `View ${photo.title} in ${albumNames[photo.album]}`);
    const img = makeElement("img");
    img.width = 900;
    img.height = 1100;
    img.loading = "lazy";
    img.decoding = "async";
    setPhotoImage(img, photo);
    opener.append(img);
    if (photo.demo) opener.append(makeElement("span", "demo-badge", "SAMPLE ART"));
    const cue = makeElement("span", "expand-cue");
    cue.append(makeIcon("expand"));
    opener.append(cue);
    opener.addEventListener("click", () => openViewer(photo.id, visiblePhotos(), opener));
    const save = makeElement("button", "photo-save");
    save.type = "button";
    save.dataset.saveId = photo.id;
    save.append(makeIcon("heart"));
    save.addEventListener("click", () => toggleFavorite(photo, save));
    const caption = makeElement("figcaption", "photo-caption");
    const captionTop = makeElement("div", "photo-caption-top");
    captionTop.append(makeElement("h4", "", photo.title), makeElement("span", "photo-index", String(photo.index).padStart(2, "0")));
    caption.append(captionTop);
    if (photo.caption) caption.append(makeElement("p", "", String(photo.caption)));
    const meta = [photo.location, photo.date].filter(Boolean).join(" · ");
    if (meta) caption.append(makeElement("p", "photo-meta", meta));
    card.append(opener, save, caption);
    cardMap.set(photo.id, card);
    return card;
  }
  photos.forEach(photo => $(`#${photo.album}-grid`).append(makePhotoCard(photo)));

  function applyFilter(withAnimation = true) {
    const visible = visiblePhotos();
    const visibleIDs = new Set(visible.map(photo => photo.id));
    cardMap.forEach((card, id) => { card.hidden = !visibleIDs.has(id); });
    Object.keys(albumNames).forEach(album => {
      const count = visible.filter(photo => photo.album === album).length;
      $(`[data-album='${album}']`).hidden = count === 0;
      $(`[data-album-count='${album}']`).textContent = `${String(count).padStart(2, "0")} ${count === 1 ? "MOMENT" : "MOMENTS"}`;
      $(`[data-filter-count='${album}']`).textContent = String(photos.filter(photo => photo.album === album).length);
    });
    $("[data-filter-count='all']").textContent = String(photos.length);
    $$("[data-filter]").forEach(button => {
      const selected = button.dataset.filter === activeFilter;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    $("#empty-state").hidden = visible.length > 0;
    $("#empty-title").textContent = activeFilter === "saved" ? "Your favorites live here." : "A little room for new memories.";
    $("#empty-message").textContent = activeFilter === "saved"
      ? "Tap the heart on a photo to keep it close. Saved photos stay in this browser."
      : "Add your photos to the folders and list them at the top of script.js.";
    $("#surprise-button").disabled = visible.length === 0;
    $("#demo-notice").hidden = !visible.some(photo => photo.demo);
    $("#filter-status").textContent = `${visible.length} ${visible.length === 1 ? "moment" : "moments"} shown. ${activeFilter === "all" ? "All albums" : activeFilter === "saved" ? "Saved in this browser" : albumNames[activeFilter]}.`;
    if (withAnimation) {
      $$(".album:not([hidden]) .photo-grid").forEach(grid => {
        animate(grid, [{ opacity: .4, transform: "translateY(9px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 300, easing: "ease-out" });
      });
    }
    requestProgress();
  }
  $$("[data-filter]").forEach(button => button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    applyFilter();
  }));
  $("#show-all-button").addEventListener("click", () => {
    activeFilter = "all";
    applyFilter();
    $("[data-filter='all']").focus({ preventScroll: true });
  });
  $$("[data-cover]").forEach(button => {
    const album = button.dataset.cover;
    const albumPhotos = photos.filter(photo => photo.album === album);
    const first = albumPhotos[0];
    if (!first) {
      button.disabled = true;
      $("img", button).src = FALLBACK_IMAGE;
      $("img", button).alt = `Space for a ${albumNames[album]} photo`;
      return;
    }
    setPhotoImage($("img", button), first);
    button.setAttribute("aria-label", `Open ${albumNames[album]} album: ${first.title}`);
    button.addEventListener("click", () => openViewer(first.id, albumPhotos, button));
  });
  $("#surprise-button").addEventListener("click", event => {
    const pool = visiblePhotos();
    if (!pool.length) return;
    const photo = pool[Math.floor(Math.random() * pool.length)];
    openViewer(photo.id, pool, event.currentTarget);
  });

  // Native dialog provides a focus trap and Escape-to-close behavior.
  const dialog = $("#lightbox");
  function updateViewer() {
    const photo = viewerPhotos[viewerIndex];
    if (!photo) return;
    const img = $("#lightbox-image");
    setPhotoImage(img, photo);
    $("#lightbox-title").textContent = photo.title;
    $("#lightbox-caption").textContent = String(photo.caption || "");
    $("#lightbox-meta").textContent = metadata(photo);
    $("#lightbox-meta").hidden = !metadata(photo);
    $("#lightbox-album").textContent = albumNames[photo.album];
    $("#lightbox-counter").textContent = `${viewerIndex + 1} of ${viewerPhotos.length}`;
    $("#lightbox-status").textContent = `${photo.title}. ${albumNames[photo.album]}. Photo ${viewerIndex + 1} of ${viewerPhotos.length}.`;
    $("#lightbox-save").dataset.saveId = photo.id;
    $("#lightbox-prev").disabled = viewerPhotos.length < 2;
    $("#lightbox-next").disabled = viewerPhotos.length < 2;
    updateSaveButtons();
    animate(img, [{ opacity: .35, transform: "scale(.985)" }, { opacity: 1, transform: "scale(1)" }], { duration: 240, easing: "ease-out" });
  }
  function openViewer(id, collection, opener) {
    const index = collection.findIndex(photo => photo.id === id);
    if (index < 0) return;
    viewerPhotos = [...collection];
    viewerIndex = index;
    viewerOpener = opener || document.activeElement;
    updateViewer();
    if (!dialog.open) {
      dialog.showModal();
      document.body.classList.add("modal-open");
      dialog.append($("#toast"), $("#heart-particles"));
      $("#lightbox-close").focus({ preventScroll: true });
    }
  }
  function stepViewer(direction) {
    if (viewerPhotos.length < 2) return;
    viewerIndex = (viewerIndex + direction + viewerPhotos.length) % viewerPhotos.length;
    updateViewer();
  }
  $("#lightbox-close").addEventListener("click", () => dialog.close());
  $("#lightbox-prev").addEventListener("click", () => stepViewer(-1));
  $("#lightbox-next").addEventListener("click", () => stepViewer(1));
  $("#lightbox-save").addEventListener("click", event => {
    const photo = viewerPhotos[viewerIndex];
    if (photo) toggleFavorite(photo, event.currentTarget);
  });
  dialog.addEventListener("click", event => {
    if (event.target === dialog || event.target === $(".lightbox-shell") || event.target === $(".lightbox-image-wrap")) dialog.close();
  });
  dialog.addEventListener("keydown", event => {
    if (event.key === "ArrowRight") { event.preventDefault(); stepViewer(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); stepViewer(-1); }
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    document.body.append($("#toast"), $("#heart-particles"));
    swipeStart = null;
    if (viewerOpener && viewerOpener.isConnected && !viewerOpener.closest("[hidden]")) viewerOpener.focus({ preventScroll: true });
    else $(`[data-filter='${activeFilter}']`).focus({ preventScroll: true });
  });
  const swipeArea = $(".lightbox-image-wrap");
  swipeArea.addEventListener("pointerdown", event => {
    if (!event.isPrimary) { swipeStart = null; return; }
    if (event.pointerType === "touch" || event.pointerType === "pen") swipeStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
  }, { passive: true });
  swipeArea.addEventListener("pointerup", event => {
    if (!swipeStart || event.pointerId !== swipeStart.id) return;
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) stepViewer(dx < 0 ? 1 : -1);
  }, { passive: true });
  swipeArea.addEventListener("pointercancel", () => { swipeStart = null; }, { passive: true });

  $("#note-text").textContent = LITTLE_NOTE;
  $("#note-toggle").addEventListener("click", event => {
    const button = event.currentTarget;
    const expanded = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(expanded));
    button.setAttribute("aria-label", expanded ? "Close our little note" : "Open our little note");
    $("#love-note").hidden = !expanded;
    $("#note-instruction").textContent = expanded ? "a little reminder, always" : "a little note for us — tap to open";
    if (expanded) animate($("#love-note"), [{ opacity: 0, transform: "translateY(15px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 400, easing: "ease-out" });
    requestProgress();
  });
  $("#year").textContent = String(new Date().getFullYear());

  let progressPending = false;
  function requestProgress() {
    if (progressPending) return;
    progressPending = true;
    requestAnimationFrame(() => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
      $("#reading-progress").style.transform = `scaleX(${ratio})`;
      progressPending = false;
    });
  }
  window.addEventListener("scroll", requestProgress, { passive: true });
  window.addEventListener("resize", requestProgress, { passive: true });
  window.addEventListener("load", requestProgress, { once: true });
  window.addEventListener("storage", event => {
    if (event.key === FAVORITES_KEY || event.key === null) {
      favorites = parseFavorites(getStored(FAVORITES_KEY));
      updateSaveButtons();
      applyFilter(false);
    }
    if (event.key === THEME_KEY || event.key === null) setTheme(getStored(THEME_KEY));
    if (event.key === MOTION_KEY || event.key === null) syncMotion();
  });

  updateSaveButtons();
  applyFilter(false);
  if ("IntersectionObserver" in window && motionEnabled) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("is-pending");
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: "0px 0px 20px 0px" });
    $$(".reveal").forEach(element => {
      element.classList.add("is-pending");
      observer.observe(element);
    });
  }
})();
