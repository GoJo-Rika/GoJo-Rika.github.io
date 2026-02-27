/**
 * Blog Search — lightweight client-side search across all posts.
 * Depends on js/search-index.js (generated at build time).
 */
document.addEventListener('DOMContentLoaded', function () {

    /* ---------- DOM references ---------- */
    const overlay = document.getElementById('search-overlay');
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    const closeBtn = document.getElementById('search-close-btn');
    const searchBtn = document.getElementById('search-fab');
    const clearBtn = document.getElementById('search-clear-btn');

    if (!overlay || !input || !results || !searchBtn) return;

    /* ---------- State ---------- */
    let selectedIndex = -1; // tracks arrow-key selection

    /* ---------- Helpers ---------- */

    function openSearch() {
        overlay.classList.add('active');
        input.value = '';
        results.innerHTML = '<p class="search-hint">Type at least 2 characters to search…</p>';
        selectedIndex = -1;
        if (clearBtn) clearBtn.style.display = 'none';
        setTimeout(function () { input.focus(); }, 80);
    }

    function closeSearch() {
        overlay.classList.remove('active');
        selectedIndex = -1;
    }

    function clearSearch() {
        input.value = '';
        selectedIndex = -1;
        if (clearBtn) clearBtn.style.display = 'none';
        results.innerHTML = '<p class="search-hint">Type at least 2 characters to search…</p>';
        input.focus();
    }

    function highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    /** Update the visual selection highlight on result items */
    function updateSelection() {
        const items = results.querySelectorAll('.search-result-item');
        items.forEach((item, i) => {
            if (i === selectedIndex) {
                item.classList.add('selected');
                // Scroll the selected item into view within the results pane
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    function performSearch(query) {
        results.innerHTML = '';
        selectedIndex = -1;

        // Show/hide the clear button based on whether there is text
        if (clearBtn) {
            clearBtn.style.display = query.length > 0 ? 'flex' : 'none';
        }

        if (!query || query.length < 2) {
            results.innerHTML = '<p class="search-hint">Type at least 2 characters to search…</p>';
            return;
        }

        const q = query.toLowerCase();

        const matches = SEARCH_INDEX.filter(post => {
            const inTitle = post.title.toLowerCase().includes(q);
            const inSummary = post.summary.toLowerCase().includes(q);
            const inTags = post.tags.some(t => t.toLowerCase().includes(q));
            return inTitle || inSummary || inTags;
        });

        if (matches.length === 0) {
            results.innerHTML = '<p class="search-hint">No posts found for "<strong>' + query + '</strong>".</p>';
            return;
        }

        matches.forEach(post => {
            const a = document.createElement('a');
            a.href = 'posts/' + post.slug + '.html';
            a.className = 'search-result-item';

            const title = document.createElement('span');
            title.className = 'search-result-title';
            title.innerHTML = highlightMatch(post.title, query);

            const date = document.createElement('span');
            date.className = 'search-result-date';
            date.textContent = post.date;

            const tags = document.createElement('span');
            tags.className = 'search-result-tags';
            const displayTags = post.tags.filter(t => t.toLowerCase().includes(q)).slice(0, 4);
            if (displayTags.length === 0) {
                tags.innerHTML = post.tags.slice(0, 4).map(t => '<span class="tag">' + t + '</span>').join('');
            } else {
                tags.innerHTML = displayTags.map(t => '<span class="tag">' + highlightMatch(t, query) + '</span>').join('');
            }

            a.appendChild(title);
            a.appendChild(date);
            a.appendChild(tags);
            results.appendChild(a);
        });
    }

    /* ---------- Event listeners ---------- */

    searchBtn.addEventListener('click', openSearch);

    closeBtn.addEventListener('click', closeSearch);

    // Clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', clearSearch);
    }

    // Close on background click
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeSearch();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeSearch();

        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (overlay.classList.contains('active')) {
                // If there's text, clear it. If empty, just refocus.
                if (input.value.trim().length > 0) {
                    clearSearch();
                } else {
                    input.focus();
                }
            } else {
                openSearch();
            }
        }

        // Arrow key navigation & Enter within search results
        if (!overlay.classList.contains('active')) return;

        const items = results.querySelectorAll('.search-result-item');
        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % items.length;
            updateSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            updateSelection();
        } else if (e.key === 'Enter' && selectedIndex >= 0 && selectedIndex < items.length) {
            e.preventDefault();
            items[selectedIndex].click();
        }
    });

    // Debounced search
    let debounceTimer;
    input.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => performSearch(input.value.trim()), 200);
    });
});
