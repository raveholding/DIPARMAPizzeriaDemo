# Sistema RAVE · demo para Di Parma Pizzería

Demo de evaluación de **Sistema RAVE V26.25b** (VINCULAR BUSINESS) adaptada a **Di Parma Pizzería de masa madre** (Salta).
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
6. **Caja → Cuentas abiertas**: cobrá la Mesa 7 con un socio y el cupón `BIENVENIDA10`.
7. Revisá **Fermentación**, **Inventario** y **Fichas técnicas**: los bollos de masa madre y los insumos se descuentan solos según la ficha de cada plato.

## Módulos

Resumen · Salón y barra (10 mesas, 3 exterior, 5 banquetas) · Mozo · Caja · Cocina (pantalla de comandas con tiempos) · PedidosYa y repartos (cadetes propios) · Asistente de voz · Fermentación (madre y lotes de bollos) · Fichas técnicas y escandallos · Inventario, trazabilidad y proveedores · Fidelización y cupones (Club Di Parma) · Facturación ARCA · Personal y fichaje (turnos y cobertura) · Menú público (QR/NFC) · Auditoría · Configuración.

Los textos legales son plantillas [VERIFICAR] con asesor; periféricos y NFC sin probar con equipos reales.

Desarrollado por **VINCULAR BUSINESS** · Único celular (387) 4484132 · vincularbusiness@gmail.com · *“Tu idea, en buenas manos.”*
