document.addEventListener('DOMContentLoaded', function () {
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
    themeToggle.addEventListener('click', function() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = (currentTheme === 'dark') ? 'light' : 'dark';
        applyTheme(newTheme);
    });
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

