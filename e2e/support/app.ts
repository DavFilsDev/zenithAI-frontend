import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, type Route } from '@playwright/test';

const apiUrl = 'http://127.0.0.1:8000/api/v1';
const createdAt = '2026-01-01T00:00:00Z';

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'access-control-allow-headers': 'authorization,content-type',
  'access-control-expose-headers': 'retry-after',
};

export interface Message {
  uuid: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Conversation {
  uuid: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface MockApiOptions {
  stream?: 'success' | 'rate-limit' | 'hold';
  conversation?: Conversation | null;
  messages?: Message[];
}

const user = {
  id: 1,
  email: 'ada@example.com',
  username: 'ada',
};

const json = (route: Route, body: unknown, status = 200): Promise<void> =>
  route.fulfill({
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

const paginated = <T>(results: T[]) => ({
  count: results.length,
  next: null,
  previous: null,
  results,
});

const readMessage = (value: unknown): string => {
  if (typeof value !== 'object' || value === null || !('message' in value)) {
    return '';
  }

  const { message } = value;
  return typeof message === 'string' ? message : '';
};

const titleFrom = (content: string): string =>
  content.trim().replace(/\s+/g, ' ').slice(0, 60) || 'New conversation';

const successfulStream = [
  'event: token\ndata: {"content":"Use a slice "}\n\n',
  'event: token\ndata: {"content":"to reverse the list."}\n\n',
  'event: done\ndata: {"message_id":"message-2","conversation_id":"conversation-1"}\n\n',
].join('');

export const mockApi = async (page: Page, options: MockApiOptions = {}): Promise<void> => {
  const streamMode = options.stream ?? 'success';
  let conversation: Conversation | null = options.conversation ?? null;
  let messages: Message[] = options.messages ?? [];

  await page.route(`${apiUrl}/**`, async (route) => {
    const request = route.request();
    const method = request.method();
    const path = new URL(request.url()).pathname.replace('/api/v1', '');
    const [scope, resource, uuid, child, action] = path.split('/').filter(Boolean);

    if (method === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }

    if (method === 'GET' && scope === 'health') {
      await json(route, { status: 'ok', database: 'ok' });
      return;
    }

    if (method === 'POST' && scope === 'auth' && resource === 'token' && uuid === 'refresh') {
      await json(route, { access: 'access-token', refresh: 'refresh-token' });
      return;
    }

    if (method === 'POST' && scope === 'auth' && resource === 'token') {
      await json(route, {
        access: 'access-token',
        refresh: 'refresh-token',
        user_id: user.id,
        email: user.email,
        username: user.username,
      });
      return;
    }

    if (method === 'GET' && scope === 'auth' && resource === 'profile') {
      if (request.headers()['authorization'] !== 'Bearer access-token') {
        await json(
          route,
          { error: { code: 'unauthorized', message: 'Authentication required.' } },
          401,
        );
        return;
      }

      await json(route, user);
      return;
    }

    if (method === 'POST' && scope === 'auth' && resource === 'logout') {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }

    if (scope === 'chat' && resource === 'conversations') {
      if (!uuid) {
        if (method === 'GET') {
          await json(route, paginated(conversation ? [conversation] : []));
          return;
        }

        if (method === 'POST') {
          const content = readMessage(request.postDataJSON());
          conversation = {
            uuid: 'conversation-1',
            title: titleFrom(content),
            created_at: createdAt,
            updated_at: createdAt,
            message_count: 0,
          };
          await json(route, conversation, 201);
          return;
        }
      }

      const current = conversation;

      if (uuid && current && uuid === current.uuid) {
        if (method === 'GET' && !child) {
          await json(route, { ...current, messages });
          return;
        }

        if (method === 'GET' && child === 'messages') {
          await json(route, paginated(messages));
          return;
        }

        if (method === 'POST' && child === 'messages' && action === 'stream') {
          if (streamMode === 'rate-limit') {
            await route.fulfill({
              status: 429,
              headers: {
                ...corsHeaders,
                'content-type': 'application/json',
                'retry-after': '3',
              },
              body: JSON.stringify({
                error: { code: 'rate_limited', message: 'Slow down.' },
              }),
            });
            return;
          }

          const content = readMessage(request.postDataJSON());
          messages = [
            ...messages,
            {
              uuid: `message-${messages.length + 1}`,
              role: 'user',
              content,
              created_at: createdAt,
            },
            {
              uuid: `message-${messages.length + 2}`,
              role: 'assistant',
              content: 'Use a slice to reverse the list.',
              created_at: createdAt,
            },
          ];
          conversation = { ...current, updated_at: createdAt, message_count: messages.length };

          if (streamMode === 'hold') {
            return;
          }

          await route.fulfill({
            status: 200,
            headers: {
              ...corsHeaders,
              'content-type': 'text/event-stream',
              'cache-control': 'no-cache',
            },
            body: successfulStream,
          });
          return;
        }
      }
    }

    await route.fulfill({
      status: 404,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
      body: JSON.stringify({ detail: `Unhandled ${method} ${path}` }),
    });
  });
};

export const signIn = async (page: Page): Promise<void> => {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email' }).fill(user.email);
  await page.getByRole('textbox', { name: 'Password' }).fill('secret123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/chat(?:\/.*)?$/);
};

export const seededConversation: Conversation = {
  uuid: 'conversation-1',
  title: 'Code sample',
  created_at: createdAt,
  updated_at: createdAt,
  message_count: 2,
};

export const seededMessages: Message[] = [
  {
    uuid: 'message-1',
    role: 'user',
    content: 'Show me a TypeScript example.',
    created_at: createdAt,
  },
  {
    uuid: 'message-2',
    role: 'assistant',
    content:
      'Here is an example:\n\n```ts\nconst greet = (name: string): string => `Hi ${name}`;\n```',
    created_at: createdAt,
  },
];

export const setTheme = async (page: Page, theme: 'dark' | 'light'): Promise<void> => {
  await page.addInitScript((value) => {
    const storage = (globalThis as unknown as { localStorage: Storage }).localStorage;
    storage.setItem('theme', value);
  }, theme);
  await page.emulateMedia({ colorScheme: theme });
};

export const waitForTheme = async (page: Page, theme: 'dark' | 'light'): Promise<void> => {
  if (theme === 'dark') {
    await expect(page.locator('html')).toHaveClass(/\bdark\b/);
    return;
  }

  await expect(page.locator('html')).toHaveClass(/\blight\b/);
};

export const expectNoSeriousOrCriticalAxeViolations = async (page: Page): Promise<void> => {
  await page.evaluate(async () => {
    const doc = (
      globalThis as unknown as {
        document?: {
          getAnimations?: () => Array<{ finish?: () => void }>;
          fonts?: { ready?: Promise<unknown> };
        };
      }
    ).document;
    const animations = doc?.getAnimations?.() ?? [];
    for (const animation of animations) {
      try {
        animation.finish?.();
      } catch {
        // ignore
      }
    }
    await doc?.fonts?.ready;
  });
  const results = await new AxeBuilder({ page }).analyze();
  const violations = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
};

export const openProfileModal = async (page: Page): Promise<void> => {
  await expect(page.getByRole('textbox', { name: 'Message' })).toBeVisible();
  const menuButton = page.getByRole('button', { name: /user menu/ }).first();
  if (!(await menuButton.isVisible().catch(() => false))) {
    const openSidebar = page.getByRole('button', { name: 'Open sidebar' });
    if (await openSidebar.isVisible().catch(() => false)) {
      await openSidebar.click();
    }
  }

  await expect(menuButton).toBeVisible();
  await menuButton.click();
  await page.getByRole('menuitem', { name: 'Profile' }).click();
  await expect(page.getByRole('dialog', { name: 'Profile' })).toBeVisible();
};
