document.addEventListener('DOMContentLoaded', () => {
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

  steps.forEach((step, index) => {
    if (!step) return;
    const nextButton = step.querySelector('.btn-avancar');
    const backButton = step.querySelector('.btn-voltar');
    const finishButton = step.querySelector('.btn-finalizar');

    if (nextButton) {
      nextButton.addEventListener('click', () => {
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
      finishButton.addEventListener('click', () => {
        window.location.href = '/login';
      });
    }
  });

  const residuosList = document.querySelector('.residuos-list');
  const addResiduoButton = document.querySelector('.add-residuo');

  if (residuosList && addResiduoButton) {
    addResiduoButton.addEventListener('click', () => {
      const currentCount = residuosList.querySelectorAll('.residuo-item').length;
      const nextCount = currentCount + 1;
      const item = document.createElement('div');
      item.className = 'residuo-item';
      item.innerHTML = `
        <span class="residuo-label">Resíduo ${nextCount}</span>
        <input type="text" placeholder="Exemplo: Papelão">
      `;
      residuosList.appendChild(item);
      item.querySelector('input')?.focus();
    });
  }

  const pontosList = document.querySelector('.pontos-list');
  const addPontoButton = document.querySelector('.add-ponto');
  const pontosData = [
    {
      name: 'Ponto de Coleta lixo Eletrônico Cascavel',
      description: 'Ponto que recebe resíduos eletrônicos para descarte adequado.',
    },
    {
      name: 'Ecoponto Cascavel Velho',
      description: 'Centro de reciclagem comunitário que recebe materiais diversos.',
    },
    {
      name: 'Ecoponto Brasília - Unicacoop',
      description: 'Ecoponto com foco em coleta de recicláveis por categoria.',
    },
    {
      name: 'Ecoponto Manaus',
      description: 'Ponto de entrega de resíduos eletrônicos e outros recicláveis.',
    },
    {
      name: 'Ecoponto Melissa',
      description: 'Ponto de coleta e reciclagem para comunidade local.',
    },
    {
      name: 'Aparas Cascavel',
      description: 'Centro de reciclagem focado em aparas de materiais.',
    },
    {
      name: 'Eco Ponto Santa Cruz - COOTACAR',
      description: 'Ponto de coleta para diversos recicláveis.',
    },
    {
      name: 'GP RECICLAGEM',
      description: 'Centro de reciclagem que aceita materiais recicláveis diversos.',
    },
    {
      name: 'Aparas de Papel Sudoeste Ltda',
      description: 'Especializado em papel e material reciclável similar.',
    },
    {
      name: 'Atlas Comércio de Recicláveis',
      description: 'Comércio voltado a material reciclável com recebimento de resíduos.',
    },
    {
      name: 'ASCACAR',
      description: 'Associação com ponto de coleta e reciclagem comunitária.',
    },
    {
      name: 'Reciclagem',
      description: 'Local de reciclagem para diferentes materiais.',
    },
    {
      name: 'Ecoponto Quebec',
      description: 'Ecoponto local com foco em recebimento de recicláveis.',
    },
    {
      name: 'Ambiental Cascavel',
      description: 'Serviço/empresa de gestão e coleta de resíduos.',
    },
    {
      name: 'LIXO ELETRÔNICO | DESCARTE AQUI',
      description: 'Ponto específico para descarte de lixo eletrônico e afins.',
    },
  ];

  const pontosByName = new Map(pontosData.map((ponto) => [ponto.name, ponto]));
  const createPontoSelect = (index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'ponto-item';
    wrapper.innerHTML = `
      <span class="ponto-label">Ponto de Coleta ${index}</span>
    `;
    const select = document.createElement('select');
    select.className = 'ponto-select';
    select.innerHTML = `
      <option value="">Digite aqui ou procure no mapa</option>
      ${pontosData.map((ponto) => `<option value="${ponto.name}">${ponto.name}</option>`).join('')}
    `;
    wrapper.appendChild(select);
    return { wrapper, select };
  };

  const cascavelCenter = [-24.9555, -53.4552];
  const mapaElement = document.getElementById('mapa-cascavel');
  const pontosMarkers = new Map();
  const pontosCoordsCache = new Map();
  const pontosImagesCache = new Map();
  const pontosCoordsByName = new Map();
  let mapa = null;

  const createImageData = (title) => {
    if (pontosImagesCache.has(title)) return pontosImagesCache.get(title);
    const safeTitle = title.length > 32 ? `${title.slice(0, 32)}...` : title;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">
        <rect width="320" height="180" fill="#dfe6e1"/>
        <rect x="16" y="16" width="288" height="148" fill="#f5f7f5" stroke="#c7cfc9" stroke-width="2"/>
        <text x="160" y="95" text-anchor="middle" font-size="16" fill="#4c5d50" font-family="Arial, sans-serif">${safeTitle}</text>
      </svg>
    `;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    pontosImagesCache.set(title, dataUrl);
    return dataUrl;
  };

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

  const normalize = (value) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

  const scoreResult = (result, queryName) => {
    const normalizedQuery = normalize(queryName);
    const displayName = normalize(result?.display_name || '');
    const namedetails = normalize(result?.namedetails?.name || '');
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
    const escapedNames = names.map((name) =>
      name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
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
    } catch (error) {
      // keep fallback below
    }

    pontosCoordsCache.set(query, null);
    return null;
  };

  const buildTooltipContent = (ponto) => {
    const imageUrl = createImageData(ponto.name);
    return `
      <div class="ponto-tooltip-content">
        <img src="${imageUrl}" alt="Imagem do ponto ${ponto.name}">
        <strong>${ponto.name}</strong>
        <span>${ponto.description}</span>
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
      if (existing && mapa) {
        mapa.removeLayer(existing);
      }
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
    } catch (error) {
      // Ignore and fall back to per-point geocoding.
    }
    window.addEventListener('cadastro:step4', () => {
      if (!mapa) return;
      setTimeout(() => {
        mapa.invalidateSize();
      }, 0);
    });

    const addSelect = () => {
      const count = pontosList.querySelectorAll('.ponto-item').length;
      const { wrapper, select } = createPontoSelect(count + 1);
      select.addEventListener('change', () => {
        if (!select.value) {
          const marker = pontosMarkers.get(select);
          if (marker && mapa) {
            mapa.removeLayer(marker);
          }
          pontosMarkers.delete(select);
          return;
        }

        updateMarkerForSelect(select);
        const isLast = wrapper === pontosList.lastElementChild;
        if (isLast) addSelect();
      });
      pontosList.appendChild(wrapper);
    };

    addSelect();

    if (addPontoButton) {
      addPontoButton.addEventListener('click', () => {
        addSelect();
      });
    }
  };

  setupPontos();
});