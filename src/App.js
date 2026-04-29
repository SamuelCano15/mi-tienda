/**
 * App.js — controlador principal.
 * DIP: recibe todas las dependencias inyectadas desde main.js.
 * SRP: orquesta el flujo entre servicios y vistas.
 */
export class App {
  constructor({ productoService, ventaService, catView, ventaView, historialView, statsView, toast, modal }) {
    this.productoService = productoService;
    this.ventaService    = ventaService;
    this.catView         = catView;
    this.ventaView       = ventaView;
    this.historialView   = historialView;
    this.statsView       = statsView;
    this.toast           = toast;
    this.modal           = modal;

    this._productos = [];
    this._ventas    = [];
    this._filtro    = 'todos';
    this._busqueda  = '';
    this._estado   = 'todos';
  }

  async init() {
    this._bindTabs();
    this._bindVentaHandlers();
    this._bindCatalogoHandlers();
    this._bindHistorialHandlers();
    this.ventaView.setToday();
    await this._loadAll();
  }

  /* ── Carga inicial ─────────────────────────────────────────── */
  async _loadAll() {
    await Promise.all([this._loadProductos(), this._loadVentas()]);
  }

  async _loadProductos() {
    try {
      this._productos = await this.productoService.listar();
      this.catView.render(this._productos);
      this.ventaView.fillProductos(this._productos);
      this.ventaView.bindAutoPrice(this._productos);
    } catch (e) {
      this.toast.error('Error cargando productos. Verifica tu conexión.');
      console.error(e);
    }
  }

  async _loadVentas() {
    try {
      this._ventas = await this.ventaService.listar();
      this._renderHistorialFiltrado();
      this.statsView.render(this.ventaService.calcularStats(this._ventas));
    } catch (e) {
      this.toast.error('Error cargando ventas. Verifica tu conexión.');
      console.error(e);
    }
  }

  /* ── Tabs ──────────────────────────────────────────────────── */
  _bindTabs() {
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('tab--active'));
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('panel--active'));
        btn.classList.add('tab--active');
        document.getElementById(`panel-${target}`)?.classList.add('panel--active');
        if (target === 'stats') this.statsView.render(this.ventaService.calcularStats(this._ventas));
      });
    });
  }

  /* ── Ventas ────────────────────────────────────────────────── */
  _bindVentaHandlers() {
    this.ventaView.bindAgregarItem(() => this._onAgregarItem());
    this.ventaView.bindRegistrarVenta(() => this._onRegistrarVenta());
  }

  _onAgregarItem() {
    const item = this.ventaView.getItemData();
    if (!item.producto) { this.toast.error('Selecciona un producto.'); return; }
    if (item.precio <= 0) { this.toast.error('El precio debe ser mayor a cero.'); return; }
    if (item.cantidad <= 0) { this.toast.error('La cantidad debe ser mayor a cero.'); return; }
    this.ventaView.addItem(item);
  }

  async _onRegistrarVenta() {
    const cabecera = this.ventaView.getCabecera();
    const items    = this.ventaView.getItems();
    const result   = await this._withLoading('btn-registrar-venta', () =>
      this.ventaService.registrar(cabecera, items)
    );
    if (!result.ok) { this.toast.error(result.errors.join(' ')); return; }
    this.toast.success('Venta registrada.');
    this.ventaView.clearForm();
    await this._loadVentas();
  }

  /* ── Catálogo ──────────────────────────────────────────────── */
  _bindCatalogoHandlers() {
    this.catView.bindAgregarProducto(() => this._onAgregarProducto());
    this.catView.bindDeleteProducto(nombre => this._onEliminarProducto(nombre));
  }

  async _onAgregarProducto() {
    const data   = this.catView.getFormData();
    const result = await this._withLoading('btn-agregar-producto', () =>
      this.productoService.agregar(data)
    );
    if (!result.ok) { this.toast.error(result.errors.join(' ')); return; }
    this.toast.success('Producto agregado al catálogo.');
    this.catView.clearForm();
    await this._loadProductos();
  }

  async _onEliminarProducto(nombre) {
    const ok = await this.modal.ask('Eliminar producto', `¿Eliminar "${nombre}" del catálogo?`);
    if (!ok) return;
    try {
      await this.productoService.eliminar(nombre);
      this.toast.success('Producto eliminado.');
      await this._loadProductos();
    } catch { this.toast.error('Error eliminando el producto.'); }
  }

  /* ── Historial ─────────────────────────────────────────────── */
  _bindHistorialHandlers() {
    this.historialView.bindFiltro(filtro => { this._filtro = filtro; this._renderHistorialFiltrado(); });
    this.historialView.bindBusqueda(q => { this._busqueda = q; this._renderHistorialFiltrado(); });
    this.historialView.bindFiltroEstado(estado => { this._estado = estado; this._renderHistorialFiltrado(); });
    this.historialView.bindEstado((id, estado) => this._onActualizarEstado(id, estado));
    this.historialView.bindDeleteVenta(id => this._onEliminarVenta(id));
  }

  _renderHistorialFiltrado() {
    const filtradas = this._filtrarVentas(this._filtro);
    this.historialView.render(filtradas);
  }

  _filtrarVentas(periodo) {
    let resultado = this._ventas;
    const hoy   = new Date().toISOString().slice(0, 10);
    const desde = new Date();
    if (periodo === 'hoy')    resultado = resultado.filter(v => v.fecha === hoy);
    if (periodo === 'semana') { desde.setDate(desde.getDate() - 7); resultado = resultado.filter(v => v.fecha >= desde.toISOString().slice(0, 10)); }
    if (periodo === 'mes')    { desde.setDate(desde.getDate() - 30); resultado = resultado.filter(v => v.fecha >= desde.toISOString().slice(0, 10)); }
    if (this._busqueda) resultado = resultado.filter(v => v.cliente.toLowerCase().includes(this._busqueda));
    if (this._estado !== 'todos') resultado = resultado.filter(v => (v.estado || 'Despachado') === this._estado);
    return resultado;
  }

  async _onEliminarVenta(ventaId) {
    const ok = await this.modal.ask('Eliminar venta', '¿Eliminar este registro de venta?');
    if (!ok) return;
    try {
      await this.ventaService.eliminar(ventaId);
      this.toast.success('Venta eliminada.');
      await this._loadVentas();
    } catch { this.toast.error('Error eliminando la venta.'); }
  }

  async _onActualizarEstado(ventaId, estado) {
    try {
      await this.ventaService.actualizarEstado(ventaId, estado);
      // actualizar en memoria para que no se resetee al filtrar
      this._ventas.forEach(v => {
        if (v.id === ventaId) v.estado = estado;
      });
      this.toast.success('Estado actualizado.');
    } catch {
      this.toast.error('Error actualizando el estado.');
    }
  }

  /* ── Helpers ───────────────────────────────────────────────── */
  async _withLoading(btnId, fn) {
    const btn = document.getElementById(btnId);
    if (btn) { btn.disabled = true; btn.classList.add('btn--loading'); }
    try { return await fn(); }
    finally { if (btn) { btn.disabled = false; btn.classList.remove('btn--loading'); } }
  }
}