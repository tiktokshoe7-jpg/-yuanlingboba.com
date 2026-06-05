const body = document.body;
const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector("[data-nav-toggle]");
const siteNav = document.querySelector("[data-site-nav]");

body.classList.add("js-enhanced");

const getCurrentPage = () => {
  const path = window.location.pathname.split("/").pop();
  return path && path.length > 0 ? path.toLowerCase() : "index.html";
};

const syncActiveNavLink = () => {
  if (!siteNav) {
    return;
  }

  const currentPage = getCurrentPage();

  siteNav.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href")?.split(/[?#]/)[0].toLowerCase();
    const isCurrent = href === currentPage;

    link.classList.toggle("current", isCurrent);
    link.classList.toggle("is-active", isCurrent);

    if (isCurrent) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const setHeaderState = () => {
  if (!siteHeader) {
    return;
  }

  siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
};

const closeNav = () => {
  if (!navToggle || !siteNav) {
    return;
  }

  siteNav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  body.classList.remove("nav-open");
};

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    body.classList.toggle("nav-open", isOpen);
  });

  document.addEventListener("click", (event) => {
    if (!siteNav.classList.contains("open")) {
      return;
    }

    const target = event.target;

    if (
      target instanceof Node &&
      !siteNav.contains(target) &&
      !navToggle.contains(target)
    ) {
      closeNav();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
    }
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 960) {
        closeNav();
      }
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) {
      closeNav();
    }
  });
}

syncActiveNavLink();
setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

const yearTarget = document.querySelector("[data-year]");

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

const attachImageState = (imageSelector, wrapperSelector) => {
  document.querySelectorAll(imageSelector).forEach((image) => {
    const wrapper = image.closest(wrapperSelector);

    if (!wrapper) {
      return;
    }

    const markLoaded = () => {
      wrapper.classList.add("has-image");
    };

    const markError = () => {
      wrapper.classList.remove("has-image");
    };

    if (image.complete && image.naturalWidth > 0) {
      markLoaded();
    } else {
      image.addEventListener("load", markLoaded, { once: true });
    }

    image.addEventListener("error", markError);
  });
};

attachImageState("[data-process-image]", "[data-process-photo]");
attachImageState("[data-cert-image]", "[data-cert-photo]");

const mapTrigger = document.querySelector("[data-map-open]");
const mapModal = document.querySelector("[data-map-modal]");
const mapCloseButton = document.querySelector("[data-map-close]");

const closeMapModal = () => {
  if (mapModal?.open) {
    mapModal.close();
  }
};

if (mapTrigger && mapModal) {
  mapTrigger.addEventListener("click", () => {
    if (typeof mapModal.showModal === "function") {
      mapModal.showModal();
    }
  });

  mapCloseButton?.addEventListener("click", closeMapModal);

  mapModal.addEventListener("click", (event) => {
    const target = event.target;

    if (target === mapModal) {
      closeMapModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMapModal();
    }
  });
}

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.16,
    }
  );

  revealItems.forEach((item) => {
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => {
    item.classList.add("in-view");
  });
}

const sectionNavLinks = document.querySelectorAll(".home-section-nav a[href^='#']");

if (sectionNavLinks.length > 0) {
  const linkedSections = [...sectionNavLinks]
    .map((link) => {
      const target = document.querySelector(link.getAttribute("href"));

      if (!target) {
        return null;
      }

      return { link, target };
    })
    .filter(Boolean);

  const setActiveSectionLink = () => {
    let activeItem = linkedSections[0] ?? null;
    const offset = 180;

    linkedSections.forEach((item) => {
      if (item.target.getBoundingClientRect().top - offset <= 0) {
        activeItem = item;
      }
    });

    linkedSections.forEach((item) => {
      item.link.classList.toggle("is-active", item === activeItem);
    });
  };

  setActiveSectionLink();
  window.addEventListener("scroll", setActiveSectionLink, { passive: true });
  window.addEventListener("resize", setActiveSectionLink);
}

document.querySelectorAll("[data-hero-slider]").forEach((heroSlider) => {
  const slides = [...heroSlider.querySelectorAll("[data-hero-slide]")];
  const dots = [...heroSlider.querySelectorAll("[data-hero-dot]")];
  const prevButton = heroSlider.querySelector("[data-hero-prev]");
  const nextButton = heroSlider.querySelector("[data-hero-next]");
  let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  let autoplayId = null;

  if (slides.length === 0) {
    return;
  }

  if (activeIndex < 0) {
    activeIndex = 0;
  }

  const renderSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
      dot.setAttribute("aria-current", dotIndex === activeIndex ? "true" : "false");
    });
  };

  const stopAutoplay = () => {
    if (autoplayId) {
      window.clearInterval(autoplayId);
      autoplayId = null;
    }
  };

  const startAutoplay = () => {
    if (slides.length < 2) {
      return;
    }

    stopAutoplay();
    autoplayId = window.setInterval(() => {
      renderSlide(activeIndex + 1);
    }, 4500);
  };

  prevButton?.addEventListener("click", () => {
    renderSlide(activeIndex - 1);
    startAutoplay();
  });

  nextButton?.addEventListener("click", () => {
    renderSlide(activeIndex + 1);
    startAutoplay();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      renderSlide(index);
      startAutoplay();
    });
  });

  heroSlider.addEventListener("mouseenter", stopAutoplay);
  heroSlider.addEventListener("mouseleave", startAutoplay);

  renderSlide(activeIndex);
  startAutoplay();
});

document.querySelectorAll("[data-feature-carousel]").forEach((featureCarousel) => {
  const slides = [...featureCarousel.querySelectorAll("[data-feature-slide]")];
  const dots = [...featureCarousel.querySelectorAll("[data-feature-dot]")];
  const prevButton = featureCarousel.querySelector("[data-feature-prev]");
  const nextButton = featureCarousel.querySelector("[data-feature-next]");
  let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  let autoplayId = null;

  if (slides.length === 0) {
    return;
  }

  if (activeIndex < 0) {
    activeIndex = 0;
  }

  const renderSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
      dot.setAttribute("aria-current", dotIndex === activeIndex ? "true" : "false");
    });
  };

  const stopAutoplay = () => {
    if (autoplayId) {
      window.clearInterval(autoplayId);
      autoplayId = null;
    }
  };

  const startAutoplay = () => {
    if (slides.length < 2) {
      return;
    }

    stopAutoplay();
    autoplayId = window.setInterval(() => {
      renderSlide(activeIndex + 1);
    }, 5000);
  };

  prevButton?.addEventListener("click", () => {
    renderSlide(activeIndex - 1);
    startAutoplay();
  });

  nextButton?.addEventListener("click", () => {
    renderSlide(activeIndex + 1);
    startAutoplay();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      renderSlide(index);
      startAutoplay();
    });
  });

  featureCarousel.addEventListener("mouseenter", stopAutoplay);
  featureCarousel.addEventListener("mouseleave", startAutoplay);

  renderSlide(activeIndex);
  startAutoplay();
});

const heroCenterMetaText = document.querySelector(".hero-center-meta p");

if (heroCenterMetaText) {
  heroCenterMetaText.classList.add("bilingual-copy", "is-compact");
  heroCenterMetaText.innerHTML = `
    <span class="copy-cn">做好每一颗珍珠，让好味道被更多人喝到</span>
    <span class="copy-en">Carefully make every pearl so better flavor reaches more people.</span>
  `;
}
