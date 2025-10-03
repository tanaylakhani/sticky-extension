import React from 'react';
import { createRoot } from 'react-dom/client';
import StickyNotesContainer from './content/components/StickyNotesContainer';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    // Create a container for React components with shadow DOM
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
        style.textContent = `
    :host, #react-root { 
      -webkit-font-smoothing: antialiased; 
      -moz-osx-font-smoothing: grayscale; 
      text-rendering: optimizeLegibility; 
    }
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
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: transparent;
      border: none;
      box-shadow: none;
    }

    .note-content-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08);
      border: none;
      border-radius: 12px;
      transform-origin: center center;
      transform: scale(1) rotate(0deg);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .note-content-wrapper.dragging {
      transform: scale(0.75) rotate(-4deg);
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sticky-note * {
      color: inherit;
    }

    .note-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      margin: 0;
      border-radius: 12px 12px 0 0;
      background-color: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      flex-shrink: 0;
      cursor: grab;
      user-select: none;
    }

    .note-header:active {
      cursor: grabbing;
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
      margin-top: 8px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.3);
      min-width: 160px;
      max-width: 200px;
      max-height: 120px;
      z-index: 999999;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 4px;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .board-menu::-webkit-scrollbar {
      display: none;
    }

    .board-menu-item {
      width: 100%;
      padding: 10px 12px;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      color: #333;
      font-size: 14px;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .board-menu-item:hover {
      background-color: rgba(0, 0, 0, 0.08);
      transform: translateY(-1px);
    }

    .board-menu-item.active {
      background-color: rgba(107, 105, 249, 0.1);
      color: #6b69f9;
      font-weight: 600;
    }

    .board-menu-item.active:hover {
      background-color: rgba(107, 105, 249, 0.15);
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
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      margin-top: auto;
      flex-shrink: 0;
      background-color: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      border-radius: 0 0 12px 12px;
    }

    .toolbar-left {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .toolbar-right {
      display: flex;
      gap: 4px;
      align-items: center;
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

    .note-content-wrapper.focused {
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    /* Color-specific styles with dashboard design and border bottom effect */
    .sticky-note.GREEN .note-content-wrapper {
      background: linear-gradient(to right, rgba(172, 235, 191, 0.5), rgba(172, 235, 191, 0.4));
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.12), 
        0 2px 6px rgba(0, 0, 0, 0.08), 
        0 4px 0 0 #ACEBBF;
      color: #000000;
    }

    .sticky-note.BLUE .note-content-wrapper {
      background: linear-gradient(to right, rgba(161, 212, 250, 0.5), rgba(161, 212, 250, 0.4));
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.12), 
        0 2px 6px rgba(0, 0, 0, 0.08), 
        0 4px 0 0 #A1D4FA;
      color: #000000;
    }

    .sticky-note.RED .note-content-wrapper {
      background: linear-gradient(to right, rgba(255, 166, 126, 0.5), rgba(255, 166, 126, 0.4));
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.12), 
        0 2px 6px rgba(0, 0, 0, 0.08), 
        0 4px 0 0 #FFA67E;
      color: #000000;
    }

    .sticky-note.YELLOW .note-content-wrapper {
      background: linear-gradient(to right, rgba(255, 207, 124, 0.5), rgba(255, 207, 124, 0.4));
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.12), 
        0 2px 6px rgba(0, 0, 0, 0.08), 
        0 4px 0 0 #FFCF7C;
      color: #000000;
    }

    .sticky-note.PURPLE .note-content-wrapper {
      background: linear-gradient(to right, rgba(216, 184, 255, 0.5), rgba(216, 184, 255, 0.4));
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.12), 
        0 2px 6px rgba(0, 0, 0, 0.08), 
        0 4px 0 0 #D8B8FF;
      color: #000000;
    }

    .sticky-note.GRAY .note-content-wrapper {
      background: linear-gradient(to right, rgba(210, 220, 228, 0.5), rgba(210, 220, 228, 0.4));
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.12), 
        0 2px 6px rgba(0, 0, 0, 0.08), 
        0 4px 0 0 #D2DCE4;
      color: #000000;
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
    root.render(React.createElement(StickyNotesContainer));
  },
});
