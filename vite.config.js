import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import tanstackRouter from "@tanstack/router-plugin/vite";
import {VitePWA} from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tanstackRouter({
    target:'react',
    autoCodeSplitting: true,
  }),react(), tailwindcss(), VitePWA({
    devOptions: {enabled: false},
  })],
})
