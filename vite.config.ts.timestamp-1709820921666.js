// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";

// manifest.ts
var manifest = {
  manifest_version: 3,
  name: "Ad Collector",
  version: process.env.npm_package_version || "1.0.0",
  action: {
    default_popup: "index.html"
  },
  icons: {
    16: "icon-16.png",
    48: "icon-48.png",
    128: "icon-128.png"
  },
  background: {
    service_worker: "src/service-worker.ts",
    type: "module"
  },
  oauth2: {
    client_id: "852662586348-50t7sehl92p5m9vkb97rnggbcp5pvvgh.apps.googleusercontent.com",
    scopes: ["openid", "email", "profile", "https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/user.birthday.read", "https://www.googleapis.com/auth/user.gender.read", "https://www.googleapis.com/auth/user.addresses.read"]
  },
  permissions: [
    "webRequest",
    "webNavigation",
    "identity",
    "identity.email",
    "activeTab",
    "declarativeNetRequest",
    "scripting",
    "declarativeNetRequestWithHostAccess",
    "tabs",
    "unlimitedStorage",
    "storage",
    "alarms"
  ],
  content_scripts: [
    {
      run_at: "document_start",
      js: ["src/content-scrpt.ts"],
      matches: ["https://*/*", "http://*/*", "http://www.google.com/robots.txt*"]
    }
  ],
  web_accessible_resources: [{
    resources: ["oauth2/lib/oauth2.html", "index.html"],
    matches: ["<all_urls>"]
  }],
  host_permissions: ["<all_urls>"],
  content_security_policy: {
    extension_pages: "script-src 'self'  ; object-src 'self'",
    sandbox: "sandbox allow-scripts; script-src 'self'; object-src 'self'"
  }
};

