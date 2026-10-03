# NeoFolks Frontend, redesign V9

A multi-page static site. No icons, no emojis, no backend.

## Pages
- `index.html` home: next-event strip, fitted headline poster, text-only Saturn orbit, next-event ticket with live countdown, stats, reviews wall with an add-review form
- `about.html` drafting-grid page: values accordion, "no single lane" moving lanes, stacked mission bands
- `team.html` staggered roster of cut panels (initials until photos are supplied)
- `events.html` event lineup: a winding timeline with one event in focus as you scroll (upcoming first, then past), filterable (also via `events.html?filter=workshops`)
- `contact.html` pinned headline, big contact rows, copy-email button
- `join.html` the form written as a sentence

## Run
Open `index.html`, or from this folder: `python -m http.server 5500`, then visit http://localhost:5500.
`PREVIEW.html` is a single-file version of the whole site for quick sharing.

## Editing content (`js/data.js`)
- `technologies`: the orbit, in order
- `stats`: the three numbers on Home (also edit the matching markup in `index.html` if you change them)
- `team`: add `photo: "assets/team/name.jpg"` to a member to show a portrait instead of initials
- `reviews`: `name`, `year`, `course`, `text`. Shown on the Home reviews wall; add as many as you like (10 or more reads best).
- `events`: `iso` date, `cat` (workshops, seminars, competitions, community), `title`, `detail`.
  Upcoming vs past, the Home ticket and the countdown are worked out from today's date.

## Design system (`css/style.css`)
- Type: Host Grotesk (display and text) and JetBrains Mono (small labels), loaded from Google Fonts. Display sizes are deliberately modest; hero and footer wordmarks are capped in `NF.fit` (js/main.js).
- Colour: one dark palette on every page: black `#0a0a0a`, white type `#ffffff`, purple `#b572ec` used only for highlighted words (`<em class="pu">`), nothing else. Defined once in `:root` and the single `body[data-page]` rule in `css/style.css`.
- Orbit: a single 1px ring, drawn in `js/orbit.js` (`drawRing`).
- Shape: the chamfered corners come from the logo's M. Use `clip-path: var(--chamfer)`.

## Notes
- The Join form has no backend yet. On submit it opens a ready-to-send email to neofolks@nuvstudents.edu.
  Replace the `mailto` step in `NF.pages.join` (js/main.js) with a `fetch()` to your API when ready.
- The Hacktober Fest description is the placeholder from the content doc ("To conduct Hacktober Fest."). Replace it in `js/data.js` once the real blurb exists.
- The logo is white and purple on transparent, so it sits inside a dark chip in the header.

## Scroll features (js/main.js, `NF.scroll`)
Purple progress bar, back-to-top button, reveal-on-scroll, word-by-word scrub on the intro paragraphs, hero logo parallax, and the orbit nudges as you scroll (js/orbit.js). All switch off under prefers-reduced-motion.

## Reviews (js/main.js, `NF.reviews`)
The wall loops slowly and pauses on hover; it is a static list under prefers-reduced-motion. The "Add your review" form has no backend yet: a new review is saved in the visitor's browser (localStorage) and appears on their wall only. To collect reviews for everyone, POST the review object at the marked line in the submit handler and load approved reviews into `reviews` in `js/data.js`. Review text is always inserted as plain text, never HTML.

## Events timeline (js/main.js, `NF.timeline`)
The curve is an SVG drawn from the position of each card's node, so it adapts to any number of events and to mobile (straight line down the left edge). The card nearest the middle of the screen is in focus; click a blurred card to bring it to the middle.
