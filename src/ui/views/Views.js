import { FormHelper, BarChart } from '../components/Components.js';

/**
 * BaseView
 * Clase base para todas las vistas.
 * SRP: cada vista gestiona solo su propio panel del DOM.
 * OCP: se extiende para cada sección sin modificar la base.
 */
export class BaseView {
  /**
   * @param {string} panelId - id del panel DOM de esta vista
   * @param {Object} deps    - dependencias inyectadas (toast, modal, etc.)
   */
  constructor(panelId, deps = {}) {
    this.panel = document.getElementById(panelId);
    this.deps  = deps;
  }

  /** Limpia el contenido de un contenedor y muestra mensaje vacío. */
  _empty(containerId, msg = 'Sin registros aún') {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = `<p class="empty">${msg}</p>`;
  }

  /** Muestra el spinner dentro de un contenedor. */
  _loading(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = '<div class="loader"><span class="loader__ring"></span></div>';
  }
}

/* ─── CatalogoView ───────────────────────────────────────────── */
export class CatalogoView extends BaseView {
  constructor(deps) { super('panel-catalogo', deps); }

  render(productos) {
    const list = document.getElementById('lista-productos');
    if (!list) return;
    if (!productos.length) { this._empty('lista-productos', 'Sin productos. Agrega el primero.'); return; }

    list.innerHTML = productos.map(p => `
      <div class="list-item" data-nombre="${p.nombre}">
        <div class="list-item__info">
          <span class="list-item__title">${p.nombre}</span>
          ${p.categoria ? `<span class="chip">${p.categoria}</span>` : ''}
        </div>
        <div class="list-item__actions">
          <span class="list-item__price">${p.precioFormateado}</span>
          <button class="btn-icon btn-icon--danger" data-delete="${p.nombre}" aria-label="Eliminar ${p.nombre}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  bindDeleteProducto(handler) {
    document.getElementById('lista-productos')?.addEventListener('click', e => {
      const btn = e.target.closest('[data-delete]');
      if (btn) handler(btn.dataset.delete);
    });
  }

  bindAgregarProducto(handler) {
    document.getElementById('btn-agregar-producto')?.addEventListener('click', handler);
  }

  getFormData() {
    return {
      nombre:    document.getElementById('p-nombre')?.value.trim(),
      precio:    document.getElementById('p-precio')?.value,
      categoria: document.getElementById('p-cat')?.value.trim(),
    };
  }

  clearForm() {
    FormHelper.clear(['p-nombre', 'p-precio', 'p-cat']);
  }
}

/* ─── VentaView ──────────────────────────────────────────────── */
export class VentaView extends BaseView {
  constructor(deps) { super('panel-ventas', deps); }

  fillProductos(productos) {
    FormHelper.fillSelect('v-producto', productos,
      p => p.nombre,
      p => `${p.nombre}${p.categoria ? ' · ' + p.categoria : ''}`,
    );
  }

  bindAutoPrice(productos) {
    document.getElementById('v-producto')?.addEventListener('change', e => {
      const prod = productos.find(p => p.nombre === e.target.value);
      if (prod) {
        const precioEl   = document.getElementById('v-precio');
        const cantidadEl = document.getElementById('v-cantidad');
        precioEl.value   = prod.precio;
        this._calcTotal();
      }
    });
    document.getElementById('v-precio')?.addEventListener('input',    () => this._calcTotal());
    document.getElementById('v-cantidad')?.addEventListener('input',  () => this._calcTotal());
  }

  _calcTotal() {
    const precio   = parseFloat(document.getElementById('v-precio')?.value)   || 0;
    const cantidad = parseInt(document.getElementById('v-cantidad')?.value, 10)|| 0;
    const totalEl  = document.getElementById('v-total');
    if (totalEl) totalEl.value = (precio * cantidad).toFixed(0);
  }

  bindRegistrarVenta(handler) {
    document.getElementById('btn-registrar-venta')?.addEventListener('click', handler);
  }

  getFormData() {
    return {
      fecha:    document.getElementById('v-fecha')?.value,
      cliente:  document.getElementById('v-cliente')?.value.trim(),
      local:    document.getElementById('v-local')?.value.trim(),
      producto: document.getElementById('v-producto')?.value,
      precio:   document.getElementById('v-precio')?.value,
      cantidad: document.getElementById('v-cantidad')?.value,
      total:    document.getElementById('v-total')?.value,
    };
  }

  clearForm() {
    const today = new Date().toISOString().slice(0, 10);
    FormHelper.clear(['v-cliente', 'v-local', 'v-producto', 'v-precio', 'v-total']);
    document.getElementById('v-cantidad').value = '1';
    document.getElementById('v-fecha').value    = today;
  }

  setToday() {
    const el = document.getElementById('v-fecha');
    if (el) el.value = new Date().toISOString().slice(0, 10);
  }
}

/* ─── HistorialView ──────────────────────────────────────────── */
export class HistorialView extends BaseView {
  constructor(deps) { super('panel-historial', deps); }

  render(ventas) {
    const list = document.getElementById('lista-ventas');
    if (!list) return;
    if (!ventas.length) { this._empty('lista-ventas', 'Sin ventas en este periodo.'); return; }

    list.innerHTML = ventas.map(v => `
      <div class="list-item" data-id="${v.id}">
        <div class="list-item__info">
          <span class="list-item__title">${v.cliente}
            ${v.local ? `<span class="chip chip--local">${v.local}</span>` : ''}
          </span>
          <span class="list-item__sub">${v.fecha} · ${v.producto} × ${v.cantidad}</span>
        </div>
        <div class="list-item__actions">
          <span class="list-item__price">${v.totalFormateado}</span>
          <button class="btn-icon btn-icon--danger" data-delete="${v.id}" aria-label="Eliminar venta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  bindDeleteVenta(handler) {
    document.getElementById('lista-ventas')?.addEventListener('click', e => {
      const btn = e.target.closest('[data-delete]');
      if (btn) handler(btn.dataset.delete);
    });
  }

  bindFiltro(handler) {
    document.getElementById('filtro-periodo')?.addEventListener('change', e => handler(e.target.value));
  }

  getFiltro() {
    return document.getElementById('filtro-periodo')?.value || 'todos';
  }
}

/* ─── StatsView ──────────────────────────────────────────────── */
export class StatsView extends BaseView {
  constructor(deps) {
    super('panel-stats', deps);
    this.chart = new BarChart();
  }

  render(stats) {
    this._renderMetricas(stats);
    this.chart.render(
      document.getElementById('chart-locales'),
      stats.porLocal,
      { formatter: v => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v) }
    );
    this.chart.render(
      document.getElementById('chart-productos'),
      stats.porProducto,
      { unit: ' uds' }
    );
    this.chart.render(
      document.getElementById('chart-dias'),
      stats.porDia,
      { formatter: v => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v) }
    );
    this.chart.render(
      document.getElementById('chart-clientes'),
      stats.porCliente,
      { formatter: v => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v) }
    );
  }

  _renderMetricas({ totalVendido, totalUnidades, clientes, hoyTotal }) {
    const fmt = v => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
    const set  = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('stat-total',    fmt(totalVendido));
    set('stat-hoy',      fmt(hoyTotal));
    set('stat-clientes', clientes);
    set('stat-unidades', totalUnidades);
  }
}
