/**
 * MultaClara — Backend demo (Google Sheets + Apps Script)
 * =======================================================
 * CÓMO USAR (sin tocar nada a mano):
 * 1. Creá un Google Sheet nuevo y llamalo "MultaClaraDemo"
 * 2. Extensiones → Apps Script → pegá TODO este archivo → Guardá
 * 3. En el editor, ejecutá la función `setup()` (botón ▶ + seleccionar setup)
 *    → Esto crea los encabezados y puebla los datos demo AUTOMÁTICAMENTE
 * 4. Deploy → Nueva implementación → Aplicación web
 *    - Ejecutar como: Yo (tu cuenta)
 *    - Acceso: Cualquier persona
 * 5. Copiá la URL del Web App y pegalá en src/lib/data.js (SHEETS_API_URL)
 *
 * ENDPOINTS:
 *   GET /            → TODAS las multas (para el cache diario de la PWA)
 *   GET /?placa=X    → multas de una placa
 *   POST /           → agrega una multa (JSON)
 *
 * CACHE:
 *   - Apps Script cachea la lectura del Sheet 6 horas (CacheService)
 *   - La PWA cachea en localStorage 24 horas (1 fetch por día)
 */

// ============================================================
// CONFIG
// ============================================================
const HOJA = 'Sheet1';
const CACHE_KEY = 'multaclara_datos';
const CACHE_TTL_SEG = 6 * 60 * 60; // 6 horas

// ============================================================
// SETUP AUTOMÁTICO — corré esto UNA vez
// ============================================================

