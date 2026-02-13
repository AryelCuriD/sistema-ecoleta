document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('delete-profile-form');
  const overlay = document.getElementById('confirm-overlay');
  const confirmDeleteButton = document.getElementById('confirm-delete-button');
  const cancelDeleteButton = document.getElementById('cancel-delete-button');

  if (!form || !overlay || !confirmDeleteButton || !cancelDeleteButton) return;

  const openModal = () => {
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
  };

  const closeModal = () => {
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    openModal();
  });

  cancelDeleteButton.addEventListener('click', closeModal);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  confirmDeleteButton.addEventListener('click', () => {
    closeModal();
    window.alert('Perfil excluído com sucesso.');
    window.location.href = '/initial-page';
  });
});