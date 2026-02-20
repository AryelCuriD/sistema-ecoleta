var data = {};
var initialData = {};

function clearErrors() {
  const existing = document.querySelector('.error-msg');
  if (existing) existing.remove();
}

function callError(errors, step) {
  clearErrors();

  const errorDiv = document.createElement('div');
  errorDiv.classList.add('error-msg');

  errors.forEach((err) => {
    errorDiv.innerHTML += `<label class="error-label">• ${err}</label>`;
  });

  const card = document.querySelector(`.edit-card[data-step="${step}"]`);
  if (card) card.appendChild(errorDiv);
}

function showStep(stepToShow) {
  document.querySelectorAll('.edit-card').forEach((card) => card.classList.add('is-hidden'));
  const target = document.querySelector(`.edit-card[data-step="${stepToShow}"]`);
  if (target) target.classList.remove('is-hidden');
  clearErrors();
}

const cloneData = (value) => JSON.parse(JSON.stringify(value || {}));

const sanitizeText = (value) => {
  const rawValue = String(value || '');
  const parsedValue = typeof stripHTMLTags === 'function'
    ? stripHTMLTags(rawValue)
    : rawValue.replace(/<[^>]*>/g, ' ');

  return parsedValue.replace(/\s+/g, ' ').trim();
};

const normalizeWaste = (value) => String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();

const capitalizeFirst = (value) => {
  const text = String(value || '');
  const trimmedStart = text.trimStart();
  if (!trimmedStart) return text;
  return trimmedStart.charAt(0).toUpperCase() + trimmedStart.slice(1);
};

const wasteArraysEqual = (arrA, arrB) => {
  const a = Array.isArray(arrA) ? arrA : [];
  const b = Array.isArray(arrB) ? arrB : [];
  if (a.length !== b.length) return false;
  return a.every((item, index) => normalizeWaste(item) === normalizeWaste(b[index]));
};

const pointsArraysEqual = (arrA, arrB) => {
  const namesA = (Array.isArray(arrA) ? arrA : []).map((p) => String(p?.name || '').trim()).filter(Boolean);
  const namesB = (Array.isArray(arrB) ? arrB : []).map((p) => String(p?.name || '').trim()).filter(Boolean);
  if (namesA.length !== namesB.length) return false;
  return namesA.every((name, index) => name === namesB[index]);
};

const logoLabel = document.querySelector('#logo-upload-text');
const logoIn = document.querySelector('#logo');
const phoneIn = document.querySelector('#telefone');
const corpEmailIn = document.querySelector('#email-corporativo');
const descIn = document.querySelector('#descricao');
const descSpan = document.querySelector('.char-count');
const facebookIn = document.querySelector('#facebook');
const instagramIn = document.querySelector('#instagram');
const linkedinIn = document.querySelector('#linkedin');
const twitterIn = document.querySelector('#twitter');

const step1NextBtn = document.querySelector('.edit-card[data-step="1"] .btn-avancar');
const step2BackBtn = document.querySelector('.edit-card[data-step="2"] .btn-voltar');
const step2NextBtn = document.querySelector('.edit-card[data-step="2"] .btn-avancar');
const step3BackBtn = document.querySelector('.edit-card[data-step="3"] .btn-voltar');
const finishBtn = document.querySelector('.edit-card[data-step="3"] .btn-finalizar');

const addWasteBtn = document.querySelector('.add-residuo');
const wastesList = document.querySelector('.residuos-list');
const pontosList = document.querySelector('.pontos-list');
const addPontoBtn = document.querySelector('.add-ponto');

let mapInitialized = false;
let map = null;
let allPointCatalog = [];
let selectedByRowId = new Map();
let markersByName = new Map();
let pointRowCounter = 0;

function updateDescriptionCounter() {
  const currentLength = descIn.value.length;
  if (currentLength > 1000) {
    descIn.value = descIn.value.slice(0, 1000);
  }
  descSpan.textContent = `${descIn.value.length}/1000 caracteres`;
}

async function validateLogoFile(file) {
  if (!file) return { valid: true, errors: [] };

  const errors = [];
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  if (!allowedTypes.includes(file.type)) {
    errors.push('Apenas arquivos JPG, JPEG ou PNG são permitidos.');
    return { valid: false, errors };
  }

  const objectURL = URL.createObjectURL(file);

  try {
    const dimensions = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error('Erro ao carregar imagem.'));
      img.src = objectURL;
    });

    if (dimensions.width !== dimensions.height) {
      errors.push('A imagem deve ter proporção 1:1 (quadrada).');
    }

    return { valid: errors.length === 0, errors };
  } catch (_err) {
    errors.push('Erro ao carregar imagem.');
    return { valid: false, errors };
  } finally {
    URL.revokeObjectURL(objectURL);
  }
}

