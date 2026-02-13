document.addEventListener('DOMContentLoaded', () => {
  const points = [
    { name: 'Cascavel - Ecoponto Cascavel Velho', coords: [-24.9818, -53.4297] },
    { name: 'Cascavel - Ecoponto Brasília - Unicacoop', coords: [-24.935105, -53.43003] },
    { name: 'Cascavel - Ambiental Cascavel', coords: [-24.9558, -53.455] },
  ];

  const list = document.getElementById('collection-points-list');
  if (list) {
    points.forEach((point) => {
      const item = document.createElement('li');
      item.textContent = `📍 ${point.name}`;
      list.appendChild(item);
    });
  }

  if (window.L) {
    const mapElement = document.getElementById('mapa-perfil');

    if (mapElement) {
      const cascavelCenter = [-24.9555, -53.4552];
      const map = window.L.map(mapElement, {
        center: cascavelCenter,
        zoom: 13,
        zoomControl: true,
      });

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      const bounds = [];

      points.forEach((point) => {
        const marker = window.L.marker(point.coords)
          .addTo(map)
          .bindPopup(`<strong>${point.name}</strong>`);

        bounds.push(marker.getLatLng());
      });

      if (bounds.length) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    }
  }

  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      window.location.href = '/login';
    });
  }

  const editButton = document.getElementById('edit-profile-button');
  if (editButton) {
    editButton.addEventListener('click', () => {
      window.alert('Fluxo de edição de perfil será implementado em breve.');
    });
  }

  const deleteButton = document.getElementById('delete-profile-button');
  if (deleteButton) {
    deleteButton.addEventListener('click', () => {
      window.location.href = '/delete-profile';
    });
  }
}); 