// flujo.spec.js — E2E del flujo crítico: idioma → bienvenida → menú → buscar →
// resultados → multas → detalle. Verifica los bugs reportados por André:
// 1) "ARTÍCULO undefined" en el listado  2) detalle que no salía  3) logo en header.
import { test, expect } from '@playwright/test'

test('Flujo completo P123ABC/EMETRA: listado sin undefined, detalle sale, logo visible', async ({
  page,
}) => {
  const errores = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errores.push(msg.text())
  })
  page.on('pageerror', (err) => errores.push(String(err)))

  // 1. Entrada redirige (a idioma o bienvenida según localStorage)
  await page.goto('/#/')
  await page.waitForTimeout(800)

  // 2. Idioma → Español
  await page.goto('/#/idioma')
  await page.getByRole('button', { name: 'Español' }).click()
  await page.waitForURL(/#\/bienvenida/)

  // 3. Bienvenida → Menú
  await expect(page.getByText('¿HAS SIDO MULTADO?')).toBeVisible()
  await page.getByRole('button', { name: '¿Qué procede?' }).click()
  await page.waitForURL(/#\/menu/)

  // 4. Menú → Buscar
  await page.getByRole('button', { name: /Buscar mis multas/ }).click()
  await page.waitForURL(/#\/buscar/)

  // 5. Buscar placa P123ABC
  await page.getByLabel('Número de placa').fill('P123ABC')
  await page.getByRole('button', { name: 'BUSCAR', exact: true }).click()
  await page.waitForURL(/#\/resultados/)

  // 6. Resultados → EMETRA
  await expect(page.getByText('Resultados por municipalidad')).toBeVisible()
  await page.getByRole('button', { name: /EMETRA/ }).first().click()
  await page.waitForURL(/#\/multas/)

  // 7. Listado: sin "ARTÍCULO undefined", con motivo legal real y montos
  await expect(page.getByText('Tus multas')).toBeVisible()
  await expect(page.getByText('ARTÍCULO undefined')).toHaveCount(0)
  await expect(page.getByText(/Art\. 90/).first()).toBeVisible()
  await expect(page.getByText('Q200.00').first()).toBeVisible()
  await expect(page.getByText('Q500.00').first()).toBeVisible()

  // 8. Detalle: timeline + tabla, sin "No encontramos la multa", sin "3 días"
  await page.getByRole('button', { name: /Ver detalle/ }).first().click()
  await page.waitForURL(/#\/detalle/)
  await expect(page.getByText('Detalle de la multa')).toBeVisible()
  await expect(page.getByText('Estado del proceso')).toBeVisible()
  await expect(page.getByText('No encontramos la multa')).toHaveCount(0)
  await expect(page.getByText(/3 días/)).toHaveCount(0)

  // 9. Logo nuevo en el header (imagen, no icono)
  await expect(page.locator('header img[src="/icon-192.png"]')).toBeVisible()

  // 10. Sin errores de consola (ignorando favicon/404 de assets opcionales)
  const criticos = errores.filter(
    (e) => !/favicon|Failed to load resource/i.test(e)
  )
  expect(criticos).toEqual([])
})