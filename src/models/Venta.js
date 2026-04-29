import { BaseModel } from './BaseModel.js';

/**
 * Venta
 * Entidad de transacción de venta.
 * Extiende BaseModel — Principio LSP.
 */
export class Venta extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.fecha    = data.fecha    || new Date().toISOString().slice(0, 10);
    this.cliente  = (data.cliente || '').trim();
    this.local    = (data.local   || '').trim();
    this.producto = (data.producto|| '').trim();
    this.precio   = parseFloat(data.precio)   || 0;
    this.cantidad = parseInt(data.cantidad, 10)|| 1;
    this.total    = parseFloat(data.total)     || this.precio * this.cantidad;
    this.estado   = data.estado   || 'Despachado';
  }

  get totalFormateado() {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(this.total);
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
    if (!this.fecha)    errors.push('La fecha es obligatoria.');
    if (!this.cliente)  errors.push('El nombre del cliente es obligatorio.');
    if (!this.producto) errors.push('Selecciona un producto.');
    if (this.precio  <= 0) errors.push('El precio debe ser mayor a cero.');
    if (this.cantidad <= 0) errors.push('La cantidad debe ser mayor a cero.');
    return errors;
  }

  toJSON() {
    return {
      id:        this.id,
      createdAt: this.createdAt,
      fecha:     this.fecha,
      cliente:   this.cliente,
      local:     this.local,
      producto:  this.producto,
      precio:    this.precio,
      cantidad:  this.cantidad,
      total:     this.total,
      estado:    this.estado,
    };
  }
}
