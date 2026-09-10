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
 *     infraccion,            // id corto SOLO para los 28 artículos mapeados; null si no
 *     motivo_legal,          // texto formal "ARTICULO 181-14: ..." (tabla ARTICULOS)
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
// TABLA COMPLETA DEL REGLAMENTO — ARTICULOS
// 98 artículos: TIPO | MOTIVO completo | MONTO
// Fuente: Reglamento de Tránsito (cartilla oficial).
// ============================================================
const ARTICULOS = {
  // ---- Serie 180 — PAPELETA Q100 ----
  '180-1': { tipo: 'PAPELETA', motivo: 'ARTICULO 180-1: Por no tener las bicicletas y motobicicletas, el equipamiento básico en óptimas condiciones de funcionamiento.', monto: 100 },
  '180-2': { tipo: 'PAPELETA', motivo: 'ARTICULO 180-2: Por no respetar las señales de tránsito (No vehículos, Silencio, Ceder el paso, No virar o girar a la derecha, Virar a la derecha o izquierda, Velocidad mínima, Siga de frente).', monto: 100 },
  '180-3': { tipo: 'PAPELETA', motivo: 'ARTICULO 180-3: Por circular en el arcén sin causa justificada.', monto: 100 },
  '180-4': { tipo: 'PAPELETA', motivo: 'ARTICULO 180-4: Por no facilitar la incorporación al tránsito a otros vehículos.', monto: 100 },
  '180-5': { tipo: 'PAPELETA', motivo: 'ARTICULO 180-5: Por no utilizar las señales de tránsito correspondientes al virar o girar, cambiar de sentido, cambiar de carril, desacelerar y retroceder.', monto: 100 },
  '180-6': { tipo: 'PAPELETA', motivo: 'ARTICULO 180-6: Por no respetar el derecho preferente a rebasar.', monto: 100 },
  '180-7': { tipo: 'PAPELETA', motivo: 'ARTICULO 180-7: Por utilizar en casos no previstos en el presente reglamento, advertencias auditivas o avisos luminosos.', monto: 100 },
  '180-8': { tipo: 'PAPELETA', motivo: 'ARTICULO 180-8: Por conducir utilizando auriculares conectados y aparatos receptores o reproductores de sonido, o utilizando teléfonos, radios comunicadores u otros aparatos similares.', monto: 100 },

  // ---- Serie 181 — Q200 (181-25/26/27 son CEPO) ----
  '181-1': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-1: Por circular sin portar la tarjeta de circulación o fotocopia autenticada de la misma.', monto: 200 },
  '181-2': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-2: Por portar las placas de circulación en lugares no autorizados.', monto: 200 },
  '181-3': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-3: Por no portar licencia de conducir.', monto: 200 },
  '181-4': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-4: Por no tener los vehículos automotores, con excepción de las motobicicletas, el equipamiento básico según el presente Reglamento.', monto: 200 },
  '181-5': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-5: Por utilizar un vehículo para aprendizaje o pruebas prácticas, sin las especificaciones que establece el presente Reglamento.', monto: 200 },
  '181-6': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-6: Por producir sonidos o ruidos estridentes exagerados o innecesarios, por medio de los propios vehículos, escapes, bocinas u otros aditamentos.', monto: 200 },
  '181-7': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-7: Por transportar carga en forma inadecuada y peligrosa, o por transportarla constituyendo obstáculo para los demás usuarios de la vía pública.', monto: 200 },
  '181-8': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-8: Por no señalizar la carga que se transporta y que sobresale, de día y de noche.', monto: 200 },
  '181-9': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-9: Por no portar identificación vigente o reglamentaria, el conductor de transporte colectivo.', monto: 200 },
  '181-10': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-10: Por circular en carriles no permitidos para el transporte público.', monto: 200 },
  '181-11': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-11: Por parar un vehículo de transporte colectivo, no paralelo a la acera, o a más de treinta centímetros de la misma.', monto: 200 },
  '181-12': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-12: Por parar un vehículo de transporte de pasajeros, a más distancia del punto de parada autorizada.', monto: 200 },
  '181-13': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-13: Por circular un vehículo de transporte de carga, por la izquierda o carriles no permitidos.', monto: 200 },
  '181-14': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-14: Por no respetar las señales de tránsito (Alto, Alto del semáforo, No hay paso, Del Agente, Altura máxima, Ancho máximo).', monto: 200 },
  '181-15': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-15: Por circular en contra de la vía señalizada o autorizada.', monto: 200 },
  '181-16': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-16: Por iniciar o comenzar la marcha o maniobra o reemprenderla, forzando con esto al vehículo que lleva la prioridad a modificar bruscamente su trayectoria o velocidad.', monto: 200 },
  '181-17': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-17: Por no observar las normas de prioridad de paso.', monto: 200 },
  '181-18': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-18: Por no respetar el turno en una fila de espera.', monto: 200 },
  '181-19': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-19: Por incorporarse a la circulación sin observar las normas respectivas.', monto: 200 },
  '181-20': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-20: Por virar o girar sin observar las normas de posicionamiento y maniobra reglamentarias.', monto: 200 },
  '181-21': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-21: Por cambiar de un carril a otro carril, sin respetar la prioridad del vehículo que ya circula en uno de los carriles.', monto: 200 },
  '181-22': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-22: Por retroceder en cualquier vía pública, excepto los casos de fuerza mayor o por evidente necesidad.', monto: 200 },
  '181-23': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-23: Por rebasar por la derecha, salvo en casos permitidos.', monto: 200 },
  '181-24': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-24: Por rebasar e integrarse a su carril, obligando a otros usuarios a modificar su trayectoria o velocidad.', monto: 200 },
  '181-25': { tipo: 'CEPO', motivo: 'ARTICULO 181-25: Por estacionarse en contra de la vía del carril más próximo.', monto: 200 },
  '181-26': { tipo: 'CEPO', motivo: 'ARTICULO 181-26: Por estacionarse a más de veinticinco centímetros del bordillo o banqueta correspondiente.', monto: 200 },
  '181-27': { tipo: 'CEPO', motivo: 'ARTICULO 181-27: Por estacionar o parar un vehículo, obstaculizando la circulación o constituyendo cierto peligro para los usuarios de la vía.', monto: 200 },
  '181-28': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-28: Por circular sin luz baja durante el día en los casos previstos de este Reglamento.', monto: 200 },
  '181-29': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-29: Por no utilizar las luces de posición para iluminar vehículos automotores inmovilizados en vías insuficientemente iluminadas.', monto: 200 },
  '181-30': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-30: Por no utilizar luces de emergencia, en casos previstos en el presente Reglamento.', monto: 200 },
  '181-31': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-31: Por no utilizar las luces de posición y bajas en los túneles o en condiciones atmosféricas o físicas que disminuya la visibilidad (incluyendo gálibo para pesados).', monto: 200 },
  '181-33': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-33: Por no respetar el orden jerárquico prevaleciente entre señales y normas de tránsito.', monto: 200 },
  '181-34': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-34: Por circular sin cinturones de seguridad, salvo los casos de excepción previstos en el presente Reglamento.', monto: 200 },
  '181-35': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-35: Por remolcar a otro vehículo por medios o en lugares prohibidos.', monto: 200 },
  '181-36': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-36: Por circular en vehículos que tengan el silenciador o escape inadecuado, incompleto, deteriorado o con tubos resonadores.', monto: 200 },
  '181-37': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-37: Por circular con llantas lisas o con rotura.', monto: 200 },
  '181-38': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-38: Por permanecer en la vía pública, efectuando reparaciones técnicas, más de dos horas en áreas urbanas y doce en áreas extraurbanas.', monto: 200 },
  '181-39': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-39: Por circular sin poseer permiso de aprendizaje o con permiso de aprendizaje vencido.', monto: 200 },
  '181-40': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-40: Por efectuar reparaciones de emergencia en vías urbanas importantes, cuando la autoridad lo prohíba.', monto: 200 },
  '181-41': { tipo: 'PAPELETA', motivo: 'ARTICULO 181-41: Por negarse a recibir la boleta de aviso, requerimiento de pago y de citación.', monto: 200 },

  // ---- Serie 182 — Q300 (182-12 es FOTOVELOCIMETRO) ----
  '182-1': { tipo: 'PAPELETA', motivo: 'ARTICULO 182-1: Por conducir con licencia vencida.', monto: 300 },
  '182-2': { tipo: 'PAPELETA', motivo: 'ARTICULO 182-2: Por no tener el vehículo de transporte colectivo, identificación del conductor.', monto: 300 },
  '182-3': { tipo: 'PAPELETA', motivo: 'ARTICULO 182-3: Por tirar o lanzar basura u otros objetos en la vía pública, desde un vehículo estacionado o en marcha.', monto: 300 },
  '182-4': { tipo: 'PAPELETA', motivo: 'ARTICULO 182-4: Por circular con vehículo sin escape o sin silenciador.', monto: 300 },
  '182-5': { tipo: 'PAPELETA', motivo: 'ARTICULO 182-5: Por producir sonidos o ruidos estridentes exagerados o innecesarios por medio de los propios vehículos, bocinas, altavoces u otros aditamentos, en áreas residenciales, hospitales o en la noche.', monto: 300 },
  '182-6': { tipo: 'PAPELETA', motivo: 'ARTICULO 182-6: Por utilizar bocinas o sirenas propias de los vehículos de emergencia.', monto: 300 },
  '182-7': { tipo: 'PAPELETA', motivo: 'ARTICULO 182-7: Por rebasar a un vehículo que se detuvo ante un paso peatonal.', monto: 300 },
  '182-8': { tipo: 'PAPELETA', motivo: 'ARTICULO 182-8: Por circular por espacios peatonales con cualquier vehículo automotor, si no está autorizado por la señalización del lugar.', monto: 300 },
  '182-9': { tipo: 'PAPELETA', motivo: 'ARTICULO 182-9: Por ubicar ventas callejeras u otros objetos o elementos no autorizados, sobre los espacios peatonales, pasarelas o la vía pública.', monto: 300 },
  '182-10': { tipo: 'PAPELETA', motivo: 'ARTICULO 182-10: Por arrojar, depositar o abandonar sobre la vía pública, materia que puede entorpecer la circulación.', monto: 300 },
  '182-11': { tipo: 'PAPELETA', motivo: 'ARTICULO 182-11: Por realizar operaciones de carga y descarga, sin contar con autorización de la autoridad de tránsito correspondiente.', monto: 300 },
  '182-12': { tipo: 'FOTOVELOCIMETRO', motivo: 'ARTICULO 182-12: Por no cumplir los límites de velocidad máxima.', monto: 300 },
  '182-13': { tipo: 'PAPELETA', motivo: 'ARTICULO 182-13: Por bloquear una intersección, salvo en los casos permitidos.', monto: 300 },
  '182-14': { tipo: 'PAPELETA', motivo: 'ARTICULO 182-14: Por no respetar las señales en los cruces de ferrocarril.', monto: 300 },
  '182-15': { tipo: 'PAPELETA', motivo: 'ARTICULO 182-15: Por efectuar un viraje o giro continuo a la derecha donde no esté permitido o hacerlo sin ceder el paso al tránsito transversal.', monto: 300 },
  '182-16': { tipo: 'PAPELETA', motivo: 'ARTICULO 182-16: Por cambiar de carril, en o justo antes de una intersección, o no seguir la dirección indicada para el carril que ocupa.', monto: 300 },
  '182-17': { tipo: 'PAPELETA', motivo: 'ARTICULO 182-17: Por efectuar cambios de sentido en lugares prohibidos.', monto: 300 },
  '182-18': { tipo: 'PAPELETA', motivo: 'ARTICULO 182-18: Por rebasar en lugares prohibidos.', monto: 300 },
  '182-19': { tipo: 'PAPELETA', motivo: 'ARTICULO 182-19: Por no ceder el paso a los peatones cuando tengan la prioridad.', monto: 300 },
  '182-20': { tipo: 'PAPELETA', motivo: 'ARTICULO 182-20: Por no ceder el paso a los ciclistas cuando tengan la prioridad.', monto: 300 },

  // ---- Serie 183 — Q400 ----
  '183-1': { tipo: 'PAPELETA', motivo: 'ARTICULO 183-1: Por conducir sin tener licencia.', monto: 400 },
  '183-2': { tipo: 'PAPELETA', motivo: 'ARTICULO 183-2: Por circular utilizando luces exclusivas para los vehículos de emergencia y de mantenimiento vial y urbano.', monto: 400 },
  '183-3': { tipo: 'PAPELETA', motivo: 'ARTICULO 183-3: Por rebasar a otras unidades del transporte público para efectuar una parada justo frente a éstas.', monto: 400 },
  '183-4': { tipo: 'PAPELETA', motivo: 'ARTICULO 183-4: Por conducir un vehículo automotor con licencia que no corresponda al mismo.', monto: 400 },
  '183-5': { tipo: 'PAPELETA', motivo: 'ARTICULO 183-5: Por utilizar carriles especiales diseñados para la circulación de otro medio de transporte.', monto: 400 },
  '183-6': { tipo: 'PAPELETA', motivo: 'ARTICULO 183-6: Por no ceder el paso a escolares dentro de la zona escolar y los horarios establecidos.', monto: 400 },
  '183-7': { tipo: 'PAPELETA', motivo: 'ARTICULO 183-7: Por circular vehículos automotores con un lado frontal completamente no iluminado.', monto: 400 },
  '183-8': { tipo: 'PAPELETA', motivo: 'ARTICULO 183-8: Por no señalizar un obstáculo sobre la vía pública.', monto: 400 },
  '183-9': { tipo: 'PAPELETA', motivo: 'ARTICULO 183-9: Por instalar objetos o cosas similares, que sean o parezcan señales de tránsito; confundan o inciten a comportamientos antirreglamentarios.', monto: 400 },
  '183-10': { tipo: 'PAPELETA', motivo: 'ARTICULO 183-10: Por no comportarse en la forma que establece el presente Reglamento, al detener un vehículo por accidentes, emergencias o averías.', monto: 400 },
  '183-11': { tipo: 'PAPELETA', motivo: 'ARTICULO 183-11: Por estacionarse en determinado lugar, simulando una falla mecánica.', monto: 400 },
  '183-12': { tipo: 'PAPELETA', motivo: 'ARTICULO 183-12: Por retroceder en autopistas y vías rápidas.', monto: 400 },
  '183-13': { tipo: 'PAPELETA', motivo: 'ARTICULO 183-13: Por tirar, lanzar o abandonar en la vía pública basura y objetos que pueden entorpecer la circulación.', monto: 400 },
  '183-14': { tipo: 'PAPELETA', motivo: 'ARTICULO 183-14: Por efectuar en la vía pública, reparaciones del vehículo que no sean de emergencia.', monto: 400 },

  // ---- Serie 184 — Q500 (184-6 es CEPO) ----
  '184-1': { tipo: 'PAPELETA', motivo: 'ARTICULO 184-1: Por circular sin placas de circulación.', monto: 500 },
  '184-2': { tipo: 'PAPELETA', motivo: 'ARTICULO 184-2: Por no tener tarjeta de circulación.', monto: 500 },
  '184-3': { tipo: 'PAPELETA', motivo: 'ARTICULO 184-3: Por circular en la vía pública cuando exista restricción dispuesta por la autoridad.', monto: 500 },
  '184-4': { tipo: 'PAPELETA', motivo: 'ARTICULO 184-4: Por circular con vehículo de carga en horarios o rutas prohibidas.', monto: 500 },
  '184-5': { tipo: 'PAPELETA', motivo: 'ARTICULO 184-5: A los propietarios de talleres que reparen vehículos en la vía pública, por cada vehículo.', monto: 500 },
  '184-6': { tipo: 'CEPO', motivo: 'ARTICULO 184-6: Por estacionar en lugar señalizado con prohibición y los especificados en los artículos 152 y 153.', monto: 500 },
  '184-7': { tipo: 'PAPELETA', motivo: 'ARTICULO 184-7: Por transportar a más personas que las plazas correspondientes a cada vehículo.', monto: 500 },
  '184-8': { tipo: 'PAPELETA', motivo: 'ARTICULO 184-8: Por transportar personas en lugares exteriores de las unidades de transporte público.', monto: 500 },
  '184-9': { tipo: 'PAPELETA', motivo: 'ARTICULO 184-9: Por recoger o dejar pasajeros o acompañantes, efectuando parada en lugar no autorizado para el efecto.', monto: 500 },
  '184-10': { tipo: 'PAPELETA', motivo: 'ARTICULO 184-10: Cuando los conductores de motocicletas o motobicicletas y sus acompañantes, no cumplan con la obligación de portar el casco protector y el chaleco.', monto: 500 },
  '184-11': { tipo: 'PAPELETA', motivo: 'ARTICULO 184-11: A los conductores de motocicletas y motobicicletas que transiten en las aceras o banquetas, pasos peatonales, ciclo vías u otras señaladas.', monto: 500 },
  '184-12': { tipo: 'PAPELETA', motivo: 'ARTICULO 184-12: A los conductores de motocicletas y motobicicletas que circulen entre carriles o hagan paradas entre carriles y zigzaguear en la vía pública.', monto: 500 },

  // ---- Serie 185 — montos altos ----
  '185-A-1': { tipo: 'PAPELETA', motivo: 'ARTICULO 185-A-1: Retirar, dañar, alterar o cubrir señales de tránsito.', monto: 1000 },
  '185-A-2': { tipo: 'PAPELETA', motivo: 'ARTICULO 185-A-2: Faltar el respeto, ofender, agredir o insultar a la autoridad de tránsito.', monto: 1000 },
  '185-B': { tipo: 'PAPELETA', motivo: 'ARTICULO 185-B: Por alterar la seguridad del tránsito, mediante la colocación de obstáculos imprevisibles o por cualquier otro medio para facilitar carreras o concursos.', monto: 5000 },
  '185-C': { tipo: 'PAPELETA', motivo: 'ARTICULO 185-C: Por utilizar la vía pública, para carreras, concursos o actividades similares, sin el permiso correspondiente (así como no atender requerimientos de vehículos de emergencia).', monto: 25000 },
};

