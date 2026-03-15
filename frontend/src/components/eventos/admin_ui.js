// admin_ui.js
// Los tres botones usan el MISMO modal iframe
// Solo cambia la URL que se carga

document.addEventListener("DOMContentLoaded", () => {

  // ── Elementos del modal compartido ──
  const modalOverlay = document.getElementById("modalOverlay");
  const modalFrame   = document.getElementById("modalFrame");
  const modalClose   = document.getElementById("modalClose");

  // URLs de los formularios 
  const URL_NUEVO_ADMIN  = "/pages/formulario_nvo_admin.html";
  const URL_EDITAR_ADMIN = "/pages/formulario_nvo_admin.html?modo=editar&id=";
  const URL_CAMBIAR_PASS = "/pages/formulario_cambiar_pass.html";

 
  // Botón: Nuevo Admin
  document.getElementById("btnNuevoAdmin").addEventListener("click", () => {
    abrirModal(URL_NUEVO_ADMIN);
  });

 
  // Botón: Editar Perfil
  // Carga el mismo formulario en modo editar
  
  document.getElementById("btnEditProfile").addEventListener("click", () => {
    // Cuando tengas API: pasa el ID real del usuario en sesión   -----EDITAR
    // Ej: abrirModal(URL_EDITAR_ADMIN + sessionUserId);
    abrirModal(URL_EDITAR_ADMIN + "me");
  });


  // Botón: Cambiar Contraseña
 
  document.getElementById("btnChangePassword").addEventListener("click", () => {
    abrirModal(URL_CAMBIAR_PASS);
  });

  
  // Cerrar modal
  
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

 
  // Escuchar mensajes desde los iframes
 
  window.addEventListener("message", (e) => {
    if (e.data === "adminRegistrado"  ||
        e.data === "adminActualizado" ||
        e.data === "passActualizada") {
      cerrarModal();
      // Aquí puedes recargar los datos del perfil o la tabla:
      // cargarPerfil();
      // cargarAdmins();
    }
  });


  // Tabla: acciones editar / eliminar admin
 
  const confirmDeleteModal = document.getElementById("confirmDeleteModal");
  const deleteAdminName    = document.getElementById("deleteAdminName");
  let adminIdToDelete = null;

  document.getElementById("tbodyAdmins").addEventListener("click", (e) => {
    const btnEdit   = e.target.closest(".btn-edit");
    const btnDelete = e.target.closest(".btn-delete");

    if (btnEdit) {
      const cells = btnEdit.closest("tr").querySelectorAll("td");
      const id    = cells[0].textContent.trim();
      abrirModal(URL_EDITAR_ADMIN + id);
    }

    if (btnDelete) {
      const cells = btnDelete.closest("tr").querySelectorAll("td");
      adminIdToDelete = cells[0].textContent.trim();
      deleteAdminName.textContent = cells[2].textContent.trim();
      confirmDeleteModal.style.display = "flex";
    }
  });

  document.getElementById("confirmDeleteClose").addEventListener("click",  () => confirmDeleteModal.style.display = "none");
  document.getElementById("btnCancelarDelete").addEventListener("click",   () => confirmDeleteModal.style.display = "none");
  confirmDeleteModal.addEventListener("click", (e) => {
    if (e.target === confirmDeleteModal) confirmDeleteModal.style.display = "none";
  });

  document.getElementById("btnConfirmarDelete").addEventListener("click", () => {
    console.log("Eliminar admin ID:", adminIdToDelete);
    // await axios.delete(`/api/admins/${adminIdToDelete}`);
    confirmDeleteModal.style.display = "none";
    adminIdToDelete = null;
    // cargarAdmins();
  });


  // Búsqueda en tiempo real
  
  document.getElementById("inputBuscar").addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll("#tbodyAdmins tr").forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(term) ? "" : "none";
    });
  });

});