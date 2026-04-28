/**
 * BaseModel
 * Clase base para todas las entidades del dominio.
 * Principio SRP: solo gestiona identidad y serialización.
 * Principio OCP: subclases extienden sin modificar esta clase.
 */
export class BaseModel {
  constructor(data = {}) {
    this.id        = data.id        || String(Date.now());
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  toJSON() {
    return { ...this };
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }

  /**
   * Método de validación base. Las subclases lo sobrescriben.
   * @returns {string[]} lista de errores; vacía si es válido
   */
  validate() {
    return [];
  }

  get isValid() {
    return this.validate().length === 0;
  }
}
