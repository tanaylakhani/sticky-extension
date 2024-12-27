# Sticky Notes Chrome Extension

A Chrome extension that allows users to create draggable sticky notes anywhere on a webpage. Built with React and TypeScript.

## Features

- **Context Menu Integration**: Right-click anywhere on a webpage to create a sticky note
- **Drag and Drop**: Notes can be dragged around the page using their header
- **Live Coordinates**: Real-time display of note positions (x, y coordinates)
- **Text Selection**: Selected text automatically becomes note content
- **Multiple Notes**: Create and manage multiple notes simultaneously
- **Clean UI**: Modern, minimalist design with a familiar sticky note appearance

## Technical Implementation

### Architecture

- Built using React 18 with TypeScript
- Uses Shadow DOM for style isolation
- Implements Chrome Extension Manifest V3

### Components

1. **Note Component** (`Note.tsx`)

   - Draggable functionality
   - Position tracking
   - Text input handling
   - Coordinate display

2. **StickyNotesContainer** (`StickyNotesContainer.tsx`)

   - State management for all notes
   - Handles Chrome message passing
   - Manages note creation and deletion

3. **Background Script** (`Background/index.ts`)

   - Context menu creation
   - Message passing to content script

4. **Content Script** (`Content/index.tsx`)
   - Shadow DOM setup
   - React initialization
   - Main container mounting

## Development

### Prerequisites

- Node.js
- npm/yarn
- Chrome browser

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
4. Drag notes by their header
5. View real-time coordinates as you move notes
6. Close notes using the × button

## Technical Details

### State Management

- Uses React hooks for state management
- `useState` for notes collection and coordinates
- `useEffect` for event listeners and cleanup
- `useRef` for DOM manipulation

### Event Handling

- Context menu event capture
- Mouse events for dragging
- Chrome message passing

### Styling

- Isolated styles using Shadow DOM
- CSS modules for component styling
- Modern, clean UI design

## Future Enhancements

- Note persistence across page reloads
- Customizable note colors
- Resizable notes
- Note minimization
- Export/Import functionality
- Keyboard shortcuts

## Contributing

Feel free to submit issues and enhancement requests!
