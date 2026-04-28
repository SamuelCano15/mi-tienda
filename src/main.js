/**
 * main.js — punto de entrada y contenedor de inyección de dependencias.
 * DIP aplicado: aquí se construye el grafo de dependencias completo.
 * Ninguna clase inferior conoce a sus dependencias directamente.
 */

import { ApiService }                            from './services/ApiService.js';
import { ProductoRepository, VentaRepository }   from './repositories/Repositories.js';
import { ProductoService, VentaService }         from './services/Services.js';
import { Toast, ConfirmModal }                   from './ui/components/Components.js';
import { CatalogoView, VentaView,
         HistorialView, StatsView }              from './ui/views/Views.js';
import { App }                                   from './App.js';

document.addEventListener('DOMContentLoaded', async () => {
  /* Infraestructura */
  const api = new ApiService();

  /* Repositorios */
  const productoRepo = new ProductoRepository(api);
  const ventaRepo    = new VentaRepository(api);

  /* Servicios de dominio */
  const productoService = new ProductoService(productoRepo);
  const ventaService    = new VentaService(ventaRepo);

  /* Componentes UI transversales */
  const toast = new Toast();
  const modal = new ConfirmModal();

  /* Vistas */
  const catView      = new CatalogoView({ toast, modal });
  const ventaView    = new VentaView({ toast, modal });
  const historialView= new HistorialView({ toast, modal });
  const statsView    = new StatsView({ toast, modal });

  /* Aplicación */
  const app = new App({ productoService, ventaService, catView, ventaView, historialView, statsView, toast, modal });
  await app.init();
});
