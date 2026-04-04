import json
import re
from datetime import UTC, datetime
from pathlib import Path

import markdown2
from jinja2 import Environment, FileSystemLoader
from PIL import Image

BASE_URL = "https://gojo-rika.github.io"
IMAGE_DIRS = ["project_images", "posts_assets"]
THUMB_MAX_SIZE = (400, 400)
WEBP_QUALITY = 80


def slugify(text):
    text = text.lower()
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"[^a-z0-9-]", "", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def markdown_to_html(text):
    """Convert **bold** markdown to <strong> HTML tags."""
    return re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", text)


def markdown_to_html_resume(text):
    """Strip **bold** markdown markers, leaving plain text for the resume."""
    return re.sub(r"\*\*(.*?)\*\*", r"\1", text)


def strip_html_tags(text):
    """Remove HTML tags and collapse whitespace for meta descriptions."""
    clean = re.sub(r"<[^>]+>", "", text)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean


# ---------------------------------------------------------------------------
# 1. Load data from the unified JSON database
# ---------------------------------------------------------------------------
with Path("portfolio.json").open(encoding="utf-8") as f:
    data = json.load(f)

data["current_year"] = datetime.now(tz=UTC).year

for link in data.get("social_links", []):
    svg_path = link.get("svg_path")
    if svg_path:
        with Path(svg_path).open(encoding="utf-8") as svg_file:
            link["svg_data"] = svg_file.read()

# ---------------------------------------------------------------------------
# 2. Derive template-compatible lists from projects_blog_db
# ---------------------------------------------------------------------------
projects_blog_db = data.get("projects_blog_db", {})

all_blogs = []
for project in projects_blog_db.values():
    github_url = project.get("github_url", "")
    parent_techs = project.get("core_technologies", [])
    for blog in project.get("blogs", []):
        blog["github_url"] = github_url
        blog["project_title"] = project["title"]
        blog["core_technologies"] = parent_techs
        all_blogs.append(blog)

featured_projects = []
for project in projects_blog_db.values():
    if project.get("featured"):
        featured_projects.append({
            "title": project["title"],
            "image": project.get("image", ""),
            "summary": project.get("summary", {}).get("project_card", ""),
            "technologies": project.get("core_technologies", []),
            "github_url": project.get("github_url", ""),
            "live_demo_url": None,
        })
data["featured_projects"] = featured_projects

projects_for_resume = []
for project in projects_blog_db.values():
    if project.get("show_in_resume", True):
        projects_for_resume.append({
            "title": project["title"],
            "url": project.get("github_url", ""),
            "summary": project.get("summary", {}).get("resume_page", ""),
            "core_technologies": project.get("core_technologies", []),
            "keywords": project.get("keywords", []),
            "highlights": [],
            "images": [],
        })
data["projects"] = projects_for_resume

# ---------------------------------------------------------------------------
# 3. Jinja2 environment (trim_blocks removes whitespace from template tags)
# ---------------------------------------------------------------------------
env = Environment(
    loader=FileSystemLoader("."),
    autoescape=True,
    trim_blocks=True,
    lstrip_blocks=True,
)
env.filters["markdown_to_html"] = markdown_to_html
env.filters["markdown_to_html_resume"] = markdown_to_html_resume

index_template = env.get_template("index_template.html")
resume_template = env.get_template("resume_template.html")
blog_template = env.get_template("blog_template.html")
post_template = env.get_template("post_template.html")
contact_template = env.get_template("contact_template.html")
projects_template = env.get_template("projects_template.html")
tech_stack_template = env.get_template("tech_stack_template.html")

Path("posts").mkdir(exist_ok=True)

# ---------------------------------------------------------------------------
# 4. Process blog posts: slugify, sort, link prev/next, resolve series parts
# ---------------------------------------------------------------------------
for post in all_blogs:
    post["slug"] = slugify(post["title"])

blog_posts = sorted(
    all_blogs,
    key=lambda x: datetime.strptime(x["publish_date"], "%Y-%m-%d"),
    reverse=True,
)

