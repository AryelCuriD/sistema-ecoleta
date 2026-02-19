document.addEventListener('DOMContentLoaded', async () => {
    const cardEmpresas = document.querySelector('.card-empresas');
    const filterOptionsContainer = document.querySelector('#waste-filter-options');
    const wasteFilterForm = document.querySelector('#waste-filter-form');
    const cleanFiltersButton = document.querySelector('#clean-waste-filters');
    const searchInput = document.querySelector('.search');

    const normalizeSearchTerm = (value) => String(value || '').trim().toLowerCase();
    const currentSearch = new URLSearchParams(window.location.search).get('search') || '';

    const users = await getUsers();
    const wastesResponse = await fetch('/empresas/wastes');
    const wastesData = wastesResponse.ok ? await wastesResponse.json() : [];

    if (!Array.isArray(users) || users.length === 0) {
        cardEmpresas.innerHTML = '<h3>Empresas Parceiras</h3><p>Nenhuma empresa encontrada.</p>';
        filterOptionsContainer.innerHTML = '<p>Nenhum resíduo encontrado.</p>';
        return;
    }

    const companiesData = await Promise.all(users.map(async (user) => {
        const data = await getUserData(user._id);
        const logo = await getCompanyLogo(data.info.logo);

        return {
            id: user._id,
            info: data.info,
            description: data.info.descricao,
            wastes: Array.isArray(data.wastes?.wastes) ? data.wastes.wastes : [],
            logoUrl: URL.createObjectURL(logo)
        };
    }));

    const uniqueWastes = [...new Set((Array.isArray(wastesData) ? wastesData : [])
        .flatMap(entry => Array.isArray(entry.wastes) ? entry.wastes : [])
        .filter(Boolean)
        .map(waste => waste.trim()))
    ].sort((a, b) => a.localeCompare(b, 'pt-BR'));

    if (uniqueWastes.length === 0) {
        filterOptionsContainer.innerHTML = '<p>Nenhum resíduo cadastrado.</p>';
    } else {
        filterOptionsContainer.innerHTML = uniqueWastes
            .map((waste, index) => `
                <label class="filtro-opcao" for="waste-${index}">
                    <input type="checkbox" id="waste-${index}" name="residuo" value="${stripHTMLTags(waste)}">
                    <span>${stripHTMLTags(waste)}</span>
                </label>
            `)
            .join('');
    }

    const renderCompanies = (selectedWastes = [], companyNameSearch = currentSearch) => {
        const normalizedSelectedWastes = selectedWastes.map(waste => waste.toLowerCase());
        const normalizedNameSearch = normalizeSearchTerm(companyNameSearch);

        const filteredCompanies = companiesData.filter((company) => {
            const companyName = normalizeSearchTerm(company.info.nome_empresa);
            const matchesName = !normalizedNameSearch || companyName.includes(normalizedNameSearch);

            if (!matchesName) return false;

            if (normalizedSelectedWastes.length === 0) {
                return true;
            }

            const normalizedCompanyWastes = company.wastes.map(waste => waste.toLowerCase());
            return normalizedSelectedWastes.every(waste => normalizedCompanyWastes.includes(waste));
        });

        cardEmpresas.innerHTML = '<h3>Empresas Parceiras</h3>';

        if (filteredCompanies.length === 0) {
            cardEmpresas.innerHTML += normalizedNameSearch
                ? '<p>Nenhuma empresa encontrada para o termo pesquisado.</p>'
                : '<p>Nenhuma empresa encontrada para os resíduos selecionados.</p>';
            return;
        }

        filteredCompanies.forEach((company) => {
            const residuos = company.wastes.length > 0 ? company.wastes : ['Sem Resíduos'];
            const primeiros = residuos.slice(0, 3)
                .map(waste => `<span>${stripHTMLTags(waste)}</span>`)
                .join('');

            const restante = residuos.length > 3
                ? `<span>+${residuos.length - 3}</span>`
                : '';

            cardEmpresas.innerHTML += `
                <div class="card">
                  <img class="card-imagem" src="${company.logoUrl}" alt="Logo da empresa ${stripHTMLTags(company.info.nome_empresa)}">
                  <div class="card-info">
                    <h4>${stripHTMLTags(company.info.nome_empresa)}</h4>
                    <p>${stripHTMLTags(company.description)}</p>
                    <div class="card-tags">
                      ${primeiros + restante}
                    </div>
                    <a class="card-botao" href="/profile?id=${company.id}">Ver perfil da empresa</a>
                  </div>
                </div>
            `;
        });
    };

    if (currentSearch && searchInput && !searchInput.value.trim()) {
        searchInput.value = currentSearch;
    }

    wasteFilterForm.addEventListener('change', () => {
        const selectedWastes = [...wasteFilterForm.querySelectorAll('input[name="residuo"]:checked')]
            .map(input => input.value);

        renderCompanies(selectedWastes);
    });

    cleanFiltersButton.addEventListener('click', () => {
        const checkedFilters = wasteFilterForm.querySelectorAll('input[name="residuo"]:checked');
        checkedFilters.forEach((input) => {
            input.checked = false;
        });
        renderCompanies([], currentSearch);
    });

    renderCompanies([], currentSearch);
});
