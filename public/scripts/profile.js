document.addEventListener('DOMContentLoaded', () => {
  const points = [
    { name: 'Cascavel - Ecoponto Cascavel Velho', coords: [-24.9818, -53.4297] },
    { name: 'Cascavel - Ecoponto Brasília - Unicacoop', coords: [-24.935105, -53.430030] },
    { name: 'Cascavel - Ambiental Cascavel', coords: [-24.9558, -53.4550] },
  ];

  const list = document.getElementById('collection-points-list');
  if (list) {
    points.forEach((point) => {
      const item = document.createElement('li');
      item.textContent = `📍 ${point.name}`;
      list.appendChild(item);
    });
  }

  if (!window.L) return;

  const mapElement = document.getElementById('mapa-perfil');
  if (!mapElement) return;

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
});
