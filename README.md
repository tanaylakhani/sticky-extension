# Sticky Notes Chrome Extension

A Chrome extension that allows users to create draggable sticky notes anywhere on a webpage, with real-time synchronization to a backend server. Built with React and TypeScript.

## Features

- **Context Menu Integration**: Right-click anywhere on a webpage to create a sticky note
- **Drag and Drop**: Notes can be dragged around the page using their header
- **Live Coordinates**: Real-time display of note positions (x, y coordinates)
- **Text Selection**: Selected text automatically becomes note content
- **Multiple Notes**: Create and manage multiple notes simultaneously
- **Server Synchronization**: All notes are stored and synced with a backend server
- **URL-Specific Notes**: Notes are filtered and displayed based on the current webpage URL
- **Clean UI**: Modern, minimalist design with a familiar sticky note appearance

## Technical Implementation

### Architecture

- Built using React 18 with TypeScript
- Uses Shadow DOM for style isolation
- Implements Chrome Extension Manifest V3
- Real-time server synchronization
- URL-based note filtering

### Components

1. **Note Component** (`Note.tsx`)

   - Draggable functionality using react-draggable
   - Position tracking
   - Text input handling
   - Coordinate display

2. **StickyNotesContainer** (`StickyNotesContainer.tsx`)

   - State management for all notes
   - Server communication (fetch/create)
   - Handles Chrome message passing
   - URL-based note filtering
   - Real-time note updates

3. **Background Script** (`Background/index.ts`)

   - Context menu creation
   - Message passing to content script

4. **Content Script** (`Content/index.tsx`)
   - Shadow DOM setup
   - React initialization
   - Main container mounting

### API Integration

- **GET /api/notes/v2/extension**

  - Fetches all notes for current user
  - Filters notes by website URL
  - Returns note data including positions and content

- **POST /api/notes/v2/extension**
  - Creates new notes
  - Stores webpage-specific coordinates
  - Maintains note position data for both extension and web app

### Data Model

```typescript
interface Note {
  id: string;
  data: {
    id: string;
    type: 'note';
    position: { x: number; y: number };
    positionAbsolute: { x: number; y: number };
    position_on_webpage: { x: number; y: number };
    data: {
      content: string;
      color: string;
      title: string;
    };
  };
  websiteUrl: string;
}
```

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
4. Drag notes by their header
5. View real-time coordinates as you move notes
6. Notes persist across page reloads
7. Notes are specific to each webpage

## Technical Details

### State Management

- Server-driven state management
- Real-time synchronization
- URL-based note filtering
- Automatic refetching on updates

### Event Handling

- Context menu event capture
- Mouse events for dragging
- Chrome message passing
- Server communication

### Styling

- Isolated styles using Shadow DOM
- Modern, clean UI design
- Draggable interface
- Position-aware layout

## Future Enhancements

- Note persistence across browser sessions
- Customizable note colors
- Resizable notes
- Note minimization
- Export/Import functionality
- Keyboard shortcuts
- Real-time collaboration
- Note sharing between users

## Contributing

Feel free to submit issues and enhancement requests!
