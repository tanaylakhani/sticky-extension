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
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 200px;
      padding: 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .sticky-note * {
      color: inherit;
    }

    .note-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 12px;
      cursor: move;
      margin: 0;
      border-radius: 12px 12px 0 0;
      background-color: rgba(0, 0, 0, 0.05);
      flex-shrink: 0;
    }

    .note-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .board-menu-container {
      position: relative;
    }

    .board-menu-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .board-menu-button:hover {
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.05);
    }

    .board-menu {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 4px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      min-width: 150px;
      z-index: 1000;
      overflow: hidden;
    }

    .board-menu-item {
      width: 100%;
      padding: 8px 12px;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      color: #333;
      transition: background-color 0.2s;
    }

    .board-menu-item:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .board-menu-item.active {
      background-color: rgba(0, 0, 0, 0.1);
      font-weight: 500;
    }

    .color-picker-button {
      width: 20px;
      height: 20px;
      opacity: 0.8;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      padding: 4px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .color-picker-button:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .close-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .close-button:hover {
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.05);
    }

    .close-button svg {
      color: inherit;
    }

    .editor-toolbar {
      display: flex;
      gap: 4px;
      padding: 8px 12px;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      margin-top: auto;
      flex-shrink: 0;
      background-color: inherit;
      border-radius: 0 0 12px 12px;
    }

    .toolbar-button {
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      border-radius: 4px;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .toolbar-button svg {
      color: inherit;
    }

    .toolbar-button:hover {
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.05);
    }

    .toolbar-button.active {
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.1);
    }

    .ProseMirror {
      flex-grow: 1;
      overflow-y: auto;
      min-height: 0;
      padding: 12px;
      margin-bottom: 0;
      color: inherit;
    }

    .ProseMirror:focus-visible {
      outline: none;
    }

    .ProseMirror img {
      max-width: 180px;
      height: auto;
      border-radius: 4px;
      margin: 4px 0;
      display: block;
    }

    .ProseMirror img.selected {
      border: 2px solid currentColor;
    }

    .ProseMirror p {
      margin: 0;
      line-height: 1.5;
    }

    .ProseMirror ul {
      padding-left: 20px;
      margin: 4px 0;
    }

    .ProseMirror li {
      margin: 2px 0;
    }

    .ProseMirror-placeholder {
      color: currentColor;
      opacity: 0.5;
      pointer-events: none;
    }

    .focused {
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    /* Color-specific styles with text/icon colors */
    .sticky-note.GREEN {
      background-color: #acebbf;
      color: #2a5a35;
    }

    .sticky-note.BLUE {
      background-color: #a1d4fa;
      color: #1a4971;
    }

    .sticky-note.RED {
      background-color: #ffa67e;
      color: #8b3f1d;
    }

    .sticky-note.YELLOW {
      background-color: #ffcf7c;
      color: #8b6534;
    }

    .sticky-note.PURPLE {
      background-color: #d8b8ff;
      color: #5b3a80;
    }

    .sticky-note.GRAY {
      background-color: #d2dce4;
      color: #3e4e5e;
    }

    /* Add size classes */
    .resize-button-container {
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
    }

    .resize-button {
      background: none;
      border: none;
      opacity: 0.6;
      cursor: pointer;
    }

    .resize-button-container:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .sticky-note.small {
      height: 15rem;  /* 60 * 0.25rem */
      width: 15rem;
    }

    .sticky-note.large {
      height: 20rem;  /* 80 * 0.25rem */
      width: 20rem;
    }

    @media (min-width: 768px) {
      .sticky-note.large {
        height: 24rem;  /* 96 * 0.25rem */
        width: 24rem;
      }
    }

    .color-menu-container {
      position: relative;
    }

    .color-menu {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 8px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      padding: 8px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      z-index: 1000;
    }

    .color-menu-item {
      width: 20px;
      height: 20px;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      padding: 0;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .color-menu-item:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .color-menu-item.active {
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(0, 0, 0, 0.2);
    }

    .editor-container {
      max-height: 100%;
      overflow-y: auto;
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
