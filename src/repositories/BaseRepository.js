/**
 * BaseRepository
 * Abstracción genérica de acceso a datos.
 * Principio OCP: los repositorios concretos extienden sin modificar.
 * Principio DIP: los servicios dependen de esta interfaz, no de la API.
 */
export class BaseRepository {
  /**
   * @param {import('../services/ApiService.js').ApiService} api
   * @param {string} entity - nombre de la entidad ('ventas' | 'productos')
   * @param {Function} ModelClass - constructor del modelo
   */
  constructor(api, entity, ModelClass) {
    this.api        = api;
    this.entity     = entity;
    this.ModelClass = ModelClass;
  }

  /**
   * Obtiene todos los registros.
   * @returns {Promise<BaseModel[]>}
   */
  async getAll() {
    const data = await this.api.get({ action: `get${this._cap()}` });
    return (Array.isArray(data) ? data : []).map(d => new this.ModelClass(d));
  }

  /**
   * Guarda un registro nuevo.
   * @param {BaseModel} model
   * @returns {Promise<{ok: boolean}>}
   */
  async save(model) {
    return this.api.get({ action: `add${this._cap()}`, ...model.toJSON() });
  }

  /**
   * Elimina un registro por id o nombre.
   * @param {string} identifier
   * @returns {Promise<{ok: boolean}>}
   */
  async delete(identifier) {
    return this.api.get({ action: `delete${this._cap()}`, id: identifier, nombre: identifier });
  }

  /** Capitaliza el nombre de la entidad para construir nombres de acción. */
  _cap() {
    return this.entity.charAt(0).toUpperCase() + this.entity.slice(1);
  }
}
