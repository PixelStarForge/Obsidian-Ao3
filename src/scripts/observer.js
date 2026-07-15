// file: src/scripts/observer.js

const HIDING_STYLE_ID = 'ao3-obsidian-hider';
const CSS_CHECK_INTERVAL = 50;      // ms
const CSS_CHECK_TIMEOUT = 5000;    // ms max wait

// ----- 1. Hider Injection & Reveal -----
function injectHider() {
    if (document.getElementById(HIDING_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = HIDING_STYLE_ID;
    style.textContent = 'html { visibility: hidden !important; }';
    document.head.insertBefore(style, document.head.firstChild);
}

function revealPage() {
    const hider = document.getElementById(HIDING_STYLE_ID);
    if (hider) hider.remove();
    console.log('[Obsidian] Page revealed');
}

// ----- 2. Strip AO3 External Stylesheets -----
function stripAO3Stylesheets() {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href.includes('/stylesheets/')) {
            link.remove();
            console.log('[Obsidian] Removed:', href);
        }
    });
}

// ----- 3. Check if Custom CSS is Loaded -----
function hasExtensionCSS() {
    return document.styleSheets.length >= 2;
}

function isDOMReady() {
    return document.readyState === 'interactive' || document.readyState === 'complete';
}

function waitForCustomCSS() {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const check = () => {
            const elapsed = Date.now() - startTime;
            if (hasExtensionCSS() && isDOMReady()) {
                console.log('[Obsidian] Custom CSS and DOM confirmed ready');
                resolve();
                return;
            }
            if (elapsed > CSS_CHECK_TIMEOUT) {
                console.warn('[Obsidian] Timeout, revealing anyway');
                resolve();
                return;
            }
            setTimeout(check, CSS_CHECK_INTERVAL);
        };
        check();
    });
}

// ----- 4. Dynamic Stylesheet Observer -----
let stripObserver = null;

function startStripObserver() {
    if (stripObserver) return;
    stripObserver = new MutationObserver((mutations) => {
        let removed = false;
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== 1) continue;
                if (node.tagName === 'LINK' && node.rel === 'stylesheet') {
                    const href = node.getAttribute('href') || '';
                    if (href.includes('/stylesheets/')) {
                        node.remove();
                        removed = true;
                        console.log('[Obsidian] Removed dynamic:', href);
                    }
                }
                if (node.querySelectorAll) {
                    node.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                        const href = link.getAttribute('href') || '';
                        if (href.includes('/stylesheets/')) {
                            link.remove();
                            removed = true;
                            console.log('[Obsidian] Removed nested:', href);
                        }
                    });
                }
            }
        }
        if (removed) stripAO3Stylesheets();
    });
    stripObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
}

// ==========================================================================
//   ENHANCEMENT FUNCTIONS
// ==========================================================================

// ----- Logo Recolor -----
function replaceLogoColor() {
    const logo = document.querySelector('#header .heading a .logo');
    if (logo) {
        logo.src = chrome.runtime.getURL('src/styles/assets/logo_accent_color.png');
        console.log('[Obsidian] Logo recolored');
    }
}

// ----- Footer Badge -----
function addFooterBadge() {
    const menu = document.querySelector('#footer .module.group:has(form.button_to) ul.menu');
    if (!menu) return;
    const newUl = document.createElement('ul');
    newUl.className = 'menu obsidian-ao3';
    const li = document.createElement('li');
    li.innerHTML = `<a href="https://github.com/PixelStarForge/Obsidian-Ao3" target="_blank">GitHub</a>`;
    newUl.appendChild(li);
    menu.appendChild(newUl);
    console.log('[Obsidian] Footer badge added');
}

// ----- Category Headers for Tags -----
function addCategoryHeaders() {
    const categoryLabels = {
        warnings: 'Archive Warnings',
        relationships: 'Relationships',
        characters: 'Characters',
        freeforms: 'Additional Tags'
    };

    const containers = document.querySelectorAll('#main ul.tags.commas');
    containers.forEach(tagContainer => {
        Object.entries(categoryLabels).forEach(([className, label]) => {
            const firstOfCategory = tagContainer.querySelector(`li.${className}`);
            if (!firstOfCategory) return;
            const previousLi = firstOfCategory.previousElementSibling;
            if (previousLi && previousLi.dataset.categoryHeader === className) return;

            const header = document.createElement('li');
            header.dataset.categoryHeader = className;
            header.style.cssText = 'width: 100% !important; margin-top: var(--margin-xs) !important;';
            header.innerHTML = `<span style="font-size: var(--font-size-h4); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; color: var(--text-muted);">${label}</span>`;
            firstOfCategory.parentNode.insertBefore(header, firstOfCategory);
        });
    });
}

