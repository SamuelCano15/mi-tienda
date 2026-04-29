import { BaseModel } from './BaseModel.js';

/**
 * Producto
 * Entidad del catálogo de productos.
 * Extiende BaseModel — Principio LSP: puede usarse donde se espere un BaseModel.
 */
export class Producto extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.nombre = String(data.nombre || '').trim();
    this.precio    = parseFloat(data.precio)  || 0;
    this.categoria = (data.categoria || data.cat || '').trim();
  }

  get precioFormateado() {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(this.precio);
  }

  validate() {
    const errors = [];
    if (!this.nombre)   errors.push('El nombre del producto es obligatorio.');
    if (this.precio <= 0) errors.push('El precio debe ser mayor a cero.');
    return errors;
  }

  toJSON() {
    return {
      id:        this.id,
      createdAt: this.createdAt,
      nombre:    this.nombre,
      precio:    this.precio,
      categoria: this.categoria,
    };
  }
}
