# My Personal Portfolio & Blog

![Homepage Screenshot](project_images/screenshot-homepage-1.png)

This repository contains the complete source code and content for my personal portfolio website, built by Mit Patel. It's a fully static site generated using Python, Jinja2, and a custom build script, designed to be a living document of my projects, skills, and technical learnings. 

The entire site is generated from a single, centralized JSON database (`portfolio-mit_v1.json`), making it incredibly easy to maintain and update.

**Live Site:** [gojo-rika.github.io](https://gojo-rika.github.io/)

---

## About This Project

The primary goal of this project was to create a clean, professional, and maintainable portfolio that goes beyond a simple resume. I wanted a platform to tell the detailed stories behind my projects and showcase my skills in a visually engaging way.

The core architectural choice was to use a **static site generator** approach. Instead of using a complex framework like React or a CMS like WordPress, I wrote a custom Python script that acts as a build tool. This script reads all my personal and project data from a central JSON file and uses the Jinja2 templating engine to inject this data into HTML templates, generating the final static website.

This approach gives me the best of both worlds:
*   **Ultimate Control:** Full control over every line of HTML and CSS.
*   **Easy Maintenance:** To add a new project or blog post, I only need to update the JSON and Markdown files and re-run the script. No HTML editing is required.
*   **High Performance:** The final output is pure, lightweight static files, which are incredibly fast, secure, and can be hosted for free on platforms like GitHub Pages.


---

## Features

This portfolio is packed with features we've built from the ground up:

*   **Centralized Data Management:** All content (project details, blog posts, skills, etc.) is managed in a single `updated-data.json` file, acting as a "single source of truth."
*   **Dynamic Site Generation:** A Python script (`generate_portfolio_modified.py`) serves as the build engine.
*   **Multi-Page Architecture:** Includes separate, fully-featured pages for:
    *   **Homepage:** A personal introduction and high-level summary.
    *   **Resume:** A clean, professional resume layout.
    *   **Projects:** A beautiful, card-based gallery of my featured work.
    *   **Tech Stack:** A visual grid of all the technologies I'm proficient in.
    *   **Blog:** A filterable list of all my technical articles.
    *   **Contact:** A clear call-to-action page.
*   **Markdown-Powered Blog:**
    *   Blog posts are written in simple Markdown files.
    *   The build script automatically converts them to styled HTML pages.
    *   Supports multi-part blog series with automatic "Part 1 / Part 2" linking.
    *   Includes "Previous/Next Post" navigation to encourage reader engagement.
*   **Interactive UI & UX:**
    *   **Light/Dark Theme Toggle:** A site-wide, persistent theme switcher with a floating icon.
    *   **Themed Icons:** All SVG icons (for social links and tech stacks) are theme-aware, automatically changing color to match the light or dark mode.
    *   **Interactive Filtering:** The blog page features a sidebar that allows users to filter posts by core technologies.
    *   **Responsive Design:** Custom CSS ensures the site looks great on both desktop and mobile devices.
*   **Deep Project-Blog Integration:** Each project card on the "Projects" page links directly to its corresponding detailed "Read the Story" blog post, creating a powerful narrative flow.

---

## How to Run This Project Locally (using `uv`)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/GoJo-Rika/GoJo-Rika.github.io.git
    cd GoJo-Rika.github.io
    ```

2.  **Install `uv` (if you haven't already):**
    ```bash
    # On macOS / Linux
    curl -LsSf https://astral.sh/uv/install.sh | sh
    
    # On Windows
    irm https://astral.sh/uv/install.ps1 | iex
    ```

3.  **Create and activate a virtual environment using `uv`:**
    ```bash
    uv venv
    source .venv/bin/activate  # On Windows, use `.venv\Scripts\activate`
    ```

4.  **Install dependencies using `uv`:**
    ```bash
    uv pip install -r requirements.txt
    ```

5.  **Run the generator script:**
    ```bash
    python generate_portfolio_modified.py
    ```

6.  **View the site:** Open any of the generated `.html` files (like `index.html`) in your browser.

---

## Future Roadmap & To-Do List

This project is a continuous work in progress. Here are some of the features and improvements planned for the future:

*   `[x]` **Add a "Copy Code" Button to Code Blocks:** A final layer of polish for the blog, allowing visitors to easily copy code snippets. This was originally attempted with Prism.js plugins, but has now been resolved directly using a custom Javascript implementation to sidestep the plugin issues.

*   `[ ]` **Integrate a CSS Framework (e.g., Bootstrap):** To further improve the responsive design and accelerate the addition of new UI components, I plan to refactor the custom CSS to use a professional framework. This will involve updating the HTML templates to use the framework's class system.

*   `[ ]` **Implement a Direct Contact Form:** To provide an alternative to the `mailto:` link, I plan to integrate a third-party service (like Formspree) to handle direct message submissions from a form on the contact page. This will require setting up the service and adding a `<form>` element to the `contact_template.html`.

*   `[ ]` **Add Search Functionality:** Implement a client-side search feature (using JavaScript) to allow users to search for keywords across all blog posts.

*   `[ ]` **Content Expansion:**
    *   Add more projects to the `json` file.
    *   Write more technical blog posts.
    *   Continue to expand and refine the `tech_stack` with new skills.

*   `[ ]` **Update architecture diagram link in markdown file**
    * by simply adding `../` or `/` should work on local system, but that does not solve the problem in static `html` page
    * the current approach solves the issue for `html` page but when previewing the `markdown` file, the **image** is not shown (both in **local** as well as in **github repos**)

*   `[ ]` **Make changes for 3 blog series:**
    *   If there are 3 blogs which are written, then link them properly and make sure it works.
    *   The current version does not do that (it loops over the middle blog in `Text Summarizer`)

*   `[ ]` **Organise data inside `json` file:**
    *   Keep the data in a structured format so there are no duplicates.
    *   The data for a project/blog must be together (`project_db`) to make it easier to edit details like Github URLs, blog images, project card thumbnail, blog home page summary, etc, etc, etc.
    *   Follow the structure given in `update-data.json` and `project_db.json` in `future-work/` folder.

*   `[ ]` **Add read story section in project page:**
    *   In the project page, under the given project card, add a link to read the blog along with viewing it on github.
    *   The blog will be redirected to the 1st blog in the series.

*   `[ ]` **Keep 3 projects columns:**
    *   Need to make changes in `project_template` to make sure it includes 3 project cards in each row. (see `future-work/images/project-page.png`)

*   `[ ]` **Add heading sections inside blog post page:**
    *   In the blog post page, add page headings and links for easy scrolling and navigating through the page. 
    *   This also helps in giving a brief of the blog post page.
    *   See `future-work/images/blog-post-page.png` for reference and `future-work/images/reference-sample.png`

*   `[ ]` **Architecture diagram and video or a gif:**
    *   Add architecture diagram of the project or the blog or create a video doing a walkthrough of the project or a gif of the working ui.
