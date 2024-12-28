# Sticky Notes Chrome Extension

A Chrome extension that allows users to create draggable sticky notes anywhere on a webpage, with rich text editing capabilities and real-time synchronization to a backend server. Built with React, TypeScript, and TipTap.

## Features

- **Context Menu Integration**: Right-click anywhere on a webpage to create a sticky note
- **Rich Text Editing**: Full text formatting capabilities using TipTap editor
  - Bold, Italic, Underline formatting
  - Bullet lists
  - Placeholder text
  - Clean, minimal toolbar
- **Color Themes**:
  - Six beautiful color themes with matching text colors
  - Single-click color cycling (GREEN → BLUE → RED → YELLOW → PURPLE → GRAY)
  - Each color theme includes:
    - Matching text and icon colors
    - Subtle header background
    - Harmonious UI elements
- **Drag and Drop**: Notes can be dragged around the page using their header
- **Modern UI**:
  - Rounded corners and smooth shadows
  - Subtle animations and transitions
  - Consistent color theming throughout
  - Clean, minimalist design
- **Multiple Notes**: Create and manage multiple notes simultaneously
- **Server Synchronization**: All notes are stored and synced with a backend server
- **URL-Specific Notes**: Notes are filtered and displayed based on the current webpage URL
- **Image Support**: Upload and embed images directly in notes

## Technical Implementation

### Architecture

- Built using React 18 with TypeScript
- Uses Shadow DOM for style isolation
- Implements Chrome Extension Manifest V3
- TipTap for rich text editing
- Real-time server synchronization
- URL-based note filtering

### Components

1. **Note Component** (`Note.tsx`)

   - Rich text editing with TipTap
   - Color theme management
   - Formatting toolbar integration
   - Draggable functionality
   - Position tracking

2. **TipTap Component** (`Tiptap.tsx`)

   - Custom TipTap editor implementation
   - Rich text formatting
   - Focus handling
   - Content management

3. **StickyNotesContainer** (`StickyNotesContainer.tsx`)

   - State management for all notes
   - Server communication (fetch/create/delete/update)
   - Handles Chrome message passing
   - URL-based note filtering
   - Real-time note updates

4. **Background Script** (`Background/index.ts`)
   - Context menu creation
   - Message passing to content script

### Color Themes

```typescript
const colors = {
  GREEN: { bg: '#ACEBBF', text: '#2a5a35' },
  BLUE: { bg: '#A1D4FA', text: '#1a4971' },
  RED: { bg: '#FFA67E', text: '#8b3f1d' },
  YELLOW: { bg: '#FFCF7C', text: '#8b6534' },
  PURPLE: { bg: '#D8B8FF', text: '#5b3a80' },
  GRAY: { bg: '#D2DCE4', text: '#3e4e5e' },
};
```

### API Integration

- **GET /api/notes/v2/extension**

  - Fetches all notes for current user
  - Filters notes by website URL
  - Returns note data including positions and content

- **POST /api/notes/v2/extension**

  - Creates new notes
  - Updates existing notes
  - Stores webpage-specific coordinates
  - Maintains note position data
  - Rich text content in TipTap format

- **DELETE /api/notes/v2/extension**
  - Deletes specific notes

## Development

### Prerequisites

- Node.js
- npm/yarn
- Chrome browser
- Running backend server (localhost:3000)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Load the extension in Chrome:
   - Open Chrome
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `build` directory

### Usage

1. Right-click anywhere on a webpage
2. Select "Create Sticky" from the context menu
3. If text was selected, it will appear in the note
4. Click the color circle to change note color
5. Use the formatting toolbar to style your text
6. Drag notes by their header
7. Notes persist across page reloads
8. Notes are specific to each webpage
9. Click the trash icon to delete a note

## Contributing

Feel free to submit issues and enhancement requests!
