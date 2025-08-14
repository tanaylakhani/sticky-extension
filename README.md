![Sticky Notes Banner](https://betterstacks.com/user_files/4301406/file/c41f20b469b92ef12fcebfaecc823093.png)

## Sticky Notes Browser Extension

Visit the product website: [thestickyapp.com](https://www.thestickyapp.com/)

Rich, draggable sticky notes on any website. Built with WXT + React, powered by the Sticky web app (see [Sticky](https://www.thestickyapp.com)). Create notes via context menu, a floating button, or the popup; format with TipTap; and add images. Audio feedback is handled via an offscreen document.

### Features
- **Create notes anywhere**: context menu (right‑click → Create Sticky), popup action, or floating "New Sticky" button.
- **Per‑page notes**: notes are scoped to the exact page URL.
- **Rich text editing**: TipTap (bold, italic, underline, bullet list, links).
- **Images**: upload to backend (Cloudinary endpoint) and insert into notes.
- **Draggable + size toggle**: move notes; toggle size (small/large); color themes.
- **Boards**: assign notes to boards from the note header.
- **Floating button**: draggable with snapping hotspots; can be toggled in popup settings.
- **Audio feedback**: offscreen document plays sounds on actions.
- **Shadow DOM injection**: styles are isolated from host pages.

### Tech stack
- **WXT** (MV3 tooling) with `@wxt-dev/module-react`
- **React 18** + **TypeScript**
- **TipTap** editor and extensions
- **motion** for the floating button, **react-draggable** for notes

### Prerequisites
- Bun 1.0+ (Node.js-compatible)
- Chrome/Chromium (MV3). Firefox is supported via scripts

### Install
```bash
bun install
```

### Development
```bash
# Chrome/Chromium
bun run dev

# Firefox
bun run dev:firefox
```
WXT runs a dev environment for the extension. If you prefer manual loading, use `chrome://extensions` → enable Developer Mode → Load unpacked → select `.output/chrome-mv3`.

### Build and package
```bash
# Production build
bun run build

# Zip for store upload
bun run zip

# Firefox builds
bun run build:firefox
bun run zip:firefox
```
Artifacts are output to `.output/*`.

### Getting started (seamless sign-in)
1. Install/run the extension.
2. Open the popup and click “Sign in with Sticky”. A tab opens to the Sticky login (Google by default). If you switch to Email/Password, the extension flag is preserved.
3. After successful login, the tab auto-closes and an in‑extension Welcome page opens. No manual code entry is required.
4. The popup will show your profile and boards automatically. Optional: toggle "Show Draggable Button" in settings.

### Auth flow (how it works)
- The popup opens `…/login/google?ext=1` (or credentials with `?ext=1`).
- The dashboard fetches a short‑lived extension code and redirects to `…/extension/code?ext=1&code=…`.
- The extension background reads `code` from the URL (no DOM scraping), saves it to `chrome.storage.local`, opens the in‑extension Welcome page, and closes the tab.
- The popup listens for the stored `code` and loads boards/profile. Logout clears the stored `code`.
- Switching to Email/Password preserves `?ext=1` and performs the same handoff on success.

### Usage
- **Create a note**
  - Right‑click → "Create Sticky" (uses selected text if any), or
  - Click the floating "New Sticky" button, or
  - Open the popup → "Create New Sticky".
- **Edit**: TipTap toolbar (bold, italic, underline, bullets). Insert images via the image button.
- **Move/Resize**: drag the note header; toggle size from the header.
- **Color/Board**: change color and assign board from the header menus.

### Configuration
- `constants.ts`
  - `IS_PRODUCTION` toggles base URLs.
  - `BASE_URL` and `API_BASE_URL` point to the Sticky web app and API.
- `wxt.config.ts` (MV3 manifest):
  - Permissions: `contextMenus`, `tabs`, `storage`, `scripting`, `offscreen`.
  - `host_permissions: ['<all_urls>']` enables injection on any page.

### Project structure
```
entrypoints/
  background.ts        # Context menu, tab listeners, offscreen audio, onboarding tab
  content.ts           # Injects React app into Shadow DOM
  content/components/
    StickyNotesContainer.tsx  # Orchestrates notes for current URL
    Note.tsx                  # Draggable TipTap note with toolbar, color/board/size
    NewStickyButton.tsx       # Floating draggable "New Sticky" button (motion)
    DraggableIcon.tsx         # Legacy floating button (react-draggable)
    Tiptap.tsx                # TipTap integration + image removal
  content/utils/
    imageUtils.ts, soundUtils.ts
popup/
  App.tsx, main.tsx, index.html, styles      # Popup UI (login, boards, settings)
services/api.ts         # Notes/boards/profile/image API calls
types.ts, enums.ts      # Shared types and enums
constants.ts            # BASE_URL and API_BASE_URL
public/                 # Icons, sounds
wxt.config.ts           # WXT + MV3 config
```

### Data and privacy
- Stored locally via `chrome.storage.local`:
  - `code` (auth code), `lastSelectedBoardId`, `showDraggableIcon`
  - Floating button position (localStorage)
- Notes, boards, profile fetched via `API_BASE_URL`.

### Troubleshooting
- **Signed in but no data**: open the popup and click “Sign in with Sticky” again; the Welcome screen should appear and the popup will refresh automatically.
- **Login tab doesn’t close**: the extension only proceeds when a valid `code` is present. If login was canceled, retry from the popup.
- **Floating button missing**: enable it in popup settings; it’s disabled on `thestickyapp.com`.
- **Audio not playing**: check offscreen permission; background sets up `offscreen.html` when needed.
- **Images won’t delete**: image delete relies on a Cloudinary `public_id` in the URL.

### Scripts
```json
{
  "dev": "wxt",
  "dev:firefox": "wxt -b firefox",
  "build": "wxt build",
  "build:firefox": "wxt build -b firefox",
  "zip": "wxt zip",
  "zip:firefox": "wxt zip -b firefox",
  "compile": "tsc --noEmit"
}
```

### Contributing
- Follow TypeScript types in `types.ts` and `enums.ts`.
- Prefer optimistic UI updates (see `StickyNotesContainer.tsx`).
- Keep styles inside the Shadow DOM where possible to avoid leaking into host pages.


