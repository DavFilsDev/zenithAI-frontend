import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const cspPlugin = (policy: string, appName: string): Plugin => ({
  name: 'zenith-csp',
  transformIndexHtml(html) {
    return html
      .replaceAll('<title>Zenith AI</title>', `<title>${appName}</title>`)
      .replace(
        '<head>',
        `<head>\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`,
      );
  },
});

const apiOrigin = (apiUrl: string | undefined): string => {
  if (!apiUrl) {
    return 'http://localhost:8000';
  }

  try {
    return new URL(apiUrl).origin;
  } catch {
    return 'http://localhost:8000';
  }
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';
  const connectSources = [
    "'self'",
    apiOrigin(env.VITE_API_URL),
    ...(isDev ? ['ws://localhost:5173', 'ws://127.0.0.1:5173'] : []),
  ].join(' ');
  const policy = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self'${isDev ? " 'unsafe-inline'" : ''}`,
    `connect-src ${connectSources}`,
  ].join('; ');

  return {
    plugins: [react(), tailwindcss(), cspPlugin(policy, env.VITE_APP_NAME || 'Zenith AI')],
    server: {
      port: 5173,
      open: true,
    },
  };
});
