(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        brandName: 'Aether',
        logoUrl: 'https://github.com/Aether-Founder/Aether-Assets/blob/main/aether-logo.png?raw=true',
        text: 'Powered by',
        position: 'bottom-right',
        zIndex: '2147483647' // Maximum z-index to stay on top
    };

    const FONT_FAMILY = "'Cormorant Garamond', Georgia, Cambria, serif";
    const FONT_URL = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap';

    // Aether theme values based on system color scheme
    function getTheme() {
        const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (isDark) {
            return {
                background: '#020817',
                foreground: '#F8FAFC',
                muted: '#94A3B8',
                border: '#1E293B',
                shadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
            };
        }

        return {
            background: '#E8EEFD',
            foreground: '#020817',
            muted: '#64748B',
            border: 'rgba(2, 8, 23, 0.18)',
            shadow: '0 4px 20px rgba(2, 8, 23, 0.12)'
        };
    }

    // Banner styles
    function getStyles(theme) {
        return {
            container: {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                backgroundColor: theme.background,
                color: theme.foreground,
                padding: '10px 16px',
                borderRadius: '9999px',
                fontFamily: FONT_FAMILY,
                fontSize: '16px',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'baseline',
                justifyContent: 'center',
                gap: '6px',
                lineHeight: '1',
                boxShadow: theme.shadow,
                border: '1px solid ' + theme.border,
                zIndex: CONFIG.zIndex,
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                userSelect: 'none',
                MozUserSelect: 'none',
                WebkitUserSelect: 'none',
                msUserSelect: 'none'
            },
            logo: {
                width: '19px',
                height: '19px',
                objectFit: 'contain',
                display: 'block',
                flexShrink: '0',
                border: 'none',
                alignSelf: 'center',
                margin: '0'
            },
            text: {
                color: theme.muted,
                fontSize: '16px',
                fontFamily: FONT_FAMILY,
                fontWeight: '500',
                letterSpacing: '0.01em',
                lineHeight: '1',
                display: 'inline',
                margin: '0'
            },
            brand: {
                color: theme.foreground,
                fontSize: '21px',
                fontWeight: '600',
                fontFamily: FONT_FAMILY,
                marginLeft: '2px',
                lineHeight: '1',
                display: 'inline',
                margin: '0'
            },
            link: {
                color: 'inherit',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: '6px'
            }
        };
    }

    // Check if banner already exists
    if (document.querySelector('#aether-banner')) {
        return;
    }

    let bannerElement = null;
    let mediaQuery = null;

    // ------------------------------------------------------------------
    // Asset preloading (prevents FOUC / font + image flicker)
    // ------------------------------------------------------------------

    // Inject the Google Fonts stylesheet and resolve once the <link> has loaded.
    function loadFontStylesheet() {
        return new Promise(function(resolve) {
            const existing = document.querySelector('link[data-aether-font]');
            if (existing) {
                // If it already loaded, resolve immediately.
                if (existing.sheet) {
                    resolve();
                } else {
                    existing.addEventListener('load', resolve, { once: true });
                    existing.addEventListener('error', resolve, { once: true });
                }
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = FONT_URL;
            link.setAttribute('data-aether-font', 'true');
            link.addEventListener('load', function() { resolve(); }, { once: true });
            link.addEventListener('error', function() { resolve(); }, { once: true });
            document.head.appendChild(link);
        });
    }

    // Ensure the exact weights we use are actually parsed and ready to paint.
    function loadFontFaces() {
        if (!document.fonts || !document.fonts.load) {
            return Promise.resolve();
        }
        return Promise.all([
            document.fonts.load('500 16px "Cormorant Garamond"'),
            document.fonts.load('600 21px "Cormorant Garamond"')
        ]).catch(function() { /* fail-safe */ });
    }

    // Preload + decode the logo image so the first paint of the <img> is instant.
    function preloadImage(url) {
        return new Promise(function(resolve) {
            const img = new Image();
            img.onload = function() {
                if (img.decode) {
                    img.decode().then(resolve).catch(resolve);
                } else {
                    resolve();
                }
            };
            img.onerror = function() { resolve(); }; // never block the banner on a broken image
            img.src = url;
        });
    }

    // Apply current system theme to the banner
    function applyTheme(banner) {
        if (!banner) {
            return;
        }

        const theme = getTheme();
        const styles = getStyles(theme);

        Object.assign(banner.style, styles.container);

        const logo = banner.querySelector('.aether-logo');
        const text = banner.querySelector('.aether-text');
        const brand = banner.querySelector('.aether-brand');

        if (logo) {
            Object.assign(logo.style, styles.logo);
        }
        if (text) {
            Object.assign(text.style, styles.text);
        }
        if (brand) {
            Object.assign(brand.style, styles.brand);
        }
    }

    // Create banner element
    function createBanner() {
        const banner = document.createElement('a');
        banner.id = 'aether-banner';
        banner.href = 'https://aether.com';
        banner.target = '_blank';
        banner.rel = 'noopener noreferrer';

        const theme = getTheme();
        const styles = getStyles(theme);

        // Apply styles
        Object.assign(banner.style, styles.container);

        // Create logo
        const logo = document.createElement('img');
        logo.className = 'aether-logo';
        logo.src = CONFIG.logoUrl;
        logo.alt = CONFIG.brandName;
        Object.assign(logo.style, styles.logo);

        // Create text
        const text = document.createElement('span');
        text.className = 'aether-text';
        Object.assign(text.style, styles.text);
        text.textContent = CONFIG.text;

        // Create brand name
        const brand = document.createElement('span');
        brand.className = 'aether-brand';
        Object.assign(brand.style, styles.brand);
        brand.textContent = CONFIG.brandName;

        // Assemble banner
        banner.appendChild(logo);
        banner.appendChild(text);
        banner.appendChild(brand);

        // No hover transform / repositioning effects.
        // Prevent removal attempts
        banner.addEventListener('click', function(e) {
            // Allow normal link behavior but prevent any removal scripts
            e.stopPropagation();
        });

        return banner;
    }

    // Add anti-removal protection
    function addProtection(banner) {
        // Prevent deletion via JavaScript
        const originalRemove = banner.remove;
        banner.remove = function() {
            console.warn('Aether banner cannot be removed');
            return false;
        };

        // Prevent style changes that would hide it
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' &&
                    (mutation.attributeName === 'style' ||
                     mutation.attributeName === 'class' ||
                     mutation.attributeName === 'hidden')) {

                    // Restore visibility
                    banner.style.display = 'inline-flex';
                    banner.style.visibility = 'visible';
                    banner.style.opacity = '1';
                    banner.style.position = 'fixed';
                    banner.style.zIndex = CONFIG.zIndex;
                }
            });
        });

        observer.observe(banner, {
            attributes: true,
            attributeFilter: ['style', 'class', 'hidden']
        });

        // Prevent right-click context menu on banner
        banner.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });

        // Prevent drag attempts
        banner.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });

        // Monitor for removal from DOM
        const domObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.removedNodes.forEach(function(node) {
                    if (node.id === 'aether-banner') {
                        // Re-add the banner
                        document.body.appendChild(banner);
                    }
                });
            });
        });

        domObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        return { bannerObserver: observer, domObserver: domObserver };
    }

    // Initialize banner
    function init() {
        // Wait for DOM to be ready before touching <head>/<body>.
        const domReady = new Promise(function(resolve) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve, { once: true });
            } else {
                resolve();
            }
        });

        // Sequence:
        // 1) DOM ready
        // 2) Font stylesheet <link> loaded
        // 3) Required font faces parsed + ready
        // 4) Logo image downloaded + decoded
        // 5) Only then build + mount the banner -> single, flicker-free paint.
        domReady
            .then(loadFontStylesheet)
            .then(function() {
                return Promise.all([
                    loadFontFaces(),
                    preloadImage(CONFIG.logoUrl)
                ]);
            })
            .then(function() {
                // Double-check with document.fonts.ready for extra safety on slow renderers.
                if (document.fonts && document.fonts.ready) {
                    return document.fonts.ready.catch(function() {});
                }
            })
            .then(function() {
                setTimeout(createAndAddBanner, 0);
            });
    }

    function createAndAddBanner() {
        // Guard: another instance may have mounted in the meantime.
        if (document.querySelector('#aether-banner')) {
            return;
        }

        const banner = createBanner();
        document.body.appendChild(banner);
        addProtection(banner);
        bannerElement = banner;

        // React to system theme changes
        if (window.matchMedia) {
            mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            const handleChange = function() {
                applyTheme(bannerElement);
            };

            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', handleChange);
            } else if (mediaQuery.addListener) {
                mediaQuery.addListener(handleChange);
            }
        }

        console.log('Aether banner initialized successfully');
    }

    // Start initialization
    init();

    // Export for potential external use
    window.AetherBanner = {
        config: CONFIG,
        create: createBanner,
        init: init
    };

})();