slug_to_post = {post["slug"]: post for post in blog_posts}

for i, post in enumerate(blog_posts):
    post["next_post"] = blog_posts[i + 1] if i + 1 < len(blog_posts) else None
    post["previous_post"] = blog_posts[i - 1] if i > 0 else None

    part_match = re.search(r"\(Part (\d+)\)", post["title"])
    if part_match:
        post["part_num"] = part_match.group(1)

for post in blog_posts:
    if post.get("previous_part_slug"):
        prev = slug_to_post.get(post["previous_part_slug"])
        if prev and prev.get("part_num"):
            post["previous_part_num"] = prev["part_num"]
    if post.get("next_part_slug"):
        nxt = slug_to_post.get(post["next_part_slug"])
        if nxt and nxt.get("part_num"):
            post["next_part_num"] = nxt["part_num"]

# ---------------------------------------------------------------------------
# 5. Generate SEO metadata for each blog post
# ---------------------------------------------------------------------------
for post in blog_posts:
    if not post.get("meta_description"):
        raw = post.get("content", "")
        clean = strip_html_tags(markdown_to_html(raw))
        post["meta_description"] = clean[:160].rsplit(" ", 1)[0] if len(clean) > 160 else clean

    if not post.get("meta_keywords"):
        techs = post.get("core_technologies", [])
        kws = post.get("keywords", [])
        post["meta_keywords"] = ", ".join(dict.fromkeys(techs + kws))

# ---------------------------------------------------------------------------
# 6. Generate individual blog post HTML files
# ---------------------------------------------------------------------------
for post in blog_posts:
    md_file = post.get("markdown_file")
    if not md_file:
        continue

    md_filepath = Path("blog_posts") / md_file
    if md_filepath.exists():
        with md_filepath.open("r", encoding="utf-8") as f:
            markdown_content = f.read()
        post["detailed_content"] = markdown2.markdown(
            markdown_content, extras=["fenced-code-blocks", "code-friendly"]
        )
        post_output = post_template.render(post=post, **data)
        output_path = Path("posts") / f"{post['slug']}.html"
        with output_path.open("w", encoding="utf-8") as f:
            f.write(post_output)
    else:
        print(f"Warning: Markdown file not found for '{post['title']}': {md_filepath}")

data["blogs"] = blog_posts

# ---------------------------------------------------------------------------
# 7. Collect unique technology tags for the blog filter sidebar
# ---------------------------------------------------------------------------
all_tags = set()
for post in blog_posts:
    for tech in post.get("core_technologies", []):
        all_tags.add(tech)

sorted_tags = sorted(all_tags)

# ---------------------------------------------------------------------------
# 8. Match featured projects to their starting blog post (Part 1)
# ---------------------------------------------------------------------------
for project in data.get("featured_projects", []):
    for post in reversed(blog_posts):
        if post.get("project_title") == project["title"] and not post.get("previous_part_slug"):
            project["blog_slug"] = post["slug"]
            break

# ---------------------------------------------------------------------------
# 9. Render all page templates
# ---------------------------------------------------------------------------
pages = {
    "index.html": index_template.render(**data),
    "resume.html": resume_template.render(**data),
    "projects.html": projects_template.render(**data),
    "blog.html": blog_template.render(tags=sorted_tags, **data),
    "contact.html": contact_template.render(**data),
    "tech-stack.html": tech_stack_template.render(**data),
}

for filename, html in pages.items():
    with Path(filename).open("w", encoding="utf-8") as f:
        f.write(html)

# ---------------------------------------------------------------------------
# 10. Generate search index for client-side blog search
# ---------------------------------------------------------------------------
search_entries = [
    {
        "title": post["title"],
        "slug": post["slug"],
        "date": post["publish_date"],
        "summary": post.get("content", ""),
        "tags": post.get("core_technologies", []) + post.get("keywords", []),
    }
    for post in blog_posts
]

search_index_js = "const SEARCH_INDEX = " + json.dumps(search_entries, indent=2) + ";\n"
with Path("js/search-index.js").open("w", encoding="utf-8") as f:
    f.write(search_index_js)

