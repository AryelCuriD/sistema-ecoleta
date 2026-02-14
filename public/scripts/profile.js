document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search)
  const user_id = params.get('id');
  
  const data = await getUserData(user_id);
  const logo = await getCompanyLogo(data.info.logo);
  const imageElement = document.querySelector('.logo-placeholder');
  const companyName = document.querySelector('#company-name');
  const materialTags = document.querySelector('.material-tags');
  const companyDesc = document.querySelector('#company-desc');
  const phone = document.querySelector('#phone');
  const email = document.querySelector('#email');

  const facebook = document.querySelector('#facebook');
  const instagram = document.querySelector('#instagram');
  const linkedin = document.querySelector('#linkedin');
  const x = document.querySelector('#x');

  materialTags.innerHTML = ''
  data.wastes.wastes.forEach(waste => {
    materialTags.innerHTML += `
    <span>${stripHTMLTags(waste)}</span>
    `
  });
  const points = data.points.points
  imageElement.src = URL.createObjectURL(logo)
  companyName.textContent = stripHTMLTags(data.info.nome_empresa)
  companyDesc.textContent = stripHTMLTags(data.info.descricao)
  phone.textContent = stripHTMLTags(data.contact.telefone)
  email.textContent = stripHTMLTags(data.contact.email)

  facebook.href = stripHTMLTags(data.contact.social_media.facebook)
  instagram.href = stripHTMLTags(data.contact.social_media.instagram)
  linkedin.href = stripHTMLTags(data.contact.social_media.linkedin)
  x.href = stripHTMLTags(data.contact.social_media.twitter)

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