function applyPhoneMask() {
  let value = phoneIn.value;
  value = value.replace(/\D/g, '').substring(0, 11);

  if (value.length > 0) {
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
  }

  if (value.length > 10) {
    value = value.replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  }

  phoneIn.value = value;
}

function createWasteItem(value = '') {
  const count = wastesList.querySelectorAll('.residuo-item').length + 1;

  const item = document.createElement('div');
  item.className = 'residuo-item';
  item.innerHTML = `
    <span class="residuo-label">Resíduo ${count}</span>
    <div class="residuo-row">
      <input type="text" id="input-${count}" placeholder="Exemplo: Papelão" value="${String(value || '').replaceAll('"', '&quot;')}">
      <button class="remove-residuo" id="delete-${count}" type="button"><img src="../images/trash.png" alt="Remover"></button>
    </div>
  `;

  const input = item.querySelector('input');
  input.addEventListener('input', () => {
    const fixed = capitalizeFirst(input.value);
    if (fixed !== input.value) input.value = fixed;
  });

  const removeBtn = item.querySelector('.remove-residuo');
  removeBtn.addEventListener('click', () => {
    item.remove();
    reorderWasteItems();
  });

  wastesList.appendChild(item);
  reorderWasteItems();
}

function reorderWasteItems() {
  const items = wastesList.querySelectorAll('.residuo-item');

  items.forEach((item, index) => {
    const itemNumber = index + 1;
    const label = item.querySelector('.residuo-label');
    const input = item.querySelector('input');
    const button = item.querySelector('.remove-residuo');

    label.textContent = `Resíduo ${itemNumber}`;
    input.id = `input-${itemNumber}`;
    button.id = `delete-${itemNumber}`;
    button.style.display = itemNumber === 1 ? 'none' : '';
  });
}

function getPointName(point) {
  return String(point?.name || '').trim();
}

function mergePointCatalog(basePoints, currentPoints) {
  const merged = [];
  const byName = new Map();

  [...(basePoints || []), ...(currentPoints || [])].forEach((point) => {
    const name = getPointName(point);
    const coords = Array.isArray(point?.coords) ? point.coords : null;

    if (!name || !coords || coords.length !== 2) return;

    const pointData = {
      name,
      image: point?.image || '/images/pontos-coleta/placeholder.svg',
      coords,
    };

    if (!byName.has(name)) {
      byName.set(name, pointData);
      merged.push(pointData);
    }
  });

  return merged;
}

async function loadPointCatalog() {
  if (Array.isArray(window.pontosData) && window.pontosData.length > 0) {
    return window.pontosData;
  }
  return [];
}

function initializeMap() {
  if (mapInitialized) return;

  const mapElement = document.getElementById('mapa-cascavel');
  if (!mapElement || !window.L) return;

  const cityCenter = [-24.9555, -53.4552];
  const worldBounds = window.L.latLngBounds(
    window.L.latLng(-85.05112878, -180),
    window.L.latLng(85.05112878, 180)
  );

  map = window.L.map(mapElement, {
    center: cityCenter,
    zoom: 13,
    zoomControl: true,
    maxBounds: worldBounds,
    maxBoundsViscosity: 1,
    worldCopyJump: true,
    minZoom: 1,
  });

  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    noWrap: true,
  }).addTo(map);

  map.setMaxBounds(worldBounds);
  mapInitialized = true;
}

function getPontoByName(name) {
  return allPointCatalog.find((p) => p.name === name);
}

function getSelectedSet() {
  const selected = new Set();
  for (const pointName of selectedByRowId.values()) {
    if (pointName) selected.add(pointName);
  }
  return selected;
}

function fillSelectOptions(selectEl, currentValue) {
  const selectedSet = getSelectedSet();

  selectEl.innerHTML = '<option value="">Selecione um ponto de coleta</option>';

  allPointCatalog.forEach((point) => {
    const name = point.name;
    if (selectedSet.has(name) && name !== currentValue) return;

    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    if (name === currentValue) option.selected = true;

    selectEl.appendChild(option);
  });
}

function refreshAllPointSelects() {
  document.querySelectorAll('.ponto-item[data-row-id]').forEach((row) => {
    const rowId = row.getAttribute('data-row-id');
    const select = row.querySelector('select.ponto-select');
    const currentValue = selectedByRowId.get(rowId) || '';

    fillSelectOptions(select, currentValue);
  });
}