function startHeaderObserver() {
    if (!document.body) return;
    const headerObserver = new MutationObserver((mutations) => {
        let hasNewNodes = false;
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        if (node.classList && (node.classList.contains('work') || node.classList.contains('series') || node.querySelector('ul.tags.commas'))) {
                            hasNewNodes = true;
                        }
                    }
                });
            }
        });
        if (hasNewNodes) setTimeout(addCategoryHeaders, 50);
    });
    headerObserver.observe(document.body, { childList: true, subtree: true });
}

// ----- Remove Fandom Commas -----
function removeFandomCommas() {
    const fandomHeadings = document.querySelectorAll('h5.fandoms.heading');
    fandomHeadings.forEach(heading => {
        if (heading.dataset.commasRemoved) return;
        Array.from(heading.childNodes).forEach(node => {
            if (node.nodeType === 3 && /^,\s*$/.test(node.textContent)) {
                node.remove();
            }
        });
        heading.dataset.commasRemoved = 'true';
    });
}

function startCommaObserver() {
    if (!document.body) return;
    const commaObserver = new MutationObserver((mutations) => {
        let hasNewCards = false;
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.classList && node.classList.contains('work')) {
                        hasNewCards = true;
                    }
                });
            }
        });
        if (hasNewCards) setTimeout(removeFandomCommas, 50);
    });
    commaObserver.observe(document.body, { childList: true, subtree: true });
}

// ----- Group Stats in Pairs -----
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
            pair.style.cssText = 'display: flex; gap: 0.4rem;align-items:center;justify-content:center;';
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

function startStatsObserver() {
    if (!document.body) return;
    const statsObserver = new MutationObserver((mutations) => {
        let hasNewStats = false;
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.querySelectorAll('dl.stats').length) {
                    hasNewStats = true;
                }
            });
        });
        if (hasNewStats) setTimeout(groupStatsInPairs, 50);
    });
    statsObserver.observe(document.body, { childList: true, subtree: true });
}

// ==========================================================================
//   FILTER MOBILE TOGGLE & COLLAPSIBLE LISTS
// ==========================================================================

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
    const toggleBtn = document.getElementById('go_to_filters') || document.querySelector('a[href*="-filters"]');

    if (!filtersForm) return;

    // Create dark backdrop
    let backdrop = document.querySelector('#filters-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'filters-backdrop';
        document.body.insertBefore(backdrop, document.body.firstChild);
    }

    // Add Close Icon if missing
    if (!filtersForm.querySelector('.filter-close-btn')) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'filter-close-btn';
        closeBtn.innerHTML = '✕';
        closeBtn.type = 'button';
        closeBtn.setAttribute('aria-label', 'Close filters');
        filtersForm.insertBefore(closeBtn, filtersForm.firstChild);
    }

    // Mobile Toggle button listener
    if (toggleBtn && !toggleBtn.dataset.listenerAdded) {
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            filtersForm.classList.toggle('mobile-active');
            backdrop.classList.toggle('mobile-active');
        });
        toggleBtn.dataset.listenerAdded = 'true';
    }

    // Click outside to dismiss modal
    if (!backdrop.dataset.listenerAdded) {
        backdrop.addEventListener('click', () => {
            filtersForm.classList.remove('mobile-active');
            backdrop.classList.remove('mobile-active');
        });
        backdrop.dataset.listenerAdded = 'true';
    }

    // Close button dismiss trigger
    const closeBtn = filtersForm.querySelector('.filter-close-btn');
    if (closeBtn && !closeBtn.dataset.listenerAdded) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            filtersForm.classList.remove('mobile-active');
            backdrop.classList.remove('mobile-active');
        });
        closeBtn.dataset.listenerAdded = 'true';
    }

    // Initialize collapsible lists
    initFilterToggles();

    // Ensure closed by default
    filtersForm.classList.remove('mobile-active');
    if (backdrop) backdrop.classList.remove('mobile-active');
}

// ==========================================================================
//   VANILLA SMOOTH SCROLL & COMMENTS OBSERVER
// ==========================================================================

