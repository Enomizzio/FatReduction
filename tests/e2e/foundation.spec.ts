import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('profilo, tastiera, sei aree, persistenza e viewport 320', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByLabel('Età (anni)')).toHaveValue('40')
  await page.keyboard.press('Tab')
  await expect(page.getByText('Vai al contenuto')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main')).toBeFocused()
  await page.getByLabel('Età (anni)').fill('43')
  await page.getByLabel('Peso iniziale (kg)').fill('91,5')
  await page.getByRole('button', { name: 'Aggiungi occasione' }).click()
  await page.getByLabel('Pasto 6').fill('Pasto di prova')
  await page.getByRole('button', { name: 'Salva profilo' }).click()
  await expect(page.getByRole('status')).toContainText('Profilo salvato')
  await page.reload()
  await expect(page.getByLabel('Età (anni)')).toHaveValue('43')
  await expect(page.getByLabel('Peso iniziale (kg)')).toHaveValue('91.5')
  await expect(page.getByLabel('Pasto 6')).toHaveValue('Pasto di prova')
  for (const label of ['Dashboard', 'Oggi', 'Menù', 'Diario', 'Alimenti / Ricette', 'Impostazioni']) {
    await page.getByRole('navigation').getByRole('link', { name: label, exact: true }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(label)
    await expect(page.getByRole('navigation').getByRole('link', { name: label, exact: true })).toHaveAttribute('aria-current', 'page')
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.setViewportSize({ width: 320, height: 800 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.screenshot({ path: 'test-results/profile-320.png', fullPage: true })
  await page.setViewportSize({ width: 1440, height: 1050 })
  await page.screenshot({ path: 'test-results/profile-desktop.png', fullPage: true })
})

test('errore apertura storage recuperabile', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'indexedDB', { get() { throw new DOMException('denied', 'SecurityError') } }) })
  await page.goto('/')
  await expect(page.getByRole('alert')).toContainText('Archivio locale non disponibile')
  await expect(page.getByRole('button', { name: 'Riprova apertura archivio' })).toBeVisible()
})