function createPopupHTML(point) {
  const safeName = String(point.name || '').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const safeImage = encodeURI(String(point.image || '/images/pontos-coleta/placeholder.svg'));

  return `
    <div style="max-width:220px;">
      <strong style="display:block;margin-bottom:6px;">${safeName}</strong>
      <img src="${safeImage}" style="width:100%;border-radius:10px;display:block;margin-bottom:6px;">
      <small style="opacity:.8;">${point.coords[0].toFixed(5)}, ${point.coords[1].toFixed(5)}</small>
    </div>
  `;
}

function addMarkerFor(pointName) {
  if (!map) return;
  if (markersByName.has(pointName)) return;

  const point = getPontoByName(pointName);
  if (!point) return;

  const marker = window.L.marker(point.coords).addTo(map);
  marker.bindPopup(createPopupHTML(point));
  markersByName.set(pointName, marker);

  map.flyTo(point.coords, Math.max(map.getZoom(), 14), { duration: 0.6 });
}

function removeMarkerFor(pointName) {
  if (!map) return;

  const marker = markersByName.get(pointName);
  if (!marker) return;

  map.removeLayer(marker);
  markersByName.delete(pointName);
}

function createPointRow({ showRemove, currentValue = '' }) {
  pointRowCounter += 1;
  const rowId = String(pointRowCounter);

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
  removeBtn.innerHTML = '<img src="../images/trash.png" alt="Remover">';
  if (!showRemove) removeBtn.style.display = 'none';

  row.appendChild(select);
  row.appendChild(removeBtn);
  wrapper.appendChild(label);
  wrapper.appendChild(row);

  selectedByRowId.set(rowId, currentValue || '');
  fillSelectOptions(select, currentValue || '');

  select.addEventListener('change', () => {
    const prev = selectedByRowId.get(rowId) || '';
    const next = select.value || '';

    if (prev && prev !== next) removeMarkerFor(prev);

    selectedByRowId.set(rowId, next);

    if (next) addMarkerFor(next);

    refreshAllPointSelects();
  });

  removeBtn.addEventListener('click', () => {
    const current = selectedByRowId.get(rowId) || '';
    if (current) removeMarkerFor(current);

    selectedByRowId.delete(rowId);
    wrapper.remove();

    document.querySelectorAll('.ponto-item').forEach((item, index) => {
      const itemLabel = item.querySelector('.ponto-label');
      if (itemLabel) itemLabel.textContent = `Ponto de Coleta ${index + 1}`;

      const btn = item.querySelector('.remove-ponto');
      if (btn) btn.style.display = index === 0 ? 'none' : '';
    });

    refreshAllPointSelects();
  });

  return wrapper;
}

function renderPointRows(initialPoints) {
  pontosList.innerHTML = '';
  selectedByRowId = new Map();
  markersByName = new Map();
  pointRowCounter = 0;

  const initialPointNames = (Array.isArray(initialPoints) ? initialPoints : [])
    .map((point) => getPointName(point))
    .filter(Boolean);

  const rowsToCreate = initialPointNames.length > 0 ? initialPointNames : [''];

  rowsToCreate.forEach((name, index) => {
    const row = createPointRow({
      showRemove: index > 0,
      currentValue: name,
    });

    pontosList.appendChild(row);

    if (name) addMarkerFor(name);
  });

  refreshAllPointSelects();
}

function setupInitialDataInInputs() {
  const contact = data.contact || {};
  const social = contact.social_media || {};
  const info = data.info || {};

  phoneIn.value = contact.telefone || '';
  corpEmailIn.value = contact.email || '';
  descIn.value = info.descricao || '';

  facebookIn.value = social.facebook || '';
  instagramIn.value = social.instagram || '';
  linkedinIn.value = social.linkedin || '';
  twitterIn.value = social.twitter || '';

  logoLabel.textContent = info.logo ? 'Logo atual cadastrada' : 'Inserir uma logo quadrada';

  updateDescriptionCounter();
}

function setupWasteInputs() {
  wastesList.innerHTML = '';

  const currentWastes = Array.isArray(data.wastes?.wastes) && data.wastes.wastes.length > 0
    ? data.wastes.wastes
    : [''];

  currentWastes.forEach((waste) => createWasteItem(waste));
}

