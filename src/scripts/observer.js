// file: src/scripts/observer.js

// CSS Stripping Logic
function handleStyleSheets(node) {
    if (node.nodeType !== 1) return;

    const tagName = node.tagName;

    // Strip AO3 default stylesheet links
    if (tagName === 'LINK' && node.rel === 'stylesheet') {
        const href = node.getAttribute('href') || '';

        if (href.includes('skin_1_default') || href.includes('sandbox.css')) {
            node.remove();
            console.log('✓ Stripped:', href);
            return;
        }
    }

    // Remove AO3 default STYLE tags
    if (tagName === 'STYLE') {
        const id = node.getAttribute('id') || '';

        if (id.startsWith('ao3-') || id.startsWith('obsidian-') || id.startsWith('prevent-')) {
            return;
        }

        const media = node.getAttribute('media') || '';
        if (media && media !== 'all') {
            return;
        }

        node.remove();
        console.log('✓ Stripped STYLE tag');
    }
}

// Strip existing stylesheets in the document immediately
function stripExistingStyleSheets() {
    // Strip existing LINK tags
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href.includes('skin_1_default') || href.includes('sandbox.css')) {
            link.remove();
            console.log('✓ Stripped existing:', href);
        }
    });

    // Strip existing STYLE tags
    document.querySelectorAll('style').forEach(style => {
        const id = style.getAttribute('id') || '';

        if (id.startsWith('ao3-') || id.startsWith('obsidian-') || id.startsWith('prevent-')) {
            return;
        }

        const media = style.getAttribute('media') || '';
        if (media && media !== 'all') {
            return;
        }

        style.remove();
        console.log('✓ Stripped existing STYLE tag');
    });

    console.log('✓ Existing stylesheets stripped');
}

// Replace AO3 logo with purple version
function replaceLogoColor() {
    const logo = document.querySelector('#header .heading a .logo');
    if (logo) {
        logo.src = chrome.runtime.getURL('src/styles/assets/logo_accent_color.png');
        console.log('Logo recolored to purple');
    }
}

// Add Obsidian Ao3 Github Link to Footer
// Add Obsidian Ao3 Github Link to Footer
function addFooterBadge() {
    const menu = document.querySelector('#footer .module.group:has(form.button_to) ul.menu');

    if (!menu) {
        console.log("Menu not found");
        return;
    }

    console.log("Found menu");

    const newUl = document.createElement('ul');
    newUl.className = 'menu obsidian-ao3';

    const li = document.createElement('li');

    li.innerHTML = `
        <a href="https://github.com/PixelStarForge/Obsidian-Ao3" target="_blank" 
        >GitHub</a>
    `;

    newUl.appendChild(li);
    menu.appendChild(newUl);
}

// Call on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        replaceLogoColor();
        addFooterBadge();
    });
} else {
    replaceLogoColor();
    addFooterBadge();
}

// Mutation Observer for future stylesheets
const headObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType !== 1) { continue; }
            handleStyleSheets(node);
        }
    }
});

function startObserver() {
    // Strip existing sheets first
    stripExistingStyleSheets();

    // Wait for head to exist
    if (!document.head) {
        setTimeout(startObserver, 10);
        return;
    }

    // Then observe for new ones
    headObserver.observe(document.head, {
        childList: true,
        subtree: false
    });

    console.log('✓ AO3 Sleek: CSS stripping active');
}

// Start immediately at document_start
startObserver();

// Run when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', replaceLogoColor);
} else {
    replaceLogoColor();
    addFooterBadge();
}