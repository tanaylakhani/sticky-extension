console.log('This is the background page.');
console.log('Put the background scripts here.');

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'createSticky',
    title: 'Create Sticky',
    contexts: ['page', 'selection'], // This makes it appear on page right-click and when text is selected
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'createSticky') {
    chrome.tabs.sendMessage(tab.id, {
      type: 'CREATE_STICKY',
      data: {
        text: info.selectionText || '',
        position: {
          x: info.x,
          y: info.y,
        },
      },
    });
  }
});
