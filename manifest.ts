import { type ManifestV3Export } from '@crxjs/vite-plugin'

export const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: 'Ad Collector',
  version: process.env.npm_package_version || '1.0.0',
  action: {
    default_popup: 'index.html',
  },

  background: {
    service_worker: 'src/service-worker.ts',
    type: 'module',


  },
  oauth2: {
    client_id: "852662586348-50t7sehl92p5m9vkb97rnggbcp5pvvgh.apps.googleusercontent.com",
    scopes: ["openid", "email", "profile",'https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/user.birthday.read','https://www.googleapis.com/auth/user.gender.read']
  },
 
  permissions: [
    'webRequest',
    'webNavigation',
    "identity",
    "identity.email",
    'activeTab',
    'declarativeNetRequest',
    'scripting',
    // This permission is need for redirecting
    'declarativeNetRequestWithHostAccess',
    'tabs',
    'unlimitedStorage',
    'storage',
    // This permission is needed for "Take a break" feature
    'alarms'


  ],
  content_scripts: [
    {       
    
      run_at: "document_end",
      js: ['src/content-scrpt.ts'],
      matches: ['https://*/*', 'http://*/*','http://www.google.com/robots.txt*'],
    },
  ],

  web_accessible_resources: [{
    resources: ['oauth2/lib/oauth2.html','index.html'],
    matches: ['<all_urls>']
  }],
  // Host permissions for all urls is needed because websites to block are determined by users.
  // Thus extension does not know which urls to block in advance
  host_permissions: ['<all_urls>'],
  content_security_policy: {
    extension_pages: "script-src 'self'  ; object-src 'self'",
    sandbox: "sandbox allow-scripts; script-src 'self'; object-src 'self'"
  }
  
}