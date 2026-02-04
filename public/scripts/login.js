const form = document.querySelector('.login-form');

// N sei se essa bomba ta funcionando pq no momento q eu fiz eu n conseguia conectar com o banco de dados
form.addEventListener('submit', async (e) => {
    const email = form.querySelector('#email').value.trim();
    const password = form.querySelector('#senha').value.trim();

    e.preventDefault()

    if (!email || ! password) return

    try {
        const usersRes = await fetch('/empresas/usuarios', {
            method: 'GET'
        });
        const users = await usersRes.json()
        if (usersRes.ok) console.log(users)

        const loginRes = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
    } catch (err) {
        console.error(err)
    }
});