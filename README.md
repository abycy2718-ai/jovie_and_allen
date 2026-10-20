# Jovie & Allen — All the little things

A small photo website built with plain HTML, CSS, and JavaScript. No package installation or build step is needed. Everything is local: the website uses system fonts and bundled illustrations, with no third-party scripts or image services.

## Folder structure

```text
jovie_and_allen/
├── index.html         # Page structure and wording
├── styles.css         # Appearance, responsive layout, and animation
├── script.js          # Your photo list first; website behavior below
├── README.md          # These instructions
├── .nojekyll          # Empty deployment flag for static hosting
└── photos/
    ├── jovie/         # Jovie's photographs
    ├── allen/         # Allen's photographs
    └── together/      # Photographs of you together
```

Each photo folder contains `01.svg`, `02.svg`, and `03.svg`: clearly labeled sample illustrations. They are placeholders, not photographs of either of you.

## Preview locally

From the repository root, run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/` in a current browser. Stop the server with Ctrl+C. You can also open `index.html` directly, but an HTTP preview is closer to GitHub Pages and gives browser storage a consistent origin for favorites and preferences.

Keep the stylesheet, script, and photo paths relative, such as `styles.css` and `photos/jovie/01.svg`. A leading slash, such as `/photos/...`, would skip the repository subpath on GitHub Pages.

## Add your photographs

Put a JPG, PNG, or WebP image into the appropriate photo folder. Use a descriptive filename, such as `coffee-date.jpg`.

Open `script.js`. At the very top, `ALBUMS` contains three lists: `jovie`, `allen`, and `together`. Replace an existing entry or add another object to the appropriate list:

```javascript
{
  src: "photos/together/coffee-date.jpg",
  title: "Coffee, with you",
  caption: "A little moment worth keeping.",
  alt: "Jovie and Allen sitting together at a café",
  date: "",
  location: "",
  demo: false,
},
```

Use captions and alternative text that describe your actual image. `src` and `title` are the main fields. `caption`, `alt`, `date`, and `location` can be edited or omitted. The date is a display label; for example, `"October 2026"`. Keep entries separated by commas. The order in the list is the display order.

The first image in each album automatically becomes that album's cover at the top of the page. To adjust a thumbnail crop, add `position: "center 30%"` to its entry. The full-screen viewer shows the whole image.

Set `demo: false` or remove the `demo` property for your own photos. This removes the sample-art label. The general illustration notice disappears once the displayed photos all have `demo` turned off.

Match file extensions and capitalization exactly. A new file must also be listed in `script.js`; the website uses this explicit list rather than discovering folder contents. Keep paths relative (`photos/...`), so the site works inside a GitHub repository's subdirectory. Use a unique image path within each album. Favorites identify photos by album and path, so renaming a file creates a new favorite identity.

For easier uploads and faster viewing, consider exporting photographs around 1600–2400 pixels on their longest side. Keep the originals separately. Review both visible details and embedded location metadata before publishing personal photos.

Commit both the image files and the matching `script.js` entries. Preview the affected album and viewer, then merge the photo changes into `main` through a pull request to publish them. Keep existing photos you still want to display.

## Personalize the page

Edit `index.html` for the headline, album descriptions, and footer. Edit `LITTLE_NOTE` near the top of `script.js` for the message inside the envelope. Edit the CSS variables at the top of `styles.css` for colors.

The site includes floating photo covers, hover and scroll animations, album filters, browser-local favorites, a random-memory button, a day/evening theme, and an opening envelope. The photo viewer supports arrow keys, Escape, and horizontal touch swipes. The footer has an animation toggle, and the page respects the device's reduced-motion preference.

## Publish on GitHub Pages

The website files belong directly in the repository root, as shown above. Keep the hidden, empty `.nojekyll` file there so GitHub Pages serves the site without Jekyll processing. Publish the files and photo folders, rather than the ZIP archive. No custom domain, dependency installation, or build workflow is required.

1. Review the pull request and merge it into `main` when you are ready to publish. Confirm that `main` contains `index.html`, `styles.css`, `script.js`, `.nojekyll`, and the `photos/` folders at the root.
2. On GitHub, open the `abycy2718-ai/jovie_and_allen` repository, then **Settings → Pages**. You need permission to change repository settings.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Under **Branch**, choose **main** and **/ (root)**, then click **Save**. GitHub may display the folder option as **/(root)**.
5. Open the repository's **Actions** tab and wait for the **pages build and deployment** run to finish successfully. If it fails, open the run to inspect the error.
6. Return to **Settings → Pages** and open the site address shown there. With the standard GitHub Pages address, this repository's site is `https://abycy2718-ai.github.io/jovie_and_allen/`. The address shown in Pages settings is authoritative if repository or domain settings change.
7. Check the published page on desktop and mobile, including the three albums, photo viewer, favorites, theme switch, and note. This final check verifies the actual GitHub deployment.

Later photo and code changes publish automatically after they reach `main`. Keep `.nojekyll` and the relative asset paths in future changes. Repository settings must be changed manually; a pull request cannot select the Pages publishing source or branch.

If Pages is unavailable in Settings, check your repository permissions and whether its visibility and GitHub plan support Pages before changing either setting.

See GitHub's [instructions for configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Sharing and privacy

Treat an ordinary GitHub Pages deployment as a public album. GitHub warns that Pages websites can be publicly accessible even when their source repositories are private. Choose photos and text you are comfortable publishing.

This is a static site. Add and update shared photographs through the repository. The heart button saves a selection only in the current browser; it does not upload a photo, create a shared account, or synchronize favorites between you. When browser storage is restricted, favorites still work for the current visit. Clearing browser data can remove saved selections and appearance preferences.
