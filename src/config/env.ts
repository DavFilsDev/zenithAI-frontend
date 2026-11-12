import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_APP_NAME: z.string().min(1),
  VITE_DEFAULT_THEME: z.enum(['light', 'dark']),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.map(String).join('.') || 'environment'}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${details}`);
}

export const env = {
  apiUrl: parsed.data.VITE_API_URL,
  appName: parsed.data.VITE_APP_NAME,
  defaultTheme: parsed.data.VITE_DEFAULT_THEME,
} as const;
