/**
 * MultaClara — Backend demo (Google Sheets + Apps Script)
 * =======================================================
 * CÓMO USAR (sin tocar nada a mano):
 * 1. Creá un Google Sheet nuevo y llamalo "MultaClaraDemo"
 * 2. Extensiones → Apps Script → pegá TODO este archivo → Guardá
 * 3. En el editor, ejecutá la función `setup()` (botón ▶ + seleccionar setup)
 *    → Esto crea los encabezados y puebla 25 multas demo AUTOMÁTICAMENTE
 * 4. Deploy → Nueva implementación → Aplicación web
 *    - Ejecutar como: Yo (tu cuenta)
 *    - Acceso: Cualquier persona
 * 5. Copiá la URL del Web App y pegalá en src/lib/data.js (SHEETS_API_URL)
 *
 * COLUMNAS DEL SHEET (11):
 *   placa | tipo_vehiculo | entidad | fecha | tipo_multa | motivo_legal
 *   | monto | estado | no_multa | categoria | fecha_notificacion
 *
 * ENDPOINTS:
 *   GET /            → TODAS las multas (para el cache diario de la PWA)
 *   GET /?placa=X    → multas de una placa
 *   POST /           → agrega una multa (JSON)
 *
 * CONTRATO GET / (cada multa):
 *   {
 *     placa, tipo_vehiculo, entidad, fecha, tipo_multa,
 *     infraccion,            // id corto derivado del artículo (mapa abajo)
 *     motivo_legal,          // texto formal "ARTÍCULO 181-14: ..."
 *     monto, estado, no_multa, categoria, fecha_notificacion
 *   }
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
// CATÁLOGO — mapa artículo → id corto de infracción
// El frontend usa `infraccion` para la razón clara y el consejo
// (public/infracciones.json). Se deriva del artículo del motivo_legal.
// ============================================================
const MAPA_ARTICULO_INFRACCION = {
  '181-14': 'semaforo_rojo',
  '184-6': 'estacionamiento_prohibido',
  '182-1': 'licencia_vencida',
  '182-3': 'basura_vehiculo',
  '181-1': 'sin_tarjeta_circulacion',
  '182-12': 'exceso_velocidad',
  '180-8': 'celular_conduciendo',
  '184-10': 'sin_casco_moto',
  '184-7': 'sobrecarga_vehiculo',
  '184-1': 'sin_placas',
};

// Mapa inverso (infraccion → artículo) para POST y para construir motivo_legal
const INFRACCION_ARTICULO = Object.fromEntries(
  Object.entries(MAPA_ARTICULO_INFRACCION).map(([articulo, infraccion]) => [infraccion, articulo])
);

// Texto formal de cada infracción (va dentro del motivo_legal)
const DESCRIPCION_POR_INFRACCION = {
  semaforo_rojo: 'Por no respetar las señales de tránsito (Alto del semáforo)',
  estacionamiento_prohibido: 'Por estacionar en lugar prohibido',
  licencia_vencida: 'Por conducir con licencia de conducir vencida',
  basura_vehiculo: 'Por arrojar basura o desechos desde el vehículo a la vía pública',
  sin_tarjeta_circulacion: 'Por circular sin tarjeta de circulación o fotocopia autenticada',
  exceso_velocidad: 'Por exceder los límites de velocidad establecidos',
  celular_conduciendo: 'Por usar teléfono celular u otro dispositivo mientras conduce',
  sin_casco_moto: 'Por circular en motocicleta sin casco de seguridad o chaleco reflectivo',
  sobrecarga_vehiculo: 'Por sobrecargar el vehículo con más pasajeros o carga de la permitida',
  sin_placas: 'Por circular sin placas de circulación o con placas no visibles',
};

// Categoría derivada del artículo (grave/leve/muy_grave)
const CATEGORIA_POR_INFRACCION = {
  semaforo_rojo: 'grave',
  estacionamiento_prohibido: 'grave',
  licencia_vencida: 'leve',
  basura_vehiculo: 'leve',
  sin_tarjeta_circulacion: 'leve',
  exceso_velocidad: 'grave',
  celular_conduciendo: 'grave',
  sin_casco_moto: 'grave',
  sobrecarga_vehiculo: 'grave',
  sin_placas: 'grave',
};

/** "ARTÍCULO 181-14: Por no respetar las señales de tránsito (Alto del semáforo)" */
function construirMotivoLegal(infraccion) {
  const articulo = INFRACCION_ARTICULO[infraccion];
  if (!articulo) return '';
  return 'ARTÍCULO ' + articulo + ': ' + (DESCRIPCION_POR_INFRACCION[infraccion] || '');
}

/** Extrae el artículo ("181-14") del motivo_legal y devuelve el id corto de infracción */
function derivarInfraccion(motivoLegal) {
  const m = (motivoLegal || '').toString().match(/(\d{3}-\d{1,2})/);
  if (!m) return '';
  return MAPA_ARTICULO_INFRACCION[m[1]] || '';
}

// ============================================================
// SETUP AUTOMÁTICO — corré esto UNA vez
// ============================================================

