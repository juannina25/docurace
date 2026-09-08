const ADMIN_CODE = 'ADG2026';
const adminLogin = document.getElementById('adminLogin');
const adminContent = document.getElementById('adminContent');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminCode = document.getElementById('adminCode');
const adminLoginMessage = document.getElementById('adminLoginMessage');
const userList = document.getElementById('userList');
const userCount = document.getElementById('userCount');

function getLocalProfiles() {
  try {
    return JSON.parse(localStorage.getItem('docuraceProfiles') || '[]');
  } catch {
    return [];
  }
}

function saveLocalProfiles(profiles) {
  localStorage.setItem('docuraceProfiles', JSON.stringify(profiles));
}

function syncProfileName(code, name) {
  const profiles = getLocalProfiles().map(profile => profile.code === code ? {...profile, name} : profile);
  saveLocalProfiles(profiles);
}

function removeLocalProfile(code) {
  saveLocalProfiles(getLocalProfiles().filter(profile => profile.code !== code));
}

function renderUsers() {
  const players = getAllPlayers().sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'es'));
  userCount.textContent = `${players.length} usuario${players.length === 1 ? '' : 's'}`;
  userList.innerHTML = '';

  if (!players.length) {
    userList.innerHTML = '<p class="adminEmpty">Todavía no hay usuarios registrados.</p>';
    return;
  }

  players.forEach(player => {
    const card = document.createElement('article');
    card.className = 'userRow';

    const details = document.createElement('div');
    details.className = 'userDetails';
    details.innerHTML = `<span class="userIcon">👤</span><div><strong>${escapeHtml(player.name || 'Sin nombre')}</strong><small>Código: ${escapeHtml(player.code)}</small></div>`;

    const form = document.createElement('form');
    form.className = 'userEditForm';
    form.innerHTML = `<label class="srOnly" for="name-${escapeHtml(player.code)}">Nombre de ${escapeHtml(player.code)}</label><input id="name-${escapeHtml(player.code)}" value="${escapeHtml(player.name || '')}" required><button class="adminPrimary" type="submit">Guardar</button><button class="adminDelete" type="button">Eliminar</button>`;

    form.addEventListener('submit', event => {
      event.preventDefault();
      const input = form.querySelector('input');
      const name = input.value.trim();
      if (!name) return;
      updatePlayerName(player.code, name);
      syncProfileName(player.code, name);
      renderUsers();
    });

    form.querySelector('.adminDelete').addEventListener('click', () => {
      if (!confirm(`¿Eliminar a ${player.name || player.code}? Esta acción borra también su progreso y puntaje.`)) return;
      deletePlayer(player.code);
      removeLocalProfile(player.code);
      renderUsers();
    });

    card.append(details, form);
    userList.appendChild(card);
  });
}

adminLoginForm.addEventListener('submit', event => {
  event.preventDefault();
  if (adminCode.value.trim().toUpperCase() !== ADMIN_CODE) {
    adminLoginMessage.textContent = 'Código incorrecto.';
    adminCode.select();
    return;
  }
  adminLogin.classList.add('hidden');
  adminContent.classList.remove('hidden');
  renderUsers();
});

document.getElementById('refreshUsers').addEventListener('click', renderUsers);
