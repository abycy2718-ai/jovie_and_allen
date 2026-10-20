# Jovie & Allen — All the little things

A small photo website built with plain HTML, CSS, and JavaScript. Open `index.html` in a current browser to preview it. Everything is local: the website uses system fonts and bundled illustrations, with no third-party scripts or image services.

## Folder structure

```text
jovie-and-allen/
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

## Personalize the page

Edit `index.html` for the headline, album descriptions, and footer. Edit `LITTLE_NOTE` near the top of `script.js` for the message inside the envelope. Edit the CSS variables at the top of `styles.css` for colors.

The site includes floating photo covers, hover and scroll animations, album filters, browser-local favorites, a random-memory button, a day/evening theme, and an opening envelope. The photo viewer supports arrow keys, Escape, and horizontal touch swipes. The footer has an animation toggle, and the page respects the device's reduced-motion preference.

## Publish on GitHub Pages

Unzip the download first. Upload the **contents** of `jovie-and-allen/` to your repository, with `index.html` directly in the repository root. Upload the actual files and photo folders, rather than the ZIP itself.

In the repository, open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select your branch (usually `main`) and **/(root)**, then save. Open the site address displayed in the Pages settings when deployment finishes. Commit later photo and code changes to the same branch to publish updates.

GitHub's publishing instructions:

```text
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
```

## Sharing and privacy

Treat an ordinary GitHub Pages deployment as a public album. GitHub warns that Pages websites can be publicly accessible even when their source repositories are private. Choose photos and text you are comfortable publishing.

This is a static site. Add and update shared photographs through the repository. The heart button saves a selection only in the current browser; it does not upload a photo, create a shared account, or synchronize favorites between you. When browser storage is restricted, favorites still work for the current visit. Clearing browser data can remove saved selections and appearance preferences.

The standalone HTML preview supplied separately contains the same starter design with assets embedded. The folder version is easier to maintain as your real photo collection grows.
