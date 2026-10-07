# Hawk — static GitHub Pages portfolio

This is the finished portfolio as plain HTML, CSS and JavaScript. **Upload it directly to GitHub Pages.** No build, installation, account secrets, database, Cloudflare subscription or self-hosted backend is required. Email submissions use FormSubmit’s hosted service.

Work, Services and Hire Me retain the existing design, responsive layouts, gradients, continuous rotating headline, trusted creator links, +99 stack tile, hover motion, per-load randomized gallery, optimized images, scroll reveals, smooth wheel scrolling and Discord copying. There is no React runtime, admin login, five-click shortcut, upload/delete editor, database, API, thumbnail lightbox, public filtering or sorting code.

## Replace your existing repository

1. Back up the old repository: on GitHub choose **Code → Download ZIP**, or create a backup branch. Keep your existing `CNAME` file if your current Pages site uses `hawkpsd.com`.
2. Extract `Hawk-GitHub-Pages.zip`. Upload the **contents**, with `index.html` directly at the repository root. Do not upload the ZIP itself or put everything inside an extra Hawk folder.
3. Replace the old site files with these files. Remove the old application/build files and obsolete Pages deployment workflows so two different builds do not compete. Keep the existing `CNAME` and `.git` directory if working from a local clone.
4. In the repository go to **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main → Folder: /(root) → Save**. Use your actual default branch if it is named differently. No custom GitHub Actions build is needed.
5. Wait for the Pages deployment to finish, then open **Visit site**. Leave your existing custom-domain and DNS settings in place if this same repository already serves `hawkpsd.com`.

GitHub Desktop is the easiest way to replace everything cleanly: clone the existing repository, replace its files in the local folder, commit the changes, then Push origin. GitHub's **Add file → Upload files** also works; drag the extracted files/folders, not their parent directory. Make sure `.nojekyll` is included. GitHub Desktop is preferable for a larger collection of image files.

The relative asset/navigation paths work on both `https://hawkpsd.com/` and `https://USERNAME.github.io/REPOSITORY/`. Services and Hire Me live at `services/index.html` and `hire/index.html`. No SPA rewrite or server route is needed. If publishing to a different permanent domain, update the canonical/OpenGraph URLs in the three HTML pages, `sitemap.xml`, `robots.txt` and the 404 home link.

Reference: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Update thumbnails by replacing files

The display images are in `gallery/`, with `-480.webp`, `-800.webp` and `-1280.webp` variants. To replace an existing thumbnail, upload the three replacement exports **using exactly the same filenames**. It will appear automatically after GitHub Pages republishes. Use 16:9 images at 480×270, 800×450 and 1280×720.

To remove a thumbnail, remove its `<div class="thumbnail-card">…</div>` block from the main `#thumbnail-gallery` in `index.html`, and its matching block inside `<noscript>`. You may then delete the three unused image files.

To add a thumbnail, copy an existing card block in both those places, change the `data-src` / `data-srcset` paths (plain `src` / `srcset` inside noscript), and write useful `alt` text. The public gallery has no visible captions. There are no creator/genre/sort settings to maintain. Its script shuffles the available blocks on each fresh load and sets the first four eager; the rest remain lazy. It runs immediately after gallery parsing before requesting images, avoiding an image/order flash. The noscript fallback remains a normal ordered gallery.

Full-resolution originals are excluded from the hosting package because the public gallery no longer enlarges images. Keep your source originals separately. There is no automatic upload optimizer now; export the three WebP sizes before replacing them. For a quick replacement, overwriting the existing optimized files is enough.

## Contact form email delivery

The Hire Me form submits directly to **FormSubmit**, which emails project inquiries to **haydenayotte1313@gmail.com**. It uses a regular HTML POST, so it works on GitHub Pages and without JavaScript. No email keys or server code are needed. The sender’s email is included for replies, with a clear subject and a table-formatted message. FormSubmit’s default CAPTCHA stays enabled, and an invisible honeypot helps reduce spam. Visitors see FormSubmit’s confirmation page after submitting.

**One-time activation:** Open the published Hire Me page, submit a test inquiry, then click FormSubmit’s activation link in the email sent to your Gmail inbox. Check Spam if necessary. Send another test afterward to verify receipt. Delivery cannot be confirmed before this mailbox activation is completed. If you change the destination email in the form’s `action`, activate the new address as well.

To change the recipient, edit the `action="https://formsubmit.co/haydenayotte1313@gmail.com"` on the form in `hire/index.html`. Keep `method="POST"`. To change the email subject, edit the hidden `_subject` input. FormSubmit handles submission/verification/error pages; no local API is used. Discord and X remain the best direct contact methods.

Documentation: https://formsubmit.co/ and https://formsubmit.co/documentation

Edit public handles, X URL, trust text and rotating words in `assets/site-config.js`. Edit fixed copy, plan details and metadata directly in the HTML pages. There are no passwords, secret keys or private records in this package.

## Files

- `index.html`: Work / homepage and gallery.
- `services/index.html`: service plans and FAQs.
- `hire/index.html`: email contact form and direct contacts.
- `assets/site.css`: existing visual design, responsive rules and CSS motion.
- `assets/site.js`: small public interaction script.
- `assets/gallery-init.js`: immediate gallery shuffle/image initialization.
- `assets/site-config.js`: editable public settings.
- `assets/vendor/lenis.mjs`: self-hosted Lenis 1.3.26, MIT licensed; the only runtime library.
- `gallery/`, `creators/`, `brand/`, `fonts/`: optimized visual assets and self-hosted font.
- `favicon*`, `apple-touch-icon-v2.png`: compressed Hawk browser icons.
- `.nojekyll`, `robots.txt`, `sitemap.xml`, `404.html`: static hosting and SEO files.

## Optional local tools

Node 22+ is only needed for these optional tools. No package installation is needed.

```sh
node scripts/preview.mjs
node tests/static.mjs
node scripts/build.mjs
```

Preview at http://localhost:4173/. The build command just copies public files into `dist/` for the private review host; **the repository-root files are already deployable on GitHub Pages**. The download excludes internal hosting metadata, local state and optional tests/tools. There is no worker/server in the production output.

`TEST_RESULTS.md` records the checks and their limits. This task does not replace your real GitHub repository or change domain settings automatically.
