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

const validateCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj.length !== 14 || !!cnpj.match(/(\d)\1{13}/)) return false;

    const size = cnpj.length - 2;
    const numbers = cnpj.substring(0, size);
    const digits = cnpj.substring(size);

    const calc = (s) => {
        let sum = 0;
        let pos = s.length - 7;
        for (let i = s.length; i >= 1; i--) {
        sum += s.charAt(s.length - i) * pos--;
        if (pos < 2) pos = 9;
        }
        return sum % 11 < 2 ? 0 : 11 - (sum % 11);
    };

    const digit1 = calc(numbers);
    const digit2 = calc(numbers + digit1);

    return digit1 === Number(digits[0]) && digit2 === Number(digits[1]);
};

function validateSocial(rede, input) {
  const value = input.value.trim();

  const patterns = {
    facebook: /^https:\/\/(www\.)?facebook\.com\/[^\/]+\/?$/i,
    instagram: /^https:\/\/(www\.)?instagram\.com\/[^\/]+\/?$/i,
    linkedin: /^https:\/\/(www\.)?linkedin\.com\/(company\/)?[^\/]+\/?$/i,
    twitter: /^https:\/\/(www\.)?(twitter\.com|x\.com)\/[^\/]+\/?$/i
  };

  if (!patterns[rede]) {
    console.error("Rede social inválida.");
    return false;
  }

  if (!patterns[rede].test(value)) {
    input.setCustomValidity(`URL inválida para ${rede}.`);
    input.reportValidity();
    return false;
  }

  input.setCustomValidity("");
  return true;
}


const setupCompanySearch = () => {
  const searchInput = document.querySelector('.search');
  if (!searchInput) return;

  const currentParams = new URLSearchParams(window.location.search);
  const currentQuery = currentParams.get('search') || '';

  if (currentQuery && !searchInput.value.trim()) {
    searchInput.value = currentQuery;
  }

  searchInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();

    const searchValue = searchInput.value.trim();
    if (!searchValue) return;

    const targetUrl = new URL('/initial-page', window.location.origin);
    targetUrl.searchParams.set('search', searchValue);

    window.location.href = targetUrl.toString();
  });
};

document.addEventListener('DOMContentLoaded', setupCompanySearch);
