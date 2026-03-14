// admin_ui.js
// Reutiliza el modal-overlay existente
// (mismas clases que registro_eventos.html)

document.addEventListener("DOMContentLoaded", () => {

  // Modal principal (reutilizado, mismas IDs) 
  const btnNuevoAdmin  = document.getElementById("btnNuevoAdmin");
  const modalOverlay   = document.getElementById("modalOverlay");
  const modalFrame     = document.getElementById("modalFrame");
  const modalClose     = document.getElementById("modalClose");

  // Modal confirmar eliminar 
  const confirmDeleteModal  = document.getElementById("confirmDeleteModal");
  const confirmDeleteClose  = document.getElementById("confirmDeleteClose");
  const btnCancelarDelete   = document.getElementById("btnCancelarDelete");
  const btnConfirmarDelete  = document.getElementById("btnConfirmarDelete");
  const deleteAdminName     = document.getElementById("deleteAdminName");

  const inputBuscar = document.getElementById("inputBuscar");

  const FORM_NUEVO_ADMIN = "/pages/formulario_nvo_admin.html";

  let adminIdToDelete = null;

  
  // ABRIR MODAL — Nuevo Admin
  // Exactamente igual que btnNuevaReserva en registro_eventos.html
  //
  btnNuevoAdmin.addEventListener("click", () => {
    modalFrame.src = FORM_NUEVO_ADMIN;
    modalOverlay.classList.add("visible");
  });

  // Cerrar con X
  modalClose.addEventListener("click", closeModal);

  // Cerrar al hacer clic en el fondo
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  function closeModal() {
    modalOverlay.classList.remove("visible");
    modalFrame.src = "about:blank";
  }

  
  // Escuchar mensaje del iframe cuando se registra el admin
  window.addEventListener("message", (event) => {
    if (event.data === "adminRegistrado") {
      console.log(" Admin registrado. Cerrando modal...");
      closeModal();
      // cargarAdmins(); // recargar tabla cuando tengas la API
    }
  });


  // ACCIONES DE LA TABLA
  document.getElementById("tbodyAdmins").addEventListener("click", (e) => {
    const btnEdit   = e.target.closest(".btn-edit");
    const btnDelete = e.target.closest(".btn-delete");

    if (btnEdit) {
      // Abrir el mismo formulario en modo edición
      // Cuando tengas API: pasar el ID → `/pages/formulario_nvo_admin.html?id=${id}`
      modalFrame.src = FORM_NUEVO_ADMIN;
      modalOverlay.classList.add("visible");
    }

    if (btnDelete) {
      const cells = btnDelete.closest("tr").querySelectorAll("td");
      adminIdToDelete = cells[0].textContent.trim();
      deleteAdminName.textContent = cells[2].textContent.trim();
      confirmDeleteModal.style.display = "flex";
    }
  });

  // editar
  // MODAL CONFIRMAR ELIMINAR
  confirmDeleteClose.addEventListener("click",  closeDeleteModal);
  btnCancelarDelete.addEventListener("click",   closeDeleteModal);
  confirmDeleteModal.addEventListener("click",  (e) => {
    if (e.target === confirmDeleteModal) closeDeleteModal();
  });

  btnConfirmarDelete.addEventListener("click", async () => {
    if (!adminIdToDelete) return;
    console.log("Eliminar admin ID:", adminIdToDelete);
    // await axios.delete(`/api/admins/${adminIdToDelete}`);
    closeDeleteModal();
    adminIdToDelete = null;
    // cargarAdmins();
  });

  function closeDeleteModal() {
    confirmDeleteModal.style.display = "none";
  }
+
  // BÚSQUEDA EN TIEMPO REAL
  
  inputBuscar.addEventListener("input", () => {
    const term = inputBuscar.value.toLowerCase();
    document.querySelectorAll("#tbodyAdmins tr").forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(term) ? "" : "none";
    });
  });

});