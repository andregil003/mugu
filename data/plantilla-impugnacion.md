# Plantilla de Escrito de Impugnación de Multa de Tránsito

> **Uso:** Plantilla para el generador de borradores del prototipo (Reto 05 HACKCREA).
> Los campos `{{doble_llave}}` se llenan con datos del formulario guiado.
> Los bloques `[CONDICIONAL] ... [/CONDICIONAL]` se incluyen solo si el Semáforo de Legalidad detectó esa falla.
> **AVISO:** Este borrador es orientativo y NO constituye asesoría legal. El usuario decide si lo presenta.

---

**Señores:**
**{{entidad_emisora}}** — Juzgado de Asuntos Municipales / Departamento de Tránsito
**Presente**

**Asunto:** Impugnación de multa de tránsito No. {{numero_boleta}}
**Referencia:** Notificación de fecha {{fecha_notificacion}}

Yo, **{{nombre_completo}}**, de {{edad}} años, guatemalteco(a), con CUI **{{cui}}**, con domicilio en **{{domicilio}}**, señalando lugar para recibir notificaciones en **{{lugar_notificaciones}}**, ante usted con todo respeto comparezco y:

**EXPONGO:**

**I. DE LA MULTA IMPUGNADA**

Que fui notificado(a) de la multa de tránsito identificada con el número **{{numero_boleta}}**, emitida por **{{entidad_emisora}}** con fecha de infracción **{{fecha_infraccion}}** a las **{{hora_infraccion}}** horas en **{{lugar_infraccion}}**, por la presunta infracción de **{{descripcion_infraccion}}** ({{codigo_normativo}}), por un monto de **Q{{monto}}**.

**II. FUNDAMENTO LEGAL**

Que el Decreto 33-2024 del Congreso de la República, que reforma la Ley de Tránsito (Decreto 132-96), establece en su Artículo 2 los requisitos obligatorios que debe contener toda notificación de multa, así como el derecho de defensa del presunto infractor dentro del plazo de 15 días, y la prescripción de las multas no notificadas en un plazo de 120 días.

**III. VICIOS DE LA NOTIFICACIÓN**

[CONDICIONAL: falta_fecha_lugar]
**A. Omisión de fecha, hora y lugar exacto.** La notificación no indica con precisión la fecha, hora y lugar de la presunta infracción, contraviniendo el Artículo 2 del Decreto 33-2024, que exige "fecha, hora y lugar exacto de la infracción". Sin estos datos no es posible ejercer adecuadamente el derecho de defensa.
[/CONDICIONAL]

[CONDICIONAL: datos_vehiculo_incorrectos]
**B. Datos del vehículo incorrectos.** La notificación consigna datos del vehículo (placa, marca, modelo) que no corresponden al vehículo de mi propiedad, contraviniendo el Artículo 2 del Decreto 33-2024. La placa consignada es **{{placa_notificacion}}** y la de mi vehículo es **{{placa_real}}**.
[/CONDICIONAL]

[CONDICIONAL: sin_pruebas]
**C. Ausencia de pruebas de respaldo.** La notificación no adjunta fotografía, video u otro documento que acredite la presunta infracción, contraviniendo el Artículo 2 del Decreto 33-2024, que exige "pruebas de respaldo (fotos, videos u otros documentos)".
[/CONDICIONAL]

[CONDICIONAL: sin_base_normativa]
**D. Omisión de la base normativa y el monto.** La notificación no cita la normativa aplicable ni el monto exacto de la multa, contraviniendo el Artículo 2 del Decreto 33-2024, que exige "explicación clara de la infracción cometida, citando la normativa aplicable" y el "monto de la multa, forma de pago y plazos".
[/CONDICIONAL]

[CONDICIONAL: sin_procedimiento_impugnacion]
**E. Omisión del procedimiento para impugnar.** La notificación no indica el procedimiento para impugnar ni el plazo para hacerlo, contraviniendo el Artículo 2 del Decreto 33-2024, que exige indicar el "procedimiento para impugnar y el plazo para realizar el pago o presentar recursos".
[/CONDICIONAL]

[CONDICIONAL: prescripcion]
**F. Prescripción de la multa.** La presunta infracción ocurrió el **{{fecha_infraccion}}** y la notificación se realizó el **{{fecha_notificacion}}**, es decir, después de los 120 días que establece el Artículo 2 del Decreto 33-2024. En consecuencia, la multa ha prescrito y no puede requerirse su pago.
[/CONDICIONAL]

[CONDICIONAL: sin_competencia]
**G. Incompetencia territorial de la autoridad emisora.** La multa fue impuesta por **{{entidad_emisora}}** (municipalidad) en **{{lugar_infraccion}}**, tramo que corresponde a **{{tipo_ruta}}** (ruta nacional/centroamericana). Conforme al Artículo 1 del Decreto 33-2024, las autoridades municipales de tránsito tienen prohibido imponer multas en rutas nacionales y centroamericanas sin convenio formalizado con la Policía Nacional Civil.
[/CONDICIONAL]

**IV. PETITORIO**

Por lo anteriormente expuesto, respetuosamente solicito:

1. Que se tenga por interpuesta la presente impugnación dentro del plazo de 15 días establecido en el Decreto 33-2024.
2. Que se declare **{{tipo_resolucion_solicitada}}** — la anulación de la multa No. {{numero_boleta}} por los vicios señalados.
3. Que se me notifique la resolución en el lugar señalado.

**Acompaño como prueba:**
- Copia de la notificación impugnada
- [CONDICIONAL: datos_vehiculo_incorrectos] Copia de la tarjeta de circulación del vehículo [/CONDICIONAL]
- [CONDICIONAL: prescripcion] Constancia de la fecha de la infracción [/CONDICIONAL]
- [CONDICIONAL: sin_competencia] Mapa/ubicación del tramo donde ocurrió la infracción [/CONDICIONAL]

**Lugar y fecha:** {{lugar}}, {{fecha_presentacion}}

**Firma:**
_________________________
**{{nombre_completo}}**
CUI: {{cui}}
Teléfono: {{telefono}}
Correo: {{correo}}