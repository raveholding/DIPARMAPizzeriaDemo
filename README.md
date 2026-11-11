# Di Parma Pizzería de masa madre · Sistema VB (demo)

Demo de evaluación del **Sistema Vincular Business V26.65** (la misma base que Almacén RAVE, esqueleto V27.2) con la **capa de pizzería** de Di Parma (Salta).
Un solo archivo (`index.html`): carta pública adelante y panel del equipo en `#acceso`.

**Demo en línea:** https://raveholding.github.io/DIPARMAPizzeriaDemo/

- Carta pública (retiro y delivery): `/`
- Carta de una mesa, la que abre el QR o el tag NFC: `/?mesa=I4` (mesas `I1`–`I10`, exterior `E1`–`E3`, barra `B1`–`B5`)
- Acceso del equipo: `/#acceso`, el botón «Acceso del equipo» al pie de la carta o **doble clic (doble toque en el celular) sobre el logo** de la carta
- Usuarios de prueba: ADMIN 1234 · Supervisor 1111 · Caja 0000 · Mozo Martín 2222 · Moza Sofía 3333 · Barra Joaquín 4444 · Cocina Franco 5555 · Cocina Lucía 6666 · Portal del empleado 7777

**Es una demo.** Carta, precios, costos, insumos, lotes de masa, socios, cupones, personal y ventas son de ejemplo. Los datos se guardan sólo en el navegador de quien la prueba y se sincronizan en vivo entre pestañas del mismo equipo (la carta de una mesa en una pestaña y el panel en otra). Las comandas de ejemplo se renuevan solas cada 14 horas o desde *Configuración → Restablecer datos de demostración*.
**ARCA:** la factura es de demostración (CAE inventado, «sin validez fiscal»). **PedidosYa:** conexión simulada. Grabar tags NFC requiere Chrome en Android; el dictado del asistente, Chrome o Edge.

## Qué cambió respecto de la versión anterior (V26.54)
La demo anterior era una aplicación aparte. Ahora corre **sobre el Sistema VB completo y actualizado**, así que suma todo lo nuevo del núcleo sin copias:
- **Diseño V27.2:** barra lateral por secciones plegables con el botón **Vender POS [F1]**, búsqueda global **Ctrl + K** (clientes, platos, pantallas; tolera errores de tipeo), **campana de avisos**, avisos con número en la barra, **tema claro/oscuro**, panel **«Hoy»** en el Resumen, ayuda de una línea en cada pantalla, modo mostrador para Caja, Mozo y Cocina.
- **Gestión de caja completa:** tablero del turno (estado, 4 pasos del día, indicadores), cajas y sucursales, arqueo con Corte X / Corte Z sellados SHA-256, historial cerrado verificable, pagos mixtos, vuelto, Fiado / Cuenta corriente, recargos por medio.
- **Club Di Parma completo:** clientes, sellos (QR rotativo, código, DNI, NFC), niveles por consumo, cumpleaños, ruleta y trivia, monedero y gift cards, cupones y membresías. Un solo beneficio por compra: gana el mayor.
- **Recursos Humanos (Plan Completo, 12 legajos):** fichaje por PIN en kiosco, QR, NFC y geocerca; turnos de la noche (lunes cerrado), licencias con aprobación en niveles, nómina interna, documentos con vencimientos, reclutamiento, vacaciones, portal del empleado y avisos al personal.
- **Atención al cliente** (CRM), **compras y proveedores** con cuenta corriente, presupuestos, mermas, importar/exportar, auditoría encadenada.

## Lo propio de la pizzería (sección «Salón y cocina»)
- **Salón y barra:** mapa de mesas con estado en vivo, QR/NFC por mesa (imprimible), consumo abierto y **«Ver la carta como el cliente»** dentro del panel.
- **Mozo:** pedidos del QR para validar, platos listos para servir, mesas que llaman o piden la cuenta, precarga en vivo de lo que arma el cliente y carga de pedidos en tres toques.
- **Comandas:** tablero del circuito **Mesa (QR/NFC) → Mozo → Caja → Cocina → Horno → Listo → Servido**; cada perfil ve sólo sus botones.
- **Cocina:** aceptar con tiempo de entrega (el cliente ve la cuenta regresiva), demoras en rojo, «Listo».
- **Delivery y PedidosYa:** cadetes propios, rendición de efectivo y PedidosYa simulado (directo a cocina); al entregarse se registran como ventas.
- **Fermentación de masa madre:** lotes de 48/72 h con temperaturas, madre «Mamma», calculadora de amasado. Cuando un lote queda listo, sus bollos **entran solos al stock**.
- **Fichas técnicas:** cada plato es un **combo** del sistema armado con los insumos de cocina; al cobrar, Vender descuenta solos los insumos y los bollos. Costo, food cost, margen y precio sugerido.
- **Asistente de comandas** (texto o voz, sólo personal): «Confirmar pedido mesa 4», «Mesa 2 en preparación 18 minutos», «Pedido 12 listo», «Mesa 6, una salteña con huevo frito y dos copas de vino».
- **La cuenta de la mesa se cobra en Vender**, con todo el cobro del sistema; al confirmar, la mesa se cierra sola.

