// admin_ui.js

// 🔥 Importamos las funciones reales desde tus archivos de API
import { getAdministrators, GetAdminInfo } from '../../api/api_serviceOwnersRead.js';  
import { deleteAdministrator } from '../../api/api_serviceOwnersDelete.js'; // <-- NUEVO IMPORT AGREGADO

document.addEventListener("DOMContentLoaded", () => {

  const modalOverlay = document.getElementById("modalOverlay");
  const modalFrame   = document.getElementById("modalFrame");
  const modalClose   = document.getElementById("modalClose");
  const tbodyAdmins  = document.getElementById("tbodyAdmins");
  let currentAdminId = null; // Variable para almacenar el ID del admin logueado

  //URLS
  const URL_NUEVO_ADMIN  = "/pages/formulario_nvo_admin.html";
  const URL_EDITAR_ADMIN = "/pages/editar_admin.html?id=";   
  const URL_CAMBIAR_PASS = "/pages/formulario_cambiar_pass.html";

  // AQUI LE AGREGAS FUNCIÓN ARMANDO XD
  async function getProfileInfo() {
    try {
      // 1. Ejecutar la función importada de la API correctamente con ()
      const response = await GetAdminInfo(); 
      
      // 2. Validar que la petición fue exitosa
      // Axios ya nos da 'data' en response, y tu API devuelve 'body' o 'result'
      if (response && (response.body || response.result)) {
        const adminData = response.body || response.result;
        currentAdminId = adminData.DIM_EmployeeId; // Guardamos el ID real obtenido de la sesión
        
        // 3. Armar el nombre completo
        const nombreCompleto = `${adminData.DIM_Name || ''} ${adminData.DIM_LastName || ''}`.trim();
        
        // 4. Inyectar los datos en el HTML
        // (Asegúrate de que las etiquetas en tu HTML tengan estos 'id')
        const domName     = document.getElementById("profileFullName");
        const domEmail    = document.getElementById("profileEmail");
        const domUsername = document.getElementById("profileUsername");
        const domPosition = document.getElementById("profileRole");

        if (domName)     domName.textContent     = nombreCompleto || 'Administrador';
        if (domEmail)    domEmail.textContent    = adminData.DIM_Email || adminData.Email || 'Sin correo';
        if (domUsername) domUsername.textContent = adminData.DIM_Username || 'Sin usuario';
        if (domPosition) domPosition.textContent = adminData.DIM_Position || 'Administrador';
      }
    } catch (error) {
      console.error("Error al obtener la información de tu perfil:", error);
    }
  }

  // Se llama a la función al cargar la página
  getProfileInfo();


  // ==========================================
  // CARGAR LA TABLA DE ADMINISTRADORES
  // ==========================================
  async function cargarAdmins() {
    if (!tbodyAdmins) return;
    
    // Mostramos un mensaje mientras carga desde la base de datos
    tbodyAdmins.innerHTML = `<tr><td colspan="7" style="text-align:center;">Cargando administradores...</td></tr>`;
    
    try {
        // Llamada real al backend
        const admins = await getAdministrators(); 
        
        if (!admins || admins.length === 0) {
             tbodyAdmins.innerHTML = `<tr><td colspan="7" style="text-align:center;">No hay administradores registrados en la base de datos.</td></tr>`;
             return;
        }

        // Limpiamos y dibujamos las filas con los datos reales
        tbodyAdmins.innerHTML = "";
        admins.forEach((admin, index) => {
            const numero = String(index + 1).padStart(3, '0');
            // Adaptamos las variables según cómo suele devolverlas el backend de tu proyecto
            const nombreCompleto = `${admin.DIM_Name || ''} ${admin.DIM_LastName || ''}`.trim();
            
            const fila = `
                <tr>
                    <td>${numero}</td>
                    <td>${admin.DIM_Username || 'Sin usuario'}</td>
                    <td>${admin.DIM_Position || 'Administrador'}</td>
                    <td>${nombreCompleto || 'N/A'}</td>
                    <td>${admin.DIM_Email || admin.Email || 'Sin correo'}</td>
                    <td>${admin.DIM_RegistrationDate || 'Dato no disponible'}</td>
                    <td>
                        <button class="btn-action btn-edit" title="Editar"><span class="material-symbols-outlined">edit</span></button>
                        <button class="btn-action btn-delete" title="Eliminar"><span class="material-symbols-outlined">delete</span></button>
                        <span style="display:none;" class="real-id">${admin.DIM_EmployeeId || admin.id}</span>
                    </td>
                </tr>
            `;
            tbodyAdmins.innerHTML += fila;
        });

    } catch (error) {
        console.error("Error al cargar admins:", error);
        tbodyAdmins.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Hubo un error al conectar con la base de datos.</td></tr>`;
    }
  }

  // Llamamos a la función apenas cargue la página
  cargarAdmins();

  // ==========================================
  // EVENTOS DE LOS BOTONES Y MODALES
  // ==========================================
  
  document.getElementById("btnNuevoAdmin").addEventListener("click", () => {
    abrirModal(URL_NUEVO_ADMIN);
  });

  document.getElementById("btnEditProfile").addEventListener("click", () => {
    if (currentAdminId) {
      abrirModal(URL_EDITAR_ADMIN + currentAdminId);
    } else {
      console.error("No se pudo obtener el ID del administrador para editar.");
    }
  });

  document.getElementById("btnChangePassword").addEventListener("click", () => {
    if (currentAdminId) {
      abrirModal(URL_CAMBIAR_PASS + "?id=" + currentAdminId);
    }
  });

  modalClose.addEventListener("click", cerrarModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) cerrarModal();
  });

  function abrirModal(url) {
    modalFrame.src = url;
    modalOverlay.classList.add("visible");
  }

  function cerrarModal() {
    modalOverlay.classList.remove("visible");
    modalFrame.src = "about:blank";
  }

  // Escucha mensajes de los iframes (Ej. cuando se termina de crear un admin)
  window.addEventListener("message", (e) => {
    if (e.data === "adminRegistrado"  ||
        e.data === "adminActualizado" ||
        e.data === "passActualizada") {
      cerrarModal();
      
      // ¡Magia! Recargamos la tabla de la base de datos automáticamente
      cargarAdmins(); 
      // 🔥 NUEVO: Recargamos tu perfil por si modificaste tus propios datos
      getProfileInfo();
    }
  });

  // ==========================================
  // TABLA: EDITAR / ELIMINAR Y BÚSQUEDA
  // ==========================================
  const confirmDeleteModal = document.getElementById("confirmDeleteModal");
  const deleteAdminName    = document.getElementById("deleteAdminName");
  let adminIdToDelete = null;

  tbodyAdmins.addEventListener("click", (e) => {
    const btnEdit   = e.target.closest(".btn-edit");
    const btnDelete = e.target.closest(".btn-delete");

    if (btnEdit) {
      // Sacamos el ID oculto de la fila y abrimos el modal
      const idReal = btnEdit.closest("td").querySelector(".real-id").textContent;
      abrirModal(URL_EDITAR_ADMIN + idReal);   
    }

    if (btnDelete) {
      const fila = btnDelete.closest("tr");
      // La columna 3 (índice 3) tiene el nombre completo en nuestro nuevo mapeo
      const nombreAdmin = fila.querySelectorAll("td")[3].textContent; 
      const idReal = fila.querySelector(".real-id").textContent;

      adminIdToDelete = idReal;
      deleteAdminName.textContent = nombreAdmin;
      confirmDeleteModal.style.display = "flex";
    }
  });

  document.getElementById("confirmDeleteClose").addEventListener("click",  () => confirmDeleteModal.style.display = "none");
  document.getElementById("btnCancelarDelete").addEventListener("click",   () => confirmDeleteModal.style.display = "none");
  confirmDeleteModal.addEventListener("click", (e) => {
    if (e.target === confirmDeleteModal) confirmDeleteModal.style.display = "none";
  });

  // 🔥 NUEVO: BOTÓN DE CONFIRMAR ELIMINACIÓN CONECTADO A LA API REAL
  document.getElementById("btnConfirmarDelete").addEventListener("click", async () => {
    try {
      console.log("Eliminando en backend el admin ID:", adminIdToDelete);
      
      // 1. Llamada REAL a la base de datos mediante tu API importada
      await deleteAdministrator(adminIdToDelete); 
      
      // 2. Cerramos el modal y limpiamos la variable
      confirmDeleteModal.style.display = "none";
      adminIdToDelete = null;
      
      // 3. Recargamos la tabla para que el admin desaparezca de la pantalla al instante
      cargarAdmins(); 
      
      // 4. (Opcional) Borramos cualquier mensaje fantasma de la memoria
      localStorage.removeItem("mensajeExito"); 
      sessionStorage.removeItem("mensajeExito");

    } catch (error) {
      console.error("Error al eliminar al administrador:", error);
      alert("Hubo un error al intentar eliminar el registro. Revisa la consola.");
    }
  });

  // Búsqueda rápida (filtro visual en el navegador)
  document.getElementById("inputBuscar").addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll("#tbodyAdmins tr").forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(term) ? "" : "none";
    });
  });

});