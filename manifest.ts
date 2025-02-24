import { type ManifestV3Export } from '@crxjs/vite-plugin'

export const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: 'Ad Collector',
  version:  '1.0',
  action: {
    default_popup: 'index.html',
  },
 
  icons: {
    16: "icon-16.png",
    48: "icon-48.png",
    128: "icon-128.png"
  },

  background: {
    service_worker: 'src/service-worker.ts',
    type: 'module',


  },
  oauth2: {
    client_id: "990873631480-e44qmgo9vdh02gromjivpgidrrl2so21.apps.googleusercontent.com",
    scopes: [ "openid","email", "profile"]
  },
  key:"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArUBEZCNrb3N4uHy8Bw131wug9pzq7RAqhP9YG1Drd+BQbsrKnDq765OWcGACBonz7VsB8VMWrKLoDcb3SOZOAE8Eg6gCJP1XCXPXkMbmhIa7pKbtbrQYWX+1jt/wKezZpn0+pm4LJ6FMLWbjFBYtfcUvTb6PaLL2i0gzdzFwvB7zOx49RNozEDzT/li3pScO9J2uKsY89fEe0ws+rMoYR4p8hsHbla/GRlXYPGIigTjDEQZ2irUO70zc7GDXADYF8dcmDXd/4DAQUqnnJ/AfizPYK3qGQtFvxGezWrSU7ZA5OU+NW7rWCnjD4pFYalYbczFZBqt6iTd+909CbBC3tQIDAQAB",

 
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
    'alarms',
    "activeTab",
   


  ],
  content_scripts: [
    {       
    
      run_at: "document_start",
      js: ['src/content-scrpt.ts'],
      matches: ['https://www.youtube.com/*'],
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
    extension_pages: "script-src 'self' 'wasm-unsafe-eval' ; object-src 'self'  ",
    sandbox: "sandbox allow-scripts; script-src 'self'; object-src 'self'"
  }
  
}