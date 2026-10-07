# Static portfolio validation

12 static integration checks passed on 2026-10-07T23:48:34.261Z.

Verified all three pages, metadata/font references, unique navigation indicators, 24 gallery cards, per-load shuffled order, responsive variants/eager/lazy loading, no-JS gallery fallback, service booking links, native FormSubmit email configuration, CAPTCHA/honeypot, form validation and plan preselection, preserved public motion code, removed runtime/editor/database/API code and zero package dependencies. All local link/image/script URLs resolve on both a domain root and /hawk-repository/ base path. Direct page refreshes work; removed endpoints return 404.

| Public file | Raw bytes | Gzip estimate |
|---|---:|---:|
| assets/site.css | 39032 | 9884 |
| assets/site.js | 8609 | 3373 |
| assets/gallery-init.js | 723 | 432 |
| assets/site-config.js | 256 | 222 |
| assets/vendor/lenis.mjs | 18714 | 5447 |

The shuffle check executes the real gallery script in a DOM simulation. The page checks run through a plain static HTTP server; there is no Worker or database. Source checks verify remaining interaction code and reduced motion. No external email was sent during these checks. Mailbox activation and receipt must be verified by the owner after the first FormSubmit submission. No browser control capability was available, so visual motion, clipboard success and real-device frame rates remain unverified. No GitHub repository or domain was changed by these local checks.
