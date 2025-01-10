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
          position: 'middle',
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
