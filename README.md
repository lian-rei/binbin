# Binbin's Travels

A small HTML5 canvas platformer demo.

## GitHub Pages setup

This project is already structured as a static site, so it can be deployed directly to GitHub Pages.

### Steps

1. Push this repository to GitHub.
2. In the repo, open Settings > Pages.
3. Set Source to "GitHub Actions".
4. The workflow in `.github/workflows/deploy-pages.yml` will deploy the site automatically on pushes to `main`.

### Notes

- The site is served from the repository root, so `index.html` is the entry point.
- `assets/` and `src/` are loaded with relative paths, which works correctly on GitHub Pages.
- `.nojekyll` is included so GitHub Pages does not try to process the site with Jekyll.
