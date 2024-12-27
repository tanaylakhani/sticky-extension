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
  style.textContent = `
    #react-root {
      position: fixed;
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
  `;
  shadowRoot.appendChild(style);

  document.body.appendChild(container);
  return reactContainer;
};

// Initialize React root and render the container
const container = createShadowContainer();
const root = createRoot(container);
root.render(<StickyNotesContainer />);
