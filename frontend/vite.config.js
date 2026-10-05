import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // (or your specific framework plugin)

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true, // Prevents Vite from auto-switching to another port if 5175 is busy
    proxy: {
      // This catches any frontend request starting with '/api' and forwards it to your backend
      '/api': {
        target: 'http://localhost:5002', // Change this to your backend server port
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
