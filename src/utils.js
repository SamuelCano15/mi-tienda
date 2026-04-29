/**
 * utils.js — funciones utilitarias reutilizables.
 */

/**
 * Capitaliza cada palabra de una cadena.
 * "guillermo gomez" → "Guillermo Gomez"
 */
export const titleCase = str =>
  str ? str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';