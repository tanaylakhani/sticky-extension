type CreateStickyMessage = {
  type: 'CREATE_STICKY';
  data: {
    text: string;
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
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, {
      type: 'UPDATE_URL',
      data: { url: changeInfo.url },
    });
  }
});
