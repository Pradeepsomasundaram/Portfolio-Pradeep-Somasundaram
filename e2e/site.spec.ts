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

test('markdown in live answers renders as formatting, not raw asterisks', async ({ page }) => {
  const events = [
    { type: 'text', text: 'He is the **Agentic AI & MLOps Lead** at Cognizant.\n* built `PySpark` pipelines' },
    { type: 'done' },
  ];
  await page.route(FUNCTION, (route) =>
    route.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream' }, body: events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('') })
  );
  await page.goto('/');
  await openChat(page);
  await ask(page, 'role?');
  const dialog = page.getByRole('dialog', { name: 'Portfolio AI assistant' });
  await expect(dialog.locator('strong', { hasText: 'Agentic AI & MLOps Lead' })).toBeVisible();
  await expect(dialog.locator('code', { hasText: 'PySpark' })).toBeVisible();
  await expect(dialog).not.toContainText('**');
  await expect(dialog).toContainText('- built');
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

test('the persona prompt waits until the hero is scrolled past, then reorders projects', async ({ page }) => {
  await page.goto('/');
  const prompt = page.getByRole('dialog', { name: 'Tailor this portfolio' });

  // It used to pop up after ~6 s and cover the hero; now it must stay away while the hero is on screen
  await page.waitForTimeout(7000);
  await expect(prompt).toBeHidden();

  await page.evaluate(() => document.getElementById('about')?.scrollIntoView());
  await expect(prompt).toBeVisible({ timeout: 10_000 });
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

test('the certifications section links out to the LinkedIn certifications page', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('#certifications').getByRole('link', { name: /verify these on LinkedIn/i });
  await expect(link).toHaveAttribute('href', 'https://www.linkedin.com/in/pradeep-somasundaram-835230192/details/certifications/');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
});

test('the newest certifications link to their public verification pages', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#certifications');
  const verify = section.getByRole('link', { name: /^Verify credential:/ });

  // The four newest (all verifiable) are visible before expanding
  await expect(verify).toHaveCount(4);
  await expect(section.getByRole('link', { name: 'Verify credential: AWS Certified Generative AI Developer - Professional' })).toHaveAttribute(
    'href',
    'https://www.credly.com/badges/97ac71bf-7270-4865-ae3e-42a03ead7d8f'
  );
  await expect(section.getByRole('link', { name: 'Verify credential: Microsoft Certified: Power Platform Developer Associate' })).toHaveAttribute(
    'href',
    'https://learn.microsoft.com/en-us/users/pradeepsomasundaram-3112/credentials/f3cc288a3a8849a'
  );
  // Links name the platform they verify on
  await expect(section.getByText('Verify on Credly').first()).toBeVisible();
  await expect(section.getByText('Verify on Microsoft Learn').first()).toBeVisible();

  // Every verify link opens safely in a new tab
  for (const link of await verify.all()) {
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  }

  // Expanding reveals the older ones; only the AWS Academy badge among them has a public link
  await section.getByRole('button', { name: /^Show \d+ more/ }).click();
  await expect(section.getByRole('heading', { level: 3 })).toHaveCount(10);
  await expect(verify).toHaveCount(5);
});

test('the hero has one clear headline, two actions and a visible email', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('#hero');
  await expect(hero.getByText('Agentic AI & MLOps Lead').first()).toBeAttached();
  await expect(hero.getByRole('button', { name: 'View Resume' })).toBeVisible();
  await expect(hero.getByRole('button', { name: 'Contact Me' })).toBeVisible();
  // The rotating job titles and the extra buttons are gone
  await expect(hero.getByRole('button', { name: /Download Resume|Ask my AI/ })).toHaveCount(0);
  await expect(hero.getByRole('link', { name: /Pradeep\.Somasundaram1501@gmail\.com/ })).toHaveAttribute(
    'href',
    'mailto:Pradeep.Somasundaram1501@gmail.com'
  );
  await expect(page).toHaveTitle(/Agentic AI & MLOps Lead/);
});

test('the hero headshot loads and the resume PDF is served', async ({ page, request }) => {
  await page.goto('/');
  const photo = page.locator('#hero img[alt="Pradeep Somasundaram"]');
  await expect(photo).toBeVisible();
  // naturalWidth is 0 for a broken image, so this catches a bad path or a deleted file
  await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);

  const resume = await request.get('/assets/Pradeep_Somasundaram_Res.pdf');
  expect(resume.status()).toBe(200);
  expect(resume.headers()['content-type']).toContain('pdf');
  expect((await resume.body()).subarray(0, 5).toString()).toBe('%PDF-');
});

