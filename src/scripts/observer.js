// file: src/scripts/observer.js
/**
 * Obsidian AO3 - Core Content Script & Observer
 * High-performance, debounced DOM enhancements for Archive of Our Own.
 */

(function () {
    if (window.__OBSIDIAN_AO3_INITIALIZED__) return;
    window.__OBSIDIAN_AO3_INITIALIZED__ = true;

    const HIDING_STYLE_ID = 'ao3-obsidian-hider';
    const CSS_CHECK_INTERVAL = 40;   // ms
    const CSS_CHECK_TIMEOUT = 3000;  // ms max wait before fail-safe reveal

    // ----- 1. FOUC Hider Injection & Reveal -----
    function injectHider() {
        if (document.getElementById(HIDING_STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = HIDING_STYLE_ID;
        style.textContent = 'html { visibility: hidden !important; }';
        const target = document.head || document.documentElement;
        if (target) {
            target.insertBefore(style, target.firstChild);
        }
    }

    function revealPage() {
        const hider = document.getElementById(HIDING_STYLE_ID);
        if (hider) hider.remove();
    }

    // ----- 2. Strip AO3 Legacy External Stylesheets -----
    function stripAO3Stylesheets(root = document) {
        root.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            const href = link.getAttribute('href') || '';
            if (href.includes('/stylesheets/')) {
                link.remove();
            }
        });
    }

    function isDOMReady() {
        return document.readyState === 'interactive' || document.readyState === 'complete';
    }

    function waitForReady() {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const check = () => {
                if (isDOMReady()) {
                    resolve();
                    return;
                }
                if (Date.now() - startTime > CSS_CHECK_TIMEOUT) {
                    resolve();
                    return;
                }
                setTimeout(check, CSS_CHECK_INTERVAL);
            };
            check();
        });
    }

    // ----- 3. Theme Enhancements -----

    function replaceLogoColor() {
        const logo = document.querySelector('#header .heading a .logo');
        if (logo && !logo.dataset.obsidianRecolored) {
            logo.src = chrome.runtime.getURL('src/styles/assets/logo_accent_color.png');
            logo.dataset.obsidianRecolored = 'true';
        }
    }

    function addFooterBadge() {
        if (document.querySelector('.menu.obsidian-ao3')) return;
        const menu = document.querySelector('#footer .module.group:has(form.button_to) ul.menu');
        if (!menu) return;
        const newUl = document.createElement('ul');
        newUl.className = 'menu obsidian-ao3';
        const li = document.createElement('li');
        li.innerHTML = '<a href="https://github.com/PixelStarForge/Obsidian-Ao3" target="_blank" rel="noopener noreferrer">Obsidian AO3</a>';
        newUl.appendChild(li);
        menu.appendChild(newUl);
    }

    const CATEGORY_LABELS = {
        warnings: 'Archive Warnings',
        relationships: 'Relationships',
        characters: 'Characters',
        freeforms: 'Additional Tags'
    };

    function addCategoryHeaders() {
        const containers = document.querySelectorAll('#main ul.tags.commas');
        containers.forEach(tagContainer => {
            Object.entries(CATEGORY_LABELS).forEach(([className, label]) => {
                const firstOfCategory = tagContainer.querySelector(`li.${className}`);
                if (!firstOfCategory) return;
                const prev = firstOfCategory.previousElementSibling;
                if (prev && prev.dataset.categoryHeader === className) return;

                const header = document.createElement('li');
                header.className = 'obsidian-category-header';
                header.dataset.categoryHeader = className;
                header.style.cssText = 'width: 100% !important; margin: var(--margin-xs) 0 !important; list-style: none !important;';
                header.innerHTML = `<span style="font-size: var(--font-size-meta); font-weight: var(--font-weight-medium); color: var(--text-muted);">${label}</span>`;
                firstOfCategory.parentNode.insertBefore(header, firstOfCategory);
            });
        });
    }

    function removeFandomCommas() {
        document.querySelectorAll('h5.fandoms.heading').forEach(heading => {
            if (heading.dataset.commasRemoved) return;
            heading.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE && /^,\s*$/.test(node.textContent)) {
                    node.remove();
                }
            });
            heading.dataset.commasRemoved = 'true';
        });
    }

    function groupStatsInPairs() {
        const statsList = document.querySelectorAll(
            'li.work.blurb dl.stats, ' +
            'li.series.blurb dl.stats, ' +
            'dl.work.meta.group dl.stats, ' +
            'li.fandom.listbox.group dd dl.stats, ' +
            'dl.statistics.meta.group'
        );
        statsList.forEach(stats => {
            if (stats.dataset.statsGrouped) return;
            const pairs = [];
            const items = Array.from(stats.querySelectorAll('dt, dd'));
            for (let i = 0; i < items.length; i += 2) {
                if (i + 1 >= items.length) break;
                const pair = document.createElement('div');
                pair.className = 'stats-pair';
                pair.style.cssText = 'display: inline-flex; gap: 0.35rem; align-items: center; justify-content: center;';
                pair.appendChild(items[i].cloneNode(true));
                pair.appendChild(items[i + 1].cloneNode(true));
                pairs.push(pair);
            }
            stats.innerHTML = '';
            stats.style.cssText = 'display: flex !important; flex-wrap: wrap !important; gap: 0.5rem;';
            pairs.forEach(pair => stats.appendChild(pair));
            stats.dataset.statsGrouped = 'true';
        });
    }

    // ----- 4. Unified DOM Enhancer with RAF Debounce -----
    let batchScheduled = false;

    function scheduleEnhancements() {
        if (batchScheduled) return;
        batchScheduled = true;
        requestAnimationFrame(() => {
            batchScheduled = false;
            addCategoryHeaders();
            removeFandomCommas();
            groupStatsInPairs();
            replaceLogoColor();
            styleEditorIframe();
        });
    }

    // Single unified observer for the whole document
    let mainObserver = null;

    function startMainObserver() {
        if (mainObserver) return;
        mainObserver = new MutationObserver((mutations) => {
            let needsEnhancement = false;
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== 1) continue;

                    // Strip AO3 stylesheet links dynamically
                    if (node.tagName === 'LINK' && node.rel === 'stylesheet') {
                        const href = node.getAttribute('href') || '';
                        if (href.includes('/stylesheets/')) {
                            node.remove();
                        }
                    } else if (node.querySelectorAll) {
                        stripAO3Stylesheets(node);
                    }

                    // Check if newly added nodes contain works, stats, or tags
                    if (
                        node.classList &&
                        (node.classList.contains('work') ||
                         node.classList.contains('blurb') ||
                         node.classList.contains('series') ||
                         node.querySelector?.('ul.tags, dl.stats, #content_ifr'))
                    ) {
                        needsEnhancement = true;
                    }
                }
            }

            if (needsEnhancement) {
                scheduleEnhancements();
            }
        });

        mainObserver.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    // ----- 5. Filter Controls & Mobile Toggle -----
    function initFilterToggles() {
        const toggles = document.querySelectorAll('form.filters dt.filter-toggle');
        toggles.forEach(toggle => {
            if (toggle.dataset.initialized) return;
            const nextDd = toggle.nextElementSibling;
            if (nextDd && nextDd.tagName === 'DD') {
                toggle.addEventListener('click', () => {
                    toggle.classList.toggle('expanded');
                    nextDd.classList.toggle('expanded');
                });
            }
            toggle.dataset.initialized = 'true';
        });
    }

    function initFilters() {
        const filtersForm = document.querySelector('form.filters');
        if (!filtersForm) return;

        const toggleBtn = document.getElementById('go_to_filters') || document.querySelector('a[href*="-filters"]');

        let backdrop = document.querySelector('#filters-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'filters-backdrop';
            document.body.insertBefore(backdrop, document.body.firstChild);
        }

        if (!filtersForm.querySelector('.filter-close-btn')) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'filter-close-btn';
            closeBtn.type = 'button';
            closeBtn.setAttribute('aria-label', 'Close filters');
            closeBtn.innerHTML = '&times;';
            filtersForm.insertBefore(closeBtn, filtersForm.firstChild);
        }

        function toggleMobileFilters(e) {
            if (e) e.preventDefault();
            filtersForm.classList.toggle('mobile-active');
            backdrop.classList.toggle('mobile-active');
        }

        function closeMobileFilters() {
            filtersForm.classList.remove('mobile-active');
            backdrop.classList.remove('mobile-active');
        }

        if (toggleBtn && !toggleBtn.dataset.listenerAdded) {
            toggleBtn.addEventListener('click', toggleMobileFilters);
            toggleBtn.dataset.listenerAdded = 'true';
        }

        if (backdrop && !backdrop.dataset.listenerAdded) {
            backdrop.addEventListener('click', closeMobileFilters);
            backdrop.dataset.listenerAdded = 'true';
        }

        const closeBtn = filtersForm.querySelector('.filter-close-btn');
        if (closeBtn && !closeBtn.dataset.listenerAdded) {
            closeBtn.addEventListener('click', closeMobileFilters);
            closeBtn.dataset.listenerAdded = 'true';
        }

        initFilterToggles();
        closeMobileFilters();
    }

    // ----- 6. Native Smooth Scroll & Comments Integration -----
    function initCommentsScrollFix() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('#show_comments_link_top a, #show_comments_link a');
            if (!link) return;

            const placeholder = document.getElementById('comments_placeholder');
            if (!placeholder) return;

            const observer = new MutationObserver((_, obs) => {
                if (placeholder.style.display !== 'none' && placeholder.children.length > 0) {
                    obs.disconnect();
                    const target = document.getElementById('feedback');
                    if (target) {
                        setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
                    }
                }
            });

            observer.observe(placeholder, { childList: true, attributes: true, attributeFilter: ['style'] });
            setTimeout(() => observer.disconnect(), 10000);
        });
    }

    function checkInitialCommentsScroll() {
        if (window.location.hash === '#comments' || window.location.search.includes('show_comments=true')) {
            setTimeout(() => {
                const target = document.getElementById('feedback');
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 400);
        }
    }

    // ----- 7. TinyMCE Dark Mode Style Injection -----
    function styleEditorIframe() {
        const iframe = document.getElementById('content_ifr');
        if (!iframe) return;
        try {
            const doc = iframe.contentDocument;
            if (doc && !doc.getElementById('obsidian-iframe-styles')) {
                const style = doc.createElement('style');
                style.id = 'obsidian-iframe-styles';
                style.textContent = `
                    body#tinymce {
                        background-color: var(--bg-surface-2, #1E1E22) !important;
                        color: var(--text-primary, #F4F4F5) !important;
                        font-family: var(--font-stack-ui, system-ui, -apple-system, sans-serif) !important;
                        -webkit-font-smoothing: antialiased !important;
                        padding: 0.75rem !important;
                        line-height: 1.75 !important;
                    }
                    strong, b {
                        font-weight: 600 !important;
                        color: var(--text-primary, #F4F4F5) !important;
                    }
                `;
                (doc.head || doc.documentElement).appendChild(style);
            }
        } catch (_) {}
    }

    // ----- 8. Lifecycle Orchestration -----
    let cleanupDone = false;

    async function doCleanupAndReveal() {
        if (cleanupDone) return;
        cleanupDone = true;

        stripAO3Stylesheets();
        await waitForReady();

        revealPage();

        // Run initial passes
        replaceLogoColor();
        addFooterBadge();
        addCategoryHeaders();
        removeFandomCommas();
        groupStatsInPairs();
        initFilters();
        initCommentsScrollFix();
        checkInitialCommentsScroll();
        styleEditorIframe();
    }

    function startup() {
        injectHider();
        stripAO3Stylesheets();
        startMainObserver();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', doCleanupAndReveal);
        } else {
            doCleanupAndReveal();
        }
    }

    startup();
})();