function updateStep1Data() {
  if (!data.contact) data.contact = {};
  if (!data.contact.social_media) data.contact.social_media = {};
  if (!data.info) data.info = {};

  const phone = phoneIn.value.trim();
  const email = corpEmailIn.value.trim();
  const descricao = descIn.value.trim();

  if (data.contact.telefone !== phone) data.contact.telefone = phone;
  if (data.contact.email !== email) data.contact.email = email;

  const socialMap = [
    ['facebook', facebookIn.value.trim()],
    ['instagram', instagramIn.value.trim()],
    ['linkedin', linkedinIn.value.trim()],
    ['twitter', twitterIn.value.trim()],
  ];

  socialMap.forEach(([key, value]) => {
    if (data.contact.social_media[key] !== value) {
      data.contact.social_media[key] = value;
    }
  });

  if (data.info.descricao !== descricao) data.info.descricao = descricao;

  const logoFile = logoIn.files && logoIn.files[0];
  if (logoFile) data.info.logo = logoFile;
}

function updateStep2Data(wastes) {
  if (!data.wastes) data.wastes = {};

  if (!wasteArraysEqual(data.wastes.wastes, wastes)) {
    data.wastes.wastes = wastes;
  }
}

function updateStep3Data(points) {
  if (!data.points) data.points = {};

  if (!pointsArraysEqual(data.points.points, points)) {
    data.points.points = points;
  }
}

