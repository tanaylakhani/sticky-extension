type CreateStickyMessage = {
  type: 'CREATE_STICKY';
  data: {
    text: string;
  };
};

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'createSticky',
    title: 'Create Sticky',
    contexts: ['page', 'selection'],
  });
});

// Handle context menu clicks
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
