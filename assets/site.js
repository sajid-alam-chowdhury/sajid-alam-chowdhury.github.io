(function () {
  const root = document.documentElement;
  const themeKey = "sajid-site-theme-v2";
  const savedTheme = localStorage.getItem(themeKey) || "dark";
  root.dataset.theme = savedTheme;

  const enablePageMotion = () => {
    window.requestAnimationFrame(() => root.classList.add("page-ready"));
  };
  if (document.readyState === "complete") {
    enablePageMotion();
  } else {
    window.addEventListener("load", enablePageMotion, { once: true });
  }

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  const themeButtons = Array.from(document.querySelectorAll("[data-theme-toggle]"));

  function syncThemeToggleIcons() {
    const isDark = root.dataset.theme === "dark";
    const icon = isDark ? "sun" : "moon-star";
    const label = isDark ? "Switch to light theme" : "Switch to dark theme";

    themeButtons.forEach((button) => {
      const currentIcon = button.querySelector("[data-lucide]");
      if (!currentIcon || currentIcon.getAttribute("data-lucide") !== icon) {
        button.innerHTML = `<i data-lucide="${icon}"></i>`;
      }
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
    });

    refreshIcons();
  }

  window.addEventListener("load", syncThemeToggleIcons);
  window.setTimeout(syncThemeToggleIcons, 1200);

  function updateScrollProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    root.style.setProperty("--scroll-progress", `${Math.min(100, Math.max(0, progress))}%`);
  }

  updateScrollProgress();
  window.addEventListener("scroll", updateScrollProgress, { passive: true });

  syncThemeToggleIcons();

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      localStorage.setItem(themeKey, next);
      syncThemeToggleIcons();
    });
  });

  const menuButton = document.querySelector("[data-menu-toggle]");
  const navLinks = document.querySelector("[data-nav-links]");
  if (menuButton && navLinks) {
    let menuCloseTimer;

    const finishMenuClose = () => {
      navLinks.classList.remove("open", "closing");
      root.classList.remove("nav-open");
      menuButton.setAttribute("aria-expanded", "false");
    };

    const setMenuOpen = (open, animate = true) => {
      window.clearTimeout(menuCloseTimer);

      if (open) {
        navLinks.classList.remove("closing");
        navLinks.classList.add("open");
        root.classList.add("nav-open");
        menuButton.setAttribute("aria-expanded", "true");
        return;
      }

      if (animate && window.innerWidth <= 1120 && navLinks.classList.contains("open")) {
        navLinks.classList.add("closing");
        menuButton.setAttribute("aria-expanded", "false");
        menuCloseTimer = window.setTimeout(finishMenuClose, 360);
        return;
      }

      finishMenuClose();
    };

    menuButton.addEventListener("click", () => {
      const shouldOpen = !navLinks.classList.contains("open") || navLinks.classList.contains("closing");
      setMenuOpen(shouldOpen);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        setMenuOpen(false);
      });
    });

    document.addEventListener("click", (event) => {
      if (!navLinks.classList.contains("open")) return;
      if (navLinks.contains(event.target) || menuButton.contains(event.target)) return;
      setMenuOpen(false);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1120) setMenuOpen(false, false);
    }, { passive: true });
  }

  const sectionLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const linkedSections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && linkedSections.length) {
    const heroSection = document.querySelector("#top");
    const observedSections = heroSection ? [heroSection, ...linkedSections] : linkedSections;
    let navJumpLockUntil = 0;

    const clearActiveNav = () => {
      sectionLinks.forEach((link) => link.classList.remove("active"));
    };
    const setActiveNav = (hash) => {
      sectionLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === hash);
      });
    };

    sectionLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const hash = link.getAttribute("href");
        if (!hash || hash === "#top") return;
        navJumpLockUntil = Date.now() + 950;
        setActiveNav(hash);
        window.setTimeout(() => {
          if (Date.now() >= navJumpLockUntil) navJumpLockUntil = 0;
        }, 1000);
      });
    });

    const navObserver = new IntersectionObserver((entries) => {
      if (Date.now() < navJumpLockUntil) return;
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) {
        const firstSectionTop = linkedSections[0].offsetTop;
        if (window.scrollY < firstSectionTop - window.innerHeight * 0.28) clearActiveNav();
        return;
      }
      if (visible.target.id === "top") {
        clearActiveNav();
        return;
      }
      setActiveNav(`#${visible.target.id}`);
    }, { rootMargin: "-35% 0px -55% 0px", threshold: [0.05, 0.2, 0.5] });
    observedSections.forEach((section) => navObserver.observe(section));
  }

  const typeTarget = document.querySelector("[data-typewriter]");
  if (typeTarget) {
    const phrases = (typeTarget.dataset.phrases || "")
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);
    let phraseIndex = 0;
    let charIndex = (phrases[0] || "").length;
    let deleting = true;
    typeTarget.textContent = phrases[0] || "";

    const tick = () => {
      const phrase = phrases[phraseIndex] || "";
      typeTarget.textContent = deleting
        ? phrase.slice(0, Math.max(0, charIndex - 1))
        : phrase.slice(0, charIndex + 1);
      charIndex += deleting ? -1 : 1;

      let delay = deleting ? 38 : 66;
      if (!deleting && charIndex === phrase.length) {
        delay = 1250;
        deleting = true;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 260;
      }
      window.setTimeout(tick, delay);
    };
    window.setTimeout(tick, 1100);
  }

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tab;
      document.querySelectorAll("[data-tab]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      document.querySelectorAll("[data-tab-panel]").forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.tabPanel === target);
      });
    });
  });

  document.querySelectorAll("[data-area-card]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.areaCard;
      document.querySelectorAll("[data-area-card]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
      });
      document.querySelectorAll("[data-area-panel]").forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.areaPanel === target);
      });
    });
  });

  function activateResearchCard(card) {
    const target = card.dataset.researchCard;
    if (!target) return;
    document.querySelectorAll("[data-research-card]").forEach((item) => {
      const active = item === card;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll("[data-research-detail]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.researchDetail === target);
    });
  }

  document.querySelectorAll("[data-research-card]").forEach((card) => {
    card.addEventListener("click", () => activateResearchCard(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateResearchCard(card);
      }
    });
  });

  document.querySelectorAll("[data-expand]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".timeline-item");
      if (!item) return;
      item.classList.toggle("open");
      const open = item.classList.contains("open");
      button.setAttribute("aria-expanded", String(open));
      button.innerHTML = open
        ? '<i data-lucide="minus"></i> Less'
        : '<i data-lucide="plus"></i> Details';
      refreshIcons();
    });
  });

  let publicationFilter = "all";
  let publicationQuery = "";
  const publicationCards = Array.from(document.querySelectorAll("[data-pub-type]"));

  function applyPublicationFilters() {
    publicationCards.forEach((card) => {
      const types = (card.dataset.pubType || "").split(/\s+/);
      const matchesType = publicationFilter === "all" || types.includes(publicationFilter);
      const matchesQuery = !publicationQuery || card.innerText.toLowerCase().includes(publicationQuery);
      card.hidden = !matchesType || !matchesQuery;
    });
  }

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      publicationFilter = button.dataset.filter || "all";
      document.querySelectorAll("[data-filter]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      applyPublicationFilters();
    });
  });

  document.querySelectorAll("[data-pub-search]").forEach((input) => {
    input.addEventListener("input", () => {
      publicationQuery = input.value.trim().toLowerCase();
      applyPublicationFilters();
    });
  });

  const newsToggle = document.querySelector("[data-news-toggle]");
  const newsItems = Array.from(document.querySelectorAll("[data-news-kind]"));
  let newsExpanded = false;
  let newsFilter = "all";

  function applyNewsFilters() {
    newsItems.forEach((item) => {
      const kinds = (item.dataset.newsKind || "").split(/\s+/);
      const matchesKind = newsFilter === "all" || kinds.includes(newsFilter);
      const isExtra = item.hasAttribute("data-news-extra");
      item.hidden = !matchesKind || (isExtra && !newsExpanded);
    });
    if (newsToggle) {
      newsToggle.setAttribute("aria-expanded", String(newsExpanded));
      newsToggle.innerHTML = newsExpanded
        ? '<i data-lucide="list-minus"></i> Show fewer updates'
        : '<i data-lucide="list-plus"></i> Show all updates';
      refreshIcons();
    }
  }

  document.querySelectorAll("[data-news-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      newsFilter = button.dataset.newsFilter || "all";
      document.querySelectorAll("[data-news-filter]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      applyNewsFilters();
    });
  });

  if (newsToggle && newsItems.length) {
    newsToggle.addEventListener("click", () => {
      newsExpanded = !newsExpanded;
      applyNewsFilters();
    });
    applyNewsFilters();
  }

  async function copyText(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      const original = button.innerHTML;
      const iconOnly = button.classList.contains("bibtex-copy");
      button.innerHTML = iconOnly ? '<i data-lucide="check"></i>' : '<i data-lucide="check"></i> Copied';
      if (iconOnly) {
        button.setAttribute("aria-label", "BibTeX copied");
        button.title = "Copied";
      }
      refreshIcons();
      window.setTimeout(() => {
        button.innerHTML = original;
        if (iconOnly) {
          button.setAttribute("aria-label", "Copy BibTeX");
          button.title = "Copy BibTeX";
        }
        refreshIcons();
      }, 1300);
    } catch {
      window.prompt("Copy this:", text);
    }
  }

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", () => copyText(button.dataset.copy || "", button));
  });

  document.querySelectorAll("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.copyTarget);
      if (target) copyText(target.innerText.trim(), button);
    });
  });

  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(contactForm);
      const name = String(form.get("name") || "").trim();
      const email = String(form.get("email") || "").trim();
      const subject = String(form.get("subject") || "Message from academic website").trim();
      const message = String(form.get("message") || "").trim();
      const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
      const mailto = `mailto:sajidalam@wayne.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.assign(mailto);
    });
  }

  const revealElements = Array.from(document.querySelectorAll(".reveal"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const observer = "IntersectionObserver" in window && !reduceMotion
    ? new IntersectionObserver((entries) => {
      const entering = entries
        .filter((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.08)
        .sort((a, b) => {
          const topDifference = a.boundingClientRect.top - b.boundingClientRect.top;
          return Math.abs(topDifference) > 16
            ? topDifference
            : a.boundingClientRect.left - b.boundingClientRect.left;
        });

      entries
        .filter((entry) => !entry.isIntersecting)
        .forEach((entry) => {
          entry.target.classList.add("reveal-reset");
          entry.target.classList.remove("in-view");
          entry.target.style.removeProperty("--reveal-delay");
          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => entry.target.classList.remove("reveal-reset"));
          });
        });

      entering.forEach((entry, index) => {
        const delay = Math.min(index, 3) * 45;
        entry.target.style.setProperty("--reveal-delay", `${delay}ms`);
        entry.target.classList.add("in-view");
      });
    }, { rootMargin: "0px 0px -3% 0px", threshold: [0, 0.08] })
    : null;

  if (observer && revealElements.length) {
    revealElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        element.classList.add("in-view");
      }
    });
    root.classList.add("reveal-ready");
    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("in-view"));
  }

  refreshIcons();
})();