## Recorrido sugerido
1. **Salón y barra → Ver el circuito en vivo**: recorre solo los 7 pasos de una comanda de la Mesa 6.
2. **Ver la carta de una mesa** (Mesa 5 ya está armando un pedido): agregá una pizza individual con adicional y aclaración, y enviala.
3. Con los perfiles **Mozo → Caja → Cocina** validá, confirmá y asigná 15′. El cliente ve la cuenta regresiva.
4. **Salón → Mesa 7 → Cobrar en Vender**: buscá a la socia «Agustina», escribí `BIENVENIDA10` (compite con su nivel y su membresía: se aplica uno solo, el mayor), tocá «Justo» y cobrá con F12.
5. **Gestión de caja → Arqueo / cierre**: Corte X, Corte Z y verificación del sello en el historial.
6. **Fermentación**, **Fichas técnicas** e **Inventario** (Stock e insumos): mirá cómo bajan los insumos y los bollos con cada cobro.
7. **Recursos Humanos**, **Club** y **Atención al cliente** con datos de ejemplo.

## Cómo se compila
`fuente/` es la fuente del Sistema VB (Almacén RAVE, V26.65) con la capa ya aplicada. La capa está en `fuente/capa-pizzeria/`, separada por dominio: `p11a-pizza-datos.js` (catálogo, fichas, personal, datos de ejemplo), `p11b-pizza-circuito.js` (estado, comanda, cobro, bollos, sincronización y API de la carta), `p11c-pizza-pantallas.js` (pantallas y acciones), `p11d-config-ux.js` (Configuración dinámica, genérica: sirve para el núcleo), `p11-pub-pizza.html` (carta pública), `dp_brand.py` (marca y estilos) y `patch_dp.py`; para aplicarla a una fuente nueva: `python3 capa-pizzeria/patch_dp.py <fuente>`.

```
cd fuente && python3 build.py pizza ../index.html
```
Pruebas en navegador real (`fuente/capa-pizzeria/pruebas/`): `dp1.py` (carta de la mesa → mozo → caja → cocina → cobro con descuento de insumos; roles y asistente), `dp2.py` (delivery, PedidosYa, rendición, circuito en vivo), `dp3_auditoria.py` (axe-core WCAG 2 A/AA, objetivos táctiles y desbordes a 360 px, en claro y oscuro) `dp4_teclado_seguridad.py` (teclado, canal entre pestañas, límites de la carta) y `dp5_config_logo.py` (acceso por el logo y Configuración dinámica).

## Configuración dinámica V27.7 (11/11/2026)
La pantalla de Configuración pasó de una columna de unos 6.500 px a un panel de unos 1.000 px:
- **Buscador** «¿Qué querés cambiar?» (tecla `/`): filtra por título, etiquetas y ayudas, sin importar tildes, y resalta el campo encontrado.
- **Índice por secciones** (Negocio · Caja y cobros · Ventas · Asistente e IA · Datos y sistema) con la cantidad de ajustes; en el celular, fichas horizontales.
- **Tarjetas plegables** con un resumen de una línea; se abre sola la primera con campos de cada sección; «Abrir todo» / «Cerrar todo».
- **«Sin guardar»** en la tarjeta y en el índice cuando tocás un campo, y aviso del navegador si salís con cambios sin guardar. Guardar sigue siendo el del núcleo y la pantalla vuelve a la misma sección.
- **Otros ajustes del sistema**: atajos a Usuarios y permisos, Menú público, Nube, Club, Recursos Humanos, Auditoría, etc. (sólo los que el rol puede abrir).
No se cambió ni duplicó ningún ajuste: la capa reordena las tarjetas que dibuja el núcleo.

## Auditoría V27.6 (11/11/2026)
Revisión con criterios de arquitectura, rendimiento, UX/accesibilidad y seguridad, **sin cambiar el stack** (HTML único sin conexión; ver esqueleto, sección 1).
- **Arquitectura:** la capa pasó de un archivo de 120 KB a tres módulos por dominio (datos → circuito → pantallas); el núcleo sigue sin tocarse (sólo ganchos de una línea).
- **Accesibilidad:** contraste AA en los estados de mesa y comanda (claro y oscuro), títulos en orden, `h1` en la carta, encabezado de tabla con texto para lectores; Enter y Espacio activan pasos del circuito, pestañas e indicadores; foco visible.
- **Táctil y móvil:** todos los controles de la capa ≥ 44 px; a 360 px Delivery, Fermentación y Fichas ya no desbordan y la tabla de repartos se ve como tarjetas.
- **Movimiento:** entradas suaves con `transform` y `opacity` (tarjetas, mesas, hoja de la carta, avisos), desactivadas con «reducir movimiento».
- **Seguridad:** el estado que llega de otra pestaña se valida antes de aceptarlo; la carta pública tiene límites (un envío cada 15 s por mesa, máximo 3 pedidos sin validar por mesa, 12 pedidos web pendientes en 10 min, 30 líneas y 20 unidades por línea, sólo platos y adicionales activos, aclaraciones sin `<` `>`).
- **Pendiente del núcleo** (no de esta capa): en el Resumen, el orden de títulos del panel «Hoy», la lista desplazable de últimas ventas sin foco y un enlace de 35 px; se corrigen en Almacén RAVE para que lo hereden todas las demos.

Límites honestos: textos legales y alérgenos son plantillas [VERIFICAR]; periféricos y NFC sin probar con equipos reales; PedidosYa y ARCA reales necesitan las cuentas y el certificado del comercio.

Desarrollado por **VINCULAR BUSINESS** · Celular (387) 4484132 · https://www.vincularbusiness.com.ar/ · vincularbusiness@gmail.com · *“Tu idea, en buenas manos.”*
