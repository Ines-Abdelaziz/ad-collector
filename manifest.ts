import { type ManifestV3Export } from '@crxjs/vite-plugin'

export const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: 'Ad Collector',
  version: process.env.npm_package_version || '1.0.0',
  action: {
    default_popup: 'index.html',
  },

  background: {
    service_worker: 'src/background/background.ts',
    type: 'module',
  },
 
  permissions: [
    'activeTab',
    'declarativeNetRequest',
    'scripting',
    // This permission is need for redirecting
    'declarativeNetRequestWithHostAccess',
    'tabs',
    'unlimitedStorage',
    'storage',
    // This permission is needed for "Take a break" feature
    'alarms',
  ],
  content_scripts: [
    {       
      js: ['src/content-scrpt.ts'],
      matches: ['https://*/*', 'http://*/*'],
    },
  ],

  // Host permissions for all urls is needed because websites to block are determined by users.
  // Thus extension does not know which urls to block in advance
  host_permissions: ['<all_urls>'],
}