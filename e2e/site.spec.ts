import { test, expect, type Page } from '@playwright/test';

const FUNCTION = '**/.netlify/functions/assistant';

/** Skip the boot animation and start every test from a clean slate. */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.clear();
    sessionStorage.setItem('portfolio-boot-seen', '1');
    localStorage.clear();
  });
});

const openChat = async (page: Page) => {
  await page.getByRole('button', { name: 'Toggle AI chat assistant' }).click();
  await expect(page.getByRole('dialog', { name: 'Portfolio AI assistant' })).toBeVisible();
};

const ask = async (page: Page, question: string) => {
  await page.getByPlaceholder(/Ask about/).fill(question);
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
};

test('loads the hero without runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Pradeep Somasundaram');
  await expect(page.locator('#projects')).toBeAttached();
  expect(errors).toEqual([]);
});

test('a personalised link tunes the hero and project order, and reports the open once', async ({ page }) => {
  const visits: string[] = [];
  await page.route('**/.netlify/functions/visit', (route) => {
    visits.push(route.request().postData() ?? '');
    return route.fulfill({ status: 204 });
  });
  await page.goto('/?for=globex-corp&role=de');
  await expect(page.locator('#hero')).toContainText('Hi Globex Corp team');
  await expect(page.locator('#hero')).toContainText('Data Engineering');
  await expect(page.locator('#projects h3').first()).toHaveText('Multi-Channel Data Integration & Analytics');
  await expect.poll(() => visits.length).toBe(1);
  expect(JSON.parse(visits[0])).toEqual({ company: 'Globex Corp', role: 'Data Engineering' });
});

test('the assistant falls back to built-in answers when the live agent is unavailable', async ({ page }) => {
  await page.route(FUNCTION, (route) => route.fulfill({ status: 404, body: 'not found' }));
  await page.goto('/');
  await openChat(page);
  await ask(page, 'What is his current role?');
  const dialog = page.getByRole('dialog', { name: 'Portfolio AI assistant' });
  await expect(dialog).toContainText('Cognizant', { timeout: 15_000 });
  await expect(dialog).toContainText('Offline mode');
});

test('the live assistant streams an answer and can open a project on the page', async ({ page }) => {
  const events = [
    { type: 'tool', name: 'open_project' },
    { type: 'action', action: 'open_project', target: 'healthcare-chatbot' },
    { type: 'text', text: 'Opened the healthcare chatbot for you.' },
    { type: 'done' },
  ];
  await page.route(FUNCTION, (route) =>
    route.fulfill({
      status: 200,
      headers: { 'content-type': 'text/event-stream' },
      body: events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join(''),
    })
  );
  await page.goto('/');
  await openChat(page);
  await ask(page, 'Show me the healthcare chatbot');
  const dialog = page.getByRole('dialog', { name: 'Portfolio AI assistant' });
  await expect(dialog).toContainText('Opened the healthcare chatbot for you.');
  await expect(dialog).toContainText('Live AI agent');
  await expect(page.getByRole('heading', { name: 'AI-Powered Chatbot for Healthcare Assistance' })).toBeVisible();
});

test('the terminal opens with the backtick key and runs commands', async ({ page }) => {
  await page.goto('/');
  await page.locator('body').press('`');
  const term = page.getByRole('dialog', { name: 'Terminal' });
  await expect(term).toBeVisible();
  await term.getByLabel('Terminal command').fill('whoami');
  await term.getByLabel('Terminal command').press('Enter');
  await expect(term).toContainText('Agentic AI & MLOps Lead');
  await term.getByLabel('Terminal command').fill('link Globex Corp agentic');
  await term.getByLabel('Terminal command').press('Enter');
  await expect(term).toContainText('for=globex-corp&role=agentic');
});

test('the command palette opens and finds pages', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Control+k');
  const palette = page.getByRole('dialog', { name: 'AI command palette' });
  await expect(palette).toBeVisible();
  await palette.getByRole('textbox').fill('contact');
  await expect(palette.getByRole('button', { name: /Contact/ }).first()).toBeVisible();
});

test('the persona prompt reorders projects for the chosen role', async ({ page }) => {
  await page.goto('/');
  const prompt = page.getByRole('dialog', { name: 'Tailor this portfolio' });
  await expect(prompt).toBeVisible({ timeout: 15_000 });
  await prompt.getByRole('button', { name: 'Data Engineering' }).click();
  await expect(page.getByRole('button', { name: /Tuned for/ })).toBeVisible();
  await expect(page.locator('#projects h3').first()).toHaveText('Multi-Channel Data Integration & Analytics');
});

test('the contact form can polish a rough note without sending it', async ({ page }) => {
  await page.route('**/.netlify/functions/polish', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Hi Pradeep, I would love to chat about a role. Best, Sam' }) })
  );
  let formSubmissions = 0;
  await page.route('https://formspree.io/**', (route) => {
    formSubmissions++;
    return route.fulfill({ status: 200, body: '{}' });
  });
  await page.goto('/');
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.getByLabel('Name').fill('Sam');
  await page.getByLabel('Message').fill('hey we are hiring, want to talk?');
  await page.getByRole('button', { name: 'Polish with AI' }).click();
  await expect(page.getByLabel('Message')).toHaveValue(/love to chat about a role/);
  await expect(page.locator('#contact')).toContainText('review and edit before sending');
  expect(formSubmissions).toBe(0);
});

test.describe('phone layout', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('the page never scrolls sideways and the chat button stays reachable', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width).toBeLessThanOrEqual(390);
    const box = await page.getByRole('button', { name: 'Toggle AI chat assistant' }).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  });
});
