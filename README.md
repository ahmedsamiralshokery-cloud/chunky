# Chunky website — GitHub Pages

Static site (HTML + CSS + JS, no build step). Menu, offers, sauces and delivery areas live in `js/menu-data.js`.
The admin panel saves changes straight into that file on GitHub, so every customer sees them.

## 1) Put the site online
1. Create a new repository on GitHub (for example `chunky`).
2. Upload **everything in this folder** (so `index.html` is at the top level of the repo): Add file → Upload files → drag all files and folders (`css`, `js`, `img`, `icons`, `index.html`, `manifest.webmanifest`, `sw.js`, `.nojekyll`) → Commit.
3. Repository → Settings → Pages → Source: *Deploy from a branch* → Branch `main`, folder `/ (root)` → Save.
4. After about a minute the site is live at `https://YOUR-NAME.github.io/chunky/`.

## 2) Let the admin panel save to GitHub (one time)
1. GitHub → your profile picture → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token.
2. Repository access: *Only select repositories* → pick the Chunky repo.
3. Repository permissions → **Contents: Read and write**. Generate and copy the token.
4. Open the live site, scroll to the very bottom and tap the small **©** (it looks like a normal copyright sign).
5. Enter the admin password: `Chunky6`.
6. Open the **إعدادات GitHub** tab. Owner / repo / branch fill in automatically; paste the token. It is stored only in that browser.

## 3) Link preview (logo when you share the link)
The link preview image is `icons/og-image.jpg`. Facebook, WhatsApp, Telegram etc. need its full web address, which depends on your GitHub name, so it is filled in for you:
- **Automatic:** after you paste the token (step 2), press **✏️ حفظ على GitHub** once. It also writes your real site address into `index.html`.
- **Manual alternative:** edit `index.html` on GitHub and replace `__SITE_URL__` (4 places) with your site address ending in `/`, for example `https://YOUR-NAME.github.io/chunky/`.
After that, sharing the link shows the Chunky logo. WhatsApp and Facebook cache previews, so an old link may need a day or the Facebook Sharing Debugger to refresh.

## 4) Install as an app (PWA)
- **Android / Chrome / Edge:** open the site and tap **📲 تنزيل التطبيق** in the top bar (or the browser menu → Install app / Add to Home screen).
- **iPhone (Safari):** tap Share → **Add to Home Screen**. The **📲 تنزيل التطبيق** button shows these steps.
The app opens full screen with the Chunky icon and keeps working for the already-loaded menu when the connection is weak. Menu changes still arrive from GitHub.

## 5) Editing the menu
Tap **©**, enter the password, edit categories, items, prices, offers (with photos), sauces or delivery areas, then press **✏️ حفظ على GitHub**.
The change is committed to `js/menu-data.js` and shows for all customers in about a minute (GitHub Pages rebuild).

Menu item fields: name, description, price, number of sauces (`-1` = customer picks any number, priced per sauce), removable ingredients separated by `،`, and "سبايسي؟" (`1` = the customer is asked عادي or سبايسي). Offers have the same sauce and spicy fields.

## Good to know
- Change the admin password: run `echo -n "NewPassword" | sha256sum` and put the result in `PH` near the top of the admin section in `js/app.js`.
- Order WhatsApp number: search `201211211424` in `index.html` and `js/app.js`.
- In the GitHub tab, the repo field is just the repository name (for example `chunky`), not `owner/chunky`. The panel now accepts both, but a wrong name makes GitHub answer 404 and the browser shows "Failed to fetch".
- If saving fails, the message under the buttons says why (wrong token, missing Contents permission, wrong repo or branch name).
- Anyone who knows the admin password and has the token on their browser can edit the menu, so keep the token private.
