var data = {};

function clearErrors() {
  if (document.querySelector('.error-msg')) {
    document.querySelector('.error-msg').remove();
  }
}

function callError(errors, step) {
  clearErrors();
  const errorDiv = document.createElement('div');
  errorDiv.classList.add('error-msg');
  errors.forEach(err => {
    errorDiv.innerHTML += `<label class="error-label">• ${err}</label>`;
  });

  switch (step) {
    case 1:
      const card = document.querySelector('.cadastro-card[data-step="1"]');
      card.appendChild(errorDiv);
      break;
    case 2:
      const card2 = document.querySelector('.cadastro-card[data-step="2"]');
      card2.appendChild(errorDiv);
      break;
    case 3:
      const card3 = document.querySelector('.cadastro-card[data-step="3"]');
      card3.appendChild(errorDiv);
      break;
    case 4:
      const card4 = document.querySelector('.cadastro-card[data-step="4"]');
      card4.appendChild(errorDiv);
      break;
    case 5:
      const card5 = document.querySelector('.cadastro-card[data-step="5"]');
      card5.appendChild(errorDiv);
  }
}


const sanitizeCompanyName = (value) => {
  const rawValue = String(value || '');
  const parsedValue = typeof stripHTMLTags === 'function'
    ? stripHTMLTags(rawValue)
    : rawValue.replace(/<[^>]*>/g, ' ');

  const normalized = parsedValue
    .replace(/[<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized;
};

const companyNameIn = document.getElementById("nome-empresa");
const cnpjIn = document.getElementById("cnpj");
const socialReasonIn = document.getElementById("razao-social");
const logoIn = document.getElementById("logo");
const descIn = document.getElementById("descricao");

cnpjIn.addEventListener('input', (e) => {
  let value = e.target.value;

  value = value.replace(/\D/g, "");
  value = value.slice(0, 14);

  value = value
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");

  e.target.value = value;
})

const logoLabel = document.querySelector('#logo-upload-text');
const descSpan = document.querySelector('.char-count');

descIn.addEventListener('input', (e) => {
  const currentLength = e.target.value.length;
  descSpan.textContent = `${currentLength}/1000 caracteres`;
  if (currentLength > 1000) {
    descSpan.textContent = `1000/1000 caracteres`;
    e.target.value = e.target.value.slice(0, 1000);
  }
});

logoIn.addEventListener('change', (e) => {
  const file = e.target.files[0];
  let errors = []

  if (!file) {
    logoLabel.textContent = "Nenhum arquivo selecionado.";
    return;
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  if (!allowedTypes.includes(file.type)) {
    errors.push("Apenas arquivos JPG, JPEG ou PNG são permitidos.");
    logoIn.value = "";
    callError(errors, 1);
    return;
  }

  const img = new Image();
  const objectURL = URL.createObjectURL(file);

  img.onload = function () {
    if (img.width !== img.height) {
      errors.push("A imagem deve ter proporção 1:1 (quadrada).");
      logoIn.value = "";
      URL.revokeObjectURL(objectURL);

      callError(errors, 1);
      return;
    }

    logoLabel.textContent = file.name;
    clearErrors();
    URL.revokeObjectURL(objectURL);
  };

  img.onerror = function () {
    logoLabel.textContent = "Erro ao carregar imagem.";
    logoIn.value = "";
    URL.revokeObjectURL(objectURL);
  };

  img.src = objectURL;
});

document.querySelector('#button-1').addEventListener('click', async (e) => {
  let errors = []
  const sanitizedCompanyName = sanitizeCompanyName(companyNameIn.value);

  if (!sanitizedCompanyName) {
    errors.push('Informe um "Nome da Empresa" válido (somente texto).');
  }
  if (!cnpjIn.value.trim()) {
    errors.push('O campo "CNPJ" é obrigatório.');
  }
  if (!socialReasonIn.value.trim()) {
    errors.push('O campo "Razão Social" é obrigatório.');
  }
  if (!logoIn.files[0]) {
    errors.push('É necessário fazer upload do logo da empresa.');
  }
  if (!descIn.value.trim()) {
    errors.push('O campo "Descrição" é obrigatório.');
  }
  if (cnpjIn.value.trim()) {
    if (!validateCNPJ(cnpjIn.value)) {
      errors.push('CNPJ inválido. Verifique o número e tente novamente.');
    }
  }

  if (errors.length > 0) {
    callError(errors, 1);
    return
  }

  clearErrors();

  companyNameIn.value = sanitizedCompanyName;

  data.info = {
    nome_empresa: sanitizedCompanyName,
    cnpj: cnpjIn.value,
    razao_social: socialReasonIn.value,
    descricao: descIn.value,
    logo: logoIn.files[0]
  }
 
  document.querySelector('.cadastro-card[data-step="1"]').classList.add('is-hidden');
  document.querySelector('.cadastro-card[data-step="2"]').classList.remove('is-hidden');
})



const phoneIn = document.getElementById("telefone");
const corpEmailIn = document.getElementById("email-corporativo");
const faceIn = document.getElementById("facebook");
const instaIn = document.getElementById("instagram");
const linkedinIn = document.getElementById("linkedin");
const twitterIn = document.getElementById("twitter");

phoneIn.addEventListener('input', (e) => {
  let value = e.target.value;
  value = value.replace(/\D/g, '');
  value = value.substring(0, 11);

  if (value.length > 0) {
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
  }

  if (value.length > 10) {
    value = value.replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  }

  e.target.value = value;
});

document.querySelector('#back-2').addEventListener('click', async (e) => {
  document.querySelector('.cadastro-card[data-step="2"]').classList.add('is-hidden');
  document.querySelector('.cadastro-card[data-step="1"]').classList.remove('is-hidden');
});

document.querySelector('#button-2').addEventListener('click', async (e) => {
  let errors = []
  if (!phoneIn.value) {
    errors.push('O campo "Telefone" é obrigatório.');
  }
  if (phoneIn.value) {
    if (phoneIn.value.replace(/\D/g, '').length !== 11) {
      errors.push('Telefone inválido. Deve conter 11 dígitos.');
    }
  }

  if (!corpEmailIn.value.trim()) {
    errors.push('O campo "Email Corporativo" é obrigatório.');
  }
  if(corpEmailIn.value.trim()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(corpEmailIn.value.trim())) {
      errors.push('Email corporativo inválido. Verifique o formato e tente novamente.');
    }
  }

  if (!faceIn.value.trim()) {
    errors.push('O campo "Facebook" é obrigatório.');
  } else if (!validateSocial('facebook', faceIn)) {
    errors.push('URL do Facebook inválida. Verifique e tente novamente.');
  }

  if (!instaIn.value.trim()) {
    errors.push('O campo "Instagram" é obrigatório.');
  } else if (!validateSocial('instagram', instaIn)) {
    errors.push('URL do Instagram inválida. Verifique e tente novamente.');
  }

  if (!linkedinIn.value.trim()) {
    errors.push('O campo "LinkedIn" é obrigatório.');
  } else if (!validateSocial('linkedin', linkedinIn)) {
    errors.push('URL do LinkedIn inválida. Verifique e tente novamente.');
  }

  if (!twitterIn.value.trim()) {
    errors.push('O campo "X (Twitter)" é obrigatório.');
  } else if (!validateSocial('twitter', twitterIn)) {
    errors.push('URL do X (Twitter) inválida. Verifique e tente novamente.');
  }


  if (errors.length > 0) {
    callError(errors, 2);
    return
  }

  clearErrors();

  data.contact = {
    telefone: phoneIn.value,
    email: corpEmailIn.value,
    facebook: faceIn.value,
    instagram: instaIn.value,
    linkedin: linkedinIn.value,
    twitter: twitterIn.value
   }

  document.querySelector('.cadastro-card[data-step="2"]').classList.add('is-hidden');
  document.querySelector('.cadastro-card[data-step="3"]').classList.remove('is-hidden');
});

document.querySelector('#back-3').addEventListener('click', async (e) => {
  document.querySelector('.cadastro-card[data-step="3"]').classList.add('is-hidden');
  document.querySelector('.cadastro-card[data-step="2"]').classList.remove('is-hidden');
});





const addWasteBtn = document.querySelector('.add-residuo');

const normalizeWaste = (s) =>
  String(s || '').trim().replace(/\s+/g, ' ').toLowerCase();

const capitalizeFirst = (s) => {
  s = String(s || '');
  const t = s.trimStart();
  if (!t) return s;
  return t.charAt(0).toUpperCase() + t.slice(1);
};

function attachWasteCapitalization(inputEl) {
  inputEl.addEventListener('input', () => {
    const before = inputEl.value;
    const after = capitalizeFirst(before);

    if (after !== before) inputEl.value = after;
  });
}

attachWasteCapitalization(document.querySelector('.residuo-item input'));

addWasteBtn.addEventListener('click', () => {
  const wasteList = document.querySelector('.residuos-list');
  const count = document.querySelectorAll('.residuo-item').length + 1;
  const newItem = document.createElement('div');
  newItem.className = 'residuo-item';
  newItem.innerHTML = `
    <span class="residuo-label">Resíduo ${count}</span>
    <div class="residuo-row">
      <input type="text" id="input-${count}" placeholder="Exemplo: Papelão">
      <button class="remove-residuo" id="delete-${count}" type="button"><img src="../images/trash.png"></button>
    </div>
  `;
  wasteList.appendChild(newItem);

  attachWasteCapitalization(newItem.querySelector('input'));

  const deleteBtn = document.getElementById(`delete-${count}`);
  deleteBtn.addEventListener('click', () => {
  newItem.remove();

    const items = document.querySelectorAll('.residuo-item');
    items.forEach((item, index) => {
      item.querySelector('.residuo-label').textContent = `Resíduo ${index + 1}`;
      item.querySelector('input').id = `input-${index + 1}`;
      item.querySelector('.remove-residuo').id = `delete-${index + 1}`;
    });
  });
});

document.querySelector('#button-3').addEventListener('click', async (e) => {
  const wasteInputs = document.querySelectorAll('.residuo-item input');
  let errors = [];
  let wastes = [];

  wasteInputs.forEach(input => {
    if (input.value.trim()) {
      const fixed = capitalizeFirst(input.value);
      input.value = fixed;
      wastes.push(fixed.trim());
    }
  });

  if (wastes.length === 0) {
    errors.push('Adicione pelo menos um resíduo para coleta.');
  } else {
    const seen = new Set();
    const duplicated = [];

    wastes.forEach(w => {
      const key = normalizeWaste(w);
      if (seen.has(key)) duplicated.push(w);
      else seen.add(key);
    });

    if (duplicated.length > 0) {
      errors.push('Não é permitido repetir resíduos (ex: "papel" e "Papel").');
    }
  }

  if (errors.length > 0) {
    callError(errors, 3);
    return;
  }

  clearErrors();
  data.wastes = {};
  data.wastes.wastes = wastes;

  document.querySelector('.cadastro-card[data-step="3"]').classList.add('is-hidden');
  document.querySelector('.cadastro-card[data-step="4"]').classList.remove('is-hidden');
  initializeMap();
});


document.querySelector('#back-4').addEventListener('click', async (e) => {
  document.querySelector('.cadastro-card[data-step="4"]').classList.add('is-hidden');
  document.querySelector('.cadastro-card[data-step="3"]').classList.remove('is-hidden');
});





function initializeMap() {
  const cityCenter = [-24.9555, -53.4552];
  const mapaElement = document.getElementById('mapa-cascavel');
  const pontosList = document.querySelector('.pontos-list');
  const addPontoBtn = document.querySelector('.add-ponto');

  if (!mapaElement || !window.L) return;

  const worldBounds = window.L.latLngBounds(
    window.L.latLng(-85.05112878, -180),
    window.L.latLng(85.05112878, 180)
  );

  const mapa = window.L.map(mapaElement, {
    center: cityCenter,
    zoom: 13,
    zoomControl: true,
    maxBounds: worldBounds,
    maxBoundsViscosity: 1.0,
    worldCopyJump: true,
    minZoom: 1
  });

  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    noWrap: true,
  }).addTo(mapa);

  mapa.setMaxBounds(worldBounds);

  const allNames = (window.pontosData || []).map(p => p.name);
  const getPontoByName = (name) => (window.pontosData || []).find(p => p.name === name);

  const selectedByRowId = new Map();
  const markersByName = new Map();
  const fallbackPointImage = '/images/pontos-coleta/placeholder.svg';

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const getSafeImageSrc = (src) => {
    const raw = String(src || '').trim();
    const fallback = new URL(fallbackPointImage, window.location.origin).toString();

    if (!raw) return fallback;

    try {
      const normalized = new URL(raw, window.location.origin);
      return encodeURI(normalized.toString());
    } catch (err) {
      return fallback;
    }
  };

  const getSelectedSet = () => {
    const set = new Set();
    for (const name of selectedByRowId.values()) {
      if (name) set.add(name);
    }
    return set;
  };

  const createPopupHTML = (ponto) => {
    const safeName = escapeHtml(ponto.name);
    const safeImg = getSafeImageSrc(ponto.image);
    const safeFallbackImage = getSafeImageSrc(fallbackPointImage);

    return `
      <div style="max-width:220px;">
        <strong style="display:block;margin-bottom:6px;">${safeName}</strong>
        <img src="${safeImg}" onerror="this.onerror=null;this.src='${safeFallbackImage}';" style="width:100%;border-radius:10px;display:block;margin-bottom:6px;">
        <small style="opacity:.8;">${ponto.coords[0].toFixed(5)}, ${ponto.coords[1].toFixed(5)}</small>
      </div>
    `;
  };

  const addMarkerFor = (pontoName) => {
    const ponto = getPontoByName(pontoName);
    if (!ponto) return;

    if (markersByName.has(pontoName)) return;

    const marker = window.L.marker(ponto.coords).addTo(mapa);
    marker.bindPopup(createPopupHTML(ponto));

    markersByName.set(pontoName, marker);

    mapa.flyTo(ponto.coords, Math.max(mapa.getZoom(), 14), { duration: 0.6 });
    marker.openPopup();
  };

  const removeMarkerFor = (pontoName) => {
    const marker = markersByName.get(pontoName);
    if (!marker) return;
    mapa.removeLayer(marker);
    markersByName.delete(pontoName);
  };

  const fillSelectOptions = (selectEl, currentValue) => {
    const selectedSet = getSelectedSet();

    selectEl.innerHTML = `<option value="">Selecione um ponto de coleta</option>`;

    allNames.forEach(name => {
      if (selectedSet.has(name) && name !== currentValue) return;

      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      if (name === currentValue) opt.selected = true;
      selectEl.appendChild(opt);
    });
  };

  const refreshAllSelects = () => {
    document.querySelectorAll('.ponto-item[data-row-id]').forEach(row => {
      const rowId = row.getAttribute('data-row-id');
      const select = row.querySelector('select.ponto-select');
      const currentValue = selectedByRowId.get(rowId) || "";
      fillSelectOptions(select, currentValue);
    });
  };

  let rowCounter = 0;

  const createPontoRow = ({ showRemove }) => {
    rowCounter += 1;
    const rowId = String(rowCounter);

    const wrapper = document.createElement('div');
    wrapper.className = 'ponto-item';
    wrapper.setAttribute('data-row-id', rowId);

    const label = document.createElement('span');
    label.className = 'ponto-label';
    label.textContent = `Ponto de Coleta ${document.querySelectorAll('.ponto-item').length + 1}`;

    const row = document.createElement('div');
    row.className = 'select-row';

    const select = document.createElement('select');
    select.className = 'ponto-select';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-ponto';
    removeBtn.type = 'button';
    removeBtn.innerHTML = `<img src="../images/trash.png" alt="Remover">`;
    if (!showRemove) removeBtn.style.display = 'none';

    row.appendChild(select);
    row.appendChild(removeBtn);

    wrapper.appendChild(label);
    wrapper.appendChild(row);

    selectedByRowId.set(rowId, "");

    fillSelectOptions(select, "");

    select.addEventListener('change', () => {
      const prev = selectedByRowId.get(rowId) || "";
      const next = select.value || "";

      if (prev && prev !== next) {
        removeMarkerFor(prev);
      }

      selectedByRowId.set(rowId, next);

      if (next) addMarkerFor(next);

      refreshAllSelects();
    });

    removeBtn.addEventListener('click', () => {
      const current = selectedByRowId.get(rowId) || "";
      if (current) removeMarkerFor(current);

      selectedByRowId.delete(rowId);
      wrapper.remove();

      document.querySelectorAll('.ponto-item').forEach((item, idx) => {
        const lb = item.querySelector('.ponto-label');
        if (lb) lb.textContent = `Ponto de Coleta ${idx + 1}`;

        const btn = item.querySelector('.remove-ponto');
        if (btn) btn.style.display = (idx === 0) ? 'none' : '';
      });

      refreshAllSelects();
    });

    return wrapper;
  };

  pontosList.innerHTML = '';
  pontosList.appendChild(createPontoRow({ showRemove: false }));

  addPontoBtn.addEventListener('click', () => {
    pontosList.appendChild(createPontoRow({ showRemove: true }));

    document.querySelectorAll('.ponto-item').forEach((item, idx) => {
      const btn = item.querySelector('.remove-ponto');
      if (btn) btn.style.display = (idx === 0) ? 'none' : '';
    });

    refreshAllSelects();
  });
}

