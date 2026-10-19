import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Keeps the game playable offline once it has been opened (production builds only).
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

// A page left open (an iPad home-screen app can stay open for days) keeps the old
// code, which may ask for pictures a newer release renamed. When the app comes back
// to the front or a picture fails, reload if a newer version has been published.
if (import.meta.env.PROD) {
  let reloading = false;
  const reloadIfOutdated = async () => {
    if (reloading || !navigator.onLine) return;
    const current = document.querySelector('script[type="module"][src]')?.getAttribute("src");
    try {
      const html = await (await fetch("./", { cache: "no-cache" })).text();
      if (current && !html.includes(current)) {
        reloading = true;
        window.location.reload();
      }
    } catch {
      // Offline or the server is unreachable: keep playing the version we have.
    }
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") reloadIfOutdated();
  });
  window.addEventListener("error", (event) => {
    if (event.target instanceof HTMLImageElement) reloadIfOutdated();
  }, true);
}
