/* Blog post: Table of Contents generation, scrollspy, and mobile TOC */
document.addEventListener("DOMContentLoaded", function () {
    var mainContent = document.querySelector(".post-content-main");
    var tocSection = document.getElementById("toc-section");
    var tocContainer = document.getElementById("toc-container");

    if (!mainContent || !tocSection || !tocContainer) return;

    var elements = Array.from(mainContent.querySelectorAll("h1, h2, h3, h4, h5, h6, img"));
    if (elements.length === 0) return;

    tocSection.style.display = "block";

    var tocList = document.createElement("ul");
    tocList.className = "toc-list";

    var links = new Map();
    var activeLink = null;
    var imgCounter = 1;

    elements.forEach(function (el) {
        if (!el.id) {
            if (el.tagName === "IMG") {
                el.id = "content-img-" + imgCounter++;
            } else {
                var slug = el.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                if (!slug) slug = "section-" + imgCounter++;
                var origSlug = slug;
                var counter = 1;
                while (document.getElementById(slug)) {
                    slug = origSlug + "-" + counter++;
                }
                el.id = slug;
            }
        }

        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#" + el.id;
        a.className = "toc-link";

        a.addEventListener('click', function (e) {
            e.preventDefault();
            history.pushState(null, null, '#' + el.id);
            el.scrollIntoView({ behavior: 'smooth' });
        });

        if (el.tagName === "IMG") {
            var altText = el.alt ? el.alt : "Image";
            a.innerHTML = '<i class="fa-solid fa-image"></i> ' + altText;
            a.classList.add("toc-link-image");
            a.style.marginLeft = "1rem";
        } else {
            a.textContent = el.textContent;
            var level = parseInt(el.tagName.charAt(1));
            if (level > 2) {
                a.style.marginLeft = (level - 2) + "rem";
            }
        }

        li.appendChild(a);
        tocList.appendChild(li);
        links.set(el, a);
    });

    tocContainer.appendChild(tocList);

    // ===== Mobile TOC =====
    var mobileTocContainer = document.getElementById('mobile-toc-container');
    var mobileTocToggle = document.getElementById('mobile-toc-toggle');
    var mobileTocOverlay = document.getElementById('mobile-toc-overlay');
    var mobileTocClose = document.getElementById('mobile-toc-close');

    if (mobileTocContainer && mobileTocToggle) {
        mobileTocToggle.classList.add('has-toc');

        var mobileList = tocList.cloneNode(true);
        mobileTocContainer.appendChild(mobileList);

        mobileList.querySelectorAll('.toc-link').forEach(function (mobileLink) {
            mobileLink.addEventListener('click', function (e) {
                e.preventDefault();
                var targetId = mobileLink.getAttribute('href').substring(1);
                var targetEl = document.getElementById(targetId);
                if (targetEl) {
                    mobileTocOverlay.classList.remove('open');
                    history.pushState(null, null, '#' + targetId);
                    setTimeout(function () {
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            });
        });

        mobileTocToggle.addEventListener('click', function () {
            mobileTocOverlay.classList.toggle('open');
        });

        if (mobileTocClose) {
            mobileTocClose.addEventListener('click', function () {
                mobileTocOverlay.classList.remove('open');
            });
        }

        mobileTocOverlay.addEventListener('click', function (e) {
            if (e.target === mobileTocOverlay) {
                mobileTocOverlay.classList.remove('open');
            }
        });
    }

    // ===== Scrollspy =====
    var OFFSET = 150;

    function updateScrollSpy() {
        var currentActive = null;
        var maxNegativeTop = -Infinity;

        for (var i = 0; i < elements.length; i++) {
            var rect = elements[i].getBoundingClientRect();
            if (rect.top <= OFFSET && rect.top > maxNegativeTop) {
                maxNegativeTop = rect.top;
                currentActive = elements[i];
            }
        }

        var isBottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 20;

        if (isBottom && elements.length > 0) {
            currentActive = elements[elements.length - 1];
        } else if (!currentActive && elements.length > 0) {
            currentActive = elements[0];
        }

        if (currentActive) {
            var targetLink = links.get(currentActive);
            if (targetLink && targetLink !== activeLink) {
                if (activeLink) activeLink.classList.remove("active");
                targetLink.classList.add("active");
                activeLink = targetLink;

                var linkRect = targetLink.getBoundingClientRect();
                var tocRect = tocSection.getBoundingClientRect();
                if (linkRect.bottom > tocRect.bottom || linkRect.top < tocRect.top) {
                    targetLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        }
    }

    window.addEventListener('scroll', updateScrollSpy, { passive: true });
    updateScrollSpy();
});
