# Sistema RAVE · demo para Di Parma Pizzería

Demo de evaluación de **Sistema RAVE V26.54** (VINCULAR BUSINESS) adaptada a **Di Parma Pizzería de masa madre** (Salta).
Un solo archivo (`index.html`): carta pública adelante y panel de gestión en `#acceso`.

- Carta pública (retiro y delivery): `/`
- Carta de una mesa, la que abre el QR o el tag NFC: `/?mesa=I4` (mesas `I1`–`I10`, exterior `E1`–`E3`, barra `B1`–`B5`)
- Acceso del equipo: `/#acceso`
- Usuarios de prueba: ADMIN 1234 · Supervisor 1111 · Caja 0000 · Mozo Martín 2222 · Moza Sofía 3333 · Barra Joaquín 4444 · Cocina Franco 5555 · Cocina Lucía 6666

**Demo en línea:** https://raveholding.github.io/DIPARMAPizzeriaDemo/

**Es una demo.** Carta, precios, costos, stock, lotes de masa, socios, cupones, personal y ventas del día son de ejemplo.
Los datos se guardan sólo en el navegador de quien la prueba y se sincronizan en vivo entre pestañas del mismo equipo (por ejemplo, la carta de una mesa en una pestaña y el panel del personal en otra). Se renuevan solos cada 14 horas o desde *Configuración → Restablecer datos de demostración*.
**Facturación electrónica (ARCA):** al cobrar se emite una Factura C **SIMULADA** (CAE inventado, rotulado «SIN VALIDEZ FISCAL»), con contingencia si ARCA no responde y nota de crédito. En el sistema del cliente el CAE lo pide el servidor a ARCA (WSAA + WSFE) con el certificado del propio comercio.
**PedidosYa** es una conexión simulada (pedidos de ejemplo que se sincronizan con caja y cocina). Grabar tags NFC requiere Chrome en Android. El asistente de voz usa el dictado del navegador (Chrome o Edge).

## Circuito de comanda

Mesa (QR/NFC) → validación del mozo → confirmación en caja → cocina acepta e ingresa el tiempo de entrega → listo → servido o despachado. Cada cambio se ve en tiempo real en el panel de cada perfil y en la carta del cliente (con cuenta regresiva). Los pedidos de la carta pública (retiro o delivery) entran directo a caja; los de PedidosYa, con la confirmación automática activa, directo a cocina.

## Recorrido sugerido

1. **Resumen → Ver el circuito completo en vivo**: recorre solo los 7 pasos de una comanda.
2. **Menú público (QR/NFC)**, Mesa 5 (ya está armando un pedido): agregá una pizza individual con adicional y aclaración, y enviala.
3. Con los perfiles **Mozo → Caja → Cocina** validá, confirmá y asigná un tiempo (15′). El cliente ve la cuenta regresiva.
4. **Asistente** (solo personal): “Confirmar pedido mesa 4”, “Mesa 2 en preparación 18 minutos”, “Pedido 12 listo”, “Mesa 6, una salteña con huevo frito y dos copas de vino”.
5. **PedidosYa y repartos**: asigná un cadete al delivery listo y simulá un pedido entrante de PedidosYa.
6. **Caja → Cuentas abiertas**: cobrá la Mesa 7. Buscá a la socia «Agus», escribí el cupón `BIENVENIDA10` (compite con su nivel Oro y su membresía: se aplica uno solo, el mayor), cargá el importe recibido o tocá «Justo» y cobrá con Enter o F12. Suma un sello y una tirada de ruleta.
7. **Vender**: dos cervezas con el WhatsApp `387 600-1009` y pago mixto Monedero + Cuenta corriente.
8. **Arqueo / cierre**: contá el efectivo, mandá el resumen por WhatsApp, hacé un Corte X y cerrá con Corte Z. En **Cajas cerradas** verificá el sello SHA-256 y tocá «Probar integridad».
9. **Fidelización**, **Niveles, cumpleaños y juegos** y **Monedero y gift cards**: sumá un sello por DNI, girá la ruleta y emití una gift card.
10. Revisá **Fermentación**, **Inventario** y **Fichas técnicas**: los bollos de masa madre y los insumos se descuentan solos según la ficha de cada plato.

## Módulos

**Operación:** Vender · Pedidos PedidosYa · Caja · Cajas y sucursales · Arqueo / cierre · Cajas cerradas · Inventario · Presupuestos · Mermas y devoluciones · Proveedores y compras · Facturación ARCA.
**Salón y cocina (Di Parma):** Salón y barra (10 mesas, 3 exterior, 5 banquetas) · Mozo · Cocina · Asistente de voz · Fermentación · Fichas técnicas.
**Clientes y fidelización:** Clientes · Fidelización · Niveles, cumpleaños y juegos · Monedero y gift cards · Cupones y membresías.
**Equipo:** Personal y fichaje · Tareas y organigrama. **Menú y web:** Menú público (QR/NFC) · Legal y cumplimiento.
**Sistema:** Nube · Periféricos y ticket · Importar / Exportar · Integraciones · Usuarios y permisos · Auditoría · Configuración.

### Caja (V26.54)
Sesión con fondo inicial por caja · ingresos y egresos con rubro obligatorio · apertura de cajón auditada · cobro con importe recibido obligatorio, botón «Justo» y vuelto en vivo (Enter/F12) · pago mixto · Fiado (vence a 7 días) o Cuenta corriente · monedero y gift card (no cuentan como cobro real) · recargo/descuento por medio de pago (apagado por defecto) · ventas de la caja con detalle, anulación y devolución parcial · conciliación de cobros digitales · Corte X y Corte Z con sello SHA-256 encadenado · cierre unificado · cajas cerradas con verificación, notas que sólo se agregan y exportación CSV/Excel · perfil Simple / Varias cajas / Multisucursal con caja principal, consolidado y traspasos con PIN de administración.

### Club (V26.54)
Tarjeta de sellos (QR rotativo cada 2 min, código de 8 dígitos, DNI o NFC; 1 cada 24 h) con premios para entregar y tarjeta imprimible 85,6 × 54 mm · niveles por consumo de los últimos 90 días · cumpleaños ±3 días una vez por año · ruleta y trivia con premios ponderados que se revierten al anular · monedero con libro de movimientos y Día de Cuenta Comercio (cashback) · gift cards al portador o nominativas con canje parcial · cupones con audiencia, usos totales y por cliente, públicos o privados · membresías · campañas de WhatsApp sólo a clientes con consentimiento. **Un solo beneficio por compra: gana el mayor.**

Los textos legales son plantillas [VERIFICAR] con asesor; periféricos y NFC sin probar con equipos reales.

Desarrollado por **VINCULAR BUSINESS** · Único celular (387) 4484132 · vincularbusiness@gmail.com · *“Tu idea, en buenas manos.”*
