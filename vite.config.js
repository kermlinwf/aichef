import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Project Pages serves the site at /<repo-name>/ — assets must use that base or they 404.
// https://vite.dev/config/shared-options.html#base
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/aichef/' : '/',
  plugins: [react(), tailwindcss()],
}))
