# FoodControl

Sistema web académico para administrar un restaurante ficticio. Está construido con **HTML5, CSS3 y JavaScript**, sin backend ni bases de datos remotas. La información se guarda en el **localStorage** del navegador.

> **Aviso académico:** el inicio de sesión, los pagos y los comprobantes son simulados. Este proyecto no debe utilizarse como sistema de seguridad ni en un restaurante real.

## Acceso de demostración

| Campo | Valor |
|---|---|
| Usuario | `admin` |
| Contraseña | `admin123` |

Las credenciales están definidas en `js/auth.js` y se muestran también en la pantalla de inicio de sesión.

## Cómo ejecutar el proyecto

### Opción 1: servidor local en Windows (recomendado, sin instalar nada)

El proyecto incluye su propio servidor estático en PowerShell, que ya viene con Windows. No requiere Python, Node.js ni internet.

1. Haz doble clic en `iniciar.bat`.
2. El servidor se inicia y el navegador se abre en `http://localhost:8000`.
3. Para detenerlo, cierra la ventana o presiona `Ctrl+C`.

También puedes ejecutarlo manualmente desde una terminal:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File servidor.ps1 -Port 8000
```

Si el puerto 8000 está ocupado, usa otro y abre esa dirección en el navegador:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File servidor.ps1 -Port 8080
```

Opciones disponibles: `-NoBrowser` evita abrir el navegador automáticamente y `-BindAll` permite el acceso desde otros equipos de la red (normalmente requiere ejecutar PowerShell como administrador).

### Opción 2: Python u otro servidor estático

Si prefieres Python y ya lo tienes instalado:

```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000`. Cualquier otro servidor estático (por ejemplo **Live Server** de Visual Studio Code) también funciona.

> Abrir `index.html` con doble clic funciona en la mayoría de navegadores porque localStorage está disponible para archivos locales. Sin embargo, se recomienda el servidor local para que todas las rutas y recursos se carguen de forma consistente.

## Módulos implementados

- **Inicio de sesión:** validación de campos, mensajes de error y sesión guardada en localStorage.
- **Dashboard:** ventas del día, pedidos, pendientes, mesas ocupadas, productos disponibles, gráfica de ventas de los últimos 7 días, productos más vendidos y pedidos recientes.
- **Menú y productos:** creación, edición, eliminación con confirmación, búsqueda, filtro por categoría y estado, activación/desactivación y validaciones.
- **Pedidos:** carrito con cantidades, eliminación de artículos, cálculo automático del total, modalidad para llevar o en mesa, observaciones, estados, búsqueda y filtro.
- **Mesas:** ocho mesas con capacidad y estado, asociación con pedidos, vista visual y validaciones para no liberar mesas con pedidos activos.
- **Ventas y pagos simulados:** cobro en efectivo, tarjeta o transferencia, cálculo de cambio, comprobante imprimible e historial de ventas.

## Datos de demostración

La primera vez que se inicia sesión se crean automáticamente:

- 12 productos con imágenes locales en `assets/images`.
- 8 mesas con diferentes capacidades y estados.
- 6 pedidos de ejemplo (pagados, pendientes, en preparación y listo para entregar).
- 3 ventas de ejemplo para que la gráfica y los indicadores tengan información inicial.

Los pedidos cancelados no generan ventas y no aparecen como pedidos por cobrar.

## Estructura del proyecto

```
FoodControl/
├── index.html              Inicio de sesión
├── iniciar.bat             Inicia el servidor y abre el navegador
├── servidor.ps1            Servidor estático local en PowerShell
├── README.md
├── assets/
│   └── images/             Ilustraciones SVG locales de los productos
├── css/
│   └── style.css           Estilos, componentes y diseño adaptable
├── js/
│   ├── auth.js             Login y datos iniciales de demostración
│   ├── ui.js               Iconos SVG y menú móvil
│   ├── dashboard.js        Indicadores, gráfica y resúmenes
│   ├── menu.js             CRUD de productos
│   ├── pedidos.js          Carrito, pedidos y cambios de estado
│   ├── mesas.js            Estado y relación de mesas con pedidos
│   └── ventas.js           Pagos simulados, comprobantes e historial
├── pages/
│   ├── dashboard.html
│   ├── menu.html
│   ├── pedidos.html
│   ├── mesas.html
│   └── ventas.html
└── vendor/
    └── chart.umd.min.js    Chart.js local (no requiere internet)
```

## Reglas de negocio principales

1. Los pedidos cancelados no se contabilizan como ventas.
2. Un pedido puede cobrarse cuando está **Listo para entregar** o **Entregado** y aún no ha sido pagado.
3. Al confirmar el pago, el pedido queda como **Entregado**, se libera la mesa y se crea un comprobante.
4. Una mesa con un pedido activo no puede marcarse como disponible hasta que el pedido se entregue o se cancele.
5. Solo se muestran mesas disponibles al crear un pedido en mesa.
6. Un pedido pagado no puede cambiar de estado para proteger el registro de la venta.
7. Los productos, pedidos y ventas nuevos reciben identificadores y códigos consecutivos.

## Reiniciar los datos de demostración

Abre la consola del navegador (F12) y ejecuta:

```js
localStorage.clear();
location.href = 'index.html';
```

Al volver a iniciar sesión con `admin` / `admin123`, se crearán nuevamente los datos iniciales.

## Notas técnicas

- Los valores monetarios se muestran en **pesos colombianos (COP)** con separadores de miles.
- Chart.js se incluye de forma local en `vendor/chart.umd.min.js`; no se necesita conexión a internet.
- Las imágenes de los productos son SVG locales; si una ruta falla, se muestra `assets/images/placeholder.svg`.
- El servidor `servidor.ps1` no tiene dependencias externas y bloquea el acceso a archivos fuera de la carpeta del proyecto.
- La interfaz está en español y es adaptable a computador, tableta y celular.