test('the footer and chat no longer show invented numbers', async ({ page }) => {
  await page.route('**/.netlify/functions/assistant', (route) => route.fulfill({ status: 404, body: 'no' }));
  await page.goto('/');
  const footer = page.locator('footer');
  await expect(footer).not.toContainText(/uptime|latency|99\.98/i);
  // Offline answers used to carry a "confidence: NN%" badge that was just a hash of the text
  await page.getByRole('button', { name: 'Toggle AI chat assistant' }).click();
  await page.getByPlaceholder(/Ask about/).fill('What is his current role?');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Portfolio AI assistant' });
  await expect(dialog).toContainText('Cognizant', { timeout: 15_000 });
  // The badge only appeared once the typewriter finished, so give the reply time to complete first
  await page.waitForTimeout(2500);
  await expect(dialog).not.toContainText(/confidence/i);
});

test.describe('boot intro', () => {
  // The default setup marks the intro as already seen; these tests want a genuine first visit
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => sessionStorage.removeItem('portfolio-boot-seen'));
  });

  test('is short, and can be skipped', async ({ page }) => {
    await page.goto('/');
    const skip = page.getByRole('button', { name: /Skip intro/ });
    await expect(skip).toBeVisible();
    await skip.click();
    await expect(skip).toBeHidden();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('ends by itself within a couple of seconds', async ({ page }) => {
    await page.goto('/');
    const skip = page.getByRole('button', { name: /Skip intro/ });
    await expect(skip).toBeVisible();
    await expect(skip).toBeHidden({ timeout: 3000 });
  });

  test('is never shown to visitors arriving through a personalised link', async ({ page }) => {
    await page.route('**/.netlify/functions/visit', (route) => route.fulfill({ status: 204 }));
    // Records whether the intro's text ever enters the page, however briefly
    await page.addInitScript(() => {
      const w = window as unknown as { __bootSeen: boolean };
      w.__bootSeen = false;
      new MutationObserver(() => {
        if (document.body?.innerText.includes('initializing portfolio_ai.core')) w.__bootSeen = true;
      }).observe(document, { subtree: true, childList: true, characterData: true });
    });
    const bootSeen = () => page.evaluate(() => (window as unknown as { __bootSeen: boolean }).__bootSeen);

    // Control: a normal first visit does show it, so we know the detector works
    await page.goto('/');
    await expect.poll(bootSeen).toBe(true);

    // A personalised link must skip it entirely (longer than the intro could possibly run)
    await page.goto('/?for=acme&role=ml');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.waitForTimeout(3000);
    expect(await bootSeen()).toBe(false);
  });
});

test('experience shows a short preview, with the details on demand', async ({ page }) => {
  await page.goto('/');
  const experience = page.locator('#experience');
  // The current role starts open and carries the specifics
  await expect(experience.getByText('five-agent LangGraph workflow').first()).toBeVisible();
  // An earlier role is collapsed: its long description is hidden until asked for
  const bmsc = experience.locator('h3', { hasText: 'Agentic AI Engineer / Data Engineer' }).locator('xpath=ancestor::*[contains(@class,"relative")][1]');
  const description = 'Built data engineering and AI workflows across ERP, IoT, and operational systems for a manufacturer.';
  await expect(bmsc.getByText(description)).toBeHidden();
  await bmsc.getByRole('button', { name: 'Show details' }).click();
  await expect(bmsc.getByText(description)).toBeVisible();
  await bmsc.getByRole('button', { name: 'Show less' }).click();
  await expect(bmsc.getByText(description)).toBeHidden();
});

test('the featured project explains how the AI assistant works', async ({ page }) => {
  await page.goto('/');
  await page.locator('#projects').getByRole('button', { name: 'grid' }).click();
  const first = page.locator('#projects h3').first();
  await expect(first).toHaveText('Agentic AI Portfolio Assistant (this site)');
  await page.locator('#projects').getByRole('button', { name: /Details/ }).first().click();
  const modal = page.getByRole('dialog', { name: 'Agentic AI Portfolio Assistant (this site)' });
  await expect(modal).toContainText('Highlights');
  await expect(modal).toContainText('six tools');
  await expect(modal.getByRole('link', { name: /Live Demo/ })).toHaveAttribute('href', 'https://pradeepsomasundaram.netlify.app');
});