/** Borra TODO y puebla 25 multas demo. No requiere nada manual. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(HOJA);
  if (!sheet) {
    sheet = ss.insertSheet(HOJA);
  }

  // Limpiar TODO el contenido de la hoja (datos viejos, encabezados, formatos)
  sheet.clear();

  // Encabezados (11 columnas)
  const encabezados = [
    'placa',
    'tipo_vehiculo',
    'entidad',
    'fecha',
    'tipo_multa',
    'motivo_legal',
    'monto',
    'estado',
    'no_multa',
    'categoria',
    'fecha_notificacion',
  ];
  sheet.getRange(1, 1, 1, encabezados.length).setValues([encabezados]);

  // 25 multas demo: [placa, tipo_vehiculo, entidad, fecha, tipo_multa, articulo, monto, estado]
  const demo = [
    ['P123ABC', 'particular', 'EMETRA', '2026-08-20', 'PAPELETA', '181-14', 400, 'pendiente'],
    ['P123ABC', 'particular', 'EMETRA', '2026-07-01', 'CEPO', '184-6', 400, 'pendiente'],
    ['P123ABC', 'particular', 'PNC', '2026-05-10', 'PAPELETA', '182-1', 300, 'pagada'],
    ['P123ABC', 'particular', 'EMETRA', '2026-03-15', 'PAPELETA', '181-1', 200, 'prescrita'],
    ['M789XYZ', 'moto', 'PNC', '2026-09-01', 'PAPELETA', '181-14', 400, 'pendiente'],
    ['M789XYZ', 'moto', 'PNC', '2026-08-15', 'PAPELETA', '184-10', 500, 'pendiente'],
    ['M789XYZ', 'moto', 'Emixtra', '2026-06-20', 'PAPELETA', '182-3', 300, 'pagada'],
    ['M789XYZ', 'moto', 'PNC', '2026-04-05', 'FOTOVELOCIMETRO', '182-12', 500, 'impugnada'],
    ['C456DEF', 'comercial', 'EMETRA', '2026-03-01', 'PAPELETA', '181-1', 200, 'pagada'],
    ['C456DEF', 'comercial', 'EMETRA', '2026-09-05', 'CEPO', '184-6', 400, 'pendiente'],
    ['C456DEF', 'comercial', 'PNC', '2026-07-22', 'PAPELETA', '184-7', 500, 'pendiente'],
    ['B111AAA', 'bus', 'PNC', '2026-09-05', 'FOTOVELOCIMETRO', '182-12', 500, 'pendiente'],
    ['B111AAA', 'bus', 'PNC', '2026-02-10', 'PAPELETA', '180-8', 500, 'prescrita'],
    ['T222BBB', 'taxi', 'EMETRA', '2026-09-08', 'PAPELETA', '184-6', 400, 'pendiente'],
    ['T222BBB', 'taxi', 'EMETRA', '2026-05-30', 'PAPELETA', '181-14', 400, 'impugnada'],
    ['P456CDE', 'particular', 'Emixtra', '2026-09-02', 'PAPELETA', '181-14', 400, 'pendiente'],
    ['P456CDE', 'particular', 'Emixtra', '2026-06-10', 'CEPO', '184-6', 400, 'pagada'],
    ['P789FGH', 'particular', 'Villa Nueva', '2026-08-28', 'PAPELETA', '182-1', 300, 'pendiente'],
    ['P789FGH', 'particular', 'Villa Nueva', '2026-04-18', 'PAPELETA', '184-1', 500, 'impugnada'],
    ['M321LMN', 'moto', 'Amatitlán', '2026-09-06', 'PAPELETA', '184-10', 500, 'pendiente'],
    ['M321LMN', 'moto', 'Amatitlán', '2026-07-12', 'PAPELETA', '181-14', 400, 'pagada'],
    ['C654OPQ', 'comercial', 'PNC', '2026-08-10', 'FOTOVELOCIMETRO', '182-12', 500, 'pendiente'],
    ['C654OPQ', 'comercial', 'PNC', '2026-03-25', 'PAPELETA', '184-7', 500, 'prescrita'],
    ['P987RST', 'particular', 'EMETRA', '2026-09-09', 'PAPELETA', '180-8', 500, 'pendiente'],
    ['P987RST', 'particular', 'EMETRA', '2026-08-01', 'PAPELETA', '181-1', 200, 'pendiente'],
  ];

  // Deriva categoria + no_multa secuencial + fecha_notificacion (fecha + 2 días)
  const filas = demo.map((d, i) => {
    const [placa, tipoVehiculo, entidad, fecha, tipoMulta, articulo, monto, estado] = d;
    const infraccion = MAPA_ARTICULO_INFRACCION[articulo];
    return [
      placa,
      tipoVehiculo,
      entidad,
      fecha,
      tipoMulta,
      construirMotivoLegal(infraccion),
      monto,
      estado,
      String(123456 + i), // no_multa secuencial de 6 dígitos
      CATEGORIA_POR_INFRACCION[infraccion],
      sumarDias(fecha, 2), // fecha_notificacion = fecha + 2 días
    ];
  });
  sheet.getRange(2, 1, filas.length, encabezados.length).setValues(filas);

  // Limpiar cache para que tome los datos nuevos
  CacheService.getScriptCache().remove(CACHE_KEY);

  return '✅ Setup listo: hoja LIMPIADA y 25 multas demo pobladas.';
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
    tipo_multa: encabezados.indexOf('tipo_multa'),
    motivo_legal: encabezados.indexOf('motivo_legal'),
    monto: encabezados.indexOf('monto'),
    estado: encabezados.indexOf('estado'),
    no_multa: encabezados.indexOf('no_multa'),
    categoria: encabezados.indexOf('categoria'),
    fecha_notificacion: encabezados.indexOf('fecha_notificacion'),
  };

  const multas = [];
  for (let i = 1; i < valores.length; i++) {
    const fila = valores[i];
    if (!fila[idx.placa]) continue;
    const motivoLegal = (fila[idx.motivo_legal] || '').toString().trim();
    multas.push({
      placa: fila[idx.placa].toString().trim().toUpperCase(),
      tipo_vehiculo: (fila[idx.tipo_vehiculo] || '').toString().trim().toLowerCase(),
      entidad: (fila[idx.entidad] || '').toString().trim(),
      fecha: formatearFecha(fila[idx.fecha]),
      tipo_multa: (fila[idx.tipo_multa] || 'PAPELETA').toString().trim().toUpperCase(),
      infraccion: derivarInfraccion(motivoLegal),
      motivo_legal: motivoLegal,
      monto: Number(fila[idx.monto]) || 0,
      estado: (fila[idx.estado] || 'pendiente').toString().trim().toLowerCase(),
      no_multa: (fila[idx.no_multa] || '').toString().trim(),
      categoria: (fila[idx.categoria] || '').toString().trim().toLowerCase(),
      fecha_notificacion: formatearFecha(fila[idx.fecha_notificacion]),
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

/** Suma días a una fecha ISO YYYY-MM-DD y devuelve otra fecha ISO */
function sumarDias(fechaISO, dias) {
  const f = new Date((fechaISO || '').toString() + 'T00:00:00');
  if (isNaN(f.getTime())) return '';
  f.setDate(f.getDate() + dias);
  return Utilities.formatDate(f, Session.getScriptTimeZone(), 'yyyy-MM-dd');
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

/**
 * POST / con JSON:
 * { placa, tipo_vehiculo, entidad, fecha, tipo_multa, infraccion,
 *   motivo_legal, monto, estado, no_multa, categoria, fecha_notificacion }
 * - infraccion y motivo_legal: alcanza con uno; el otro se deriva.
 * - categoria: se deriva de la infracción si no viene.
 * - fecha_notificacion: fecha + 2 días si no viene.
 */
function doPost(e) {
  const salida = { ok: true };

  try {
    const body = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);

    const infraccion = (body.infraccion || derivarInfraccion(body.motivo_legal) || '')
      .toString()
      .trim();
    const motivoLegal = (body.motivo_legal || construirMotivoLegal(infraccion) || '')
      .toString()
      .trim();
    const fecha = (body.fecha || '').toString().trim();

    sheet.appendRow([
      (body.placa || '').toString().trim().toUpperCase(),
      (body.tipo_vehiculo || '').toString().trim().toLowerCase(),
      (body.entidad || '').toString().trim(),
      fecha,
      (body.tipo_multa || 'PAPELETA').toString().trim().toUpperCase(),
      motivoLegal,
      Number(body.monto) || 0,
      (body.estado || 'pendiente').toString().trim().toLowerCase(),
      (body.no_multa || '').toString().trim(),
      (body.categoria || CATEGORIA_POR_INFRACCION[infraccion] || '').toString().trim().toLowerCase(),
      (body.fecha_notificacion || sumarDias(fecha, 2) || '').toString().trim(),
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
// placa     | tipo_vehiculo | entidad  | fecha       | tipo_multa | motivo_legal                                        | monto | estado    | no_multa | categoria | fecha_notificacion
// P123ABC   | particular    | EMETRA   | 2026-08-20  | PAPELETA   | ARTÍCULO 181-14: Por no respetar las señales...     | 400   | pendiente | 123456   | grave     | 2026-08-22
// M789XYZ   | moto          | PNC      | 2026-09-01  | PAPELETA   | ARTÍCULO 181-14: Por no respetar las señales...     | 400   | pendiente | 123457   | grave     | 2026-09-03
// C456DEF   | comercial     | EMETRA   | 2026-03-01  | PAPELETA   | ARTÍCULO 181-1: Por circular sin tarjeta...         | 200   | pagada    | 123458   | leve      | 2026-03-03
//
// tipo_vehiculo válidos: particular | moto | comercial | bus | taxi | camion | otro
// tipo_multa válidos: PAPELETA | CEPO | FOTOVELOCIMETRO
// estado válidos: pendiente | pagada | impugnada | prescrita
// categoria válidos: leve | grave | muy_grave
// no_multa: solo números, 6 dígitos
// infraccion: id del catálogo en public/infracciones.json (se deriva del artículo en motivo_legal)