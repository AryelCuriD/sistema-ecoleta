const getUsers = async () => {
    try {
        const usersRes = await fetch('/empresas/users');
        const users = await usersRes.json()
        
        if (usersRes.ok) {
            return users;
        } else {
            console.error('Erro ao pegar usuários')
            return null;
        }
    } catch (err) {
        console.error(err)
    }
}

const getUserData = async (user_id) => {
    try {
        const res = await fetch(`/empresa/data/${user_id}`);
        const data = res.json();

        if (res.ok) {
            return data
        } else {
            console.error('erro ao pegar os dados da empresa')
        }
    } catch (err) {
        console.error(err)
    }
}

const getLoggedUserData = async () => {
    try {
        const res = await fetch('/user-data')
        const data = await res.json()

        if (res.ok) {
            return data
        } else {
            console.error('Erro ao pegar os dados da empresa')
            return
        }
    } catch (err) {
        console.error(err)
    }
}

const getCompanyLogo = async (logoId) => {
    try {
        const res = await fetch(`/empresas/logo/${logoId}`)
        const logo = res.blob()

        if (res.ok) {
            return logo
        } else {
            console.error('Erro ao pegar logo da empresa')
        }
    } catch (err) {
        console.log(err)
    }
}

const verifyProfile = async () => {
    try {
        const res = await fetch('/api/me', { credentials: 'include' });
        
        if (res.ok) {
            document.querySelector('.login').style.display = 'none';
            document.querySelector('.profile').style.display = 'flex';
        } else {
            document.querySelector('.login').style.display = 'flex';
            document.querySelector('.profile').style.display = 'none';
        }
    } catch (err) {
        console.error(err)
    }
}
verifyProfile()

const stripHTMLTags = (string) => {
    const parseHTML = new DOMParser().parseFromString(string, 'text/html')
    return parseHTML.body.textContent || '';
}