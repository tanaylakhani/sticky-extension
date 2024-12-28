import React from 'react';
import { createRoot } from 'react-dom/client';
import StickyNotesContainer from './components/StickyNotesContainer';

// Create a container for our React components with shadow DOM
const createShadowContainer = (): HTMLDivElement => {
  const container = document.createElement('div');
  container.id = 'sticky-notes-container';
  const shadowRoot = container.attachShadow({ mode: 'open' });

  // Create a container inside shadow DOM for React
  const reactContainer = document.createElement('div');
  reactContainer.id = 'react-root';
  shadowRoot.appendChild(reactContainer);

  // Inject styles into shadow DOM
  const style = document.createElement('style');
  // Include both container and note styles
  style.textContent = `
    #react-root {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2147483647;
    }
    #react-root > * {
      pointer-events: auto;
    }
    
    .sticky-note {
      position: absolute;
      width: 200px;
      min-height: 200px;
      background: #feff9c;
      padding: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      border-radius: 2px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 2147483647;
      user-select: none;
      display: flex;
      flex-direction: column;
    }

    .sticky-note.focused {
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .note-header {
      height: 20px;
      margin-bottom: 10px;
      cursor: move;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #666;
      background: rgba(0, 0, 0, 0.05);
      margin: -10px -10px 10px -10px;
      padding: 5px 10px;
      border-radius: 2px 2px 0 0;
    }

    .coordinates {
      font-family: monospace;
      padding: 2px 5px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 3px;
      user-select: none;
    }

    .close-button {
      background: none;
      border: none;
      color: #666;
      font-size: 18px;
      cursor: pointer;
      padding: 0 5px;
      line-height: 20px;
      transition: color 0.2s ease;
    }

    .close-button:hover {
      color: #000;
    }

    .editor-toolbar {
      display: flex;
      gap: 5px;
      padding: 5px 10px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      margin-top: auto;
    }

    .toolbar-button {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 5px;
      border-radius: 3px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toolbar-button:hover {
      background: rgba(0, 0, 0, 0.05);
      color: #000;
    }

    .toolbar-button.active {
      background: rgba(0, 0, 0, 0.1);
      color: #000;
    }

    .ProseMirror {
      outline: none;
      min-height: 100px;
      padding: 5px;
    }

    .ProseMirror p {
      margin: 0;
      line-height: 1.5;
    }

    .ProseMirror ul {
      padding-left: 20px;
      margin: 0;
    }

    .ProseMirror-focused {
      outline: none;
    }
  `;
  shadowRoot.appendChild(style);

  document.body.appendChild(container);
  return reactContainer;
};

// Initialize React root and render the container
const container = createShadowContainer();
const root = createRoot(container);
root.render(<StickyNotesContainer />);
