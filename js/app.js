document.addEventListener('DOMContentLoaded', function () {

    // ===== Scroll Progress Bar =====
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    document.body.appendChild(progressBar);

    let ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(function () {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
                progressBar.style.width = progress + '%';
                ticking = false;
            });
            ticking = true;
        }
    });

    const themeToggle = document.getElementById('theme-toggle-icon');
    const icon = themeToggle.querySelector('i');

    // Function to apply the theme
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            document.body.classList.remove('dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
        localStorage.setItem('theme', theme);
    }

    // Check for saved theme in localStorage, or use system preference
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);

    // Listen for toggle clicks
    themeToggle.addEventListener('click', function () {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = (currentTheme === 'dark') ? 'light' : 'dark';
        applyTheme(newTheme);
    });

    // Custom Copy to Clipboard for Code Blocks (blog posts only)
    const codeBlocks = document.querySelectorAll('.post-content-main pre');

    // Only create the toast if there are code blocks on this page
    if (codeBlocks.length > 0) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerText = 'Copied to clipboard';
        document.body.appendChild(toast);

        codeBlocks.forEach(block => {
            // Create the copy button using an icon
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-code-btn';
            copyButton.innerHTML = '<i class="far fa-copy"></i>';
            copyButton.setAttribute('aria-label', 'Copy code to clipboard');

            // Add the button to the pre block
            block.appendChild(copyButton);

            // Add the click event listener
            copyButton.addEventListener('click', () => {
                const code = block.querySelector('code');
                let textToCopy = '';

                if (code) {
                    textToCopy = code.innerText;
                } else {
                    // Remove the button from the copied text if no inner code tag is found
                    const clone = block.cloneNode(true);
                    const btn = clone.querySelector('.copy-code-btn');
                    if (btn) clone.removeChild(btn);
                    textToCopy = clone.innerText;
                }

                navigator.clipboard.writeText(textToCopy).then(() => {
                    // Show toast notification
                    toast.classList.add('show');

                    // Change icon to a checkmark
                    copyButton.innerHTML = '<i class="fas fa-check"></i>';
                    copyButton.classList.add('copied');

                    setTimeout(() => {
                        // Hide toast and revert icon
                        toast.classList.remove('show');
                        copyButton.innerHTML = '<i class="far fa-copy"></i>';
                        copyButton.classList.remove('copied');
                    }, 2500);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            });
        });
    }
});


// // In js/app.js
// document.addEventListener('DOMContentLoaded', function () {
//     const themeToggle = document.getElementById('theme-toggle-icon');
//     const icon = themeToggle ? themeToggle.querySelector('i') : null;

//     // This function now handles everything: applying the class and updating the icon
//     function setTheme(theme) {
//         if (theme === 'dark') {
//             document.body.classList.add('dark');
//             if (icon) {
//                 icon.classList.remove('fa-sun');
//                 icon.classList.add('fa-moon');
//             }
//         } else {
//             document.body.classList.remove('dark');
//             if (icon) {
//                 icon.classList.remove('fa-moon');
//                 icon.classList.add('fa-sun');
//             }
//         }
//         localStorage.setItem('theme', theme);
//     }

//     // --- Main Logic ---
//     // 1. Check for a saved theme in localStorage
//     let currentTheme = localStorage.getItem('theme');

//     // 2. If no saved theme, check the OS preference
//     if (!currentTheme) {
//         currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
//     }

//     // 3. Apply the determined theme
//     setTheme(currentTheme);

//     // 4. Add the click listener to the toggle
//     if (themeToggle) {
//         themeToggle.addEventListener('click', function() {
//             // Get the current theme from the body class, not localStorage, for instant feedback
//             const isDark = document.body.classList.contains('dark');
//             const newTheme = isDark ? 'light' : 'dark';
//             setTheme(newTheme);
//         });
//     }
// });

