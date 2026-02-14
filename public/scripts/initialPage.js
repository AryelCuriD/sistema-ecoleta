document.addEventListener('DOMContentLoaded', async (e) => {
    const users = await getUsers()
    const cardEmpresas = document.querySelector('.card-empresas');
    cardEmpresas.innerHTML = '<h3>Empresas Parceiras</h3>'

    users.forEach(async (u) => {
        const data = await getUserData(u._id)
        const logo = await getCompanyLogo(data.info.logo)

        cardEmpresas.innerHTML += `
        <div class="card">
          <img class="card-imagem" id="${data.info.nome_empresa}"></img>
          <div class="card-info">
            <h4>${stripHTMLTags(data.info.nome_empresa)}</h4>
            <p>${stripHTMLTags(data.info.descricao)}</p>
            <div class="card-tags">
                ${(() => {
                    const residuos = data.wastes?.wastes || ["Sem Resíduos"];

                    const primeiros = residuos.slice(0, 3)
                        .map(m => `<span>${stripHTMLTags(m)}</span>`)
                        .join('');

                    const restante = residuos.length > 3
                        ? `<span>+${residuos.length - 3}</span>`
                        : '';

                    return primeiros + restante;
                })()}
            </div>
            <a class="card-botao" href="/profile?id=${u._id}">Ver perfil da empresa</a>
          </div>
        </div>
        `
        document.querySelector(`#${data.info.nome_empresa}`).src = URL.createObjectURL(logo)
    });
})