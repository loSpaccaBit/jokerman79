"use client";

import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Gestione update: mostrare un messaggio o ricaricare la pagina se c'è un nuovo SW
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    // Nuovo SW installato, puoi mostrare un toast o ricaricare la pagina
                    // window.location.reload();
                  }
                }
              };
            }
          };
        })
        .catch(() => {
          // Errore silenziato
        });
    }
  }, []);
  return null;
} 