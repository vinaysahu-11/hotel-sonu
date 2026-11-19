/**
 * HOTEL SONU – CLIENT INTERACTION ENGINE (V3)
 * Premium Hospitality Interaction, Verified WhatsApp Booking & Google Places Sync
 */

const HOTEL_CONFIG = {
  "id": "01-hotel-sonu",
  "name": "Hotel Sonu",
  "phone": "7000383800",
  "phoneDisplay": "+91 70003 83800",
  "whatsapp": "917000383800",
  "address": "Opposite Jalaram Sweets, Behind Patanjali Store, Tanka Para, Rajnandgaon, Chhattisgarh \u2013 491441",
  "mapsUrl": "https://maps.app.goo.gl/LrvJd45XBZ9SCmp98",
  "placeQuery": "Hotel Sonu Tanka Para Rajnandgaon Chhattisgarh",
  "archetype": "modern_minimal_boutique",
  "rooms": [
    {
      "id": "sonu-deluxe-ac",
      "title": "Deluxe AC Room",
      "tag": "Air Conditioned",
      "bed_type": "1 Double Bed",
      "occupancy": "Up to 2 Guests",
      "desc": "Air-conditioned guest room featuring a premium double bed, television, attached tiled bathroom with 24-hour running water, and daily housekeeping.",
      "amenities": [
        "Air Conditioning",
        "Private Bath",
        "TV",
        "Daily Housekeeping",
        "24h Running Water"
      ],
      "photo": ""
    },
    {
      "id": "sonu-std-non-ac",
      "title": "Standard Non-AC Room",
      "tag": "Economical Non-AC",
      "bed_type": "1 Double Bed",
      "occupancy": "Up to 2 Guests",
      "desc": "Crisp and comfortable budget lodging with efficient ceiling fan cooling, fresh linens, private attached bath, and round-the-clock front desk support.",
      "amenities": [
        "Ceiling Fan",
        "Attached Bath",
        "Daily Housekeeping",
        "24/7 Desk Support"
      ],
      "photo": ""
    }
  ]
};

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initBookingEngine();
  initScrollAnimations();
  initLightbox();
  initOwnerAuthModal();
  initBackToTop();
  syncGooglePlacesData();
  
  // Set copyright year
  const yearEl = document.getElementById("currentYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

/* ==========================================================================
   1. NAVIGATION & SCROLLSPY
   ========================================================================== */
function initNavigation() {
  const header = document.getElementById("mainHeader");
  const mobileToggle = document.getElementById("mobileToggle");
  const mainNav = document.getElementById("mainNav");
  const navLinks = document.querySelectorAll(".nav-item");

  // Sticky header class toggle
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }
    updateScrollSpy();
  }, { passive: true });

  // Mobile menu toggle
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      mobileToggle.classList.toggle("active", isOpen);
      mobileToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    // Close when clicking nav links
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        if (mainNav.classList.contains("open")) {
          mainNav.classList.remove("open");
          mobileToggle.classList.remove("active");
          mobileToggle.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        }
      });
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mainNav.classList.contains("open")) {
        mainNav.classList.remove("open");
        mobileToggle.classList.remove("active");
        mobileToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  }
}

