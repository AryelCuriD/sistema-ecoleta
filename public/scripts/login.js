const form = document.querySelector('.login-form');
const errorMsg = form.querySelector('.error-msg');

// Envia p servidor o email e senha para login, e trata a resposta
form.addEventListener('submit', async (e) => {
    const email = form.querySelector('#email').value.trim();
    const password = form.querySelector('#senha').value.trim();

    e.preventDefault()

    if (!email || !password) return

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const msg = await res.json();
        if (res.ok) {
            console.log('Login bem-sucedido:', msg);
            errorMsg.style.display = 'none';
            window.location.href = '/own-profile'; //nao esquecer de mudar
        } else {
            console.error('Erro no login:', msg);
            errorMsg.textContent = msg.error || 'Erro no login. Tente novamente.';
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        console.error(err)
    };
});