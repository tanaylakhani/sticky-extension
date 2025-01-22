type CreateStickyMessage = {
  type: 'CREATE_STICKY';
  data: {
    text: string;
    position?: 'middle';
  };
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'createSticky',
    title: 'Create Sticky',
    contexts: ['page', 'selection'],
  });
});

chrome.contextMenus.onClicked.addListener(
  (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) => {
    if (info.menuItemId === 'createSticky' && tab?.id) {
      // Send message to content script with selected text
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
            const checkInterval = 1000; // 1 second

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
                resolve(''); // Give up after max attempts
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
            // Close the tab after message is sent
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

const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';

// Create the offscreen document if it doesn't exist
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

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === 'play_sound') {
    await setupOffscreenDocument();
    chrome.runtime.sendMessage({
      action: 'play_audio',
      sound: '/assets/sounds/bubble.wav',
    });
  }
});