function smoothScrollTo(element, duration = 400) {
    if (!element) return;
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    // Quadratic easing out
    function ease(t, b, c, d) {
        t /= d;
        return -c * t * (t - 2) + b;
    }

    requestAnimationFrame(animation);
}

function initCommentsScrollFix() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('#show_comments_link_top a, #show_comments_link a');
        if (!link) return;

        console.log('[Obsidian] Comments link clicked, setting up observer...');
        const placeholder = document.getElementById('comments_placeholder');
        if (!placeholder) return;

        // Monitor elements inside isolated context without jQuery
        const observer = new MutationObserver((mutations, obs) => {
            if (placeholder.style.display !== 'none' && placeholder.children.length > 0) {
                obs.disconnect();
                const target = document.getElementById('feedback');
                if (target) {
                    setTimeout(() => smoothScrollTo(target, 400), 100);
                }
            }
        });

        observer.observe(placeholder, {
            childList: true,
            attributes: true,
            attributeFilter: ['style']
        });

        // Fail-safe timeout
        setTimeout(() => observer.disconnect(), 10000);
    });
}

function checkInitialCommentsScroll() {
    if (window.location.hash === '#comments' || window.location.search.includes('show_comments=true')) {
        setTimeout(() => {
            const target = document.getElementById('feedback');
            if (target) smoothScrollTo(target, 400);
        }, 600);
    }
}

// ==========================================================================
//   MAIN INITIALISATION
// ==========================================================================

function initEnhancements() {
    // Run all enhancements once
    replaceLogoColor();
    addFooterBadge();
    addCategoryHeaders();
    removeFandomCommas();
    groupStatsInPairs();

    // Start observers for dynamic content
    startHeaderObserver();
    startCommaObserver();
    startStatsObserver();

    // Initialise filter toggles (mobile & collapsible)
    initFilters();

    // Initialise isolated scroll behavior
    initCommentsScrollFix();
    checkInitialCommentsScroll();

    console.log('[Obsidian] All enhancements applied');
}

// ==========================================================================
//   CLEANUP + REVEAL
// ==========================================================================

let cleanupDone = false;

async function doCleanupAndReveal() {
    if (cleanupDone) return;
    cleanupDone = true;

    // Remove all AO3 external stylesheets
    stripAO3Stylesheets();

    // Wait for custom CSS and DOM readiness
    await waitForCustomCSS();

    // Extra safety: wait for two frames to ensure browser has painted
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => setTimeout(r, 50));

    // Reveal the page
    revealPage();

    // Run all enhancements
    initEnhancements();

    console.log('[Obsidian] Page fully ready');
}

// ==========================================================================
//   STARTUP
// ==========================================================================

function startup() {
    if (!document.head) {
        const headObserver = new MutationObserver((mutations, obs) => {
            if (document.head) {
                obs.disconnect();
                injectHider();
                stripAO3Stylesheets();
                startStripObserver();
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', doCleanupAndReveal);
                } else {
                    doCleanupAndReveal();
                }
            }
        });
        headObserver.observe(document.documentElement, { childList: true, subtree: true });
        return;
    }

    injectHider();
    stripAO3Stylesheets();
    startStripObserver();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', doCleanupAndReveal);
    } else {
        doCleanupAndReveal();
    }
}

// Start everything
startup();



// Style TinyMCE iframe body natively for dark mode text-weight contrast
// Style TinyMCE iframe body natively for dark mode text-weight contrast
function styleEditorIframe() {
    const iframe = document.getElementById('content_ifr');
    if (iframe && iframe.contentDocument) {
        const doc = iframe.contentDocument;
        if (!doc.getElementById('obsidian-iframe-styles')) {
            const style = doc.createElement('style');
            style.id = 'obsidian-iframe-styles';
            style.innerHTML = `
                body#tinymce {
                    background-color: var(--bg-surface-2, #222225) !important;
                    color: var(--text-primary, #E4E4E7) !important;
                    font-family: var(--font-stack-ui, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif) !important;
                    -webkit-font-smoothing: antialiased !important;
                    padding: 0.5rem !important;
                }
                
                strong, b {
                    font-weight: 800 !important;
                    color: var(--text-primary, #E4E4E7) !important;
                }
            `;
            doc.head.appendChild(style);
        }
    }
}

// Watch for editor load dynamically
setInterval(styleEditorIframe, 1000);