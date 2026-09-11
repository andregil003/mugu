// ContactoEntidad: tarjetita con el contacto de la entidad que emitió la multa.
// Datos de public/entidades.json (fuente: contactos SAT + tabla de pagos).
// Se muestra debajo de los botones de acción en Detalle/Pago/Apelación.
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPhone,
  faLocationDot,
  faGlobe,
  faBuildingColumns,
  faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons'
import { useI18n } from '@/lib/i18n'

export default function ContactoEntidad({ entidad }) {
  const { t } = useI18n()
  if (!entidad) return null

  const telefono = entidad.telefono
  const telefonoExtra = entidad.telefonoExtra
  const direccion = entidad.direccion
  const pagoEnLinea = entidad.pagoEnLinea
  const pagoPresencial = entidad.pagoPresencial
  // Evitar duplicar la dirección general cuando es la misma del pago presencial
  const mostrarDireccion =
    direccion && (!pagoPresencial?.direccion || pagoPresencial.direccion !== direccion)

  return (
    <section className="mt-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">
        {t('contactoTitulo')}
      </h2>
      <div className="space-y-2.5">
        {telefono ? (
          <div className="flex items-start gap-2.5 rounded-xl bg-gray-50/80 px-3 py-2.5 text-sm">
            <FontAwesomeIcon
              icon={faPhone}
              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t('contactoTelefono')}
              </p>
              <p className="font-semibold">
                {telefono}
                {telefonoExtra ? ` · ${telefonoExtra}` : ''}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 rounded-xl bg-gray-50/80 px-3 py-2.5 text-sm">
            <FontAwesomeIcon
              icon={faPhone}
              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t('contactoTelefono')}
              </p>
              <p className="font-medium text-muted-foreground">
                {t('contactoPendiente')}
              </p>
            </div>
          </div>
        )}

        {mostrarDireccion && (
          <div className="flex items-start gap-2.5 rounded-xl bg-gray-50/80 px-3 py-2.5 text-sm">
            <FontAwesomeIcon
              icon={faLocationDot}
              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t('contactoDireccion')}
              </p>
              <p className="font-medium leading-snug">{direccion}</p>
            </div>
          </div>
        )}

        {pagoEnLinea && (
          <div className="flex items-start gap-2.5 rounded-xl bg-gray-50/80 px-3 py-2.5 text-sm">
            <FontAwesomeIcon
              icon={faGlobe}
              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t('contactoPagoEnLinea')}
              </p>
              {pagoEnLinea.disponible ? (
                <>
                  <p className="font-medium leading-snug">{pagoEnLinea.descripcion}</p>
                  {pagoEnLinea.url && (
                    <a
                      href={pagoEnLinea.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700 active:scale-95"
                    >
                      {pagoEnLinea.url.replace(/^https?:\/\/(www\.)?/, '')}
                      <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3" />
                    </a>
                  )}
                </>
              ) : (
                <p className="font-medium text-muted-foreground">
                  {t('contactoNoConfirmado')}
                  {pagoEnLinea.nota ? ` — ${pagoEnLinea.nota}` : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {pagoPresencial && (
          <div className="flex items-start gap-2.5 rounded-xl bg-gray-50/80 px-3 py-2.5 text-sm">
            <FontAwesomeIcon
              icon={faBuildingColumns}
              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {pagoPresencial.confirmado
                  ? t('contactoPagoPresencial')
                  : t('contactoDondeConsultar')}
              </p>
              {pagoPresencial.direccion && (
                <p className="font-medium leading-snug">{pagoPresencial.direccion}</p>
              )}
              {pagoPresencial.nota && (
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  {pagoPresencial.nota}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}