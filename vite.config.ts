import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // FIX: Replaced `process.cwd()` with `'.'` to resolve a TypeScript type error.
  // Vite resolves `.` relative to the project root, which is correct for loading .env files.
  const env = loadEnv(mode, '.', '');
  return {
    base: '/Wing-Man-App/',
    plugins: [react()],
    define: {
      // This ensures process.env.API_KEY works in your code by replacing it with the actual value during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});