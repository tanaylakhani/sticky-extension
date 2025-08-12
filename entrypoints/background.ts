import { BASE_URL } from '../constants';

export type CreateStickyMessage = {
  type: 'CREATE_STICKY';
  data: {
    text: string;
    position?: 'middle';
  };
};

export default defineBackground(() => {
  // Context menu setup
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'createSticky',
      title: 'Create Sticky',
      contexts: ['page', 'selection'],
    });
  });

  // Context menu click handler
  chrome.contextMenus.onClicked.addListener(
    (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) => {
      if (info.menuItemId === 'createSticky' && tab?.id) {
        const message: CreateStickyMessage = {
          type: 'CREATE_STICKY',
          data: {
            text: info.selectionText || '',
          },
        };

        chrome.tabs.sendMessage(tab.id, message);
      }
    }
  );

  // Tab update listener
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (!changeInfo.url) return;

    if (changeInfo?.url?.includes('/extension/code')) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          func: () => {
            return new Promise((resolve) => {
              let attempts = 0;
              const maxAttempts = 10;
              const checkInterval = 1000;

              const checkForElement = () => {
                const element = document.querySelector(
                  '#sticky-chrome-extension-code'
                );
                if (element) {
                  resolve(element.textContent || '');
                } else if (attempts < maxAttempts) {
                  attempts++;
                  setTimeout(checkForElement, checkInterval);
                } else {
                  resolve('');
                }
              };

              checkForElement();
            });
          },
        },
        (results) => {
          const code = results?.[0]?.result || '';
          chrome.tabs.sendMessage(
            tabId,
            {
              type: 'CODE_DETECTED',
              data: { code },
            },
            () => {
              chrome.tabs.remove(tabId);
            }
          );
        }
      );
    }

    chrome.tabs.sendMessage(tabId, {
      type: 'UPDATE_URL',
      data: { url: changeInfo.url },
    });
  });

  // Offscreen document setup for audio
  const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';

  async function setupOffscreenDocument() {
    const existingContexts = await (chrome as any).runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
    });

    if (existingContexts.length > 0) return;

    await (chrome as any).offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Playing audio on button click',
    });
  }

  // Message listener for audio playback
  chrome.runtime.onMessage.addListener(async (message) => {
    if (message.action === 'play_sound') {
      await setupOffscreenDocument();
      chrome.runtime.sendMessage({
        action: 'play_audio',
        sound: message.sound,
      });
    }
  });

  // Open extension page on install
  chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.create({
      url: `${BASE_URL}/extension/code`,
    });
  });
});