// vite.config.ts
import { inject } from "rollup-plugin-inject";
var vite_config_default = defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    rollupOptions: {
      plugins: [inject({ Buffer: ["Buffer", "Buffer"] })]
    }
  },
  optimizeDeps: {
    exclude: ["puppeteer"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAibWFuaWZlc3QudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgeyBjcnggfSBmcm9tICdAY3J4anMvdml0ZS1wbHVnaW4nXG5pbXBvcnQgeyBtYW5pZmVzdCB9IGZyb20gJy4vbWFuaWZlc3QnXG5pbXBvcnQgeyBpbmplY3QgfSBmcm9tICdyb2xsdXAtcGx1Z2luLWluamVjdCcgLy8gSW1wb3J0IHRoZSAnaW5qZWN0JyBmdW5jdGlvblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgICBwbHVnaW5zOiBbcmVhY3QoKSwgY3J4KHsgbWFuaWZlc3QgfSldLFxuICAgIGJ1aWxkOiB7XG4gICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgICAgIHBsdWdpbnM6IFtpbmplY3QoeyBCdWZmZXI6IFsnQnVmZmVyJywgJ0J1ZmZlciddIH0pXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgICBleGNsdWRlOiBbJ3B1cHBldGVlciddXG4gICAgICB9XG59KVxuXG5cbiIsICJpbXBvcnQgeyB0eXBlIE1hbmlmZXN0VjNFeHBvcnQgfSBmcm9tICdAY3J4anMvdml0ZS1wbHVnaW4nXG5cbmV4cG9ydCBjb25zdCBtYW5pZmVzdDogTWFuaWZlc3RWM0V4cG9ydCA9IHtcbiAgbWFuaWZlc3RfdmVyc2lvbjogMyxcbiAgbmFtZTogJ0FkIENvbGxlY3RvcicsXG4gIHZlcnNpb246IHByb2Nlc3MuZW52Lm5wbV9wYWNrYWdlX3ZlcnNpb24gfHwgJzEuMC4wJyxcbiAgYWN0aW9uOiB7XG4gICAgZGVmYXVsdF9wb3B1cDogJ2luZGV4Lmh0bWwnLFxuICB9LFxuICBpY29uczoge1xuICAgIDE2OiBcImljb24tMTYucG5nXCIsXG4gICAgNDg6IFwiaWNvbi00OC5wbmdcIixcbiAgICAxMjg6IFwiaWNvbi0xMjgucG5nXCJcbiAgfSxcblxuICBiYWNrZ3JvdW5kOiB7XG4gICAgc2VydmljZV93b3JrZXI6ICdzcmMvc2VydmljZS13b3JrZXIudHMnLFxuICAgIHR5cGU6ICdtb2R1bGUnLFxuXG5cbiAgfSxcbiAgb2F1dGgyOiB7XG4gICAgY2xpZW50X2lkOiBcIjg1MjY2MjU4NjM0OC01MHQ3c2VobDkycDVtOXZrYjk3cm5nZ2JjcDVwdnZnaC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbVwiLFxuICAgIHNjb3BlczogW1wib3BlbmlkXCIsIFwiZW1haWxcIiwgXCJwcm9maWxlXCIsJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvdXNlcmluZm8ucHJvZmlsZScsJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvdXNlci5iaXJ0aGRheS5yZWFkJywnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC91c2VyLmdlbmRlci5yZWFkJywnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC91c2VyLmFkZHJlc3Nlcy5yZWFkJ11cbiAgfSxcbiBcbiAgcGVybWlzc2lvbnM6IFtcbiAgICAnd2ViUmVxdWVzdCcsXG4gICAgJ3dlYk5hdmlnYXRpb24nLFxuICAgIFwiaWRlbnRpdHlcIixcbiAgICBcImlkZW50aXR5LmVtYWlsXCIsXG4gICAgJ2FjdGl2ZVRhYicsXG4gICAgJ2RlY2xhcmF0aXZlTmV0UmVxdWVzdCcsXG4gICAgJ3NjcmlwdGluZycsXG4gICAgLy8gVGhpcyBwZXJtaXNzaW9uIGlzIG5lZWQgZm9yIHJlZGlyZWN0aW5nXG4gICAgJ2RlY2xhcmF0aXZlTmV0UmVxdWVzdFdpdGhIb3N0QWNjZXNzJyxcbiAgICAndGFicycsXG4gICAgJ3VubGltaXRlZFN0b3JhZ2UnLFxuICAgICdzdG9yYWdlJyxcbiAgICAvLyBUaGlzIHBlcm1pc3Npb24gaXMgbmVlZGVkIGZvciBcIlRha2UgYSBicmVha1wiIGZlYXR1cmVcbiAgICAnYWxhcm1zJ1xuXG5cbiAgXSxcbiAgY29udGVudF9zY3JpcHRzOiBbXG4gICAgeyAgICAgICBcbiAgICBcbiAgICAgIHJ1bl9hdDogXCJkb2N1bWVudF9zdGFydFwiLFxuICAgICAganM6IFsnc3JjL2NvbnRlbnQtc2NycHQudHMnXSxcbiAgICAgIG1hdGNoZXM6IFsnaHR0cHM6Ly8qLyonLCAnaHR0cDovLyovKicsJ2h0dHA6Ly93d3cuZ29vZ2xlLmNvbS9yb2JvdHMudHh0KiddLFxuICAgIH0sXG4gIF0sXG5cbiAgd2ViX2FjY2Vzc2libGVfcmVzb3VyY2VzOiBbe1xuICAgIHJlc291cmNlczogWydvYXV0aDIvbGliL29hdXRoMi5odG1sJywnaW5kZXguaHRtbCddLFxuICAgIG1hdGNoZXM6IFsnPGFsbF91cmxzPiddXG4gIH1dLFxuICAvLyBIb3N0IHBlcm1pc3Npb25zIGZvciBhbGwgdXJscyBpcyBuZWVkZWQgYmVjYXVzZSB3ZWJzaXRlcyB0byBibG9jayBhcmUgZGV0ZXJtaW5lZCBieSB1c2Vycy5cbiAgLy8gVGh1cyBleHRlbnNpb24gZG9lcyBub3Qga25vdyB3aGljaCB1cmxzIHRvIGJsb2NrIGluIGFkdmFuY2VcbiAgaG9zdF9wZXJtaXNzaW9uczogWyc8YWxsX3VybHM+J10sXG4gIGNvbnRlbnRfc2VjdXJpdHlfcG9saWN5OiB7XG4gICAgZXh0ZW5zaW9uX3BhZ2VzOiBcInNjcmlwdC1zcmMgJ3NlbGYnICA7IG9iamVjdC1zcmMgJ3NlbGYnXCIsXG4gICAgc2FuZGJveDogXCJzYW5kYm94IGFsbG93LXNjcmlwdHM7IHNjcmlwdC1zcmMgJ3NlbGYnOyBvYmplY3Qtc3JjICdzZWxmJ1wiXG4gIH1cbiAgXG59Il0sCiAgIm1hcHBpbmdzIjogIjtBQUFBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixTQUFTLFdBQVc7OztBQ0FiLElBQU0sV0FBNkI7QUFBQSxFQUN4QyxrQkFBa0I7QUFBQSxFQUNsQixNQUFNO0FBQUEsRUFDTixTQUFTLFFBQVEsSUFBSSx1QkFBdUI7QUFBQSxFQUM1QyxRQUFRO0FBQUEsSUFDTixlQUFlO0FBQUEsRUFDakI7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLElBQUk7QUFBQSxJQUNKLElBQUk7QUFBQSxJQUNKLEtBQUs7QUFBQSxFQUNQO0FBQUEsRUFFQSxZQUFZO0FBQUEsSUFDVixnQkFBZ0I7QUFBQSxJQUNoQixNQUFNO0FBQUEsRUFHUjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sV0FBVztBQUFBLElBQ1gsUUFBUSxDQUFDLFVBQVUsU0FBUyxXQUFVLG9EQUFtRCxzREFBcUQsb0RBQW1ELHFEQUFxRDtBQUFBLEVBQ3hQO0FBQUEsRUFFQSxhQUFhO0FBQUEsSUFDWDtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBRUE7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUVBO0FBQUEsRUFHRjtBQUFBLEVBQ0EsaUJBQWlCO0FBQUEsSUFDZjtBQUFBLE1BRUUsUUFBUTtBQUFBLE1BQ1IsSUFBSSxDQUFDLHNCQUFzQjtBQUFBLE1BQzNCLFNBQVMsQ0FBQyxlQUFlLGNBQWEsbUNBQW1DO0FBQUEsSUFDM0U7QUFBQSxFQUNGO0FBQUEsRUFFQSwwQkFBMEIsQ0FBQztBQUFBLElBQ3pCLFdBQVcsQ0FBQywwQkFBeUIsWUFBWTtBQUFBLElBQ2pELFNBQVMsQ0FBQyxZQUFZO0FBQUEsRUFDeEIsQ0FBQztBQUFBLEVBR0Qsa0JBQWtCLENBQUMsWUFBWTtBQUFBLEVBQy9CLHlCQUF5QjtBQUFBLElBQ3ZCLGlCQUFpQjtBQUFBLElBQ2pCLFNBQVM7QUFBQSxFQUNYO0FBRUY7OztBRDdEQSxTQUFTLGNBQWM7QUFDdkIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsU0FBUyxDQUFDLE1BQU0sR0FBRyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFBQSxFQUNwQyxPQUFPO0FBQUEsSUFDSCxlQUFlO0FBQUEsTUFDWCxTQUFTLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxVQUFVLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFBQSxJQUN0RDtBQUFBLEVBQ0o7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNWLFNBQVMsQ0FBQyxXQUFXO0FBQUEsRUFDdkI7QUFDTixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
