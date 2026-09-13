# Md. Sajid Alam Chowdhury

Personal academic website for Md. Sajid Alam Chowdhury, a Computer Science PhD student at Wayne State University working on trustworthy multimodal AI, privacy-aware vision-language reasoning, adversarial robustness, and long-horizon video understanding.

Live site: https://sajid-alam-chowdhury.github.io/

## Contents

- `index.html` - main homepage with profile, news, research, publications, education, experience, coding, awards, extras, and contact
- `publications.html` - full publication list with filters and links
- `publications/` - individual publication detail pages with abstracts, BibTeX, DOI, PDF, and official links
- `research.html`, `projects.html`, `updates.html`, `cv.html` - supporting pages
- `assets/` - CSS, JavaScript, images, logos, and curriculum vitae PDF
- `sitemap.xml`, `robots.txt`, `.nojekyll` - GitHub Pages and search engine support

## Local Preview

Run from the repository root:

```bash
python3 -m http.server 8000 --bind 0.0.0.0
```

Then open:

```text
http://localhost:8000/
```

## Deployment

This is a static GitHub Pages site served from the `main` branch root.

To publish updates:

```bash
git add .
git commit -m "Update website"
git push
```

GitHub Pages will rebuild automatically after the push.
