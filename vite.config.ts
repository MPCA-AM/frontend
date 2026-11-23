import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Lit le fichier .env correspondant au mode courant (development, production, etc.).
  // Le troisième argument limite la lecture aux variables qui commencent par VITE_.
  const env = loadEnv(mode, __dirname, "VITE_");

  // Cette adresse est utilisée uniquement par le serveur Vite : le navigateur
  // appelle /geoserver, et Vite transmet la requête vers GeoServer local.
  const geoserverProxyTarget = env.VITE_GEOSERVER_PROXY_TARGET || "http://localhost:8080";
  const geoserverUsername = env.VITE_GEOSERVER_USERNAME || "Justien";
  const geoserverPassword = env.VITE_GEOSERVER_PASSWORD || "hackermode";
  const authHeader = `Basic ${Buffer.from(`${geoserverUsername}:${geoserverPassword}`).toString("base64")}`;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      proxy: {
        "/geoserver": {
          // Évite les problèmes CORS en développement : le navigateur reste sur
          // http://localhost:5173 et Vite contacte GeoServer à sa place.
          target: geoserverProxyTarget,
          changeOrigin: true,
          headers: {
            Authorization: authHeader,
          },
        },
      },
    },
  };
});
