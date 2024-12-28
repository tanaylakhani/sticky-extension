# Sticky Notes Chrome Extension

A Chrome extension that allows users to create draggable sticky notes anywhere on a webpage, with rich text editing capabilities and real-time synchronization to a backend server. Built with React, TypeScript, and TipTap.

## Features

- **Context Menu Integration**: Right-click anywhere on a webpage to create a sticky note
- **Rich Text Editing**: Full text formatting capabilities using TipTap editor
  - Bold, Italic, Underline formatting
  - Bullet lists
  - Placeholder text
  - Clean, minimal toolbar
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
- TipTap for rich text editing
- Real-time server synchronization
- URL-based note filtering

### Components

1. **Note Component** (`Note.tsx`)

   - Rich text editing with TipTap
   - Formatting toolbar integration
   - Draggable functionality
   - Position tracking
   - Coordinate display

2. **TipTap Component** (`Tiptap.tsx`)

   - Custom TipTap editor implementation
   - Rich text formatting
   - Focus handling
   - Content management

3. **StickyNotesContainer** (`StickyNotesContainer.tsx`)

   - State management for all notes
   - Server communication (fetch/create/delete)
   - Handles Chrome message passing
   - URL-based note filtering
   - Real-time note updates

4. **Background Script** (`Background/index.ts`)

   - Context menu creation
   - Message passing to content script

### API Integration

- **GET /api/notes/v2/extension**

  - Fetches all notes for current user
  - Filters notes by website URL
  - Returns note data including positions and content
  - Query parameter: `code`

- **POST /api/notes/v2/extension**

  - Creates new notes
  - Stores webpage-specific coordinates
  - Maintains note position data
  - Rich text content in TipTap format
  - Request body includes:
    - `code`
    - `note` object with position and content

- **DELETE /api/notes/v2/extension**
  - Deletes specific notes
  - Request body includes:
    - `code`
    - `noteId`

### Data Model

```typescript
// TipTap Content Structure
interface TipTapContent {
  type: string;
  content: Array<{
    type: string;
    content: Array<{
      type: string;
      text: string;
    }>;
  }>;
}

// Note Structure
interface Note {
  id: string;
  data: {
    id: string;
    type: 'note';
    position: { x: number; y: number };
    positionAbsolute: { x: number; y: number };
    position_on_webpage: { x: number; y: number };
    data: {
      content: TipTapContent;
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
4. Use the formatting toolbar to style your text
5. Drag notes by their header
6. View real-time coordinates as you move notes
7. Notes persist across page reloads
8. Notes are specific to each webpage
9. Click × to delete a note

## Technical Details

### State Management

- Server-driven state management
- Real-time synchronization
- URL-based note filtering
- Automatic refetching on updates
- Rich text state handling

### Event Handling

- Context menu event capture
- Mouse events for dragging
- Chrome message passing
- Server communication
- Rich text editing events

### Styling

- Isolated styles using Shadow DOM
- Modern, clean UI design
- Draggable interface
- Position-aware layout
- Rich text formatting styles

## Future Enhancements

- Note persistence across browser sessions
- Customizable note colors
- Resizable notes
- Note minimization
- Export/Import functionality
- Keyboard shortcuts
- Real-time collaboration
- Note sharing between users
- Additional rich text features
  - Links
  - Images
  - Code blocks
  - Tables

## Contributing

Feel free to submit issues and enhancement requests!