// ============================================================
// MAPA artículo → id corto de infracción (28 mapeados)
// El frontend usa `infraccion` para la razón clara y el consejo
// (public/infracciones.json). Para el resto: infraccion = null
// y el frontend muestra motivo_legal como fallback.
// ============================================================
const MAPA_ARTICULO_INFRACCION = {
  // 10 originales con id propio en el catálogo
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
  // 18 nuevos con razón clara en infracciones.json
  '181-25': 'articulo_181_25',
  '181-26': 'articulo_181_26',
  '181-27': 'articulo_181_27',
  '181-34': 'articulo_181_34',
  '182-19': 'articulo_182_19',
  '182-20': 'articulo_182_20',
  '183-1': 'articulo_183_1',
  '184-2': 'articulo_184_2',
  '184-3': 'articulo_184_3',
  '184-4': 'articulo_184_4',
  '184-8': 'articulo_184_8',
  '184-9': 'articulo_184_9',
  '184-11': 'articulo_184_11',
  '184-12': 'articulo_184_12',
  '185-A-1': 'articulo_185_a_1',
  '185-A-2': 'articulo_185_a_2',
  '185-B': 'articulo_185_b',
  '185-C': 'articulo_185_c',
};

// Mapa inverso (infraccion → artículo) para POST
const INFRACCION_ARTICULO = Object.fromEntries(
  Object.entries(MAPA_ARTICULO_INFRACCION).map(([articulo, infraccion]) => [infraccion, articulo])
);

