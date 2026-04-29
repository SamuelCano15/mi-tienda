import { BaseRepository } from './BaseRepository.js';
import { Producto }        from '../models/Producto.js';
import { Venta }           from '../models/Venta.js';

export class ProductoRepository extends BaseRepository {
  constructor(api) {
    super(api, 'producto', Producto);
  }

  async getAll() {
    const data = await this.api.get({ action: 'getProductos' });
    return (Array.isArray(data) ? data : []).map(d => new this.ModelClass(d));
  }

  async deleteByNombre(nombre) {
    return this.api.get({ action: 'deleteProducto', nombre });
  }
}

export class VentaRepository extends BaseRepository {
  constructor(api) {
    super(api, 'venta', Venta);
  }

  async getAll() {
    const data = await this.api.get({ action: 'getVentas' });
    return (Array.isArray(data) ? data : []).map(d => new this.ModelClass(d));
  }

  async getByRango(desde, hasta) {
    const todas = await this.getAll();
    return todas.filter(v => v.fecha >= desde && v.fecha <= hasta);
  }

  async deleteById(id) {
    return this.api.get({ action: 'deleteVenta', id });
  }
}
