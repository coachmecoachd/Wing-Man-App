
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Cast process to any to avoid TS error since @types/node might not be present
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This ensures process.env.API_KEY works in your code by replacing it with the actual value during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Prevents crashing if other parts of code access process.env, but doesn't expose all system vars
      'process.env': {},
    },
  };
});
