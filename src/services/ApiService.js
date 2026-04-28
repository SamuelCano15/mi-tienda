import { CONFIG } from '../config.js';

/**
 * ApiService
 * SRP: única responsabilidad — comunicación HTTP con Google Apps Script.
 * DIP: clases superiores dependen de esta abstracción, no de fetch directamente.
 */
export class ApiService {
  constructor(baseUrl = CONFIG.SCRIPT_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Llamada GET con parámetros en query string.
   * Google Apps Script solo acepta GET para doGet.
   * @param {Object} params
   * @returns {Promise<any>}
   */
  async get(params = {}) {
    const url = new URL(this.baseUrl);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  /**
   * Llamada POST con body en query string.
   * Apps Script lee parámetros con e.parameter en doPost también.
   * @param {Object} params
   * @returns {Promise<any>}
   */
  async post(params = {}) {
    const url  = new URL(this.baseUrl);
    const body = new URLSearchParams(params);
    const res  = await fetch(url.toString(), {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
}
