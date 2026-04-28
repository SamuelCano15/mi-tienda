# Mi Tienda — Sistema de gestión de ventas

Aplicación web para registro de ventas y catálogo de productos.  
Backend: Google Sheets vía Apps Script. Frontend: Vanilla JS ES6 modules.

## Estructura del proyecto

```
tienda/
├── index.html                          ← entrada principal
├── netlify.toml                        ← configuración de despliegue
├── assets/css/styles.css               ← estilos globales
└── src/
    ├── config.js                       ← URL del Apps Script
    ├── main.js                         ← bootstrap + inyección de dependencias
    ├── App.js                          ← controlador principal
    ├── models/
    │   ├── BaseModel.js                ← clase base (id, createdAt, validate)
    │   ├── Producto.js                 ← entidad producto
    │   └── Venta.js                    ← entidad venta
    ├── repositories/
    │   ├── BaseRepository.js           ← CRUD genérico
    │   └── Repositories.js            ← ProductoRepository, VentaRepository
    ├── services/
    │   ├── ApiService.js               ← HTTP → Google Apps Script
    │   └── Services.js                 ← ProductoService, VentaService
    └── ui/
        ├── components/Components.js    ← Toast, ConfirmModal, BarChart, FormHelper
        └── views/Views.js              ← CatalogoView, VentaView, HistorialView, StatsView
```

## Desplegar en Netlify

1. Sube esta carpeta a un repositorio GitHub
2. Ve a https://netlify.com → "Add new site" → "Import from GitHub"
3. Selecciona el repositorio
4. Build command: (dejar vacío)
5. Publish directory: `.` (punto)
6. Deploy

La URL quedará disponible en `https://tu-nombre.netlify.app`

## Cambiar la URL del Apps Script

Edita `src/config.js`:

```js
export const CONFIG = {
  SCRIPT_URL: 'https://script.google.com/macros/s/TU_URL/exec',
};
```
