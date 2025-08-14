import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Sticky Notes',
    description: 'Notes for your browser',
    permissions: [
      'contextMenus',
      'tabs',
      'storage',
      'scripting',
      'offscreen'
    ],
    host_permissions: ['<all_urls>'],
    icons: {
      "16": "icon/16.png",
      "32": "icon/32.png", 
      "48": "icon/48.png",
      "128": "icon/128.png"
    },
    action: {
      default_icon: {
        "16": "icon/16.png",
        "32": "icon/32.png",
        "48": "icon/48.png",
        "128": "icon/128.png"
      }
    },
    web_accessible_resources: [
      {
        resources: ['assets/sounds/*'],
        matches: ['<all_urls>']
      }
    ]
  }
});