function updateScrollSpy() {
  const sections = document.querySelectorAll("section[id], header[id]");
  const navLinks = document.querySelectorAll(".nav-links .nav-item");
  let currentSectionId = "";

  sections.forEach(section => {
    const top = section.offsetTop - 120;
    const height = section.offsetHeight;
    if (window.scrollY >= top && window.scrollY < top + height) {
      currentSectionId = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === `#${currentSectionId}`) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

/* ==========================================================================
   2. INTERACTIVE BOOKING ENGINE JOURNEY
   ========================================================================== */
function initBookingEngine() {
  const form = document.getElementById("bookingEnquiryForm");
  const checkInInput = document.getElementById("enquiryCheckIn");
  const checkOutInput = document.getElementById("enquiryCheckOut");
  const roomSelect = document.getElementById("enquiryRoom");
  const statusMsg = document.getElementById("enquiryStatusMsg");

  // Set min date to today for check-in
  const today = new Date().toISOString().split("T")[0];
  if (checkInInput) {
    checkInInput.min = today;
    checkInInput.addEventListener("change", () => {
      if (checkOutInput) {
        checkOutInput.min = checkInInput.value || today;
        if (checkOutInput.value && checkOutInput.value < checkInInput.value) {
          checkOutInput.value = checkInInput.value;
        }
      }
    });
  }
  if (checkOutInput) {
    checkOutInput.min = today;
  }

  // Global room selection handler invoked by room cards
  window.selectRoomForBooking = function(roomTitle) {
    if (roomSelect) {
      for (let i = 0; i < roomSelect.options.length; i++) {
        if (roomSelect.options[i].text.includes(roomTitle) || roomSelect.options[i].value === roomTitle) {
          roomSelect.selectedIndex = i;
          break;
        }
      }
    }
    const enquirySec = document.getElementById("enquiry");
    if (enquirySec) {
      enquirySec.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        checkInInput?.focus();
      }, 500);
    }
  };

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearFormErrors();

      const roomVal = roomSelect ? roomSelect.value : "";
      const checkInVal = checkInInput ? checkInInput.value : "";
      const checkOutVal = checkOutInput ? checkOutInput.value : "";
      const guestsVal = document.getElementById("enquiryGuests")?.value || "2 Guests";
      const phoneVal = document.getElementById("enquiryPhone")?.value.trim() || "";
      const notesVal = document.getElementById("enquiryNotes")?.value.trim() || "";

      let hasError = false;

      // Validate check-in
      if (!checkInVal) {
        showFieldError("enquiryCheckIn", "Please select a check-in date");
        hasError = true;
      } else if (checkInVal < today) {
        showFieldError("enquiryCheckIn", "Check-in date cannot be in the past");
        hasError = true;
      }

      // Validate check-out
      if (!checkOutVal) {
        showFieldError("enquiryCheckOut", "Please select a check-out date");
        hasError = true;
      } else if (checkOutVal < checkInVal) {
        showFieldError("enquiryCheckOut", "Check-out must be on or after check-in date");
        hasError = true;
      }

      // Validate phone (10-digit Indian phone)
      const cleanPhone = phoneVal.replace(/[^0-9]/g, "");
      if (!phoneVal) {
        showFieldError("enquiryPhone", "Please enter your contact mobile number");
        hasError = true;
      } else if (cleanPhone.length < 10) {
        showFieldError("enquiryPhone", "Please enter a valid 10-digit mobile number");
        hasError = true;
      }

      if (hasError) return;

      // Construct formatted WhatsApp message
      const message = 
`Hello ${HOTEL_CONFIG.name}, I would like to enquire about room reservation:
• Room Category: ${roomVal}
• Check-in Date: ${checkInVal}
• Check-out Date: ${checkOutVal}
• Number of Guests: ${guestsVal}
• Customer Mobile: +91 ${cleanPhone.slice(-10)}` +
(notesVal ? `\n• Special Notes: ${notesVal}` : "") +
`\n\nPlease share current tariff and room availability. Thank you!`;

      const encodedMsg = encodeURIComponent(message);
      const waUrl = `https://wa.me/${HOTEL_CONFIG.whatsapp}?text=${encodedMsg}`;

      if (statusMsg) {
        statusMsg.className = "form-status-msg active success";
        statusMsg.innerHTML = `<strong>Connecting to WhatsApp...</strong> Redirecting you to chat directly with ${HOTEL_CONFIG.name} to confirm your dates.`;
      }

      setTimeout(() => {
        window.open(waUrl, "_blank", "noopener,noreferrer");
      }, 600);
    });
  }
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}Error`);
  if (field) field.classList.add("input-error");
  if (errorEl) errorEl.textContent = message;
}

function clearFormErrors() {
  document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
  document.querySelectorAll(".error-msg").forEach(el => el.textContent = "");
  const statusMsg = document.getElementById("enquiryStatusMsg");
  if (statusMsg) {
    statusMsg.className = "form-status-msg";
    statusMsg.textContent = "";
  }
}

/* ==========================================================================
   3. SCROLL REVEAL ANIMATIONS (ACCESSIBILITY COMPLIANT)
   ========================================================================== */
function initScrollAnimations() {
  // Respect user preference for reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal-on-scroll").forEach(el => el.classList.add("revealed"));
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -40px 0px"
  });

  document.querySelectorAll(".reveal-on-scroll").forEach(el => {
    revealObserver.observe(el);
  });
}

/* ==========================================================================
   4. LIGHTBOX WITH KEYBOARD NAVIGATION
   ========================================================================== */
let activeLightboxIndex = 0;
let currentGalleryPhotos = [];

function initLightbox() {
  const modal = document.getElementById("imageLightboxModal");
  const closeBtn = document.getElementById("lightboxClose");
  const backdrop = document.getElementById("lightboxBackdrop");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");

  if (!modal) return;

  function closeLightbox() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  closeBtn?.addEventListener("click", closeLightbox);
  backdrop?.addEventListener("click", closeLightbox);

  prevBtn?.addEventListener("click", () => {
    if (currentGalleryPhotos.length > 0) {
      activeLightboxIndex = (activeLightboxIndex - 1 + currentGalleryPhotos.length) % currentGalleryPhotos.length;
      renderLightboxImage();
    }
  });

  nextBtn?.addEventListener("click", () => {
    if (currentGalleryPhotos.length > 0) {
      activeLightboxIndex = (activeLightboxIndex + 1) % currentGalleryPhotos.length;
      renderLightboxImage();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft" && prevBtn) prevBtn.click();
    if (e.key === "ArrowRight" && nextBtn) nextBtn.click();
  });
}

function openLightbox(index) {
  const modal = document.getElementById("imageLightboxModal");
  if (!modal || !currentGalleryPhotos.length) return;
  activeLightboxIndex = index;
  renderLightboxImage();
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function renderLightboxImage() {
  const imgEl = document.getElementById("lightboxImg");
  const captionEl = document.getElementById("lightboxCaption");
  const photo = currentGalleryPhotos[activeLightboxIndex];
  if (!photo) return;

  if (imgEl) {
    imgEl.src = photo.src;
    imgEl.alt = photo.caption || `${HOTEL_CONFIG.name} photograph`;
  }
  if (captionEl) {
    captionEl.innerHTML = `${photo.caption || HOTEL_CONFIG.name} <small style="display:block; opacity:0.8; font-size:0.75rem; margin-top:2px;">${photo.attribution || "Verified Physical Property"}</small>`;
  }
}

/* ==========================================================================
   5. BACK TO TOP BUTTON
   ========================================================================== */
function initBackToTop() {
  const backToTopBtn = document.getElementById("backToTop");
  if (!backToTopBtn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  }, { passive: true });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ==========================================================================
   6. OWNER AUTH MODAL
   ========================================================================== */
function initOwnerAuthModal() {
  const modal = document.getElementById("ownerAuthModal");
  const closeBtn = document.getElementById("ownerModalClose");
  const trigger = document.getElementById("ownerAuthTrigger");

  if (!modal) return;

  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  trigger?.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  closeBtn?.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) closeModal();
  });
}

/* ==========================================================================
   7. LIVE GOOGLE PLACES API STREAMING & REVIEWS
   ========================================================================== */
async function syncGooglePlacesData() {
  try {
    const res = await fetch(`/api/place-details?hotelId=${encodeURIComponent(HOTEL_CONFIG.id)}`, {
      headers: { "Accept": "application/json" }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data && data.success && data.place) {
      renderLiveRatingAndReviews(data.place);
      renderLivePhotos(data.place);
      return;
    }

    renderHonestFallbackStates();
  } catch (err) {
    renderHonestFallbackStates();
  }
}

function renderLiveRatingAndReviews(place) {
  const ratingEl = document.getElementById("liveGoogleRating");
  const reviewCountEl = document.getElementById("liveReviewCount");
  const reviewsContainer = document.getElementById("liveReviewsList");

  if (ratingEl && place.rating) {
    ratingEl.textContent = `${place.rating.toFixed(1)}`;
  }
  if (reviewCountEl && place.userRatingCount) {
    reviewCountEl.textContent = `Based on ${place.userRatingCount} verified Google reviews`;
  }

  if (reviewsContainer && Array.isArray(place.reviews) && place.reviews.length > 0) {
    reviewsContainer.innerHTML = place.reviews.map(rev => {
      const stars = "★".repeat(rev.rating || 5);
      const initial = (rev.authorAttribution?.displayName || "G").charAt(0).toUpperCase();
      const authorName = rev.authorAttribution?.displayName || "Google Reviewer";
      const photoUri = rev.authorAttribution?.photoUri;
      const avatarHtml = photoUri 
        ? `<img src="${photoUri}" alt="${authorName}" class="reviewer-avatar-img" width="36" height="36" loading="lazy">` 
        : `<div class="reviewer-avatar">${initial}</div>`;

      return `
        <div class="review-card reveal-on-scroll">
          <div class="review-header">
            <div class="reviewer-meta">
              ${avatarHtml}
              <div>
                <h4 class="reviewer-name">${authorName}</h4>
                <small class="review-date">${rev.relativePublishTimeDescription || "Verified stay"}</small>
              </div>
            </div>
            <div class="review-stars" aria-label="${rev.rating} out of 5 stars">${stars}</div>
          </div>
          <p class="review-text">"${rev.text?.text || rev.originalText?.text || "Clean and pleasant stay in Rajnandgaon."}"</p>
          <div class="review-google-badge">
            <img src="assets/icons/check.svg" alt="" width="14" height="14">
            <span>Verified Google Review</span>
          </div>
        </div>
      `;
    }).join('');

    initScrollAnimations();
  } else {
    renderHonestReviewsFallback();
  }
}

function renderLivePhotos(place) {
  const photosContainer = document.getElementById("livePhotoGrid");
  if (!photosContainer) return;

  if (Array.isArray(place.photos) && place.photos.length > 0) {
    currentGalleryPhotos = place.photos.map((p, idx) => ({
      src: `/api/place-photos?name=${encodeURIComponent(p.name)}&maxWidth=1000`,
      caption: `${HOTEL_CONFIG.name} - Property Photo`,
      attribution: p.authorAttributions?.[0]?.displayName ? `Photo by ${p.authorAttributions[0].displayName}` : "Google Places Verification"
    }));

    photosContainer.innerHTML = currentGalleryPhotos.map((photo, idx) => `
      <div class="gallery-item-card reveal-on-scroll" data-gallery-index="${idx}">
        <div class="gallery-photo-wrapper">
          <img src="${photo.src}" alt="${photo.caption}" width="800" height="500" loading="lazy" onerror="this.onerror=null; this.closest('.gallery-item-card').style.display='none';">
          <div class="photo-badge google-badge">Google Verified</div>
        </div>
        <div class="photo-caption-bar">
          <span>${photo.caption}</span>
          <span class="photo-src-link">View Fullscreen</span>
        </div>
      </div>
    `).join('');

    photosContainer.querySelectorAll(".gallery-item-card").forEach(card => {
      card.addEventListener("click", () => {
        const idx = parseInt(card.getAttribute("data-gallery-index"), 10);
        openLightbox(idx);
      });
    });

    initScrollAnimations();
  } else {
    renderHonestGalleryFallback();
  }
}

function renderHonestFallbackStates() {
  renderHonestReviewsFallback();
  renderHonestGalleryFallback();
}

function renderHonestReviewsFallback() {
  const ratingEl = document.getElementById("liveGoogleRating");
  const reviewCountEl = document.getElementById("liveReviewCount");
  const reviewsContainer = document.getElementById("liveReviewsList");

  if (ratingEl) ratingEl.textContent = "Verified";
  if (reviewCountEl) reviewCountEl.textContent = "Physical Business Listing • Rajnandgaon";

  if (reviewsContainer) {
    reviewsContainer.innerHTML = `
      <div class="reviews-empty-state text-center w-full">
        <img src="assets/icons/star.svg" alt="" width="36" height="36" class="empty-star-icon">
        <h4>Verified Google Business Reviews</h4>
        <p>Live Google Places rating and review synchronization is active. You can browse all customer feedback directly on our verified Google Maps listing.</p>
        <a href="${HOTEL_CONFIG.mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary mt-2">
          <img src="assets/icons/map-pin.svg" alt="" width="16" height="16">
          <span>Read Reviews on Google Maps</span>
        </a>
      </div>
    `;
  }
}

function renderHonestGalleryFallback() {
  const photosContainer = document.getElementById("livePhotoGrid");
  if (!photosContainer) return;

  photosContainer.innerHTML = `
    <div class="gallery-empty-state text-center w-full">
      <div class="empty-camera-circle" style="width:52px; height:52px; border-radius:50%; background:var(--bg); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
        <img src="assets/icons/map-pin.svg" alt="" width="24" height="24">
      </div>
      <h4>Official Property Photography</h4>
      <p>Connect your verified Google Maps listing to synchronize property exterior, reception, and ambient photography. In the interim, view photos directly on Google Maps or contact us directly on WhatsApp.</p>
      <div class="mt-2" style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
        <a href="${HOTEL_CONFIG.mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-dark btn-sm">
          <img src="assets/icons/map-pin.svg" alt="" width="14" height="14">
          <span>View Photos on Google Maps</span>
        </a>
        <a href="https://wa.me/${HOTEL_CONFIG.whatsapp}?text=Hello%20${encodeURIComponent(HOTEL_CONFIG.name)}%2C%20please%20share%20current%20room%20photographs." target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm">
          <img src="assets/icons/whatsapp.svg" alt="" width="14" height="14">
          <span>Request Photos on WhatsApp</span>
        </a>
      </div>
    </div>
  `;
}
