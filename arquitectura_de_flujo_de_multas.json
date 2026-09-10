{
  "proyecto": "Plataforma de Gestión y Consulta de Multas de Tránsito",
  "contexto": "Facilitar el conocimiento y las acciones a tomar respecto a multas de tránsito en Guatemala.",
  "modulos": [
    {
      "id": "modulo_ingreso",
      "nombre": "Ingreso y Configuración Inicial",
      "pantallas": [
        {
          "id": "pantalla_entrada_qr",
          "nombre": "Punto de Entrada (Web/QR)",
          "descripcion": "Punto de origen del usuario al escanear QR o ingresar URL.",
          "ui_componentes": [],
          "explicacion_tecnica": "Actúa como un enrutador inicial (middleware) que detecta el ingreso y redirige automáticamente al usuario a la configuración de idioma.",
          "conexiones": {
            "onLoad": "pantalla_idioma"
          }
        },
        {
          "id": "pantalla_idioma",
          "nombre": "Selección de Idioma",
          "descripcion": "Permite al usuario elegir el idioma de la interfaz.",
          "ui_componentes": [
            { "tipo": "button", "etiqueta": "Idiomas (ej. Español)", "accion": "setLanguage" },
            { "tipo": "button", "etiqueta": "Idiomas (ej. K'iche')", "accion": "setLanguage" },
            { "tipo": "button", "etiqueta": "Idiomas (ej. Kaqchikel)", "accion": "setLanguage" },
            { "tipo": "button", "etiqueta": "Sugerir idioma", "accion": "abrirFormularioSugerencia" }
          ],
          "explicacion_tecnica": "Debe establecer una variable de estado global (ej. usando Context API o Redux) para alimentar la internacionalización (i18n) de la app.",
          "conexiones": {
            "onLanguageSelect": "pantalla_bienvenida"
          }
        },
        {
          "id": "pantalla_bienvenida",
          "nombre": "Landing Page / Bienvenida",
          "descripcion": "Pantalla de inicio que captura la atención del usuario.",
          "ui_componentes": [
            { "tipo": "typography_h1", "texto": "HAS SIDO MULTADO?" },
            { "tipo": "button_primary", "etiqueta": "Que procede?", "accion": "iniciarFlujo" }
          ],
          "conexiones": {
            "onClick_que_procede": "pantalla_menu_principal"
          }
        }
      ]
    },
    {
      "id": "modulo_navegacion",
      "nombre": "Navegación Principal",
      "pantallas": [
        {
          "id": "pantalla_menu_principal",
          "nombre": "Módulos (Menú Principal)",
          "descripcion": "Núcleo de enrutamiento basado en la necesidad del usuario.",
          "ui_componentes": [
            { "tipo": "button_menu", "etiqueta": "Buscar mis multas", "flujo_destino": "flujo_a" },
            { "tipo": "button_menu", "etiqueta": "Tengo una multa fisica", "flujo_destino": "flujo_b" },
            { "tipo": "button_menu", "etiqueta": "No entiendo mi multa", "flujo_destino": "flujo_c" }
          ],
          "conexiones": {
            "onClick_buscar": "pantalla_ingreso_placa",
            "onClick_fisica": "pantalla_formulario_fisica",
            "onClick_no_entiendo": "pantalla_tabla_informativa"
          }
        }
      ]
    },
    {
      "id": "flujo_a_busqueda_general",
      "nombre": "Flujo A: Buscar mis multas",
      "pantallas": [
        {
          "id": "pantalla_ingreso_placa",
          "nombre": "Ingreso de Placa",
          "descripcion": "Búsqueda general utilizando solo el número de placa.",
          "ui_componentes": [
            { "tipo": "input_text", "etiqueta": "No. Placa", "requerido": true },
            { "tipo": "button_submit", "etiqueta": "BUSCAR", "estilo": "azul" }
          ],
          "explicacion_tecnica": "Realiza un GET request a la API para verificar multas asociadas a la placa en todas las municipalidades registradas.",
          "conexiones": {
            "onSubmit_success": "pantalla_resultados_muni"
          }
        },
        {
          "id": "pantalla_resultados_muni",
          "nombre": "Resultados por Municipalidad",
          "descripcion": "Muestra en qué municipalidades la placa tiene multas activas.",
          "ui_componentes": [
            { "tipo": "grid", "elementos": "botones_muni" },
            { "tipo": "badge_notification", "descripcion": "Globo rojo con número de multas, visible solo si count > 0" }
          ],
          "explicacion_tecnica": "Lógica de renderizado condicional. Itera sobre el response de la API; si una municipalidad tiene multas, activa el badge. Al seleccionar una muni, extrae la 'Fecha de notificación (opcional)' internamente y la pasa como parametro a la siguiente vista.",
          "conexiones": {
            "onClick_muni_con_multa": "pantalla_detalle_multa"
          }
        }
      ]
    },
    {
      "id": "flujo_b_busqueda_especifica",
      "nombre": "Flujo B: Tengo una multa física",
      "pantallas": [
        {
          "id": "pantalla_formulario_fisica",
          "nombre": "Formulario de Multa Física",
          "descripcion": "Búsqueda detallada con los datos del documento impreso.",
          "ui_componentes": [
            { "tipo": "input_text", "etiqueta": "No. Placa", "requerido": true },
            { "tipo": "input_text", "etiqueta": "No. Multa", "requerido": true },
            { "tipo": "input_date", "etiqueta": "Fecha de multa", "requerido": true },
            { "tipo": "input_date", "etiqueta": "Fecha de notificación (opcional)", "requerido": false },
            { "tipo": "select", "etiqueta": "Municipalidad", "requerido": true },
            { "tipo": "button_submit", "etiqueta": "BUSCAR", "estilo": "azul" },
            { "tipo": "alert_error", "condicion": "no_encontrado", "mensaje": "Si no aparece tu multa espera 3 dias desde le dia que te la dieron" }
          ],
          "explicacion_tecnica": "Requiere validación estricta de formulario (yup o similar). Manejo de errores de API (404) para mostrar el mensaje de espera de 3 días (debido a delay en digitación de remisiones).",
          "conexiones": {
            "onSubmit_success": "pantalla_detalle_multa",
            "onSubmit_error": "mostrar_mensaje_espera"
          }
        }
      ]
    },
    {
      "id": "flujo_c_educativo",
      "nombre": "Flujo C: Centro de Ayuda",
      "pantallas": [
        {
          "id": "pantalla_tabla_informativa",
          "nombre": "Más Info",
          "descripcion": "Traducción de términos legales a lenguaje común.",
          "ui_componentes": [
            { "tipo": "table_or_list", "contenido": "Tabla de tipos de multas a lenguaje casual, detalles de cada caso" }
          ],
          "explicacion_tecnica": "Vista informativa. Los datos pueden ser estáticos en el frontend o consumidos desde un CMS sin cabeza (Headless CMS) para facilitar su actualización.",
          "conexiones": {}
        }
      ]
    },
    {
      "id": "modulo_resolucion",
      "nombre": "Detalles y Resolución",
      "pantallas": [
        {
          "id": "pantalla_detalle_multa",
          "nombre": "Vista de Detalle de la Multa (Info de la multa)",
          "descripcion": "Destino final de las búsquedas, presenta el estado y opciones de resolución.",
          "ui_componentes": [
            { "tipo": "typography_body", "texto": "Razón de multa con lenguaje claro (mapeado desde la API)" },
            { 
              "tipo": "stepper_semaforo", 
              "estados": [
                { "nombre": "Noti", "color": "Verde" },
                { "nombre": "Apelacion", "color": "Amarillo" },
                { "nombre": "Pago", "color": "Rojo" }
              ]
            },
            { "tipo": "button_action", "etiqueta": "Quiero apelar", "estilo": "azul" },
            { "tipo": "button_action", "etiqueta": "Quiero pagar", "estilo": "azul" }
          ],
          "explicacion_tecnica": "El componente 'stepper_semaforo' necesita lógica de fechas. Debe comparar date.now() con la 'Fecha de notificación' y los plazos legales para determinar en qué fase del semáforo se encuentra el usuario.",
          "conexiones": {
            "onClick_apelar": "pantalla_info_apelacion",
            "onClick_pagar": "pantalla_info_pagar"
          }
        },
        {
          "id": "pantalla_info_apelacion",
          "nombre": "Información de Apelación",
          "descripcion": "Guía o requisitos para apelar en el juzgado de tránsito correspondiente.",
          "ui_componentes": [],
          "conexiones": {}
        },
        {
          "id": "pantalla_info_pagar",
          "nombre": "Información de Pago",
          "descripcion": "Pasarelas de pago o instrucciones bancarias para cancelar la multa.",
          "ui_componentes": [],
          "conexiones": {}
        }
      ]
    }
  ]
}