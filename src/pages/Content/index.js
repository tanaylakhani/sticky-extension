import React from 'react';
import { createRoot } from 'react-dom/client';
import Sticky from './components/Sticky';

// Create a container for our React components with shadow DOM
const createShadowContainer = () => {
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

// Initialize React root
const container = createShadowContainer();
const root = createRoot(container);

// Keep track of mounted stickies
const stickyNotes = new Map();
let stickyCounter = 0;

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CREATE_STICKY') {
    const id = `sticky-${stickyCounter++}`;

    const clickX = message.data.position.x;
    const clickY = message.data.position.y;

    const adjustedX = clickX - 10;
    const adjustedY = clickY - 10;

    stickyNotes.set(id, {
      position: { x: adjustedX, y: adjustedY },
      text: message.data.text || '',
    });

    root.render(
      <React.Fragment>
        {Array.from(stickyNotes.entries()).map(([noteId, noteData]) => (
          <Sticky
            key={noteId}
            position={noteData.position}
            initialText={noteData.text}
            onClose={() => {
              stickyNotes.delete(noteId);
              root.render(null);
              if (stickyNotes.size > 0) {
                root.render(
                  <React.Fragment>
                    {Array.from(stickyNotes.entries()).map(([id, data]) => (
                      <Sticky
                        key={id}
                        position={data.position}
                        initialText={data.text}
                        onClose={() => {
                          stickyNotes.delete(id);
                          root.render(null);
                        }}
                      />
                    ))}
                  </React.Fragment>
                );
              }
            }}
          />
        ))}
      </React.Fragment>
    );

    sendResponse({ success: true });
  }
});
