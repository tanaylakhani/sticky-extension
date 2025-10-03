import { BASE_URL } from '../constants';
import { defineBackground } from 'wxt/utils/define-background';

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
    (info: any, tab: any) => {
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
  chrome.tabs.onUpdated.addListener(function (tabId: number, changeInfo: any) {
    if (!changeInfo.url) return;

    // Try to extract code directly from URL params (no DOM injection → no flicker)
    if (changeInfo.url.includes('/extension/code')) {
      try {
        const url = new URL(changeInfo.url);
        const codeParam = url.searchParams.get('code')?.trim();
        if (codeParam) {
          chrome.storage.local.set({ code: codeParam });

          chrome.tabs.sendMessage(tabId, {
            type: 'CODE_DETECTED',
            data: { code: codeParam },
          });

          const welcomeUrl = chrome.runtime.getURL('welcome.html');
          chrome.tabs.create({ url: welcomeUrl }, () => chrome.tabs.remove(tabId));
        }
      } catch {}
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
  chrome.runtime.onMessage.addListener(async (message: any) => {
    if (message.action === 'play_sound') {
      await setupOffscreenDocument();
      chrome.runtime.sendMessage({
        action: 'play_audio',
        sound: message.sound,
      });
    }
  });

  // Open login page on install (extension-aware)
  chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.create({
      url: `${BASE_URL}/login/google?ext=1`,
    });
  });
});
