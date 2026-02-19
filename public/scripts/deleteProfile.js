document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('delete-profile-form');
  const overlay = document.getElementById('confirm-overlay');
  const confirmDeleteButton = document.getElementById('confirm-delete-button');
  const cancelDeleteButton = document.getElementById('cancel-delete-button');

  let email
  let password
  let id

  if (!form || !overlay || !confirmDeleteButton || !cancelDeleteButton) return;

  const openModal = () => {
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
  };

  const closeModal = () => {
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
  };

  form.addEventListener('submit', async (event)=> {
    event.preventDefault();
    email = document.querySelector('#delete-email').value;
    password = document.querySelector('#delete-password').value;
    
    const data = await getLoggedUserData()
    id = data.user
    try {
      const res = await fetch('/api/me', { credentials: 'include' })

      if (res.ok) {
        openModal()
      }
    } catch (err) {
      console.error(err)
    }
  });

  cancelDeleteButton.addEventListener('click', closeModal);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  confirmDeleteButton.addEventListener('click', async () => {
    try {
      const res = await fetch(`/empresa/user/${id._id}`, {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (res.ok) {
        console.log('a')
        await fetch('/api/logout', {
          method: 'POST'
        });
        window.location.href = '/initial-page'
      }
    } catch (err) {
      console.error(err)
    }
    closeModal();
  });
});