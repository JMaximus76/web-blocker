import { defineConfig } from "vite";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";
import { svelte } from "@sveltejs/vite-plugin-svelte";

function loadWebExtConfig() {
  try {
    return require("./.web-ext.config.json");
  } catch {
    return undefined;
  }
}

function generateManifest() {
  const manifest = readJsonFile("src/manifest.json");
  const pkg = readJsonFile("package.json");
  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    ...manifest,
  };
}

export default defineConfig({
  plugins: [
    svelte(),
    webExtension({
      assets: "public",
      webExtConfig: loadWebExtConfig(),
      manifest: generateManifest,
      browser: "firefox",
      additionalInputs: [
        "src/blocked_page/blocked-page.html"
      ]
    })
  ],

  build: {
    minify: false,
    sourcemap: false,
    
  }
});
