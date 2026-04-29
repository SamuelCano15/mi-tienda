import { FormHelper, BarChart } from '../components/Components.js';

export class BaseView {
  constructor(panelId, deps = {}) {
    this.panel = document.getElementById(panelId);
    this.deps  = deps;
  }

  _empty(containerId, msg = 'Sin registros aún') {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = `<p class="empty">${msg}</p>`;
  }

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

  clearForm() { FormHelper.clear(['p-nombre', 'p-precio', 'p-cat']); }
}

/* ─── VentaView ──────────────────────────────────────────────── */
export class VentaView extends BaseView {
  constructor(deps) {
    super('panel-ventas', deps);
    this._items = []; // lista temporal de productos en la venta actual
  }

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
        document.getElementById('v-precio').value = prod.precio;
        this._calcTotal();
      }
    });
    document.getElementById('v-precio')?.addEventListener('input',   () => this._calcTotal());
    document.getElementById('v-cantidad')?.addEventListener('input', () => this._calcTotal());
  }

  _calcTotal() {
    const precio   = parseFloat(document.getElementById('v-precio')?.value)    || 0;
    const cantidad = parseInt(document.getElementById('v-cantidad')?.value, 10) || 0;
    const totalEl  = document.getElementById('v-subtotal');
    if (totalEl) totalEl.value = (precio * cantidad).toFixed(0);
  }

  bindAgregarItem(handler) {
    document.getElementById('btn-agregar-item')?.addEventListener('click', handler);
  }

  bindRegistrarVenta(handler) {
    document.getElementById('btn-registrar-venta')?.addEventListener('click', handler);
  }

  getItemData() {
    return {
      producto: document.getElementById('v-producto')?.value,
      precio:   parseFloat(document.getElementById('v-precio')?.value)    || 0,
      cantidad: parseInt(document.getElementById('v-cantidad')?.value, 10) || 1,
      total:    parseFloat(document.getElementById('v-subtotal')?.value)   || 0,
    };
  }

  getCabecera() {
    return {
      fecha:   document.getElementById('v-fecha')?.value,
      cliente: document.getElementById('v-cliente')?.value.trim(),
      local:   document.getElementById('v-local')?.value.trim(),
    };
  }

  addItem(item) {
    this._items.push(item);
    this._renderItems();
    this._clearItemForm();
  }

  getItems() { return this._items; }

  _renderItems() {
    const container = document.getElementById('v-items-list');
    if (!container) return;
    if (!this._items.length) {
      container.innerHTML = '<p class="empty" style="padding:12px 0">Sin productos aún</p>';
      return;
    }
    const fmt   = v => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
    const total = this._items.reduce((s, i) => s + i.total, 0);
    const comision = total * 0.06;

    container.innerHTML = `
      ${this._items.map((item, idx) => `
        <div class="list-item">
          <div class="list-item__info">
            <span class="list-item__title">${item.producto}</span>
            <span class="list-item__sub">${fmt(item.precio)} × ${item.cantidad}</span>
          </div>
          <div class="list-item__actions">
            <span class="list-item__price">${fmt(item.total)}</span>
            <button class="btn-icon btn-icon--danger" data-remove="${idx}" aria-label="Quitar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
        </div>
      `).join('')}
      <div class="list-item" style="border-top: 2px solid var(--border-m); margin-top:4px;">
        <span style="font-weight:600; font-size:14px;">Total</span>
        <span class="list-item__price" style="font-size:16px;">${fmt(total)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:13px; margin-top:8px; padding:8px 12px; background:var(--green-l); border-radius:var(--radius);">
        <span style="color:var(--green); font-weight:500;">Comisión papá (6%)</span>
        <span style="color:var(--green); font-weight:600;">${fmt(comision)}</span>
      </div>
    `;

    container.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._items.splice(parseInt(btn.dataset.remove), 1);
        this._renderItems();
      });
    });
  }

  _clearItemForm() {
    document.getElementById('v-producto').value  = '';
    document.getElementById('v-precio').value    = '';
    document.getElementById('v-cantidad').value  = '1';
    document.getElementById('v-subtotal').value  = '';
  }

  clearForm() {
    const today = new Date().toISOString().slice(0, 10);
    FormHelper.clear(['v-cliente', 'v-local']);
    document.getElementById('v-fecha').value = today;
    this._items = [];
    this._renderItems();
    this._clearItemForm();
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

    const grupos = {};
    ventas.forEach(v => {
      if (!grupos[v.id]) grupos[v.id] = { ...v, items: [] };
      grupos[v.id].items.push(v);
    });

    const fmt = v => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
    const fmtFecha = f => {
      if (!f) return '';
      const d = new Date(f);
      return isNaN(d) ? f : `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
    };

    list.innerHTML = Object.values(grupos).map(g => {
      const totalGrupo = g.items.reduce((s, i) => s + i.total, 0);
      const comision   = totalGrupo * 0.06;
      return `
        <div class="ticket-card">
          <div class="ticket-card__header">
            <div>
              <span class="ticket-card__cliente">${g.cliente}
                ${g.local ? `<span class="chip chip--local">${g.local}</span>` : ''}
              </span>
              <div class="list-item__sub">${fmtFecha(g.fecha)}</div>
            </div>
            <button class="btn-icon btn-icon--danger" data-delete="${g.id}" aria-label="Eliminar venta">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
          <div class="ticket-card__items">
            ${g.items.map(i => `
              <div class="ticket-card__row">
                <span>${i.producto} × ${i.cantidad}</span>
                <span>${fmt(i.total)}</span>
              </div>
            `).join('')}
          </div>
          <div class="ticket-card__footer">
            <div class="ticket-card__total">
              <span>Total</span>
              <span>${fmt(totalGrupo)}</span>
            </div>
            <div class="ticket-card__comision">
              <span>Comisión (6%)</span>
              <span>${fmt(comision)}</span>
            </div>
            <div class="ticket-card__estado">
              <select class="estado-select" data-venta-id="${g.id}">
                <option value="Despachado" ${(g.estado||'Despachado')==='Despachado'?'selected':''}>📦 Despachado</option>
                <option value="Entregado"  ${(g.estado||'')==='Entregado' ?'selected':''}>✅ Entregado</option>
                <option value="Cancelado"  ${(g.estado||'')==='Cancelado' ?'selected':''}>❌ Cancelado</option>
              </select>
            </div>
          </div>
        </div>
      `;
    }).join('');
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

  bindBusqueda(handler) {
    document.getElementById('busqueda-cliente')?.addEventListener('input', e => handler(e.target.value.trim().toLowerCase()));
  }

  bindFiltroEstado(handler) {
    document.getElementById('filtro-estado')?.addEventListener('change', e => handler(e.target.value));
  }

  getFiltroEstado() {
    return document.getElementById('filtro-estado')?.value || 'todos';
  }

  getFiltro() {
    return document.getElementById('filtro-periodo')?.value || 'todos';
  }

  getBusqueda() {
    return document.getElementById('busqueda-cliente')?.value.trim().toLowerCase() || '';
  }

  bindEstado(handler) {
    document.getElementById('lista-ventas')?.addEventListener('change', e => {
      const sel = e.target.closest('.estado-select');
      if (sel) handler(sel.dataset.ventaId, sel.value);
    });
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
    const fmt = v => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
    this.chart.render(document.getElementById('chart-locales'),   stats.porLocal,    { formatter: fmt });
    this.chart.render(document.getElementById('chart-productos'), stats.porProducto, { unit: ' uds' });
    this.chart.render(document.getElementById('chart-dias'),      stats.porDia,      { formatter: fmt });
    this.chart.render(document.getElementById('chart-clientes'),  stats.porCliente,  { formatter: fmt });
  }

  _renderMetricas({ totalVendido, totalUnidades, clientes, hoyTotal, totalComision }) {
    const fmt = v => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
    const set  = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('stat-total',    fmt(totalVendido));
    set('stat-hoy',      fmt(hoyTotal));
    set('stat-clientes', clientes);
    set('stat-unidades', totalUnidades);
    set('stat-comision', fmt(totalComision));
  }
}