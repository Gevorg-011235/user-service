type UserRow = {
  _id: string;
  fullName?: string;
  email?: string;
  username?: string;
  role?: string;
  isActive?: boolean;
};

const statusEl = document.getElementById('status') as HTMLElement;
const errorMessageEl = document.getElementById('errorMessage') as HTMLElement;
const adminContentEl = document.getElementById('adminContent') as HTMLElement;
const usersTbody = document.getElementById('usersTbody') as HTMLElement;
const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement;
const backToUserBtn = document.getElementById('backToUser') as HTMLButtonElement;

const showError = (message: string) => {
  statusEl.style.display = 'none';
  adminContentEl.style.display = 'none';
  errorMessageEl.style.display = 'block';
  errorMessageEl.innerText = message;
};

const formatStatus = (isActive: boolean | undefined) => {
  if (isActive === false) {
    return '<span class="badge blocked">Заблокирован</span>';
  }
  return '<span class="badge active">Активен</span>';
};

const renderUsers = (users: UserRow[]) => {
  usersTbody.innerHTML = '';
  users.forEach(user => {
    const tr = document.createElement('tr');
    const statusHtml = formatStatus(user.isActive);
    const isBlocked = user.isActive === false;
    const actionLabel = isBlocked ? 'Разблокировать' : 'Заблокировать';
    const actionClass = isBlocked ? 'unblock' : 'block';

    tr.innerHTML = `
      <td>${user.fullName || '-'}</td>
      <td>${user.email || '-'}</td>
      <td>${user.username || '-'}</td>
      <td>${user.role || 'user'}</td>
      <td>${statusHtml}</td>
      <td>
        <button class="action-btn ${actionClass}" data-id="${user._id}">
          ${actionLabel}
        </button>
      </td>
    `;
    usersTbody.appendChild(tr);
  });
};

const loadUsers = async () => {
  statusEl.style.display = 'block';
  adminContentEl.style.display = 'none';
  errorMessageEl.style.display = 'none';

  try {
    const res = await fetch('http://localhost:3000/api/users', {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (res.status === 401) {
      window.location.href = '../login/login.html';
      return;
    }
    if (res.status === 403) {
      showError('Нет доступа к админ‑панели');
      setTimeout(() => {
        window.location.href = '../dashboard/dashboard.html';
      }, 1500);
      return;
    }
    if (!res.ok) {
      showError('Ошибка при загрузке пользователей');
      return;
    }

    const users = (await res.json()) as UserRow[];
    renderUsers(users);
    statusEl.style.display = 'none';
    adminContentEl.style.display = 'block';
  } catch {
    showError('Ошибка сети. Проверьте соединение.');
  }
};

const blockUser = async (userId: string, unblock = false) => {
  try {
    const endpoint = unblock ? 'unblock' : 'block';
    const res = await fetch(`http://localhost:3000/api/users/${userId}/${endpoint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (res.ok) {
      await loadUsers();
    }
  } catch {
    // ignore
  }
};

usersTbody.addEventListener('click', event => {
  const target = event.target as HTMLElement;
  if (target.matches('.action-btn.block') || target.matches('.action-btn.unblock')) {
    const id = target.getAttribute('data-id');
    if (id) {
      blockUser(id, target.classList.contains('unblock'));
    }
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch {
    // ignore
  }
  window.location.href = '../login/login.html';
});

backToUserBtn.addEventListener('click', () => {
  window.location.href = '../dashboard/dashboard.html';
});

loadUsers();
