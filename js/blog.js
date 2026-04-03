/* Blog page: filtering, pagination, mobile panel */
document.addEventListener('DOMContentLoaded', function () {
    var tagContainer = document.getElementById('tag-filter-container');
    var mobileTagContainer = document.getElementById('mobile-tag-filter-container');
    var blogPosts = Array.from(document.querySelectorAll('.blog-post'));
    var loadMoreBtn = document.getElementById('load-more-btn');
    var mobileFilterToggle = document.getElementById('mobile-filter-toggle');
    var mobileFilterPanel = document.getElementById('mobile-filter-panel');

    var currentMax = 5;
    var POSTS_PER_PAGE = 5;
    var activeFilters = new Set();

    function updatePostsDisplay() {
        var matchingPosts = blogPosts.filter(function (post) {
            if (activeFilters.size === 0) return true;
            var postTags = post.getAttribute('data-tags').split(',');
            return postTags.some(function (tag) { return activeFilters.has(tag.trim()); });
        });

        blogPosts.forEach(function (post) { post.style.display = 'none'; });

        var visibleCount = 0;
        for (var i = 0; i < matchingPosts.length; i++) {
            if (i < currentMax) {
                matchingPosts[i].style.display = 'block';
                visibleCount++;
            }
        }

        loadMoreBtn.style.display = (visibleCount >= matchingPosts.length) ? 'none' : 'inline-block';

        var totalPostsEl = document.getElementById('total-posts-count');
        if (totalPostsEl) {
            totalPostsEl.textContent = 'Total Posts: ' + matchingPosts.length;
        }
    }

    function syncFilterUI() {
        [tagContainer, mobileTagContainer].filter(Boolean).forEach(function (container) {
            container.querySelectorAll('.filter-tag').forEach(function (btn) {
                var tag = btn.getAttribute('data-tag').toLowerCase();
                if (tag === 'all') {
                    btn.classList.toggle('active', activeFilters.size === 0);
                } else {
                    btn.classList.toggle('active', activeFilters.has(tag));
                }
            });
        });
    }

    function handleFilterClick(clickedBtn) {
        var tag = clickedBtn.getAttribute('data-tag').toLowerCase();
        if (tag === 'all') {
            activeFilters.clear();
        } else if (activeFilters.has(tag)) {
            activeFilters.delete(tag);
        } else {
            activeFilters.add(tag);
        }
        currentMax = POSTS_PER_PAGE;
        syncFilterUI();
        updatePostsDisplay();
    }

    if (tagContainer) {
        tagContainer.addEventListener('click', function (e) {
            if (e.target.matches('.filter-tag')) handleFilterClick(e.target);
        });
    }

    if (mobileTagContainer) {
        mobileTagContainer.addEventListener('click', function (e) {
            if (e.target.matches('.filter-tag')) handleFilterClick(e.target);
        });
    }

    if (mobileFilterToggle && mobileFilterPanel) {
        mobileFilterToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            var isOpen = mobileFilterPanel.classList.toggle('open');
            mobileFilterToggle.classList.toggle('active', isOpen);
        });

        document.addEventListener('click', function (e) {
            if (!mobileFilterPanel.contains(e.target) && !mobileFilterToggle.contains(e.target)) {
                mobileFilterPanel.classList.remove('open');
                mobileFilterToggle.classList.remove('active');
            }
        });
    }

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function () {
            var previousMax = currentMax;
            currentMax += POSTS_PER_PAGE;
            updatePostsDisplay();

            var visiblePosts = blogPosts.filter(function (p) { return p.style.display !== 'none'; });
            if (visiblePosts.length > previousMax) {
                var firstNewPost = visiblePosts[previousMax];
                if (firstNewPost) {
                    setTimeout(function () {
                        firstNewPost.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 50);
                }
            }
        });
    }

    updatePostsDisplay();
});
