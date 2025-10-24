// ===================================
// Gallery & Lightbox Functionality
// ===================================

(function() {
    'use strict';

    // ===================================
    // Gallery Configuration
    // ===================================
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCounter = document.getElementById('lightboxCounter');

    let currentImageIndex = 0;
    const images = [];

    // ===================================
    // Initialize Gallery
    // ===================================
    function initGallery() {
        // Collect all image sources
        galleryItems.forEach((item, index) => {
            const img = item.querySelector('img');
            if (img) {
                images.push({
                    src: img.src,
                    alt: img.alt || `Gallery image ${index + 1}`
                });
            }

            // Add click event to each gallery item
            item.addEventListener('click', function() {
                openLightbox(index);
            });

            // Add keyboard navigation to gallery items
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('aria-label', `Open image ${index + 1} in lightbox`);

            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(index);
                }
            });
        });
    }

    // ===================================
    // Open Lightbox
    // ===================================
    function openLightbox(index) {
        currentImageIndex = index;
        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus on close button for accessibility
        setTimeout(() => {
            lightboxClose.focus();
        }, 100);
    }

    // ===================================
    // Close Lightbox
    // ===================================
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';

        // Return focus to the gallery item that was clicked
        if (galleryItems[currentImageIndex]) {
            galleryItems[currentImageIndex].focus();
        }
    }

    // ===================================
    // Update Lightbox Image
    // ===================================
    function updateLightboxImage() {
        if (images[currentImageIndex]) {
            const img = images[currentImageIndex];

            // Add loading class
            lightboxImage.style.opacity = '0';

            // Preload image
            const tempImg = new Image();
            tempImg.onload = function() {
                lightboxImage.src = img.src;
                lightboxImage.alt = img.alt;
                lightboxImage.style.opacity = '1';
            };
            tempImg.src = img.src;

            // Update counter
            lightboxCounter.textContent = `${currentImageIndex + 1} / ${images.length}`;

            // Update navigation button states
            updateNavigationButtons();
        }
    }

    // ===================================
    // Navigation Functions
    // ===================================
    function showPreviousImage() {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        updateLightboxImage();
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        updateLightboxImage();
    }

    function updateNavigationButtons() {
        // Always enable both buttons for infinite loop navigation
        lightboxPrev.style.opacity = '1';
        lightboxNext.style.opacity = '1';
    }

    // ===================================
    // Event Listeners
    // ===================================

    // Close button
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    // Previous button
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', function(e) {
            e.stopPropagation();
            showPreviousImage();
        });
    }

    // Next button
    if (lightboxNext) {
        lightboxNext.addEventListener('click', function(e) {
            e.stopPropagation();
            showNextImage();
        });
    }

    // Click outside image to close
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;

        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPreviousImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
        }
    });

    // ===================================
    // Touch/Swipe Support for Mobile
    // ===================================
    let touchStartX = 0;
    let touchEndX = 0;

    if (lightbox) {
        lightbox.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left - show next image
                showNextImage();
            } else {
                // Swiped right - show previous image
                showPreviousImage();
            }
        }
    }

    // ===================================
    // Preload Adjacent Images
    // ===================================
    function preloadAdjacentImages() {
        if (!lightbox.classList.contains('active')) return;

        const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
        const nextIndex = (currentImageIndex + 1) % images.length;

        [prevIndex, nextIndex].forEach(index => {
            if (images[index]) {
                const img = new Image();
                img.src = images[index].src;
            }
        });
    }

    // Preload images when lightbox is opened
    lightbox.addEventListener('transitionend', function() {
        if (lightbox.classList.contains('active')) {
            preloadAdjacentImages();
        }
    });

    // ===================================
    // Responsive Image Handling
    // ===================================
    function handleResize() {
        if (lightbox.classList.contains('active')) {
            // Adjust image display on resize
            updateLightboxImage();
        }
    }

    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleResize, 250);
    });

    // ===================================
    // Gallery Animation on Scroll
    // ===================================
    function animateGalleryItems() {
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 50);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        galleryItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(item);
        });
    }

    // ===================================
    // Accessibility: Focus Trap in Lightbox
    // ===================================
    function trapFocusInLightbox() {
        if (!lightbox.classList.contains('active')) return;

        const focusableElements = lightbox.querySelectorAll(
            'button, [href], [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        lightbox.addEventListener('keydown', function(e) {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        });
    }

    // ===================================
    // Error Handling
    // ===================================
    if (lightboxImage) {
        lightboxImage.addEventListener('error', function() {
            console.error('Failed to load image:', this.src);
            this.alt = 'Image failed to load';
        });
    }

    // ===================================
    // Initialize
    // ===================================
    if (galleryItems.length > 0) {
        initGallery();
        animateGalleryItems();
        trapFocusInLightbox();
    }

    // ===================================
    // Public API (if needed)
    // ===================================
    window.galleryAPI = {
        openLightbox: openLightbox,
        closeLightbox: closeLightbox,
        next: showNextImage,
        previous: showPreviousImage
    };

})();