test('publications show where each paper stands, and link to its code', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#publications');
  await expect(section).toContainText('2 published · 1 accepted · 2 submitted');
  await expect(section.getByText('Published', { exact: true })).toHaveCount(2);
  await expect(section.getByText('Accepted', { exact: true })).toHaveCount(1);
  await expect(section.getByText('Submitted', { exact: true })).toHaveCount(2);

  // The published papers keep their publisher links; the unpublished ones link to code instead
  await expect(section.getByRole('link', { name: /View Publication/ })).toHaveCount(2);
  await expect(section.getByRole('link', { name: /Code & data \(Zenodo\)/ })).toHaveAttribute('href', 'https://doi.org/10.5281/zenodo.23044933');
  const github = section.getByRole('link', { name: /Code \(GitHub\)/ });
  await expect(github).toHaveCount(2);
  await expect(github.first()).toHaveAttribute('href', /github\.com\/PradeepSomasundaram1512\/(hybrid-arima-lstm-rul-cmapss|hera_pdm)$/);
});

test('the hero counts come from the data, and only published papers count as publications', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('#hero');
  // The counters animate up to their value, so poll for the final numbers. The number and its label
  // sit side by side with no space between them ("22Projects2Publications"), hence the lookbehinds.
  await expect(hero).toContainText(/(?<!\d)22\s*Projects/i, { timeout: 10_000 });
  await expect(hero).toContainText(/(?<!\d)2\s*Publications/i);
  await expect(hero).toContainText(/(?<!\d)10\s*Certifications/i);
  // Five papers are listed, but only two are published
  await expect(hero).not.toContainText(/(?<!\d)5\s*Publications/i);
});

test('every GitHub project is listed, including the newest and the BI dashboards', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#projects');
  await section.getByRole('button', { name: 'grid' }).click();
  await expect(section.getByRole('button', { name: /^All\s*22$/ })).toBeVisible();

  // The new category holds the three Power BI repos that used to be missing
  await section.getByRole('button', { name: /^Analytics & BI\s*3$/ }).click();
  await expect(section.locator('h3')).toHaveText([
    'TeleHealth Trends Dashboard',
    'Customer Retention Dashboard with Predictive Insights',
    'Revenue & Profitability Dashboard (Global Superstore)',
  ]);
  const repos = await section.getByRole('link', { name: /GitHub/ }).evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).href));
  expect(repos).toEqual([
    'https://github.com/PradeepSomasundaram1512/TeleHealth-Trends-Dashboard',
    'https://github.com/PradeepSomasundaram1512/Customer-Retention-Dashboard-with-Predictive-Insights',
    'https://github.com/PradeepSomasundaram1512/Real-Time-Revenue-Profitability-Dashboard',
  ]);

  // AgriDroneAI keeps the repo's own candid result rather than just the headline number
  await section.getByRole('button', { name: /^IoT\s*\d+$/ }).click();
  await section.locator('h3', { hasText: 'AgriDroneAI' }).locator('xpath=ancestor::*[contains(@class,"flex-col")][1]').getByRole('button', { name: /Details/ }).click();
  const modal = page.getByRole('dialog', { name: /AgriDroneAI/ });
  await expect(modal).toContainText('about 80% of the water');
  await expect(modal).toContainText('does about as well on yield and profit');
  await expect(modal).toContainText('not on real aircraft');
});

test('the built-in assistant describes unpublished papers by their status', async ({ page }) => {
  await page.route(FUNCTION, (route) => route.fulfill({ status: 404, body: 'no' }));
  await page.goto('/');
  await openChat(page);
  await ask(page, 'What publications does he have?');
  const dialog = page.getByRole('dialog', { name: 'Portfolio AI assistant' });
  await expect(dialog).toContainText('2 peer-reviewed publications', { timeout: 15_000 });
  // The status lines come later in the answer, so once they're there the whole answer is on screen
  await expect(dialog).toContainText('Accepted at ICAIET-2027');
  await expect(dialog).toContainText('Submitted to AIEI 2027');
  await expect(dialog).not.toContainText(/\b5 peer-reviewed/);
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