function validateStep1BasicData() {
  const errors = [];

  if (!phoneIn.value) {
    errors.push('O campo "Telefone" é obrigatório.');
  } else if (phoneIn.value.replace(/\D/g, '').length !== 11) {
    errors.push('Telefone inválido. Deve conter 11 dígitos.');
  }

  if (!corpEmailIn.value.trim()) {
    errors.push('O campo "Email Corporativo" é obrigatório.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(corpEmailIn.value.trim())) {
    errors.push('Email corporativo inválido. Verifique o formato e tente novamente.');
  }

  if (!descIn.value.trim()) {
    errors.push('O campo "Descrição" é obrigatório.');
  }

  if (!facebookIn.value.trim()) {
    errors.push('O campo "Facebook" é obrigatório.');
  } else if (!validateSocial('facebook', facebookIn)) {
    errors.push('URL do Facebook inválida. Verifique e tente novamente.');
  }

  if (!instagramIn.value.trim()) {
    errors.push('O campo "Instagram" é obrigatório.');
  } else if (!validateSocial('instagram', instagramIn)) {
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

  return errors;
}

async function handleStep1Next() {
  let errors = validateStep1BasicData();

  const logoFile = logoIn.files && logoIn.files[0];
  if (logoFile) {
    const validation = await validateLogoFile(logoFile);
    if (!validation.valid) errors = [...errors, ...validation.errors];
  }

  if (errors.length > 0) {
    callError(errors, 1);
    return;
  }

  clearErrors();
  updateStep1Data();

  if (!mapInitialized) {
    initializeMap();
    renderPointRows(data.points?.points || []);
  }

  showStep(2);
}

function handleStep2Back() {
  showStep(1);
}

function handleStep2Next() {
  const wasteInputs = document.querySelectorAll('.residuo-item input');
  const errors = [];
  const wastes = [];

  wasteInputs.forEach((input) => {
    const fixed = capitalizeFirst(input.value || '');
    input.value = fixed;

    if (fixed.trim()) {
      wastes.push(sanitizeText(fixed));
    }
  });

  if (wastes.length === 0) {
    errors.push('Adicione pelo menos um resíduo para coleta.');
  } else {
    const seen = new Set();
    const duplicated = [];

    wastes.forEach((waste) => {
      const key = normalizeWaste(waste);
      if (seen.has(key)) duplicated.push(waste);
      else seen.add(key);
    });

    if (duplicated.length > 0) {
      errors.push('Não é permitido repetir resíduos (ex: "papel" e "Papel").');
    }
  }

  if (errors.length > 0) {
    callError(errors, 2);
    return;
  }

  clearErrors();
  updateStep2Data(wastes);
  showStep(3);
}

function handleStep3Back() {
  showStep(2);
}

function resolveSelectedPoints() {
  const selects = document.querySelectorAll('.ponto-select');
  const errors = [];

  const selectedNames = Array.from(selects)
    .map((select) => (select.value || '').trim())
    .filter(Boolean);

  if (selectedNames.length === 0) {
    errors.push('Selecione pelo menos um ponto de coleta.');
    return { errors, points: [] };
  }

  const uniqueNames = [...new Set(selectedNames)];

  const selectedPoints = uniqueNames
    .map((name) => allPointCatalog.find((point) => point.name === name))
    .filter(Boolean);

  if (selectedPoints.length !== uniqueNames.length) {
    errors.push('Um ou mais pontos selecionados não foram encontrados. Recarregue a página e tente novamente.');
  }

  return { errors, points: selectedPoints };
}

async function handleFinish() {
  const { errors, points } = resolveSelectedPoints();

  if (errors.length > 0) {
    callError(errors, 3);
    return;
  }

  clearErrors();
  updateStep3Data(points);
  dataFetch()
}

function bindEvents() {
  descIn.addEventListener('input', updateDescriptionCounter);

  phoneIn.addEventListener('input', applyPhoneMask);

  logoIn.addEventListener('change', async () => {
    const logoFile = logoIn.files && logoIn.files[0];
    if (!logoFile) {
      logoLabel.textContent = data.info?.logo ? 'Logo atual cadastrada' : 'Inserir uma logo quadrada';
      clearErrors();
      return;
    }

    const validation = await validateLogoFile(logoFile);
    if (!validation.valid) {
      logoIn.value = '';
      logoLabel.textContent = data.info?.logo ? 'Logo atual cadastrada' : 'Inserir uma logo quadrada';
      callError(validation.errors, 1);
      return;
    }

    logoLabel.textContent = logoFile.name;
    clearErrors();
  });

  step1NextBtn.addEventListener('click', handleStep1Next);
  step2BackBtn.addEventListener('click', handleStep2Back);
  step2NextBtn.addEventListener('click', handleStep2Next);
  step3BackBtn.addEventListener('click', handleStep3Back);
  finishBtn.addEventListener('click', handleFinish);

  addWasteBtn.addEventListener('click', () => createWasteItem(''));

  addPontoBtn.addEventListener('click', () => {
    const row = createPointRow({ showRemove: true, currentValue: '' });
    pontosList.appendChild(row);

    document.querySelectorAll('.ponto-item').forEach((item, index) => {
      const button = item.querySelector('.remove-ponto');
      if (button) button.style.display = index === 0 ? 'none' : '';
    });

    refreshAllPointSelects();
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const loggedData = await getLoggedUserData();
    if (!loggedData) {
      callError(['Não foi possível carregar os dados do usuário logado.'], 1);
      return;
    }

    data = loggedData;
    initialData = cloneData(loggedData);

    setupInitialDataInInputs();
    setupWasteInputs();

    const catalog = await loadPointCatalog();
    allPointCatalog = mergePointCatalog(catalog, data.points?.points || []);

    initializeMap();
    renderPointRows(data.points?.points || []);

    bindEvents();
    showStep(1);
  } catch (err) {
    console.error(err);
    callError(['Erro ao iniciar a página de edição de perfil.'], 1);
  }
});

async function dataFetch() {
  const results = await Promise.all([
    infoFetch(),
    contactFetch(),
    wastesFetch(),
    pointsFetch(),
    window.location.href = 'own-profile'
  ]);
  
  const allSuccess = results.every(r => r === true);

  if (!allSuccess) {
    callError(['Erro ao salvar dados da empresa, tente novamente'], 5);
    return;
  }

  async function infoFetch() {
    try {
      const formData = new FormData()
      formData.append('nome_empresa', data.info.nome_empresa)
      formData.append('cnpj', data.info.cnpj)
      formData.append('razao_social', data.info.razao_social)
      formData.append('descricao', data.info.descricao)
      formData.append('logo', data.info.logo)

      const res = await fetch(`/empresas/info/${data.info._id}`, {
        method: 'PUT',
        body: formData
      });
      
      return res.ok
    } catch (err) {
      console.error(err)
    }
  }

  async function contactFetch() {
    try {
      const user_id = data.contact.user_id
      const telefone = data.contact.telefone
      const email = data.contact.email
      const facebook = data.contact.social_media.facebook
      const instagram = data.contact.social_media.instagram
      const linkedin = data.contact.social_media.linkedin
      const twitter = data.contact.social_media.twitter
    
      const res = await fetch(`/empresas/contato/${data.contact._id}`, {
        method: 'PUT',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ user_id, telefone, email, facebook, instagram, linkedin, twitter })
      });

      return res.ok
    } catch (err) {
      console.error(err)
    }
  }
  
  async function wastesFetch() {
    try {
      const wastes = data.wastes.wastes
    
      const res = await fetch(`/empresas/wastes/${data.wastes._id}`, {
        method: 'PUT',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ wastes })
      });

      return res.ok
    } catch (err) {
      console.error(err)
    }
  }

  async function pointsFetch() {
    try {
      const points = data.points.points

      const res = await fetch(`/empresas/points/${data.points._id}`, {
        method: 'PUT',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ points })
      });

      return res.ok
    } catch (err) {
      console.error(err)
    }
  }
}