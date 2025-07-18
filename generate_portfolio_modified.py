import json
from datetime import UTC, datetime
from pathlib import Path

from jinja2 import Environment, FileSystemLoader


def markdown_to_html(text):
    # Replace **text** with <strong>text</strong>
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

# Set up Jinja environment
env = Environment(loader=FileSystemLoader("."), autoescape=True)
index_template = env.get_template("index_template.html")
resume_template = env.get_template("resume_template.html")
blog_template = env.get_template("blog_template.html")

env.filters["markdown_to_html"] = markdown_to_html
env.filters["markdown_to_html_resume"] = markdown_to_html_resume

# Sort the blog posts by publish date
data["blogs"].sort(
    key=lambda x: datetime.strptime(x["publish_date"], "%Y-%m-%d"), reverse=True
)

# Render the template with the data
html_output = index_template.render(**data)
resume_output = resume_template.render(**data)
blog_output = blog_template.render(**data)


# This is equivalent to...
# html_output = index_template.render(name=data["name"], label=data["label"]...)
# resume_output = resume_template.render(name=data["name"], label=data["label"]...)
# blog_output = blog_template.render(name=data["name"], label=data["label"]...)


# Write the output to an HTML file
with Path("index.html").open("w", encoding="utf-8") as f:
    f.write(html_output)

with Path("resume.html").open("w", encoding="utf-8") as f:
    f.write(resume_output)

with Path("blog.html").open("w", encoding="utf-8") as f:
    f.write(blog_output)


print("HTML files generated successfully!")


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
