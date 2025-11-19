// src/components/eventos/dropdown_manager.js

/**
 * Clase para manejar la lógica de los selectores de acción en tablas.
 * Se encarga de ejecutar callbacks según la opción seleccionada.
 */
export class TableDropdownManager {
  constructor(tableBodySelector, actions) {
    this.tbody = document.querySelector(tableBodySelector);
    
    // actions espera un objeto con callbacks:
    // { onEdit: (id) => {}, onArchive: (id) => {}, onDetails: (id) => {}, onPay: (id) => {} }
    this.actions = actions; 
    
    if (!this.tbody) {
      console.error(`No se encontró el cuerpo de la tabla: ${tableBodySelector}`);
      return;
    }

    this.initListeners();
  }

  initListeners() {
    // Escuchamos el evento 'change' en el tbody (delegación de eventos)
    this.tbody.addEventListener('change', (event) => {
      const select = event.target.closest('.js-action-select');
      if (!select) return;

      const id = select.dataset.id;
      const action = select.value;

      // Ejecutamos el callback correspondiente según la acción
      switch (action) {
        case 'details':
          if (this.actions.onDetails) {
            this.actions.onDetails(id);
          }
          break;
        
        case 'archive':
          if (this.actions.onArchive) {
            this.actions.onArchive(id);
          }
          break;
        
        case 'pay':
          if (this.actions.onPay) {
            this.actions.onPay(id);
          }
          break;
        
        case 'edit':
          if (this.actions.onEdit) {
            this.actions.onEdit(id);
          }
          break;
        
        default:
          console.warn(`Acción no reconocida: ${action}`);
      }
      
      // Reseteamos el select a la opción por defecto
      select.value = "";
    });
  }

  /**
   * Método opcional para actualizar los callbacks dinámicamente
   */
  updateActions(newActions) {
    this.actions = { ...this.actions, ...newActions };
  }

  /**
   * Método para limpiar listeners si necesitas destruir la instancia
   */
  destroy() {
    // Aquí podrías remover listeners si fuera necesario
    console.log('TableDropdownManager destruido');
  }
}