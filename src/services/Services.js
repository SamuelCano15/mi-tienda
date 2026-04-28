import { Producto } from '../models/Producto.js';
import { Venta }    from '../models/Venta.js';

/**
 * ProductoService
 * SRP: lógica de negocio del catálogo.
 * DIP: recibe el repositorio por inyección — no crea sus propias dependencias.
 */
export class ProductoService {
  /** @param {import('../repositories/Repositories.js').ProductoRepository} repo */
  constructor(repo) {
    this.repo = repo;
  }

  async listar() {
    return this.repo.getAll();
  }

  /**
   * Valida y guarda un producto nuevo.
   * @param {Object} data
   * @returns {Promise<{ok: boolean, errors?: string[]}>}
   */
  async agregar(data) {
    const producto = new Producto(data);
    const errors   = producto.validate();
    if (errors.length) return { ok: false, errors };
    await this.repo.save(producto);
    return { ok: true };
  }

  /** @param {string} nombre */
  async eliminar(nombre) {
    return this.repo.deleteByNombre(nombre);
  }
}

/**
 * VentaService
 * SRP: lógica de negocio de ventas.
 * DIP: recibe el repositorio por inyección.
 */
export class VentaService {
  /** @param {import('../repositories/Repositories.js').VentaRepository} repo */
  constructor(repo) {
    this.repo = repo;
  }

  async listar() {
    return this.repo.getAll();
  }

  /**
   * Valida y registra una venta nueva.
   * @param {Object} data
   * @returns {Promise<{ok: boolean, errors?: string[]}>}
   */
  async registrar(data) {
    const venta  = new Venta(data);
    const errors = venta.validate();
    if (errors.length) return { ok: false, errors };
    await this.repo.save(venta);
    return { ok: true };
  }

  /** @param {string} id */
  async eliminar(id) {
    return this.repo.deleteById(id);
  }

  /**
   * Genera estadísticas agregadas a partir del conjunto de ventas.
   * @param {Venta[]} ventas
   * @returns {Object} métricas y tendencias
   */
  calcularStats(ventas) {
    if (!ventas.length) return this._statsVacias();

    const totalVendido  = ventas.reduce((s, v) => s + v.total,    0);
    const totalUnidades = ventas.reduce((s, v) => s + v.cantidad,  0);
    const clientes      = new Set(ventas.map(v => v.cliente)).size;

    const hoy   = new Date().toISOString().slice(0, 10);
    const hoyTotal = ventas
      .filter(v => v.fecha === hoy)
      .reduce((s, v) => s + v.total, 0);

    const porLocal    = this._agrupar(ventas, v => v.local    || 'Sin local',    v => v.total);
    const porProducto = this._agrupar(ventas, v => v.producto,                   v => v.cantidad);
    const porCliente  = this._agrupar(ventas, v => v.cliente,                    v => v.total);
    const porDia      = this._porDia(ventas, 14);

    return { totalVendido, totalUnidades, clientes, hoyTotal, porLocal, porProducto, porCliente, porDia };
  }

  _statsVacias() {
    return { totalVendido: 0, totalUnidades: 0, clientes: 0, hoyTotal: 0,
             porLocal: [], porProducto: [], porCliente: [], porDia: [] };
  }

  _agrupar(ventas, keyFn, valFn) {
    const map = {};
    ventas.forEach(v => {
      const k = keyFn(v);
      map[k]  = (map[k] || 0) + valFn(v);
    });
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }

  _porDia(ventas, dias) {
    const desde = new Date();
    desde.setDate(desde.getDate() - (dias - 1));
    const desdeStr = desde.toISOString().slice(0, 10);
    return this._agrupar(
      ventas.filter(v => v.fecha >= desdeStr),
      v => v.fecha,
      v => v.total,
    ).sort((a, b) => a.label.localeCompare(b.label));
  }
}
