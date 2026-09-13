import { expect, type Page } from '@playwright/test'

export async function createFood(page: Page, name = 'Alimento fittizio') {
  await page.goto('/#catalogo')
  await page.getByRole('button', { name: 'Nuovo alimento' }).click()
  await page.getByLabel('Nome alimento', { exact: true }).fill(name)
  for (const [label, value] of [['Energia (kcal)', '123'], ['Proteine (g)', '10'], ['Carboidrati (g)', '20'], ['Grassi (g)', '3']]) await page.getByLabel(label, { exact: true }).fill(value)
  await page.getByLabel('Riferimento della fonte', { exact: true }).fill('Fixture fittizia per test')
  await page.getByRole('button', { name: 'Salva alimento' }).click()
  await expect(page.getByRole('status')).toContainText('Alimento salvato')
}

export async function createSelectedPlan(page: Page, date = '2026-09-10') {
  await page.getByRole('navigation').getByRole('link', { name: 'Menù', exact: true }).click()
  await page.getByLabel('Titolo del piano').fill('Piano fittizio')
  await page.getByLabel('Inizio del piano').fill(date)
  await page.getByRole('button', { name: 'Crea bozza del menù' }).click()
  const breakfast = page.getByRole('region', { name: 'Colazione', exact: true })
  await breakfast.getByText('Aggiungi alimenti o alternative', { exact: true }).click()
  await breakfast.getByLabel('Alimento o ricetta').selectOption({ label: 'Alimento fittizio · alimento' })
  await breakfast.getByRole('button', { name: 'Aggiungi al pasto' }).click()
  await page.getByRole('button', { name: 'Salva revisione del menù' }).click()
  await expect(page.getByRole('status')).toContainText('Menù salvato')
  await page.getByRole('button', { name: `Usa questa revisione per ${date}` }).click()
  await expect(page.getByRole('status')).toContainText('Piano selezionato')
}