# ---------------------------------------------------------------------------
# 11. Generate sitemap.xml
# ---------------------------------------------------------------------------
def generate_sitemap():
    today = datetime.now(tz=UTC).strftime("%Y-%m-%d")

    static_pages = [
        {"loc": f"{BASE_URL}/", "priority": "1.0", "changefreq": "monthly"},
        {"loc": f"{BASE_URL}/resume.html", "priority": "0.8", "changefreq": "monthly"},
        {"loc": f"{BASE_URL}/projects.html", "priority": "0.8", "changefreq": "monthly"},
        {"loc": f"{BASE_URL}/blog.html", "priority": "0.9", "changefreq": "weekly"},
        {"loc": f"{BASE_URL}/contact.html", "priority": "0.6", "changefreq": "yearly"},
        {"loc": f"{BASE_URL}/tech-stack.html", "priority": "0.7", "changefreq": "monthly"},
    ]

    urls = []
    for page in static_pages:
        urls.append(
            f"  <url>\n"
            f"    <loc>{page['loc']}</loc>\n"
            f"    <lastmod>{today}</lastmod>\n"
            f"    <changefreq>{page['changefreq']}</changefreq>\n"
            f"    <priority>{page['priority']}</priority>\n"
            f"  </url>"
        )

    for post in blog_posts:
        urls.append(
            f"  <url>\n"
            f"    <loc>{BASE_URL}/posts/{post['slug']}.html</loc>\n"
            f"    <lastmod>{post['publish_date']}</lastmod>\n"
            f"    <changefreq>yearly</changefreq>\n"
            f"    <priority>0.7</priority>\n"
            f"  </url>"
        )

    sitemap = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>\n"
    )

    with Path("sitemap.xml").open("w", encoding="utf-8") as f:
        f.write(sitemap)
    print(f"Sitemap generated with {len(urls)} URLs.")


generate_sitemap()

# ---------------------------------------------------------------------------
# 12. Generate robots.txt
# ---------------------------------------------------------------------------
def generate_robots_txt():
    robots = (
        "User-agent: *\n"
        "Allow: /\n"
        "\n"
        f"Sitemap: {BASE_URL}/sitemap.xml\n"
    )
    with Path("robots.txt").open("w", encoding="utf-8") as f:
        f.write(robots)
    print("robots.txt generated.")


generate_robots_txt()

# ---------------------------------------------------------------------------
# 13. Image optimization: convert to WebP and generate thumbnails
# ---------------------------------------------------------------------------
def optimize_images():
    converted = 0
    skipped = 0

    for dir_name in IMAGE_DIRS:
        img_dir = Path(dir_name)
        if not img_dir.exists():
            continue

        for img_path in img_dir.iterdir():
            if img_path.suffix.lower() not in (".jpg", ".jpeg", ".png"):
                continue

            webp_path = img_path.with_suffix(".webp")
            thumb_path = img_path.parent / f"{img_path.stem}_thumb.webp"

            # Skip if WebP already exists and is newer than the source
            if webp_path.exists() and webp_path.stat().st_mtime >= img_path.stat().st_mtime:
                skipped += 1
                continue

            try:
                with Image.open(img_path) as img:
                    img = img.convert("RGB")

                    # Full-size WebP
                    img.save(webp_path, "WEBP", quality=WEBP_QUALITY)

                    # Thumbnail WebP
                    thumb = img.copy()
                    thumb.thumbnail(THUMB_MAX_SIZE, Image.LANCZOS)
                    thumb.save(thumb_path, "WEBP", quality=WEBP_QUALITY)

                    converted += 1
            except Exception as e:
                print(f"  Warning: Could not convert {img_path}: {e}")

    print(f"Image optimization: {converted} converted, {skipped} skipped (already up-to-date).")


optimize_images()

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
print("\nHTML files generated successfully!")
print(f"Individual blog posts generated in the 'posts' directory ({len(blog_posts)} posts).")
print("Search index generated at js/search-index.js.")
