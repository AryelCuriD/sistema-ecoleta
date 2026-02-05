const getUsers = async () => {
    const usersRes = await fetch('/empresas/usuarios', {
        method: 'GET'
    });
    const users = await usersRes.json()
    
    if (usersRes.ok) {
        return users;
    } else {
        console.error('Erro ao pegar usuários')
        return null;
    }
}