document.querySelector('#button-4').addEventListener('click', async (e) => {
  let errors = [];

  const selects = document.querySelectorAll('.ponto-select');

  const selectedNames = Array.from(selects)
    .map(s => (s.value || '').trim())
    .filter(Boolean);

  if (selectedNames.length === 0) {
    errors.push('Selecione pelo menos um ponto de coleta.');
    callError(errors, 4);
    return;
  }

  const uniqueNames = [...new Set(selectedNames)];

  const PD = (typeof pontosData !== 'undefined' ? pontosData : (window.pontosData || []));
  const selectedPoints = uniqueNames
    .map(name => PD.find(p => p.name === name))
    .filter(Boolean);

  if (selectedPoints.length !== uniqueNames.length) {
    errors.push('Um ou mais pontos selecionados não foram encontrados. Recarregue a página e tente novamente.');
    callError(errors, 4);
    return;
  }

  data.points = { points: selectedPoints };

  clearErrors();
  document.querySelector('.cadastro-card[data-step="4"]').classList.add('is-hidden');
  document.querySelector('.cadastro-card[data-step="5"]').classList.remove('is-hidden');
});

document.querySelector('#back-5').addEventListener('click', async (e) => {
  document.querySelector('.cadastro-card[data-step="5"]').classList.add('is-hidden');
  document.querySelector('.cadastro-card[data-step="4"]').classList.remove('is-hidden');
});

