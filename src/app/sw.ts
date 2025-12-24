/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { CacheFirst, ExpirationPlugin, NetworkFirst, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    {
      matcher: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: new NetworkFirst({
        cacheName: "supabase-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
          }),
        ],
      }),
    },
    {
      matcher: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: new CacheFirst({
        cacheName: "image-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          }),
        ],
      }),
    },
    {
      matcher: /^https:\/\/world\.openfoodfacts\.org\/.*/i,
      handler: new NetworkFirst({
        cacheName: "food-api-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 500,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          }),
        ],
      }),
    },
  ],
});

serwist.addEventListeners();

// Handle SKIP_WAITING message from the app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, tag, data } = event.data.payload;

    // Extended notification options including actions (supported in some browsers)
    const options: NotificationOptions & { actions?: { action: string; title: string }[] } = {
      body,
      tag,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      data,
      actions: [
        { action: "log", title: "Log Food" },
        { action: "dismiss", title: "Dismiss" },
      ],
      requireInteraction: false,
      silent: false,
    };

    self.registration.showNotification(title, options as NotificationOptions);
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === "dismiss") {
    return;
  }

  // Default action or "log" action - open the app
  const urlToOpen = data?.url || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) {
            (client as WindowClient).navigate(urlToOpen);
          }
          return;
        }
      }
      // If no window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
