/* ========================================================================
   OBSIDIAN AO3 – COMPLETE CONTENT SCRIPT
   - FOUC prevention (hider + external CSS stripping)
   - Waits for custom CSS and DOM readiness
   - All enhancement functions integrated
   ======================================================================== */

const HIDING_STYLE_ID = 'ao3-obsidian-hider';
const CSS_CHECK_INTERVAL = 50;      // ms
const CSS_CHECK_TIMEOUT = 15000;    // ms max wait

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
    // Count stylesheets – extension CSS adds to document.styleSheets
    // Adjust this number if you inject more/ fewer CSS files.
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
                // Scan inside added nodes for nested link tags
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
//   ENHANCEMENT FUNCTIONS (your existing code)
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
            header.style.cssText = 'width: 100% !important; margin-top: var(--margin-xs) !important;'
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
        'li.fandom.listbox.group dd dl.stats'
    );
    statsList.forEach(stats => {
        if (stats.dataset.statsGrouped) return;
        const pairs = [];
        const items = Array.from(stats.querySelectorAll('dt, dd'));
        for (let i = 0; i < items.length; i += 2) {
            if (i + 1 >= items.length) break;
            const pair = document.createElement('div');
            pair.className = 'stats-pair';
            pair.style.cssText = 'display: flex; gap: 0.4rem; white-space: nowrap;';
            pair.appendChild(items[i].cloneNode(true));
            pair.appendChild(items[i + 1].cloneNode(true));
            pairs.push(pair);
        }
        stats.innerHTML = '';
        stats.style.cssText = 'display: flex !important; flex-wrap: wrap !important; gap: 0.5rem !important;';
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

// ----- Main initialisation function -----
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
                setupSPA();
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
    setupSPA();
}

// ==========================================================================
//   SPA HANDLING (Turbolinks, History API)
// ==========================================================================

function setupSPA() {
    // Turbolinks
    document.addEventListener('turbolinks:before-render', () => {
        if (!document.getElementById(HIDING_STYLE_ID)) injectHider();
        cleanupDone = false;
    });
    document.addEventListener('turbolinks:load', () => {
        if (!cleanupDone) doCleanupAndReveal();
    });

    // History API
    const origPushState = history.pushState;
    history.pushState = function (...args) {
        if (!document.getElementById(HIDING_STYLE_ID)) injectHider();
        cleanupDone = false;
        setTimeout(() => { if (!cleanupDone) doCleanupAndReveal(); }, 100);
        return origPushState.apply(this, args);
    };
    const origReplaceState = history.replaceState;
    history.replaceState = function (...args) {
        if (!document.getElementById(HIDING_STYLE_ID)) injectHider();
        cleanupDone = false;
        setTimeout(() => { if (!cleanupDone) doCleanupAndReveal(); }, 100);
        return origReplaceState.apply(this, args);
    };

    window.addEventListener('popstate', () => {
        if (!document.getElementById(HIDING_STYLE_ID)) injectHider();
        cleanupDone = false;
        setTimeout(() => { if (!cleanupDone) doCleanupAndReveal(); }, 100);
    });
}

// Start everything
startup();