const emailFinalIn = document.getElementById('email-final');
const senhaFinalIn = document.getElementById('senha-final');
const confirmarSenhaFinalIn = document.getElementById('confirmar-senha-final');

document.querySelector('.btn-finalizar').addEventListener('click', async () => {
  let errors = [];
  const corpEmailIn = document.getElementById('email-corporativo')

  if (!emailFinalIn.value.trim()) {
    errors.push('O campo "E-mail de Cadastro" é obrigatório.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFinalIn.value.trim())) {
    errors.push('E-mail de cadastro inválido. Verifique o formato e tente novamente.');
  }

  if (
 
  corpEmailIn.value.trim() &&
  emailFinalIn.value.trim().toLowerCase() === corpEmailIn.value.trim().toLowerCase()
  ) {
    errors.push('O e-mail de cadastro não pode ser igual ao e-mail corporativo.');
  }

  if (!senhaFinalIn.value.trim()) {
    errors.push('O campo "Criar Senha" é obrigatório.');
  } else {
    const senha = senhaFinalIn.value.trim();

    const passOk = /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(senha);
    if (!passOk) {
      errors.push('A senha deve ter no mínimo 8 caracteres, com pelo menos 1 letra maiúscula e 1 número.');
    }
  }

  if (!confirmarSenhaFinalIn.value.trim()) {
    errors.push('O campo "Confirmar Senha" é obrigatório.');
  } else if (senhaFinalIn.value.trim() !== confirmarSenhaFinalIn.value.trim()) {
    errors.push('As senhas não coincidem. Verifique e tente novamente.');
  }

  if (errors.length > 0) {
    callError(errors, 5);
    return;
  }

  clearErrors();

  data.user = {
    email: emailFinalIn.value.trim(),
    password: senhaFinalIn.value.trim()
  };

  dataFetch()
});

async function dataFetch() {
  var user_id

  const email = data.user.email
  const password = data.user.password

  let errors = []
  try {
    const res = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const userData = await res.json()

    if (res.ok) {
      user_id = userData.newUser._id;

      const results = await Promise.all([
        infoFetch(),
        contactFetch(),
        wastesFetch(),
        pointsFetch()
      ]);

      const allSuccess = results.every(r => r === true);

      if (!allSuccess) {
        callError(['Erro ao salvar dados da empresa, tente novamente'], 5);
        return;
      }

      await loginFetch();
    } else {
      errors.push(userData.error)
      callError(errors, 5)
    }
  } catch (err) {
    console.error(err)
  }
 
  async function infoFetch() {
    const formData = new FormData()
    formData.append('user_id', user_id)
    formData.append('nome_empresa', data.info.nome_empresa)
    formData.append('cnpj', data.info.cnpj)
    formData.append('razao_social', data.info.razao_social)
    formData.append('descricao', data.info.descricao)
    formData.append('logo', data.info.logo)

    try {
      const res = await fetch('/empresas/info', {
        method: 'POST',
        body: formData
      });

      return res.ok
    } catch (err) {
      console.error(err)
    }
  }

  async function contactFetch() {
    const formData = new FormData();
    formData.append('user_id', user_id)
    formData.append('telefone', data.contact.telefone)
    formData.append('email', data.contact.email)
    formData.append('facebook', data.contact.facebook)
    formData.append('instagram', data.contact.instagram)
    formData.append('linkedin', data.contact.linkedin)
    formData.append('twitter', data.contact.twitter)

    try {
      const res = await fetch('/empresas/contato', {
        method: 'POST',
        body: formData
      });
      
      return res.ok
    } catch (err) {
      console.error(err)
    }
  }

  async function wastesFetch() {
    const wastes = data.wastes.wastes
    try {
      const res = await fetch('/empresas/wastes', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ user_id, wastes })
      });
      
      return res.ok
    } catch (err) {
      console.error(err)
    }
  }

  async function pointsFetch() {
    const points = data.points.points
    try {
      const res = await fetch('/empresas/points', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ user_id, points })
      });
      
      return res.ok
    } catch (err) {
      console.error(err)
    }
  }

  async function loginFetch() {
    const email = data.user.email
    const password = data.user.password
    const rememberMe = document.querySelector('#remember-me').checked;

    try {
      const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, rememberMe })
      });
      const msg = await res.json();

      if (res.ok) {
          console.log('Login bem-sucedido:', msg);
          window.location.href = '/own-profile';
      } else {
          console.error('Erro no login:', msg);
      }
    } catch (err) {
      console.error(err)
    };
  }
}