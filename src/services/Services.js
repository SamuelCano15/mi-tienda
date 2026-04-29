import { Producto } from '../models/Producto.js';
import { Venta }    from '../models/Venta.js';
import { calcComision } from '../utils.js';

export class ProductoService {
  constructor(repo) { this.repo = repo; }

  async listar() { return this.repo.getAll(); }

  async agregar(data) {
    const producto = new Producto({
      ...data,
      nombre:    (data.nombre    || '').trim().toLowerCase(),
      categoria: (data.categoria || '').trim().toLowerCase(),
    });
    const errors = producto.validate();
    if (errors.length) return { ok: false, errors };
    await this.repo.save(producto);
    return { ok: true };
  }

  async eliminar(nombre) { return this.repo.deleteByNombre(nombre); }
}

export class VentaService {
  constructor(repo) { this.repo = repo; }

  async listar() { return this.repo.getAll(); }

  /**
   * Registra una venta con múltiples productos.
   * Cada producto se guarda como fila separada con el mismo ventaId.
   * @param {Object} cabecera - { fecha, cliente, local }
   * @param {Array}  items    - [{ producto, precio, cantidad, total }]
   */
async registrar(cabecera, items) {
    if (!items.length) return { ok: false, errors: ['Agrega al menos un producto.'] };
    const errors = [];
    if (!cabecera.fecha)   errors.push('La fecha es obligatoria.');
    if (!cabecera.cliente) errors.push('El nombre del cliente es obligatorio.');
    if (errors.length) return { ok: false, errors };

    const ventaId = String(Date.now());
    for (const item of items) {
      const venta = new Venta({
        ...cabecera,
        cliente:  cabecera.cliente.trim().toLowerCase(),
        local:    (cabecera.local || '').trim().toLowerCase(),
        producto: item.producto.trim().toLowerCase(),
        ...item,
        id:       ventaId,
        ventaId:  ventaId,
      });
      await this.repo.save(venta);
    }
    return { ok: true };
  }
  
  async eliminar(ventaId) { return this.repo.deleteByVentaId(ventaId); }

  async actualizarEstado(ventaId, estado) {
  return this.repo.updateEstado(ventaId, estado); }

  calcularStats(ventas) {
    if (!ventas.length) return this._statsVacias();
    const totalVendido  = ventas.reduce((s, v) => s + v.total, 0);
    const totalUnidades = ventas.reduce((s, v) => s + v.cantidad, 0);
    const clientes      = new Set(ventas.map(v => v.cliente)).size;
    const hoy           = new Date().toISOString().slice(0, 10);
    const hoyTotal      = ventas.filter(v => v.fecha === hoy).reduce((s, v) => s + v.total, 0);
    const porLocal      = this._agrupar(ventas, v => v.local || 'Sin local', v => v.total);
    const porProducto   = this._agrupar(ventas, v => v.producto, v => v.cantidad);
    const porCliente    = this._agrupar(ventas, v => v.cliente, v => v.total);
    const porDia        = this._porDia(ventas, 14);
    const totalComision = ventas.reduce((s, v) => s + calcComision(v.total, v.estado), 0);
    return { totalVendido, totalUnidades, clientes, hoyTotal, totalComision, porLocal, porProducto, porCliente, porDia };
  }

  _statsVacias() {
    return { totalVendido: 0, totalUnidades: 0, clientes: 0, hoyTotal: 0, totalComision: 0,
         porLocal: [], porProducto: [], porCliente: [], porDia: [] };
  }

  _agrupar(ventas, keyFn, valFn) {
    const map = {};
    ventas.forEach(v => { const k = keyFn(v); map[k] = (map[k] || 0) + valFn(v); });
    return Object.entries(map).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }

  _porDia(ventas, dias) {
    const desde = new Date();
    desde.setDate(desde.getDate() - (dias - 1));
    const desdeStr = desde.toISOString().slice(0, 10);
    return this._agrupar(
      ventas.filter(v => v.fecha >= desdeStr),
      v => v.fecha, v => v.total,
    ).sort((a, b) => a.label.localeCompare(b.label));
  }
}