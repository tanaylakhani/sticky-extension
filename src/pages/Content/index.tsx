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

    .sticky-note textarea {
      width: 100%;
      height: calc(100% - 30px);
      border: none;
      background: transparent;
      resize: none;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.4;
      color: #333;
      user-select: text;
    }

    .sticky-note textarea:focus {
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
