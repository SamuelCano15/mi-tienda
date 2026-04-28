import { BaseRepository } from './BaseRepository.js';
import { Producto }        from '../models/Producto.js';
import { Venta }           from '../models/Venta.js';

/**
 * ProductoRepository
 * Acceso a datos del catálogo. Hereda todo el CRUD de BaseRepository.
 * Agrega lógica específica: búsqueda por nombre.
 */
export class ProductoRepository extends BaseRepository {
  constructor(api) {
    super(api, 'productos', Producto);
  }

  /**
   * Elimina por nombre (campo natural del producto en Sheets).
   * @param {string} nombre
   */
  async deleteByNombre(nombre) {
    return this.api.get({ action: 'deleteProducto', nombre });
  }
}

/**
 * VentaRepository
 * Acceso a datos de ventas. Hereda todo el CRUD de BaseRepository.
 * Agrega filtros de dominio.
 */
export class VentaRepository extends BaseRepository {
  constructor(api) {
    super(api, 'ventas', Venta);
  }

  /**
   * Devuelve ventas filtradas por rango de fechas (cliente-side).
   * @param {string} desde - yyyy-mm-dd
   * @param {string} hasta - yyyy-mm-dd
   */
  async getByRango(desde, hasta) {
    const todas = await this.getAll();
    return todas.filter(v => v.fecha >= desde && v.fecha <= hasta);
  }

  /**
   * Elimina por id.
   * @param {string} id
   */
  async deleteById(id) {
    return this.api.get({ action: 'deleteVenta', id });
  }
}
