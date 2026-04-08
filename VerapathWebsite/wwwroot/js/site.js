(function () {
    'use strict';

    // ─── MOBILE NAV ──────────────────────────────────────────────────────────────

    function buildMobileOverlay() {
        var seen = {};
        var links = [];
        document.querySelectorAll('a[href]').forEach(function (a) {
            var href = a.getAttribute('href');
            if ((href === '/' || href === '/about' || href === '/contact') && !seen[href]) {
                seen[href] = true;
                var text = (a.innerText || a.textContent).trim();
                if (text) links.push({ href: href, text: text });
            }
        });
        if (links.length === 0) {
            links = [{ href: '/', text: 'Home' }, { href: '/about', text: 'About' }, { href: '/contact', text: 'Contact' }];
        }

        var overlay = document.createElement('div');
        overlay.id = 'vp-mobile-nav';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgb(248,248,243);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2.5rem;opacity:0;pointer-events:none;transition:opacity 0.25s ease';

        links.forEach(function (link) {
            var a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.text;
            a.style.cssText = 'font-size:1.75rem;color:#1a1a1a;text-decoration:none;font-family:inherit;letter-spacing:-0.02em';
            overlay.appendChild(a);
        });

        var closeBtn = document.createElement('button');
        closeBtn.setAttribute('aria-label', 'Close menu');
        closeBtn.innerHTML = '&#x2715;';
        closeBtn.style.cssText = 'position:absolute;top:1.5rem;right:1.5rem;font-size:1.5rem;background:none;border:none;cursor:pointer;color:#1a1a1a;padding:0.5rem;line-height:1';
        closeBtn.addEventListener('click', function () { closeMobileNav(overlay); });
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);
        return overlay;
    }

    function openMobileNav(overlay) {
        overlay.style.pointerEvents = 'auto';
        overlay.style.opacity = '1';
        document.body.style.overflow = 'hidden';
    }

    function closeMobileNav(overlay) {
        overlay.style.pointerEvents = 'none';
        overlay.style.opacity = '0';
        document.body.style.overflow = '';
    }

    function initMobileNav() {
        var overlay = null;
        document.querySelectorAll('[data-framer-name="Hamburger"]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (!overlay) overlay = buildMobileOverlay();
                overlay.style.pointerEvents === 'auto' ? closeMobileNav(overlay) : openMobileNav(overlay);
            });
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && overlay && overlay.style.pointerEvents === 'auto') closeMobileNav(overlay);
        });
    }

    // ─── TAB SWITCHING ────────────────────────────────────────────────────────────

    function initTabs() {
        document.querySelectorAll('[data-framer-name="Tab Nav"]').forEach(function (tabNav) {
            var buttons = Array.from(tabNav.querySelectorAll('[data-highlight="true"]'));
            if (!buttons.length) return;

            var container = tabNav.parentElement;
            while (container && !container.querySelector('[data-framer-name="Tab Content"]')) {
                container = container.parentElement;
                if (!container || container === document.body) return;
            }

            var panels = [
                container.querySelector('[data-framer-name="Tab Content"]'),
                container.querySelector('[data-framer-name="Tab 2"]'),
                container.querySelector('[data-framer-name="Tab 3"]')
            ];

            function activateTab(index) {
                panels.forEach(function (panel, i) {
                    if (!panel) return;
                    panel.style.transition = 'opacity 0.3s ease';
                    panel.style.opacity = i === index ? '1' : '0';
                    panel.style.pointerEvents = i === index ? 'auto' : 'none';
                });
                buttons.forEach(function (btn, i) {
                    btn.setAttribute('aria-selected', i === index ? 'true' : 'false');
                });
            }

            buttons.forEach(function (btn, i) {
                btn.style.cursor = 'pointer';
                btn.setAttribute('role', 'tab');
                btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
                btn.addEventListener('click', function () { activateTab(i); });
            });
        });
    }

    // ─── VIDEO AUTOPLAY ───────────────────────────────────────────────────────────
    // Videos have preload="none" muted playsinline — just call .play()

    function initVideos() {
        document.querySelectorAll('video').forEach(function (video) {
            // Try immediate autoplay (works because all videos are muted)
            var playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(function () {
                    // Blocked by browser policy — play on first scroll into view
                    var obs = new IntersectionObserver(function (entries) {
                        if (entries[0].isIntersecting) {
                            video.play().catch(function () {});
                            obs.disconnect();
                        }
                    }, { threshold: 0.1 });
                    obs.observe(video);
                });
            }
        });
    }

    // ─── MARQUEE ─────────────────────────────────────────────────────────────────
    // Framer Motion continuously animates translateX on logo-list <ul> elements.
    // We replace this with a requestAnimationFrame loop.

    function initMarquee() {
        // Identify marquee tracks: <ul> elements whose inline style has translateX(-0px)
        var tracks = [];
        document.querySelectorAll('ul').forEach(function (ul) {
            var s = ul.getAttribute('style') || '';
            if (s.indexOf('translateX') !== -1 && s.indexOf('will-change') !== -1) {
                tracks.push(ul);
            }
        });

        if (!tracks.length) return;

        tracks.forEach(function (track) {
            var pos = 0;
            var speed = 0.4; // px per frame (~24px/s at 60fps)

            // Framer duplicates the list items for seamless looping.
            // Reset point = half of scrollWidth (the width of one full copy of the list).
            var halfWidth = null;

            function step() {
                if (halfWidth === null) {
                    halfWidth = track.scrollWidth / 2;
                }
                pos -= speed;
                if (pos <= -halfWidth) {
                    pos = 0;
                }
                track.style.transform = 'translateX(' + pos + 'px)';
                requestAnimationFrame(step);
            }

            requestAnimationFrame(step);
        });

        // Pause marquee on hover (accessibility / usability)
        tracks.forEach(function (track) {
            var parent = track.parentElement;
            if (parent) {
                parent.addEventListener('mouseenter', function () { speed = 0; });
                parent.addEventListener('mouseleave', function () { speed = 0.4; });
            }
        });
    }

    // ─── SCROLL FADE-IN ───────────────────────────────────────────────────────────
    // Framer SSR sets opacity:0 on elements that should animate in.
    // Types we handle:
    //   1. will-change:transform + translateY(Npx) — standard slide-up fade
    //   2. opacity:0 + rotate(Ndeg) — rotating card entrance
    //   3. opacity:0 + mask-image — marquee/section container fade
    //
    // We pre-apply the transition BEFORE the IntersectionObserver fires so the
    // element smoothly fades rather than popping visible.

    function initScrollAnimations() {
        var animatableEls = [];

        document.querySelectorAll('[style*="opacity:0"]').forEach(function (el) {
            var style = el.getAttribute('style') || '';
            var name = el.getAttribute('data-framer-name') || '';

            // Skip tab panels — those are driven by the tab switcher
            if (/^Tab [23]$/.test(name)) return;

            var hasTranslateY = style.indexOf('translateY') !== -1;
            var hasRotate     = style.indexOf('rotate(') !== -1 || style.indexOf('rotate3d') !== -1;
            var hasMask       = style.indexOf('mask-image') !== -1;
            var hasWillChange = style.indexOf('will-change') !== -1;

            // Only pick up elements that Framer marked for animation
            if (!hasTranslateY && !hasRotate && !hasMask && !hasWillChange) return;

            // Pre-set transition before observing so it plays when the element enters
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            animatableEls.push(el);
        });

        if (!animatableEls.length) return;

        if (!window.IntersectionObserver) {
            // No IntersectionObserver support — show everything immediately
            animatableEls.forEach(function (el) {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    el.style.opacity = '1';
                    el.style.transform = 'none';
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.07, rootMargin: '0px 0px -30px 0px' });

        animatableEls.forEach(function (el) {
            observer.observe(el);
        });
    }

    // ─── CURRENT PAGE LINK ────────────────────────────────────────────────────────

    function highlightCurrentPage() {
        var path = window.location.pathname.replace(/\/+$/, '') || '/';
        document.querySelectorAll('a[href]').forEach(function (a) {
            var href = a.getAttribute('href').replace(/\/+$/, '').replace(/\.html$/, '') || '/';
            var match = href === path || (path === '' && href === '/') || (path === '/' && href === '');
            if (match) {
                a.setAttribute('data-framer-page-link-current', 'true');
            } else {
                a.removeAttribute('data-framer-page-link-current');
            }
        });
    }

    // ─── INIT ─────────────────────────────────────────────────────────────────────

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initTabs();
        initVideos();
        initMarquee();
        initScrollAnimations();
        highlightCurrentPage();
    });

})();
