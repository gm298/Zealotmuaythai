(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-solid", window.scrollY > 24);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      });
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  if (slides.length > 1) {
    let index = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) {
      setInterval(() => {
        slides[index].classList.remove("is-active");
        index = (index + 1) % slides.length;
        slides[index].classList.add("is-active");
      }, 2500);
    }
  }

  const fitLocalBarText = () => {
    const el = document.querySelector(".local-bar-fit");
    const shell = el?.closest(".local-bar-inner");
    if (!el || !shell) return;

    const maxWidth = shell.clientWidth;
    if (!maxWidth) return;

    el.style.whiteSpace = "nowrap";
    el.style.fontSize = "200px";

    const natural = el.scrollWidth;
    if (!natural) return;

    const fitted = (maxWidth / natural) * 200;

    if (fitted < 12.5) {
      el.style.whiteSpace = "normal";
      el.style.fontSize = "0.95rem";
      return;
    }

    el.style.fontSize = `${fitted}px`;
  };

  fitLocalBarText();
  window.addEventListener("resize", fitLocalBarText);
  if ("ResizeObserver" in window) {
    const localShell = document.querySelector(".local-bar-inner");
    if (localShell) new ResizeObserver(fitLocalBarText).observe(localShell);
  }
  document.fonts?.ready?.then(fitLocalBarText);

  const revealTargets = document.querySelectorAll(
    ".local-bar, .coach, .identity, .facilities, .learn, .for-who, .offerings, .schedule, .private, .atmosphere, .book, .find-us, .split-visual"
  );

  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-in"));
  }

  const lightbox = document.getElementById("flyer-lightbox");
  const lightboxImg = document.getElementById("flyer-lightbox-img");
  const lightboxBook = document.getElementById("flyer-lightbox-book");

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
  };

  const openLightbox = (btn) => {
    if (!lightbox || !lightboxImg || !lightboxBook) return;
    const src = btn.getAttribute("data-flyer-src");
    const day = btn.getAttribute("data-flyer-day") || "training";
    const alt = btn.getAttribute("data-flyer-alt") || day;
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightboxBook.href = `https://wa.me/6281338306716?text=${encodeURIComponent(
      `Hi Zealot, I'd like to book training on ${day}.`
    )}`;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  };

  document.querySelectorAll(".schedule-flyer").forEach((btn) => {
    btn.addEventListener("click", () => openLightbox(btn));
  });

  if (lightbox) {
    lightbox.querySelectorAll("[data-close-flyer]").forEach((el) => {
      el.addEventListener("click", closeLightbox);
    });
  }

  const slots = Array.from(document.querySelectorAll(".sched-slot"));
  const bookModal = document.getElementById("book-modal");
  const bookTitle = document.getElementById("book-modal-title");
  const bookSummary = document.getElementById("book-modal-summary");
  const bookDate = document.getElementById("book-modal-date");
  const bookError = document.getElementById("book-modal-error");
  const bookWhatsapp = document.getElementById("book-modal-whatsapp");
  const bookPrivateOptions = document.getElementById("book-private-options");
  const bookPackageUpsell = document.getElementById("book-package-upsell");
  const bookTotal = document.getElementById("book-total");
  const bookTotalPrice = document.getElementById("book-total-price");
  const bookUpsell10 = document.getElementById("book-upsell-10");
  const bookUpsell20 = document.getElementById("book-upsell-20");

  const PRIVATE_PRICES = {
    jerry: {
      label: "Jerry (National coach)",
      single: "1,5M",
      "10": "10M",
      "20": "20M",
    },
    senior: {
      label: "Senior trainer",
      single: "600K",
      "10": "5M",
      "20": "10M",
    },
    junior: {
      label: "Junior trainer",
      single: "400K",
      "10": "3,5M",
      "20": "7M",
    },
  };

  const PACKAGE_LABELS = {
    single: "Single session",
    "10": "Package of 10 sessions",
    "20": "Package of 20 sessions",
  };

  const bookingState = {
    day: "",
    time: "",
    type: "",
    isPrivate: false,
  };

  const weekdayIndex = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const formatDisplayDate = (date) =>
    date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatIsoDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const upcomingDatesForWeekday = (weekdayName, count = 8) => {
    const target = weekdayIndex[weekdayName];
    if (target == null) return [];
    const dates = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let i = 0; i < 90 && dates.length < count; i += 1) {
      const check = new Date(start);
      check.setDate(start.getDate() + i);
      if (check.getDay() === target) dates.push(check);
    }
    return dates;
  };

  const getSelectedTrainer = () =>
    bookModal?.querySelector('input[name="book-trainer"]:checked')?.value || "jerry";

  const getSelectedPackage = () =>
    bookModal?.querySelector('input[name="book-package"]:checked')?.value || "single";

  const setPackageSelection = (value) => {
    const input = bookModal?.querySelector(`input[name="book-package"][value="${value}"]`);
    if (input) input.checked = true;
  };

  const setBookDisabled = (disabled) => {
    if (!bookWhatsapp) return;
    bookWhatsapp.classList.toggle("is-disabled", disabled);
    bookWhatsapp.setAttribute("aria-disabled", String(disabled));
    if (disabled) bookWhatsapp.href = "#";
  };

  const refreshPrivateUI = () => {
    if (!bookingState.isPrivate) return;
    const trainer = getSelectedTrainer();
    const pack = getSelectedPackage();
    const prices = PRIVATE_PRICES[trainer];
    if (!prices || !bookTotalPrice) return;

    bookTotalPrice.textContent = `${prices[pack]} IDR`;
    if (bookUpsell10) bookUpsell10.textContent = prices["10"];
    if (bookUpsell20) bookUpsell20.textContent = prices["20"];
    if (bookPackageUpsell) bookPackageUpsell.hidden = pack !== "single";
  };

  const updateBookLink = () => {
    if (!bookDate || !bookWhatsapp) return;
    const selected = bookDate.options[bookDate.selectedIndex];
    if (!bookDate.value || !selected) {
      setBookDisabled(true);
      refreshPrivateUI();
      return;
    }

    const display = selected.dataset.display || selected.textContent;
    const { type, time, isPrivate } = bookingState;
    let msg = `Hi Zealot, I'd like to book ${type} on ${display} at ${time}.`;

    if (isPrivate) {
      const trainer = getSelectedTrainer();
      const pack = getSelectedPackage();
      const prices = PRIVATE_PRICES[trainer];
      msg = `Hi Zealot, I'd like to book a private session with ${prices.label} — ${PACKAGE_LABELS[pack]} (${prices[pack]} IDR) on ${display} at ${time}.`;
    }

    bookWhatsapp.href = `https://wa.me/6281338306716?text=${encodeURIComponent(msg)}`;
    setBookDisabled(false);
    if (bookError) bookError.hidden = true;
    refreshPrivateUI();
  };

  const closeBookModal = () => {
    if (!bookModal) return;
    bookModal.hidden = true;
    document.body.style.overflow = "";
  };

  const openBookModal = (slot) => {
    if (!bookModal || !bookSummary || !bookDate || !bookWhatsapp) return;

    slots.forEach((s) => s.classList.remove("is-selected"));
    slot.classList.add("is-selected");

    const day = slot.dataset.day;
    const time = slot.dataset.time;
    const type = slot.dataset.type;
    const isPrivate = /private/i.test(type || "");

    bookingState.day = day;
    bookingState.time = time;
    bookingState.type = type;
    bookingState.isPrivate = isPrivate;

    if (bookTitle) {
      bookTitle.textContent = isPrivate ? "Book private session" : "Choose your date";
    }
    bookSummary.textContent = `${type} · ${day} · ${time}`;
    bookDate.innerHTML = '<option value="">Select a date</option>';

    upcomingDatesForWeekday(day).forEach((date) => {
      const option = document.createElement("option");
      option.value = formatIsoDate(date);
      option.textContent = formatDisplayDate(date);
      option.dataset.display = formatDisplayDate(date);
      bookDate.appendChild(option);
    });

    if (bookPrivateOptions) bookPrivateOptions.hidden = !isPrivate;
    if (bookTotal) bookTotal.hidden = !isPrivate;
    if (bookPackageUpsell) bookPackageUpsell.hidden = true;

    if (isPrivate) {
      const jerryRadio = bookModal.querySelector('input[name="book-trainer"][value="jerry"]');
      const singleRadio = bookModal.querySelector('input[name="book-package"][value="single"]');
      if (jerryRadio) jerryRadio.checked = true;
      if (singleRadio) singleRadio.checked = true;
    }

    if (bookError) bookError.hidden = true;
    setBookDisabled(true);
    bookModal.hidden = false;
    document.body.style.overflow = "hidden";
    bookDate.focus();
    updateBookLink();
  };

  slots.forEach((slot) => {
    slot.addEventListener("click", () => openBookModal(slot));
  });

  if (bookModal) {
    bookModal.querySelectorAll("[data-close-book]").forEach((el) => {
      el.addEventListener("click", closeBookModal);
    });

    bookModal.querySelectorAll('input[name="book-trainer"], input[name="book-package"]').forEach((input) => {
      input.addEventListener("change", updateBookLink);
    });

    bookModal.querySelectorAll("[data-package]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setPackageSelection(btn.dataset.package);
        updateBookLink();
      });
    });
  }

  if (bookDate) {
    bookDate.addEventListener("change", updateBookLink);
  }

  if (bookWhatsapp) {
    bookWhatsapp.addEventListener("click", (e) => {
      if (bookWhatsapp.getAttribute("aria-disabled") === "true") {
        e.preventDefault();
        if (bookError) bookError.hidden = false;
      } else {
        closeBookModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (bookModal && !bookModal.hidden) closeBookModal();
    if (lightbox && !lightbox.hidden) closeLightbox();
  });
})();
