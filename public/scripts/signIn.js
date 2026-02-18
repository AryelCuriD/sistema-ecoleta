document.addEventListener('DOMContentLoaded', () => {
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

  const socialFieldRules = {
    facebook: /^https?:\/\/(www\.)?facebook\.com\/.+/i,
    instagram: /^https?:\/\/(www\.)?instagram\.com\/.+/i,
    linkedin: /^https?:\/\/(www\.)?linkedin\.com\/.+/i,
    twitter: /^https?:\/\/(www\.)?(x|twitter)\.com\/.+/i,
  };

  const normalizeText = (value = '') =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

  const capitalizeFirstLetter = (value) => {
    const trimmedStart = value.trimStart();
    if (!trimmedStart) return value;
    const firstChar = trimmedStart.charAt(0).toLocaleUpperCase('pt-BR');
    return value.replace(trimmedStart.charAt(0), firstChar);
  };

  const hasDuplicateValues = (values = []) => {
    const normalized = values.map((value) => normalizeText(value));
    return new Set(normalized).size !== normalized.length;
  };

  const cnpjInput = document.getElementById('cnpj');
  const phoneInput = document.getElementById('telefone');
  const corporateEmailInput = document.getElementById('email-corporativo');
  const finalEmailInput = document.getElementById('email-final');
  const passwordInput = document.getElementById('senha-final');
  const confirmPasswordInput = document.getElementById('confirmar-senha-final');

  const formatCNPJ = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    return digits
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    }

    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  };

  const isValidPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
  };

  cnpjInput?.addEventListener('input', () => {
    cnpjInput.value = formatCNPJ(cnpjInput.value);
  });

  phoneInput?.addEventListener('input', () => {
    phoneInput.value = formatPhone(phoneInput.value);
  });

  const logoInput = document.getElementById('logo');
  const logoUploadBox = document.querySelector('.upload-box');
  const logoUploadText = document.getElementById('logo-upload-text');
  const allowedLogoTypes = ['image/png', 'image/jpg', 'image/jpeg'];
  let logoIsSquare = false;

  const resetLogoUploadState = () => {
    logoIsSquare = false;
    if (logoUploadText) logoUploadText.textContent = 'Inserir uma logo quadrada';
    logoUploadBox?.classList.remove('has-file');
  };

  const checkIfImageIsSquare = (file) =>
    new Promise((resolve) => {
      const image = new Image();
      const imageUrl = URL.createObjectURL(file);

      image.onload = () => {
        resolve(image.width === image.height);
        URL.revokeObjectURL(imageUrl);
      };

      image.onerror = () => {
        resolve(false);
        URL.revokeObjectURL(imageUrl);
      };

      image.src = imageUrl;
    });

  logoInput?.addEventListener('change', async () => {
    const selectedFile = logoInput.files?.[0];
    if (!selectedFile) {
      resetLogoUploadState();
      return;
    }

    if (!allowedLogoTypes.includes(selectedFile.type)) {
      logoInput.value = '';
      resetLogoUploadState();
      logoInput.setCustomValidity('A logo deve ser PNG, JPG ou JPEG.');
      logoInput.reportValidity();
      return;
    }

    const isSquare = await checkIfImageIsSquare(selectedFile);
    if (!isSquare) {
      logoInput.value = '';
      resetLogoUploadState();
      logoInput.setCustomValidity('A imagem da logo deve ser quadrada (largura igual à altura).');
      logoInput.reportValidity();
      return;
    }

    logoIsSquare = true;
    logoInput.setCustomValidity('');
    if (logoUploadText) logoUploadText.textContent = selectedFile.name;
    logoUploadBox?.classList.add('has-file');
  });

  const descricaoInput = document.getElementById('descricao');
  const charCountSpan = document.querySelector('.char-count');
  const maxDescricaoChars = 1000;

  const updateDescricaoCount = () => {
    if (!descricaoInput || !charCountSpan) return;
    if (descricaoInput.value.length > maxDescricaoChars) {
      descricaoInput.value = descricaoInput.value.slice(0, maxDescricaoChars);
    }
    charCountSpan.textContent = `${descricaoInput.value.length}/${maxDescricaoChars} caracteres`;
  };

  if (descricaoInput) {
    descricaoInput.setAttribute('maxlength', String(maxDescricaoChars));
    descricaoInput.addEventListener('input', updateDescricaoCount);
    updateDescricaoCount();
  }

  const createFeedback = () => {
    const feedback = document.createElement('div');
    feedback.className = 'step-feedback';
    feedback.setAttribute('role', 'alert');
    feedback.setAttribute('aria-live', 'polite');
    return feedback;
  };

  const steps = [
    document.querySelector('[data-step="1"]'),
    document.querySelector('[data-step="2"]'),
    document.querySelector('[data-step="3"]'),
    document.querySelector('[data-step="4"]'),
    document.querySelector('[data-step="5"]'),
  ];

  const showStep = (index) => {
    steps.forEach((step, stepIndex) => {
      if (!step) return;
      step.classList.toggle('is-hidden', stepIndex !== index);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (index === 3) {
      window.dispatchEvent(new Event('cadastro:step4'));
    }
  };

  const getFieldLabel = (field, step) => {
    if (!field || !step) return 'Campo obrigatório';
    const id = field.getAttribute('id');
    if (id) {
      const label = step.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent.trim();
    }
    const item = field.closest('.residuo-item, .ponto-item, .finalizar-field, .cadastro-col');
    const itemLabel = item?.querySelector('.residuo-label, .ponto-label, label');
    return itemLabel?.textContent?.trim() || field.getAttribute('placeholder') || 'Campo obrigatório';
  };

  const markFieldValidity = (field, isInvalid) => {
    if (!field) return;
    field.classList.toggle('field-invalid', isInvalid);
  };

  const clearFieldValidity = (field) => {
    if (!field) return;
    markFieldValidity(field, false);
    field.setCustomValidity('');
  };

  const getSelectedPointNames = () =>
    Array.from(document.querySelectorAll('.ponto-select'))
      .map((select) => select.value)
      .filter(Boolean);

  const validateCurrentStep = async (index) => {
    const step = steps[index];
    if (!step) return true;

    const feedback = step.querySelector('.step-feedback') || createFeedback();
    if (!feedback.parentElement) {
      const actions = step.querySelector('.cadastro-acoes');
      actions?.insertAdjacentElement('beforebegin', feedback);
    }

    const invalidMessages = [];
    const textFields = step.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea');

    textFields.forEach((field) => {
      const isInvalid = !field.value.trim();
      markFieldValidity(field, isInvalid);
      if (isInvalid) {
        field.setCustomValidity('Preencha este campo.');
        invalidMessages.push(getFieldLabel(field, step));
      } else {
        field.setCustomValidity('');
      }
    });

    const fileInputs = step.querySelectorAll('input[type="file"]');
    for (const field of fileInputs) {
      const selectedFile = field.files?.[0];
      const isMissingFile = !selectedFile;

      if (selectedFile && !allowedLogoTypes.includes(selectedFile.type)) {
        markFieldValidity(field, true);
        field.setCustomValidity('A logo deve ser PNG, JPG ou JPEG.');
        invalidMessages.push('Logo da empresa deve ser PNG, JPG ou JPEG.');
        continue;
      }

      if (selectedFile) {
        const isSquare = logoIsSquare || await checkIfImageIsSquare(selectedFile);
        if (!isSquare) {
          markFieldValidity(field, true);
          field.setCustomValidity('A imagem da logo deve ser quadrada.');
          invalidMessages.push('Logo da empresa deve ser uma imagem quadrada.');
          continue;
        }
      }

      if (isMissingFile) {
        markFieldValidity(field, true);
        field.setCustomValidity('Selecione um arquivo.');
        invalidMessages.push(getFieldLabel(field, step));
      } else {
        clearFieldValidity(field);
      }
    }

    if (index === 0) {
      const cnpjField = step.querySelector('#cnpj');
      const isCnpjValid = validateCNPJ(cnpjField?.value || '');
      if (cnpjField && !isCnpjValid) {
        markFieldValidity(cnpjField, true);
        cnpjField.setCustomValidity('Digite um CNPJ válido.');
        invalidMessages.push('CNPJ inválido.');
      }

      if (descricaoInput && descricaoInput.value.length > maxDescricaoChars) {
        markFieldValidity(descricaoInput, true);
        descricaoInput.setCustomValidity(`A descrição deve ter no máximo ${maxDescricaoChars} caracteres.`);
        invalidMessages.push(`Descrição deve ter no máximo ${maxDescricaoChars} caracteres.`);
      }
    }

    if (index === 1) {
      const phoneField = step.querySelector('#telefone');
      if (phoneField && !isValidPhone(phoneField.value)) {
        markFieldValidity(phoneField, true);
        phoneField.setCustomValidity('Digite um telefone válido com DDD.');
        invalidMessages.push('Telefone inválido.');
      }

      const emailField = step.querySelector('#email-corporativo');
      if (emailField && !emailField.value.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        markFieldValidity(emailField, true);
        emailField.setCustomValidity('Digite um e-mail válido.');
        invalidMessages.push('E-mail corporativo inválido.');
      }

      Object.entries(socialFieldRules).forEach(([id, pattern]) => {
        const field = step.querySelector(`#${id}`);
        if (!field) return;
        const value = field.value.trim();
        if (!pattern.test(value)) {
          markFieldValidity(field, true);
          field.setCustomValidity('Informe um link completo, com / e nome da conta.');
          invalidMessages.push(`${getFieldLabel(field, step)} deve conter um link completo com o nome da conta.`);
        } else {
          clearFieldValidity(field);
        }
      });
    }

    if (index === 2) {
      const residuosInputs = Array.from(step.querySelectorAll('.residuo-item input'));
      const filledResiduos = residuosInputs.filter((input) => input.value.trim().length > 0);

      if (!filledResiduos.length) {
        invalidMessages.push('Informe pelo menos 1 resíduo.');
      }

      filledResiduos.forEach((input) => {
        const value = input.value.trim();
        const startsWithUppercase = /^[A-ZÀ-ÖØ-Þ]/.test(value);
        if (!startsWithUppercase) {
          markFieldValidity(input, true);
          input.setCustomValidity('A primeira letra do resíduo deve ser maiúscula.');
          invalidMessages.push('Todos os resíduos devem iniciar com letra maiúscula.');
        } else {
          clearFieldValidity(input);
        }
      });

      const residuosNames = filledResiduos.map((input) => input.value.trim());
      if (residuosNames.length && hasDuplicateValues(residuosNames)) {
        invalidMessages.push('Não é permitido cadastrar resíduos com o mesmo nome.');
        filledResiduos.forEach((input) => {
          const duplicates = residuosNames.filter((name) => normalizeText(name) === normalizeText(input.value));
          if (duplicates.length > 1) {
            markFieldValidity(input, true);
            input.setCustomValidity('Não repita o mesmo nome de resíduo.');
          }
        });
      }
    }

    if (index === 3) {
      const selectedPontos = getSelectedPointNames();
      if (!selectedPontos.length) {
        invalidMessages.push('Selecione pelo menos 1 ponto de coleta.');
      }

      if (hasDuplicateValues(selectedPontos)) {
        invalidMessages.push('Não é permitido selecionar o mesmo ponto de coleta duas vezes.');
      }
    }

    if (index === 4) {
      const corporateEmail = corporateEmailInput?.value.trim();
      const finalEmail = finalEmailInput?.value.trim();

      if (corporateEmail && finalEmail && normalizeText(corporateEmail) === normalizeText(finalEmail)) {
        markFieldValidity(finalEmailInput, true);
        finalEmailInput?.setCustomValidity('O e-mail de cadastro deve ser diferente do e-mail corporativo.');
        invalidMessages.push('O e-mail de cadastro deve ser diferente do e-mail corporativo.');
      } else {
        clearFieldValidity(finalEmailInput);
      }

      const password = passwordInput?.value || '';
      const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordPattern.test(password)) {
        markFieldValidity(passwordInput, true);
        passwordInput?.setCustomValidity('A senha deve ter no mínimo 8 caracteres, 1 letra maiúscula e 1 número.');
        invalidMessages.push('A senha deve ter no mínimo 8 caracteres, 1 letra maiúscula e 1 número.');
      } else {
        clearFieldValidity(passwordInput);
      }

      const confirmPassword = confirmPasswordInput?.value || '';
      if (password && confirmPassword && password !== confirmPassword) {
        markFieldValidity(confirmPasswordInput, true);
        confirmPasswordInput?.setCustomValidity('A confirmação de senha deve ser igual à senha criada.');
        invalidMessages.push('A confirmação de senha deve ser igual à senha criada.');
      } else {
        clearFieldValidity(confirmPasswordInput);
      }
    }

    if (!invalidMessages.length) {
      feedback.classList.remove('is-visible');
      feedback.innerHTML = '';
      return true;
    }

    const uniqueMessages = [...new Set(invalidMessages)];
    feedback.classList.add('is-visible');
    feedback.innerHTML = `
      <strong>Preencha os campos obrigatórios:</strong>
      <ul>${uniqueMessages.map((message) => `<li>${message}</li>`).join('')}</ul>
    `;

    const firstInvalid = step.querySelector('.field-invalid, input[type="text"]:invalid, input[type="email"]:invalid, input[type="password"]:invalid, textarea:invalid');
    firstInvalid?.reportValidity();
    firstInvalid?.focus();
    return false;
  };

  const pontosList = document.querySelector('.pontos-list');
  const addPontoButton = document.querySelector('.add-ponto');

  const pontosData = [
    {
      name: 'Ponto de Coleta lixo Eletrônico Cascavel',
      image: '../images/pontos-coleta/ponto-coleta-lixo-eletronico-cascavel.jpg',
      coords: [-24.9558, -53.455],
    },
    {
      name: 'Ecoponto Cascavel Velho',
      image: '../images/pontos-coleta/ecoponto-cascavel-velho.jpg',
      coords: [-24.9818, -53.4297],
    },
    {
      name: 'Ecoponto Brasília - Unicacoop',
      image: '../images/pontos-coleta/ecoponto-brasilia-unicacoop.jpg',
      coords: [-24.935105, -53.43003],
    },
    {
      name: 'Ecoponto Manaus',
      image: '../images/pontos-coleta/ecoponto-manaus.jpg',
      coords: [-24.9458, -53.4682],
    },
    {
      name: 'Ecoponto Melissa',
      image: '../images/pontos-coleta/ecoponto-melissa.jpg',
      coords: [-24.908, -53.4355],
    },
    {
      name: 'Eco Ponto Santa Cruz - COOTACAR',
      image: '../images/pontos-coleta/eco-ponto-santa-cruz-cootacar.jpg',
      coords: [-24.9654, -53.5134],
    },
    {
      name: 'GP RECICLAGEM',
      image: '../images/pontos-coleta/gp-reciclagem.jpg',
      coords: [-24.99616, -53.46197],
    },
    {
      name: 'Atlas Comércio de Recicláveis',
      image: '../images/pontos-coleta/atlas-comercio-de-reciclaveis.jpg',
      coords: [-24.995, -53.4216],
    },
    {
      name: 'ASCACAR',
      image: '../images/pontos-coleta/ascacar.jpg',
      coords: [-24.9818, -53.4244],
    },
    {
      name: 'Ecoponto Quebec',
      image: '../images/pontos-coleta/ecoponto-quebec.jpg',
      coords: [-24.9664, -53.5186],
    },
  ];

  const pontosByName = new Map(pontosData.map((ponto) => [ponto.name, ponto]));
  const getPontoOptions = () => pontosData.map((ponto) => ponto.name);

  const createPontoSelect = (index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'ponto-item';
    wrapper.innerHTML = `<span class="ponto-label">Ponto de Coleta ${index}</span>`;

    const select = document.createElement('select');
    select.className = 'ponto-select';
    wrapper.appendChild(select);
    return { wrapper, select };
  };

  const syncPontoSelectOptions = () => {
    if (!pontosList) return;
    const selects = Array.from(pontosList.querySelectorAll('.ponto-select'));
    const selectedValues = new Set(selects.map((s) => s.value).filter(Boolean));

    selects.forEach((select) => {
      const currentValue = select.value;
      const placeholder = '<option value="">Digite aqui ou procure no mapa</option>';
      const availableOptions = getPontoOptions()
        .filter((name) => !selectedValues.has(name) || name === currentValue)
        .map((name) => `<option value="${name}">${name}</option>`)
        .join('');

      select.innerHTML = `${placeholder}${availableOptions}`;
      select.value = currentValue;
    });
  };

  const cascavelCenter = [-24.9555, -53.4552];
  const mapaElement = document.getElementById('mapa-cascavel');
  const pontosMarkers = new Map();
  const pontosCoordsCache = new Map();
  const pontosCoordsByName = new Map();
  let mapa = null;

  pontosData.forEach((ponto) => {
    if (Array.isArray(ponto.coords) && ponto.coords.length === 2) {
      pontosCoordsByName.set(ponto.name, ponto.coords);
    }
  });

  const initMapa = () => {
    if (!mapaElement || !window.L) return null;
    const mapInstance = window.L.map(mapaElement, {
      center: cascavelCenter,
      zoom: 13,
      zoomControl: true,
    });

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(mapInstance);

    return mapInstance;
  };

  const normalizeMapSearch = (value) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

  const scoreResult = (result, queryName) => {
    const normalizedQuery = normalizeMapSearch(queryName);
    const displayName = normalizeMapSearch(result?.display_name || '');
    const namedetails = normalizeMapSearch(result?.namedetails?.name || '');
    const isAdministrative =
      result?.type === 'administrative' ||
      result?.class === 'boundary' ||
      result?.class === 'place';

    let score = 0;
    if (namedetails.includes(normalizedQuery)) score += 6;
    if (displayName.includes(normalizedQuery)) score += 4;
    if (!isAdministrative) score += 2;
    score += Number(result?.importance || 0);
    return score;
  };

  const fetchOverpassCoords = async () => {
    const names = pontosData.map((ponto) => ponto.name);
    const escapedNames = names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const query = `
      [out:json][timeout:25];
      area["name"="Cascavel"]["is_in:state"="Paraná"]->.searchArea;
      (
        node["name"~"^(${escapedNames.join('|')})$"](area.searchArea);
        way["name"~"^(${escapedNames.join('|')})$"](area.searchArea);
        relation["name"~"^(${escapedNames.join('|')})$"](area.searchArea);
      );
      out center tags;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });

    const payload = await response.json();
    payload.elements?.forEach((element) => {
      const name = element?.tags?.name;
      if (!name) return;
      const lat = element.lat ?? element?.center?.lat;
      const lon = element.lon ?? element?.center?.lon;
      if (typeof lat === 'number' && typeof lon === 'number') {
        pontosCoordsByName.set(name, [lat, lon]);
      }
    });
  };

  const fetchCoords = async (query) => {
    if (pontosCoordsCache.has(query)) return pontosCoordsCache.get(query);
    if (pontosCoordsByName.has(query)) {
      const cached = pontosCoordsByName.get(query);
      pontosCoordsCache.set(query, cached);
      return cached;
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&namedetails=1&countrycodes=br&viewbox=-53.58,-24.99,-53.35,-24.88&bounded=1&q=${encodeURIComponent(
        `${query}, Cascavel, Paraná, Brasil`
      )}`;
      const response = await fetch(url, {
        headers: { 'Accept-Language': 'pt-BR' },
      });
      const results = await response.json();
      if (Array.isArray(results) && results.length) {
        const best = results
          .map((result) => ({ result, score: scoreResult(result, query) }))
          .sort((a, b) => b.score - a.score)[0]?.result;
        if (best) {
          const coords = [parseFloat(best.lat), parseFloat(best.lon)];
          pontosCoordsCache.set(query, coords);
          return coords;
        }
      }
    } catch (_error) {
      // Keep fallback below.
    }

    pontosCoordsCache.set(query, null);
    return null;
  };

  const buildTooltipContent = (ponto) => {
    const imageUrl = ponto.image || '../images/pontos-coleta/placeholder.svg';
    return `
      <div class="ponto-tooltip-content">
        <img src="${imageUrl}" alt="Imagem do ponto ${ponto.name}" onerror="this.onerror=null;this.src='../images/pontos-coleta/placeholder.svg';">
        <strong>${ponto.name}</strong>
      </div>
    `;
  };

  const updateMarkerForSelect = async (select) => {
    const selectedName = select.value;
    const ponto = pontosByName.get(selectedName);
    if (!ponto || !mapa) return;

    const coords = await fetchCoords(ponto.name);
    if (!coords) {
      const existing = pontosMarkers.get(select);
      if (existing && mapa) mapa.removeLayer(existing);
      pontosMarkers.delete(select);
      return;
    }

    let marker = pontosMarkers.get(select);
    if (!marker) {
      marker = window.L.marker(coords).addTo(mapa);
      marker.bindTooltip(buildTooltipContent(ponto), {
        direction: 'top',
        offset: [0, -10],
        opacity: 1,
        className: 'ponto-tooltip',
      });
      pontosMarkers.set(select, marker);
    } else {
      marker.setLatLng(coords);
      marker.setTooltipContent(buildTooltipContent(ponto));
    }

    mapa.setView(coords, Math.max(mapa.getZoom(), 14));
  };

  const setupPontos = async () => {
    if (!pontosList) return;

    mapa = initMapa();
    try {
      await fetchOverpassCoords();
    } catch (_error) {
      // Ignore and use per-point geocoding.
    }

    window.addEventListener('cadastro:step4', () => {
      if (!mapa) return;
      setTimeout(() => {
        mapa.invalidateSize();
      }, 0);
    });

    const updatePontoLabels = () => {
      const items = pontosList.querySelectorAll('.ponto-item');
      items.forEach((item, index) => {
        const label = item.querySelector('.ponto-label');
        if (label) label.textContent = `Ponto de Coleta ${index + 1}`;
        const removeButton = item.querySelector('.remove-dynamic-item');
        if (removeButton) removeButton.disabled = items.length === 1;
      });
    };

    const addSelect = () => {
      const count = pontosList.querySelectorAll('.ponto-item').length;
      const { wrapper, select } = createPontoSelect(count + 1);
      const removeButton = document.createElement('button');
      removeButton.className = 'remove-dynamic-item';
      removeButton.type = 'button';
      removeButton.setAttribute('aria-label', 'Remover campo');
      removeButton.textContent = '🗑';
      wrapper.appendChild(removeButton);

      removeButton.addEventListener('click', () => {
        const items = pontosList.querySelectorAll('.ponto-item');
        if (items.length === 1) return;
        const marker = pontosMarkers.get(select);
        if (marker && mapa) mapa.removeLayer(marker);
        pontosMarkers.delete(select);
        wrapper.remove();
        updatePontoLabels();
        syncPontoSelectOptions();
      });

      select.addEventListener('change', () => {
        if (!select.value) {
          const marker = pontosMarkers.get(select);
          if (marker && mapa) mapa.removeLayer(marker);
          pontosMarkers.delete(select);

          const items = pontosList.querySelectorAll('.ponto-item');
          if (items.length > 1) {
            wrapper.remove();
            updatePontoLabels();
            syncPontoSelectOptions();
          }
          return;
        }

        syncPontoSelectOptions();
        updateMarkerForSelect(select);
      });

      pontosList.appendChild(wrapper);
      syncPontoSelectOptions();
      updatePontoLabels();
    };

    addSelect();

    if (addPontoButton) {
      addPontoButton.addEventListener('click', () => {
        addSelect();
      });
    }
  };

  const residuosList = document.querySelector('.residuos-list');
  const addResiduoButton = document.querySelector('.add-residuo');

  if (residuosList && addResiduoButton) {
    const updateResiduoLabels = () => {
      const items = residuosList.querySelectorAll('.residuo-item');
      items.forEach((item, index) => {
        const label = item.querySelector('.residuo-label');
        if (label) label.textContent = `Resíduo ${index + 1}`;
        const removeButton = item.querySelector('.remove-dynamic-item');
        if (removeButton) removeButton.disabled = items.length === 1;
      });
    };

    const createRemoveButton = () => {
      const button = document.createElement('button');
      button.className = 'remove-dynamic-item';
      button.type = 'button';
      button.setAttribute('aria-label', 'Remover campo');
      button.textContent = '🗑';
      return button;
    };

    const attachResiduoInputBehavior = (item) => {
      const input = item.querySelector('input');
      if (!input) return;
      input.addEventListener('input', () => {
        input.value = capitalizeFirstLetter(input.value);
      });
      input.addEventListener('blur', () => {
        input.value = capitalizeFirstLetter(input.value);
      });
    };

    const attachResiduoDelete = (item) => {
      let removeButton = item.querySelector('.remove-dynamic-item');
      if (!removeButton) {
        removeButton = createRemoveButton();
        item.appendChild(removeButton);
      }

      removeButton.addEventListener('click', () => {
        const items = residuosList.querySelectorAll('.residuo-item');
        if (items.length === 1) return;
        item.remove();
        updateResiduoLabels();
      });
    };

    residuosList.querySelectorAll('.residuo-item').forEach((item) => {
      attachResiduoDelete(item);
      attachResiduoInputBehavior(item);
    });
    updateResiduoLabels();

    addResiduoButton.addEventListener('click', () => {
      const currentCount = residuosList.querySelectorAll('.residuo-item').length;
      const nextCount = currentCount + 1;
      const item = document.createElement('div');
      item.className = 'residuo-item';
      item.innerHTML = `
        <span class="residuo-label">Resíduo ${nextCount}</span>
        <input type="text" placeholder="Exemplo: Papelão">
      `;
      attachResiduoDelete(item);
      attachResiduoInputBehavior(item);
      residuosList.appendChild(item);
      updateResiduoLabels();
      item.querySelector('input')?.focus();
    });
  }

  const buildRegistrationPayload = () => {
    const logoFile = logoInput?.files?.[0] || null;

    const wastesArray = Array.from(document.querySelectorAll('.residuo-item input'))
      .map((input) => input.value.trim())
      .filter(Boolean);

    const pointsArray = getSelectedPointNames()
      .map((pointName) => {
        const point = pontosByName.get(pointName);
        return point
          ? {
              name: point.name,
              image: point.image,
              coords: point.coords,
            }
          : null;
      })
      .filter(Boolean);

    return {
      info: {
        nome_empresa: document.getElementById('nome-empresa')?.value.trim() || '',
        cnpj: cnpjInput?.value.trim() || '',
        razao_social: document.getElementById('razao-social')?.value.trim() || '',
        descricao: descricaoInput?.value.trim() || '',
        logo: logoFile,
      },
      contact: {
        telefone: phoneInput?.value.trim() || '',
        email: corporateEmailInput?.value.trim() || '',
        facebook: document.getElementById('facebook')?.value.trim() || '',
        instagram: document.getElementById('instagram')?.value.trim() || '',
        linkedin: document.getElementById('linkedin')?.value.trim() || '',
        twitter: document.getElementById('twitter')?.value.trim() || '',
      },
      wastes: {
        items: wastesArray,
      },
      points: {
        items: pointsArray,
      },
      user: {
        email: finalEmailInput?.value.trim() || '',
        password: passwordInput?.value || '',
      },
    };
  };

  const getUserIdAfterSignIn = async (email) => {
    const usersResponse = await fetch('/empresas/users');
    if (!usersResponse.ok) {
      throw new Error('Não foi possível buscar o usuário recém-criado.');
    }

    const users = await usersResponse.json();
    const foundUser = Array.isArray(users)
      ? users.find((user) => normalizeText(user.email) === normalizeText(email))
      : null;

    const userId = foundUser?.id || foundUser?._id;
    if (!userId) {
      throw new Error('Usuário criado, mas o identificador não foi encontrado.');
    }

    return userId;
  };

  const submitSignIn = async () => {
    const registrationData = buildRegistrationPayload();

    const userResponse = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData.user),
    });

    const userPayload = await userResponse.json().catch(() => ({}));
    if (!userResponse.ok) {
      throw new Error(userPayload?.error || 'Erro ao criar usuário.');
    }

    const userId =
      userPayload?.user_id ||
      userPayload?.id ||
      userPayload?.user?.id ||
      (await getUserIdAfterSignIn(registrationData.user.email));

    const infoFormData = new FormData();
    infoFormData.append('user_id', userId);
    infoFormData.append('nome_empresa', registrationData.info.nome_empresa);
    infoFormData.append('cnpj', registrationData.info.cnpj);
    infoFormData.append('razao_social', registrationData.info.razao_social);
    infoFormData.append('descricao', registrationData.info.descricao);
    if (registrationData.info.logo) {
      infoFormData.append('logo', registrationData.info.logo);
    }

    const infoResponse = await fetch('/empresas/info', {
      method: 'POST',
      body: infoFormData,
    });
    if (!infoResponse.ok) {
      const infoPayload = await infoResponse.json().catch(() => ({}));
      throw new Error(infoPayload?.error || 'Erro ao salvar dados de identificação.');
    }
    
    const contactResponse = await fetch('/empresas/contato', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        ...registrationData.contact,
      }),
    });
    if (!contactResponse.ok) {
      const contactPayload = await contactResponse.json().catch(() => ({}));
      throw new Error(contactPayload?.error || 'Erro ao salvar dados de contato.');
    }

    const wasteResponse = await fetch('/empresas/waste', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        wastes: registrationData.wastes.items,
      }),
    });
    if (!wasteResponse.ok) {
      const wastePayload = await wasteResponse.json().catch(() => ({}));
      throw new Error(wastePayload?.error || 'Erro ao salvar resíduos.');
    }

    const pointsResponse = await fetch('/empresas/points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        points: registrationData.points.items,
      }),
    });
    if (!pointsResponse.ok) {
      const pointsPayload = await pointsResponse.json().catch(() => ({}));
      throw new Error(pointsPayload?.error || 'Erro ao salvar pontos de coleta.');
    }

    return registrationData;
  };

  steps.forEach((step, index) => {
    if (!step) return;

    const nextButton = step.querySelector('.btn-avancar');
    const backButton = step.querySelector('.btn-voltar');
    const finishButton = step.querySelector('.btn-finalizar');

    if (nextButton) {
      nextButton.addEventListener('click', async () => {
        if (!(await validateCurrentStep(index))) return;
        const nextIndex = Math.min(index + 1, steps.length - 1);
        showStep(nextIndex);
      });
    }

    if (backButton) {
      backButton.addEventListener('click', () => {
        const prevIndex = Math.max(index - 1, 0);
        showStep(prevIndex);
      });
    }

    if (finishButton) {
      finishButton.addEventListener('click', async () => {
        if (!(await validateCurrentStep(index))) return;

        const feedback = step.querySelector('.step-feedback') || createFeedback();
        if (!feedback.parentElement) {
          const actions = step.querySelector('.cadastro-acoes');
          actions?.insertAdjacentElement('beforebegin', feedback);
        }

        finishButton.disabled = true;
        finishButton.textContent = 'Finalizando...';

        try {
          const payload = await submitSignIn();
          console.log('Cadastro finalizado com sucesso:', payload);
          feedback.classList.remove('is-visible');
          feedback.innerHTML = '';
          window.location.href = '/login';
        } catch (error) {
          feedback.classList.add('is-visible');
          feedback.innerHTML = `<strong>Não foi possível concluir o cadastro:</strong><ul><li>${error.message}</li></ul>`;
        } finally {
          finishButton.disabled = false;
          finishButton.textContent = 'Finalizar';
        }
      });
    }
  });

  setupPontos();
});
