# Sistema VB · Demo Di Parma Pizzería

Demo funcional e interactiva del Sistema VB 26 adaptada a **Di Parma Pizzería de masa madre** (Salta): salón y barra, carta por QR/NFC, circuito completo de comanda con tiempos de entrega, asistente de voz para el personal, repartos con cadetes propios y PedidosYa, control de fermentación, fichas técnicas, stock con trazabilidad, Factura C ARCA, club de socios y turnos. Todo corre en el navegador desde un único archivo `index.html`, sin backend ni instalación. **Todos los datos son ficticios.**

**Demo en línea:** https://raveholding.github.io/DIPARMAPizzeriaDemo/
**Carta de una mesa (lo que abre el QR/NFC):** https://raveholding.github.io/DIPARMAPizzeriaDemo/?mesa=I4

## Cómo usarla

1. Abrí `index.html` en Chrome o Edge actualizados (el dictado por voz necesita uno de esos dos navegadores).
2. Arriba a la derecha elegí el perfil: **Administración, Mozo, Caja, Cocina o Cliente (QR)**. Cada perfil ve sólo sus pantallas y acciones.
3. La demo arranca con un servicio en curso: mesas ocupadas, un pedido QR esperando al mozo (mesa 4), una comanda en caja (mesa 3), otra en cocina sin tiempo (mesa 2), pizzas en el horno y un delivery listo sin cadete.
4. Para volver al estado inicial: **Ajustes → Restablecer datos de demostración**.

Los datos se guardan en el navegador y **se sincronizan en vivo entre pestañas**: abrí la carta de una mesa en otra pestaña (`?mesa=I5`) y el panel del personal en esta.

## Recorrido sugerido (5 minutos)

1. **Dashboard → Ver el circuito completo en vivo**: recorre solo los 7 pasos Mesa → Mozo → Caja → Cocina → Tiempo → Listo.
2. **Vista cliente** (Mesa 5, que ya está armando un pedido): agregá una pizza individual con huevo frito y una aclaración, y tocá *Enviar*.
3. **Perfil Mozo**: validá el pedido. **Caja**: confirmalo. **Cocina**: tocá *15′*. En la carta del cliente aparece la cuenta regresiva.
4. **Asistente de voz**: “Confirmar pedido mesa 4”, “Mesa 2 en preparación 18 minutos”, “Pedido 12 listo”, “Mesa 6, una salteña con huevo frito y dos copas de vino”.
5. **Repartos y PedidosYa**: asigná un cadete al delivery listo y simulá un pedido entrante de PedidosYa (entra directo a cocina).
6. **Caja → Cuentas abiertas**: cobrá la Mesa 7 con un socio y el cupón `BIENVENIDA10`. Se emite la Factura C con CAE y QR de ARCA.
7. Revisá **Fermentación** (bollos descontados por lote), **Stock** (consumo por ficha técnica, lote y pedido) y **Fichas técnicas** (costo y food cost por plato).

## Módulos

- **Salón y barra**: 10 mesas interiores, 3 exteriores y 5 banquetas de barra, con estado en vivo (libre, cliente armando por QR, pedido sin validar, en cocina, listo, pidió la cuenta), llamados al mozo y QR/NFC imprimibles por mesa.
- **Carta QR/NFC del cliente**: carta con tamaños, adicionales y aclaraciones; la precarga la ve el mozo en vivo; seguimiento del pedido con tiempo de entrega; llamar al mozo, pedir la cuenta y sumarse al club. Sin acceso al asistente de voz.
- **Circuito de comanda**: Mesa/QR → validación del mozo → confirmación en caja → cocina acepta y asigna tiempo → listo → servido o despachado. Cada paso queda en el historial del pedido y en la auditoría.
- **Asistente de voz (sólo personal)**: carga comandas habladas (cantidades, tamaño, adicionales y “sin…”), confirma pedidos según el perfil, asigna y cambia tiempos, marca listos y entregados, consulta estados y cancela. Respeta los permisos de cada rol.
- **Logística**: cadetes propios con estado, entregas y efectivo a rendir; integración simulada con PedidosYa (sincronización automática y confirmación automática hacia cocina).
- **Producción**: lotes de masa madre con fases (bloque, frío, listo, sobremadurado), temperaturas, refrescos de la madre, calculadora de amasado y descuento de bollos FEFO; fichas técnicas editables con escandallo, food cost y precio sugerido.
- **Administración**: stock con lotes, vencimientos y movimientos por pedido; proveedores y pedido de faltantes por WhatsApp o correo; Factura C ARCA con contingencia y nota de crédito; Club Di Parma con puntos, niveles, canjes y cupones; personal con grilla de turnos, cobertura y fichadas.

## Limitaciones conocidas

Es un prototipo para validar flujos. Los datos viven sólo en el navegador; la sincronización en tiempo real funciona entre pestañas del mismo equipo (entre dispositivos requiere el servidor de la versión productiva). La facturación ARCA, el CAE, el QR fiscal, la integración con PedidosYa y la grabación de tags NFC son simulaciones o dependen del navegador. El dictado por voz usa el reconocimiento del navegador (Chrome/Edge).

Sistema VB · desarrollado por Rave Holding.
