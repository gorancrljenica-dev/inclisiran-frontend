import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    // Čekamo summary kartice — pojavljuju se tek kad API vrati podatke
    await page.waitForSelector('[data-testid="summary-card"]', { timeout: 15000 });
  });

  test('ucitava dashboard stranicu', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Inclisiran');
  });

  test('prikazuje summary kartice', async ({ page }) => {
    // SummaryCards komponenta — tri kartice
    const cards = page.locator('[data-testid="summary-card"]');
    await expect(cards).toHaveCount(3);
  });

  test('prikazuje sekciju Za akciju ili Nema pacijenata', async ({ page }) => {
    const zaAkciju = page.getByText('Za akciju');
    const nema = page.getByText(/nema/i);
    const hasZaAkciju = await zaAkciju.isVisible().catch(() => false);
    const hasNema = await nema.isVisible().catch(() => false);
    expect(hasZaAkciju || hasNema).toBe(true);
  });

  test('osvjezi button postoji i klikabilan je', async ({ page }) => {
    const btn = page.getByRole('button', { name: /osvježi/i });
    await expect(btn).toBeVisible();
    await btn.click();
    await page.waitForLoadState('networkidle');
  });
});

test.describe('RecordDoseModal', () => {
  test('otvara modal klikom na Unesi dozu', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const unesiBtn = page.getByRole('button', { name: /unesi dozu/i }).first();
    const hasButton = await unesiBtn.isVisible().catch(() => false);

    if (!hasButton) {
      test.skip(); // Nema pacijenata na dashboardu
      return;
    }

    await unesiBtn.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('heading', { name: /unesi dozu/i })).toBeVisible();
  });

  test('modal sadrzi date input i submit button', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const unesiBtn = page.getByRole('button', { name: /unesi dozu/i }).first();
    const hasButton = await unesiBtn.isVisible().catch(() => false);

    if (!hasButton) {
      test.skip();
      return;
    }

    await unesiBtn.click();
    await expect(page.locator('input[type="date"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /potvrdi dozu/i })).toBeVisible();
  });

  test('modal se zatvara klikom na X', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const unesiBtn = page.getByRole('button', { name: /unesi dozu/i }).first();
    const hasButton = await unesiBtn.isVisible().catch(() => false);

    if (!hasButton) {
      test.skip();
      return;
    }

    await unesiBtn.click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: /zatvori/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
