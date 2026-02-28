import json
import os
from datetime import UTC, datetime
from pathlib import Path

import markdown2
from jinja2 import Environment, FileSystemLoader
import re

def slugify(text):
    text = text.lower()
    # Replace spaces and underscores with hyphens
    text = re.sub(r'[\s_]+', '-', text)
    # Remove all non-alphanumeric characters except hyphens
    text = re.sub(r'[^a-z0-9-]', '', text)
    return text


def markdown_to_html(text):
    # This function is now used for the main blog summaries
    import re

    text = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", text)
    return text


def markdown_to_html_resume(text):
    # Replace **text** with <strong>text</strong>
    import re

    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    return text


# Load JSON data
with Path("portfolio-mit_v1.json").open(encoding="utf-8") as f:
    data = json.load(f)

# Add any extra context if needed
data["current_year"] = datetime.now(tz=UTC).year

if "social_links" in data:
    for link in data["social_links"]:
        if link.get("svg_path"):
            with Path(link["svg_path"]).open(encoding="utf-8") as svg_file:
                link["svg_data"] = svg_file.read()

env = Environment(loader=FileSystemLoader("."), autoescape=True)

env.filters["markdown_to_html"] = markdown_to_html
env.filters["markdown_to_html_resume"] = markdown_to_html_resume

# Set up Jinja environment
# env = Environment(loader=FileSystemLoader("."), autoescape=True)
index_template = env.get_template("index_template.html")
resume_template = env.get_template("resume_template.html")
blog_template = env.get_template("blog_template.html")
post_template = env.get_template("post_template.html") # <-- Load the new post template
contact_template = env.get_template("contact_template.html")
projects_template = env.get_template("projects_template.html")
tech_stack_template = env.get_template("tech_stack_template.html")

# env.filters["markdown_to_html"] = markdown_to_html
# env.filters["markdown_to_html_resume"] = markdown_to_html_resume

# Create a directory for the output blog post files if it doesn't exist
Path("posts").mkdir(exist_ok=True)

# 1. First, add a slug to EVERY post object
for post in data.get("blogs", []):
    post['slug'] = slugify(post['title'])

# 2. NOW, sort all blog posts by date
blog_posts = sorted(
    data.get("blogs", []),
    key=lambda x: datetime.strptime(x["publish_date"], "%Y-%m-%d"),
    reverse=True
)

# 3. Now that every post has a slug, add previous/next post information and series part resolution
slug_to_post = {post['slug']: post for post in blog_posts}

for i, post in enumerate(blog_posts):
    post['next_post'] = None
    post['previous_post'] = None
    if i + 1 < len(blog_posts):
        post['next_post'] = blog_posts[i + 1]
    if i > 0:
        post['previous_post'] = blog_posts[i - 1]

    # Dynamically extract series part number from title, e.g. " (Part 2)" -> "2"
    part_match = re.search(r'\(Part (\d+)\)', post['title'])
    if part_match:
        post['part_num'] = part_match.group(1)

for post in blog_posts:
    if post.get('previous_part_slug'):
        prev_post = slug_to_post.get(post['previous_part_slug'])
        if prev_post and prev_post.get('part_num'):
             post['previous_part_num'] = prev_post['part_num']
    if post.get('next_part_slug'):
        next_post = slug_to_post.get(post['next_part_slug'])
        if next_post and next_post.get('part_num'):
             post['next_part_num'] = next_post['part_num']

# 4. Finally, process each post to create its HTML file
for post in blog_posts:
    if "markdown_file" in post and post["markdown_file"]:
        md_filepath = Path("blog_posts") / post["markdown_file"]

        if md_filepath.exists():
            with md_filepath.open("r", encoding="utf-8") as f:
                markdown_content = f.read()
            post['detailed_content'] = markdown2.markdown(
                markdown_content, extras=["fenced-code-blocks", "code-friendly"]
            )

            post_output = post_template.render(post=post, **data)
            output_path = Path("posts") / f"{post['slug']}.html"
            with output_path.open("w", encoding="utf-8") as f:
                f.write(post_output)
        else:
            print(f"Warning: Markdown file not found for blog '{post['title']}': {md_filepath}")

# Update the main data dictionary with the sorted and processed posts
data['blogs'] = blog_posts

# Render the template with the data
html_output = index_template.render(**data)
resume_output = resume_template.render(**data)
projects_output = projects_template.render(**data)


# Collect all unique tags from all blog posts
all_tags = set()
for post in data.get("blogs", []):
    # We need to add the slugify function call here as well for the links to work
    for tech in post.get("core_technologies", []):
        all_tags.add(tech)

# Convert set to a sorted list for consistent order
sorted_tags = sorted(list(all_tags))


# Find and update the line below to pass the new 'tags' variable
blog_output = blog_template.render(tags=sorted_tags, **data)

# blog_output = blog_template.render(**data)

# Render the new contact page
contact_output = contact_template.render(**data)

# Render the new tech stack page
tech_stack_output = tech_stack_template.render(**data)

# Write the output to an HTML file
with Path("index.html").open("w", encoding="utf-8") as f:
    f.write(html_output)

with Path("resume.html").open("w", encoding="utf-8") as f:
    f.write(resume_output)

with Path("blog.html").open("w", encoding="utf-8") as f:
    f.write(blog_output)

with Path("contact.html").open("w", encoding="utf-8") as f:
    f.write(contact_output)

with Path("projects.html").open("w", encoding="utf-8") as f:
    f.write(projects_output)

with Path("tech-stack.html").open("w", encoding="utf-8") as f:
    f.write(tech_stack_output)

# Generate search index for client-side blog search
search_entries = []
for post in blog_posts:
    entry = {
        "title": post["title"],
        "slug": post["slug"],
        "date": post["publish_date"],
        "summary": post.get("content", ""),
        "tags": post.get("core_technologies", []) + post.get("keywords", []),
    }
    search_entries.append(entry)

search_index_js = "const SEARCH_INDEX = " + json.dumps(search_entries, indent=2) + ";\n"
with Path("js/search-index.js").open("w", encoding="utf-8") as f:
    f.write(search_index_js)

print("HTML files generated successfully!")
print("Individual blog posts have been generated in the 'posts' directory.")
print("Search index generated at js/search-index.js.")

# There are 18 keys in the JSON data that are used in the templates:
# name
# label
# image_path
# contact
# summary
# base_url
# social_links
# core_competencies
# work_experience
# volunteer_experience
# education
# technical_skills_categorized
# interests
# technologies_used
# languages
# references
# awards_certifications
# blogs

# Out of these 18 keys, the following keys are not used in any of the templates:
# volunteer_experience
# interests
# technologies_used ---> mostly redundant with technical_skills_categorized as a replacement and with more detailed breakdown
# references
# awards_certifications

# The following keys are used in the resume template:


# The following keys are used in the index/home template:


# The following keys are used in the blog template:
