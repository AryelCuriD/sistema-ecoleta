document.addEventListener('DOMContentLoaded', () => {
  const socialFieldRules = {
    facebook: /^https?:\/\/(www\.)?facebook\.com\/.+/i,
    instagram: /^https?:\/\/(www\.)?instagram\.com\/.+/i,
    linkedin: /^https?:\/\/(www\.)?linkedin\.com\/.+/i,
    twitter: /^https?:\/\/(www\.)?(x|twitter)\.com\/.+/i,
  };

  const phoneInput = document.getElementById('telefone');
  const descriptionField = document.getElementById('descricao');
  const charCount = document.querySelector('.char-count');
  const logoInput = document.getElementById('logo');
  const logoUploadBox = document.querySelector('.upload-box');
  const logoUploadText = document.getElementById('logo-upload-text');
  const allowedLogoTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  const LOGO_MAX_DIMENSION = 512;

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

  const capitalizeFirstLetter = (value) => {
    const trimmedStart = value.trimStart();
    if (!trimmedStart) return value;
    const firstChar = trimmedStart.charAt(0).toLocaleUpperCase('pt-BR');
    return value.replace(trimmedStart.charAt(0), firstChar);
  };

  phoneInput?.addEventListener('input', () => {
    phoneInput.value = formatPhone(phoneInput.value);
  });

  const logoWarning = document.createElement('small');
  logoWarning.className = 'logo-upload-warning';
  logoWarning.setAttribute('role', 'alert');
  logoWarning.setAttribute('aria-live', 'polite');
  logoUploadBox?.insertAdjacentElement('afterend', logoWarning);

  const showLogoWarning = (message) => {
    if (!logoWarning) return;
    logoWarning.textContent = message;
    logoWarning.style.display = message ? 'block' : 'none';
  };

  const resetLogoUploadState = () => {
    if (logoUploadText) logoUploadText.textContent = 'Inserir uma logo quadrada';
    logoUploadBox?.classList.remove('has-file');
    showLogoWarning('');
  };

  const getLogoValidationMessage = ({ isSquare, isWithinMaxSize }) => {
    if (!isSquare) {
      return 'A logo deve ser quadrada (largura igual à altura).';
    }

    if (!isWithinMaxSize) {
      return `A logo deve ter no máximo ${LOGO_MAX_DIMENSION}x${LOGO_MAX_DIMENSION} pixels.`;
    }

    return '';
  };

  const validateSquareImage = (file) => new Promise((resolve) => {
    const image = new Image();
    const imageUrl = URL.createObjectURL(file);

    image.onload = () => {
      const isSquare = image.width === image.height;
      const isWithinMaxSize = image.width <= LOGO_MAX_DIMENSION && image.height <= LOGO_MAX_DIMENSION;
      resolve({
        valid: isSquare && isWithinMaxSize,
        isSquare,
        isWithinMaxSize,
      });
      URL.revokeObjectURL(imageUrl);
    };

    image.onerror = () => {
      resolve({
        valid: false,
        isSquare: false,
        isWithinMaxSize: false,
      });
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
      const typeErrorMessage = 'Envie apenas arquivos PNG, JPG ou JPEG para a logo. A imagem deve ser quadrada e ter no máximo 512x512 pixels.';
      logoInput.setCustomValidity(typeErrorMessage);
      showLogoWarning(typeErrorMessage);
      logoInput.reportValidity();
      return;
    }

    const logoValidation = await validateSquareImage(selectedFile);
    if (!logoValidation.valid) {
      logoInput.value = '';
      resetLogoUploadState();
      const logoMessage = getLogoValidationMessage(logoValidation);
      logoInput.setCustomValidity(logoMessage);
      showLogoWarning(logoMessage);
      logoInput.reportValidity();
      return;
    }

    logoInput.setCustomValidity('');
    showLogoWarning('');
    if (logoUploadText) logoUploadText.textContent = selectedFile.name;
    logoUploadBox?.classList.add('has-file');
  });

  const updateDescriptionCount = () => {
    if (!descriptionField || !charCount) return;
    descriptionField.maxLength = 1000;
    charCount.textContent = `${descriptionField.value.length}/1000 caracteres`;
  };

  descriptionField?.addEventListener('input', updateDescriptionCount);
  updateDescriptionCount();

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
  ];

  const showStep = (index) => {
    steps.forEach((step, stepIndex) => {
      if (!step) return;
      step.classList.toggle('is-hidden', stepIndex !== index);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (index === 2) {
      window.dispatchEvent(new Event('edicao:step3'));
    }
  };

  const getFieldLabel = (field, step) => {
    if (!field || !step) return 'Campo obrigatório';
    const id = field.getAttribute('id');
    if (id) {
      const label = step.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent.trim();
    }
    const item = field.closest('.residuo-item, .ponto-item, .edit-col');
    const itemLabel = item?.querySelector('.residuo-label, .ponto-label, label');
    return itemLabel?.textContent?.trim() || field.getAttribute('placeholder') || 'Campo obrigatório';
  };

  const markFieldValidity = (field, isInvalid) => {
    field.classList.toggle('field-invalid', isInvalid);
  };

  const validateCurrentStep = async (index) => {
    const step = steps[index];
    if (!step) return true;

    const feedback = step.querySelector('.step-feedback') || createFeedback();
    if (!feedback.parentElement) {
      const actions = step.querySelector('.edit-acoes');
      actions?.insertAdjacentElement('beforebegin', feedback);
    }

    const invalidMessages = [];

    if (index === 0) {
      const requiredFields = step.querySelectorAll('input[type="text"], input[type="email"], textarea');
      requiredFields.forEach((field) => {
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
        const isInvalid = !field.files?.length;
        const hasInvalidType = !!field.files?.length && !allowedLogoTypes.includes(field.files[0].type);

        if (hasInvalidType) {
          markFieldValidity(field, true);
          field.setCustomValidity('Envie apenas arquivos PNG, JPG ou JPEG para a logo.');
          invalidMessages.push('Logo da empresa deve ser PNG, JPG ou JPEG.');
          continue;
        }

        if (field.files?.length) {
          const logoValidation = await validateSquareImage(field.files[0]);
          if (!logoValidation.valid) {
            markFieldValidity(field, true);
            const logoMessage = getLogoValidationMessage(logoValidation);
            field.setCustomValidity(logoMessage);
            invalidMessages.push(logoMessage);
            continue;
          }
        }

        if (isInvalid) {
          invalidMessages.push('Logo da empresa');
          field.setCustomValidity('Selecione um arquivo.');
        } else {
          field.setCustomValidity('');
        }
        markFieldValidity(field, isInvalid);
      }

      const emailField = step.querySelector('#email-corporativo');
      if (emailField && !emailField.value.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        markFieldValidity(emailField, true);
        emailField.setCustomValidity('Digite um e-mail válido.');
        invalidMessages.push('E-mail corporativo inválido.');
      }

      const phoneField = step.querySelector('#telefone');
      if (phoneField && !isValidPhone(phoneField.value)) {
        markFieldValidity(phoneField, true);
        phoneField.setCustomValidity('Digite um telefone válido com DDD.');
        invalidMessages.push('Telefone inválido.');
      }

      Object.entries(socialFieldRules).forEach(([id, pattern]) => {
        const field = step.querySelector(`#${id}`);
        if (!field) return;
        const value = field.value.trim();
        if (!value) return;

        if (!pattern.test(value)) {
          markFieldValidity(field, true);
          field.setCustomValidity('Informe um link completo, com / e nome da conta.');
          invalidMessages.push(`${getFieldLabel(field, step)} deve conter um link completo com o nome da conta.`);
        } else {
          field.setCustomValidity('');
        }
      });
    }

    if (index === 1) {
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
          input.setCustomValidity('');
        }
      });

      const normalizedResiduos = filledResiduos.map((input) => input.value.trim().toLocaleLowerCase('pt-BR'));
      const hasDuplicateResiduos = new Set(normalizedResiduos).size !== normalizedResiduos.length;
      if (hasDuplicateResiduos) {
        invalidMessages.push('Não adicione resíduos com nomes repetidos.');
        filledResiduos.forEach((input) => markFieldValidity(input, true));
      }
    }

    if (index === 2) {
      const selectedPontos = Array.from(step.querySelectorAll('.ponto-select')).filter((select) => select.value);
      if (!selectedPontos.length) {
        invalidMessages.push('Selecione pelo menos 1 ponto de coleta.');
      }

      const pointValues = selectedPontos.map((select) => select.value);
      if (new Set(pointValues).size !== pointValues.length) {
        invalidMessages.push('Não selecione o mesmo ponto de coleta mais de uma vez.');
        selectedPontos.forEach((select) => markFieldValidity(select, true));
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

    const firstInvalid = step.querySelector('.field-invalid, input:invalid, textarea:invalid');
    firstInvalid?.reportValidity();
    firstInvalid?.focus();
    return false;
  };

  steps.forEach((step, index) => {
    if (!step) return;
    const nextButton = step.querySelector('.btn-avancar');
    const backButton = step.querySelector('.btn-voltar');
    const finishButton = step.querySelector('.btn-finalizar');

    if (nextButton) {
      nextButton.addEventListener('click', async () => {
        if (!(await validateCurrentStep(index))) return;
        showStep(Math.min(index + 1, steps.length - 1));
      });
    }

    if (backButton) {
      backButton.addEventListener('click', () => {
        showStep(Math.max(index - 1, 0));
      });
    }

    if (finishButton) {
      finishButton.addEventListener('click', async () => {
        if (!(await validateCurrentStep(index))) return;
        window.location.href = '/own-profile';
      });
    }
  });

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
      const item = document.createElement('div');
      item.className = 'residuo-item';
      item.innerHTML = `
        <span class="residuo-label">Resíduo ${currentCount + 1}</span>
        <input type="text" placeholder="Exemplo: Papelão">
      `;
      attachResiduoDelete(item);
      attachResiduoInputBehavior(item);
      residuosList.appendChild(item);
      updateResiduoLabels();
      item.querySelector('input')?.focus();
    });
  }

  const pontosList = document.querySelector('.pontos-list');
  const addPontoButton = document.querySelector('.add-ponto');
  const pontosData = [
    {
      name: 'Ponto de Coleta lixo Eletrônico Cascavel',
      image: '../images/pontos-coleta/ponto-coleta-lixo-eletronico-cascavel.jpg',
      coords: [-24.9558, -53.4554],
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
  const createPontoSelect = (index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'ponto-item';
    wrapper.innerHTML = `<span class="ponto-label">Ponto de Coleta ${index}</span>`;
    const select = document.createElement('select');
    select.className = 'ponto-select';
    select.innerHTML = '<option value="">Digite aqui ou procure no mapa</option>';
    wrapper.appendChild(select);
    return { wrapper, select };
  };

  const mapaElement = document.getElementById('mapa-cascavel');
  const pontosMarkers = new Map();
  const cascavelCenter = [-24.9555, -53.4552];
  let mapa = null;

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

  const buildTooltipContent = (ponto) => {
    const imageUrl = ponto.image || '../images/pontos-coleta/placeholder.svg';
    return `
      <div class="ponto-tooltip-content">
        <img src="${imageUrl}" alt="Imagem do ponto ${ponto.name}" onerror="this.onerror=null;this.src='../images/pontos-coleta/placeholder.svg';">
        <strong>${ponto.name}</strong>
      </div>
    `;
  };

  const updateMarkerForSelect = (select) => {
    const selectedName = select.value;
    const ponto = pontosByName.get(selectedName);
    if (!ponto || !mapa || !ponto.coords) return;

    let marker = pontosMarkers.get(select);
    if (!marker) {
      marker = window.L.marker(ponto.coords).addTo(mapa);
      marker.bindTooltip(buildTooltipContent(ponto), {
        direction: 'top',
        offset: [0, -10],
        opacity: 1,
        className: 'ponto-tooltip',
      });
      pontosMarkers.set(select, marker);
    } else {
      marker.setLatLng(ponto.coords);
      marker.setTooltipContent(buildTooltipContent(ponto));
    }

    mapa.setView(ponto.coords, Math.max(mapa.getZoom(), 14));
  };

  const setupPontos = () => {
    if (!pontosList) return;
    mapa = initMapa();

    window.addEventListener('edicao:step3', () => {
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

    const refreshPontoSelectOptions = () => {
      const selects = Array.from(pontosList.querySelectorAll('.ponto-select'));
      const selectedValues = selects.map((select) => select.value).filter(Boolean);

      selects.forEach((select) => {
        const previousValue = select.value;
        const availableNames = pontosData
          .filter((ponto) => ponto.name === previousValue || !selectedValues.includes(ponto.name))
          .map((ponto) => ponto.name);

        select.innerHTML = `
          <option value="">Digite aqui ou procure no mapa</option>
          ${availableNames.map((name) => `<option value="${name}">${name}</option>`).join('')}
        `;
        select.value = previousValue;
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
        refreshPontoSelectOptions();
        updatePontoLabels();
      });

      select.addEventListener('change', () => {
        if (!select.value) {
          const marker = pontosMarkers.get(select);
          if (marker && mapa) mapa.removeLayer(marker);
          pontosMarkers.delete(select);
          refreshPontoSelectOptions();
          return;
        }

        refreshPontoSelectOptions();
        updateMarkerForSelect(select);
      });

      pontosList.appendChild(wrapper);
      refreshPontoSelectOptions();
      updatePontoLabels();
    };

    addSelect();

    if (addPontoButton) {
      addPontoButton.addEventListener('click', () => addSelect());
    }
  };

  setupPontos();
});