/** Crea los encabezados y puebla los datos demo. No requiere nada manual. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(HOJA);
  if (!sheet) {
    sheet = ss.insertSheet(HOJA);
  }

  // Encabezados (se crean solos si la hoja está vacía)
  const encabezados = [
    'placa',
    'tipo_vehiculo',
    'entidad',
    'fecha',
    'infraccion',
    'monto',
    'estado',
  ];

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, encabezados.length).setValues([encabezados]);
  }

  // Datos demo (solo si no hay datos todavía)
  if (sheet.getLastRow() === 1) {
    const demo = [
      ['P123ABC', 'particular', 'EMETRA', '2026-08-20', 'semaforo_rojo', 400, 'pendiente'],
      ['P123ABC', 'particular', 'EMETRA', '2026-07-01', 'estacionamiento_prohibido', 400, 'pendiente'],
      ['P123ABC', 'particular', 'PNC', '2026-05-10', 'licencia_vencida', 300, 'pagada'],
      ['M789XYZ', 'moto', 'PNC', '2026-09-01', 'semaforo_rojo', 400, 'pendiente'],
      ['M789XYZ', 'moto', 'MuniGuate', '2026-08-15', 'basura_vehiculo', 300, 'pendiente'],
      ['C456DEF', 'comercial', 'EMETRA', '2026-03-01', 'sin_tarjeta_circulacion', 200, 'pagada'],
      ['B111AAA', 'bus', 'PNC', '2026-09-05', 'exceso_velocidad', 500, 'pendiente'],
      ['T222BBB', 'taxi', 'EMETRA', '2026-09-08', 'estacionamiento_prohibido', 400, 'pendiente'],
    ];
    sheet.getRange(2, 1, demo.length, encabezados.length).setValues(demo);
  }

  // Limpiar cache para que tome los datos nuevos
  CacheService.getScriptCache().remove(CACHE_KEY);

  return '✅ Setup listo: hoja creada, encabezados y datos demo poblados.';
}

// ============================================================
// LECTURA CON CACHE (6 horas)
// ============================================================

function leerDatos() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(CACHE_KEY);
  if (cached) {
    return JSON.parse(cached);
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
  if (!sheet) throw new Error('No se encontró la hoja ' + HOJA);

  const valores = sheet.getDataRange().getValues();
  const encabezados = valores[0].map((h) => h.toString().trim().toLowerCase());

  const idx = {
    placa: encabezados.indexOf('placa'),
    tipo_vehiculo: encabezados.indexOf('tipo_vehiculo'),
    entidad: encabezados.indexOf('entidad'),
    fecha: encabezados.indexOf('fecha'),
    infraccion: encabezados.indexOf('infraccion'),
    monto: encabezados.indexOf('monto'),
    estado: encabezados.indexOf('estado'),
  };

  const multas = [];
  for (let i = 1; i < valores.length; i++) {
    const fila = valores[i];
    if (!fila[idx.placa]) continue;
    multas.push({
      placa: fila[idx.placa].toString().trim().toUpperCase(),
      tipo_vehiculo: (fila[idx.tipo_vehiculo] || '').toString().trim().toLowerCase(),
      entidad: (fila[idx.entidad] || '').toString().trim(),
      fecha: formatearFecha(fila[idx.fecha]),
      infraccion: (fila[idx.infraccion] || '').toString().trim(),
      monto: Number(fila[idx.monto]) || 0,
      estado: (fila[idx.estado] || 'pendiente').toString().trim().toLowerCase(),
    });
  }

  cache.put(CACHE_KEY, JSON.stringify(multas), CACHE_TTL_SEG);
  return multas;
}

/** Convierte celdas de fecha (Date) o texto a formato ISO YYYY-MM-DD */
function formatearFecha(valor) {
  if (valor instanceof Date) {
    return Utilities.formatDate(valor, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return (valor || '').toString().trim();
}

// ============================================================
// ENDPOINTS
// ============================================================

/** GET / → todas las multas · GET /?placa=X → las de esa placa */
function doGet(e) {
  const placa = (e && e.parameter && e.parameter.placa || '')
    .toString()
    .trim()
    .toUpperCase();

  const salida = {
    ok: true,
    fuente: 'Google Sheets + Apps Script (datos demo)',
    cache: '6h en Apps Script + 24h en PWA',
    fecha: new Date().toISOString(),
    total: 0,
    multas: [],
  };

  try {
    const multas = leerDatos();
    salida.multas = placa ? multas.filter((m) => m.placa === placa) : multas;
    salida.total = salida.multas.length;
    if (placa && salida.total === 0) {
      salida.mensaje = 'No se encontraron multas para esta placa';
    }
  } catch (err) {
    salida.ok = false;
    salida.error = err.toString();
  }

  return ContentService.createTextOutput(JSON.stringify(salida))
    .setMimeType(ContentService.MimeType.JSON);
}

/** POST / con JSON { placa, tipo_vehiculo, entidad, fecha, infraccion, monto, estado } */
function doPost(e) {
  const salida = { ok: true };

  try {
    const body = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);

    sheet.appendRow([
      (body.placa || '').toString().trim().toUpperCase(),
      (body.tipo_vehiculo || '').toString().trim().toLowerCase(),
      body.entidad || '',
      body.fecha || '',
      body.infraccion || '',
      Number(body.monto) || 0,
      body.estado || 'pendiente',
    ]);

    // Invalidar cache para que la próxima lectura tome la multa nueva
    CacheService.getScriptCache().remove(CACHE_KEY);

    salida.mensaje = 'Multa agregada correctamente';
  } catch (err) {
    salida.ok = false;
    salida.error = err.toString();
  }

  return ContentService.createTextOutput(JSON.stringify(salida))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// FORMATO DE DATOS (para poblar el Sheet manualmente si querés)
// ============================================================
// placa     | tipo_vehiculo | entidad  | fecha       | infraccion                | monto | estado
// P123ABC   | particular    | EMETRA   | 2026-08-20  | semaforo_rojo             | 400   | pendiente
// M789XYZ   | moto          | PNC      | 2026-09-01  | semaforo_rojo             | 400   | pendiente
// C456DEF   | comercial     | EMETRA   | 2026-03-01  | sin_tarjeta_circulacion   | 200   | pagada
//
// tipo_vehiculo válidos: particular | moto | comercial | bus | taxi | camion | otro
// estado válidos: pendiente | pagada | impugnada | prescrita
// infraccion: id del catálogo en public/infracciones.json