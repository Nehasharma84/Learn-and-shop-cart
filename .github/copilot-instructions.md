<!-- .github/copilot-instructions.md -->
# Copilot instructions for this repository

Purpose: help AI coding agents be immediately productive in this small static web project.

- Top-level overview
  - This is a small multi-page static website. Key pages live at the repository root:
    - `index.html`, `login.html`, `signup.html`, `dashboard.html`, `cart.html`.
  - Client-side logic is centralized in `script.js` and styling in `style.css`.
  - There is no server-side code or build system (no `package.json`, no tests, no CI configs detected).

- Big-picture architecture (what to assume and why)
  - Treat the project as a static client-side site. Changes should normally be limited to HTML, CSS, and `script.js`.
  - Data flows are browser-driven (forms and client JS). Because no backend is present, agents should not introduce server-only APIs unless asked.

- Key files to inspect first (order matters)
  1. `index.html` — landing page / main navigation.
 2. `login.html` / `signup.html` — authentication UI; look here for form names/ids if wiring client-side validation.
  3. `dashboard.html`, `cart.html` — post-login pages; check for expected DOM ids/classes before changing behavior.
  4. `script.js` — central place for DOM handlers, validation, storage logic.
  5. `style.css` — site-wide CSS rules and class naming patterns.

- Common patterns and project-specific conventions
  - Single, central script file: put DOM-ready handlers and small utilities in `script.js` rather than scattering inline scripts across many files.
  - Multi-page linking: pages are separate files (not a SPA). Add new pages by creating a new `.html` and linking it from the nav in `index.html`.
  - Keep markup and behavior separate: prefer editing `script.js` for behavior and `*.html` for structure.

- Developer workflows (how to run and test locally)
  - No build step. Serve files from a simple static server or open in browser for quick checks.
    - Quick PowerShell dev server (if Python is installed):

```powershell
python -m http.server 8000
```

    - Or use the VS Code Live Server extension to open `index.html`.
  - Testing: there are no automated tests. Validate manually in a browser and across a couple of view widths.

- Integration points & external dependencies
  - No external package manifests detected. If adding third-party libs, prefer adding them as local assets (e.g., `vendor/` or via CDN links in the HTML) and document additions in `README.md`.

- Editing guidelines for agents
  - Keep changes minimal and scoped. Example: to change login validation, edit `script.js` and update handler attached to the login form id/class—do not add a backend.
  - Preserve existing filenames/paths unless a refactor explicitly requires renaming; many pages reference each other by filename.
  - Add comments when introducing non-obvious client-side state (localStorage keys, timers, mock data shapes).

- Examples (concrete, minimal)
  - Wire a login form: open `login.html`, find the `<form id="loginForm">` (or similar), and add an event listener in `script.js` that prevents default, validates fields, and stores a minimal auth flag in localStorage (key name: `isLoggedIn` — document if you pick a different one).
  - Add a new page: create `newpage.html`, add a nav link in `index.html`, and include `<script src="script.js"></script>` if page requires behavior.

- What agents should NOT do
  - Do not add server-side code or assume an API exists unless the user asks for it.
  - Do not remove or rename pages without updating all cross-page links.

- Notes for reviewers / follow-ups
  - There is no README content currently—consider adding project intent and any runtime constraints.
  - If you'd like agent help scaffolding a dev server, tests, or a minimal README, mention which approach you prefer (pure static, lightweight Node server, or other).

Please review these instructions and tell me if you'd like me to (a) incorporate a preferred dev-server command, (b) add explicit examples using the current `script.js` code, or (c) expand into PR checklist items.