/** Categoría derivada del MONTO: 100-200 leve · 300-500 grave · 1000+ muy_grave */
function categoriaPorMonto(monto) {
  const n = Number(monto) || 0;
  if (n >= 1000) return 'muy_grave';
  if (n >= 300) return 'grave';
  return 'leve';
}

/** Motivo legal completo desde la tabla ARTICULOS (para POST) */
function construirMotivoLegal(infraccion) {
  const articulo = INFRACCION_ARTICULO[infraccion];
  if (!articulo) return '';
  const a = ARTICULOS[articulo];
  return a ? a.motivo : '';
}

/** Extrae el artículo ("181-14", "185-A-1", "185-B") del motivo_legal y devuelve el id corto de infracción (o null) */
function derivarInfraccion(motivoLegal) {
  const m = (motivoLegal || '').toString().match(/(\d{3}-(?:[A-Z](?:-\d{1,2})?|\d{1,2}))/);
  if (!m) return null;
  return MAPA_ARTICULO_INFRACCION[m[1]] || null;
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

  // 25 multas demo: [placa, tipo_vehiculo, entidad, fecha, articulo, estado]
  // tipo_multa y monto salen de ARTICULOS (fuente única de verdad).
  const demo = [
    ['P123ABC', 'particular', 'EMETRA', '2026-08-20', '181-14', 'pendiente'],
    ['P123ABC', 'particular', 'EMETRA', '2026-07-01', '184-6', 'pendiente'],
    ['P123ABC', 'particular', 'PNC', '2026-05-10', '182-1', 'pagada'],
    ['P123ABC', 'particular', 'EMETRA', '2026-03-15', '181-1', 'prescrita'],
    ['M789XYZ', 'moto', 'PNC', '2026-09-01', '181-14', 'pendiente'],
    ['M789XYZ', 'moto', 'PNC', '2026-08-15', '184-10', 'pendiente'],
    ['M789XYZ', 'moto', 'Emixtra', '2026-06-20', '182-3', 'pagada'],
    ['M789XYZ', 'moto', 'PNC', '2026-04-05', '182-12', 'impugnada'],
    ['C456DEF', 'comercial', 'EMETRA', '2026-03-01', '181-1', 'pagada'],
    ['C456DEF', 'comercial', 'EMETRA', '2026-09-05', '184-6', 'pendiente'],
    ['C456DEF', 'comercial', 'PNC', '2026-07-22', '184-7', 'pendiente'],
    ['B111AAA', 'bus', 'PNC', '2026-09-05', '182-12', 'pendiente'],
    ['B111AAA', 'bus', 'PNC', '2026-02-10', '180-8', 'prescrita'],
    ['T222BBB', 'taxi', 'EMETRA', '2026-09-08', '184-6', 'pendiente'],
    ['T222BBB', 'taxi', 'EMETRA', '2026-05-30', '181-14', 'impugnada'],
    ['P456CDE', 'particular', 'Emixtra', '2026-09-02', '183-1', 'pendiente'],
    ['P456CDE', 'particular', 'Emixtra', '2026-06-10', '184-6', 'pagada'],
    ['P789FGH', 'particular', 'Villa Nueva', '2026-08-28', '182-1', 'pendiente'],
    ['P789FGH', 'particular', 'Villa Nueva', '2026-04-18', '184-1', 'impugnada'],
    ['M321LMN', 'moto', 'Amatitlán', '2026-09-06', '184-10', 'pendiente'],
    ['M321LMN', 'moto', 'Amatitlán', '2026-07-12', '181-29', 'pagada'],
    ['C654OPQ', 'comercial', 'PNC', '2026-08-10', '182-12', 'pendiente'],
    ['C654OPQ', 'comercial', 'PNC', '2026-03-25', '185-A-1', 'prescrita'],
    ['P987RST', 'particular', 'EMETRA', '2026-09-09', '185-B', 'pendiente'],
    ['P987RST', 'particular', 'EMETRA', '2026-08-01', '185-C', 'pendiente'],
  ];

  // Deriva tipo/motivo/monto de ARTICULOS + categoria del monto + no_multa secuencial + fecha_notificacion
  const filas = demo.map((d, i) => {
    const [placa, tipoVehiculo, entidad, fecha, articulo, estado] = d;
    const a = ARTICULOS[articulo];
    return [
      placa,
      tipoVehiculo,
      entidad,
      fecha,
      a.tipo,
      a.motivo,
      a.monto,
      estado,
      String(123456 + i), // no_multa secuencial de 6 dígitos
      categoriaPorMonto(a.monto),
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
      motivo_legal: motivoLegal,
      monto: Number(fila[idx.monto]) || 0,
      estado: (fila[idx.estado] || 'pendiente').toString().trim().toLowerCase(),
      no_multa: (fila[idx.no_multa] || '').toString().trim(),
      categoria: (fila[idx.categoria] || '').toString().trim().toLowerCase(),
      fecha_notificacion: formatearFecha(fila[idx.fecha_notificacion]),
      infraccion: derivarInfraccion(motivoLegal),
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
 * - categoria: se deriva del monto si no viene.
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
    const monto = Number(body.monto) || 0;

    sheet.appendRow([
      (body.placa || '').toString().trim().toUpperCase(),
      (body.tipo_vehiculo || '').toString().trim().toLowerCase(),
      (body.entidad || '').toString().trim(),
      fecha,
      (body.tipo_multa || 'PAPELETA').toString().trim().toUpperCase(),
      motivoLegal,
      monto,
      (body.estado || 'pendiente').toString().trim().toLowerCase(),
      (body.no_multa || '').toString().trim(),
      (body.categoria || categoriaPorMonto(monto) || '').toString().trim().toLowerCase(),
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
// placa     | tipo_vehiculo | entidad  | fecha       | tipo_multa      | motivo_legal                          | monto | estado    | no_multa | categoria | fecha_notificacion
// P123ABC   | particular    | EMETRA   | 2026-08-20  | PAPELETA        | ARTICULO 181-14: Por no respetar...   | 200   | pendiente | 123456   | grave     | 2026-08-22
// M789XYZ   | moto          | PNC      | 2026-09-01  | PAPELETA        | ARTICULO 181-14: Por no respetar...   | 200   | pendiente | 123457   | grave     | 2026-09-03
// C456DEF   | comercial     | EMETRA   | 2026-03-01  | PAPELETA        | ARTICULO 181-1: Por circular sin...   | 200   | pagada    | 123458   | leve      | 2026-03-03
//
// tipo_vehiculo válidos: particular | moto | comercial | bus | taxi | camion | otro
// tipo_multa válidos: PAPELETA | CEPO | FOTOVELOCIMETRO
// estado válidos: pendiente | pagada | impugnada | prescrita
// categoria (derivada del monto): 100-200 leve | 300-500 grave | 1000+ muy_grave
// no_multa: solo números, 6 dígitos
// infraccion: id del catálogo en public/infracciones.json — SOLO para los 28 artículos
// mapeados en MAPA_ARTICULO_INFRACCION; el resto devuelve null (fallback: motivo_legal)