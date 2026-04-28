/**
 * ui/components — biblioteca de componentes UI reutilizables.
 * ISP: cada componente expone solo la interfaz que necesita.
 */

/* ─── Toast ─────────────────────────────────────────────────── */
export class Toast {
  constructor() {
    this._el = document.getElementById('toast');
    this._timer = null;
  }

  show(message, type = 'default', duration = 3000) {
    this._el.textContent  = message;
    this._el.className    = `toast toast--${type} toast--visible`;
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this._el.classList.remove('toast--visible'), duration);
  }

  success(msg) { this.show(msg, 'success'); }
  error(msg)   { this.show(msg, 'error'); }
  info(msg)    { this.show(msg, 'info'); }
}

/* ─── Loader ─────────────────────────────────────────────────── */
export class Loader {
  constructor(selector) {
    this._el = document.querySelector(selector);
  }

  show(text = 'Cargando...') {
    if (!this._el) return;
    this._el.innerHTML  = `<div class="loader"><span class="loader__ring"></span><span>${text}</span></div>`;
    this._el.style.display = 'flex';
  }

  hide() {
    if (!this._el) return;
    this._el.style.display = 'none';
    this._el.innerHTML = '';
  }
}

/* ─── ConfirmModal ────────────────────────────────────────────── */
export class ConfirmModal {
  constructor() {
    this._el     = document.getElementById('confirm-modal');
    this._title  = this._el.querySelector('.modal__title');
    this._body   = this._el.querySelector('.modal__body');
    this._btnOk  = this._el.querySelector('[data-action="ok"]');
    this._btnCan = this._el.querySelector('[data-action="cancel"]');
    this._btnCan.addEventListener('click', () => this._resolve(false));
  }

  /**
   * Muestra el modal de confirmación.
   * @returns {Promise<boolean>}
   */
  ask(title, message) {
    this._title.textContent = title;
    this._body.textContent  = message;
    this._el.classList.add('modal--visible');
    return new Promise(resolve => {
      this._resolve = (val) => {
        this._el.classList.remove('modal--visible');
        resolve(val);
      };
      this._btnOk.onclick = () => this._resolve(true);
    });
  }
}

/* ─── BarChart ────────────────────────────────────────────────── */
export class BarChart {
  /**
   * @param {HTMLElement} container
   * @param {{ label: string, value: number }[]} data
   * @param {Object} opts
   */
  render(container, data, opts = {}) {
    if (!data.length) {
      container.innerHTML = '<p class="empty">Sin datos aún</p>';
      return;
    }
    const { unit = '', maxItems = 8, formatter } = opts;
    const slice  = data.slice(0, maxItems);
    const maxVal = Math.max(...slice.map(d => d.value), 1);
    const fmt    = formatter || (v => Number(v).toLocaleString('es-CO'));

    container.innerHTML = slice.map(({ label, value }) => `
      <div class="bar-row">
        <span class="bar-label" title="${label}">${label}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width:${Math.round(value / maxVal * 100)}%"></div>
        </div>
        <span class="bar-value">${fmt(value)}${unit}</span>
      </div>
    `).join('');
  }
}

/* ─── FormHelper ─────────────────────────────────────────────── */
export class FormHelper {
  /**
   * Lee todos los campos de un formulario por sus id.
   * @param {string[]} ids
   * @returns {Object}
   */
  static collect(ids) {
    return ids.reduce((obj, id) => {
      const el = document.getElementById(id);
      obj[id]  = el ? el.value : '';
      return obj;
    }, {});
  }

  /** Limpia los campos de un formulario. */
  static clear(ids) {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = el.tagName === 'SELECT' ? '' : (el.type === 'number' && el.id.includes('cantidad') ? '1' : '');
    });
  }

  /** Puebla un <select> con opciones desde un array. */
  static fillSelect(selectId, items, valueFn, labelFn) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const prev = sel.value;
    sel.innerHTML = '<option value="">— Seleccionar —</option>';
    items.forEach(item => {
      const opt    = document.createElement('option');
      opt.value    = valueFn(item);
      opt.textContent = labelFn(item);
      sel.appendChild(opt);
    });
    if (prev) sel.value = prev;
  }
}
