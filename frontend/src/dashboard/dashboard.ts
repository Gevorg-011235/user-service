type DashboardResponse = {
  email?: string;
  username?: string;
  fullName?: string;
  birthDate?: string;
  role?: string;
  isActive?: boolean;
  message?: string;
};

const statusEl = document.getElementById('status') as HTMLElement | null;
const userInfoEl = document.getElementById('userInfo') as HTMLElement | null;
const userFullNameEl = document.getElementById('userFullName') as HTMLElement | null;
const userBirthDateEl = document.getElementById('userBirthDate') as HTMLElement | null;
const userEmailEl = document.getElementById('userEmail') as HTMLElement | null;
const userUsernameEl = document.getElementById('userUsername') as HTMLElement | null;
const userRoleEl = document.getElementById('userRole') as HTMLElement | null;
const adminNoteEl = document.getElementById('adminNote') as HTMLElement | null;
const userStatusEl = document.getElementById('userStatus') as HTMLElement | null;
const errorMessageEl = document.getElementById('errorMessage') as HTMLElement | null;
const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement | null;
const editProfileBtn = document.getElementById('editProfileBtn') as HTMLButtonElement | null;
const adminPanelBtn = document.getElementById('adminPanelBtn') as HTMLButtonElement | null;

if (statusEl && userInfoEl && errorMessageEl && logoutBtn) {
  const urlParams = new URLSearchParams(window.location.search);
  const isUpdated = urlParams.get('updated');

  fetch('http://localhost:3000/api/dashboard', {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  })
    .then(res => {
      if (res.status === 401) {
        throw new Error('session_expired');
      }
      if (!res.ok) {
        throw new Error('server_error');
      }
      return res.json();
    })
    .then((data: DashboardResponse) => {
      statusEl.style.display = 'none';
      userInfoEl.style.display = 'block';

      if (userFullNameEl) {
        userFullNameEl.innerText = data.fullName || 'Не указано';
      }
      if (userBirthDateEl) {
        if (data.birthDate) {
          const d = new Date(data.birthDate);
          userBirthDateEl.innerText = Number.isNaN(d.getTime())
            ? 'Не указано'
            : d.toISOString().slice(0, 10);
        } else {
          userBirthDateEl.innerText = 'Не указано';
        }
      }

      if (userEmailEl) {
        userEmailEl.innerText = data.email || 'Пользователь';
      }
      if (userUsernameEl) {
        userUsernameEl.innerText = data.username || 'Не указано';
      }
      if (userRoleEl) {
        userRoleEl.innerText = data.role || 'user';
      }
      if (adminNoteEl) {
        adminNoteEl.style.display = data.role === 'admin' ? 'inline' : 'none';
      }
      if (userStatusEl) {
        userStatusEl.innerText = data.isActive === false ? 'Заблокирован' : 'Активен';
      }
      if (adminPanelBtn && data.role === 'admin') {
        adminPanelBtn.style.display = 'block';
      }
      if (data.message) {
        const messageEl = document.createElement('p');
        messageEl.innerText = data.message;
        userInfoEl.appendChild(messageEl);
      }

      if (isUpdated) {
      }
    })
    .catch((err: Error) => {
      statusEl.style.display = 'none';
      errorMessageEl.style.display = 'block';

      if (err.message === 'session_expired') {
        errorMessageEl.innerText = '❌ Сессия истекла. Пожалуйста, войдите снова.';
        setTimeout(() => window.location.href = '../login/login.html', 2000);
      } else if (err.message === 'server_error') {
        errorMessageEl.innerText = '❌ Ошибка сервера. Попробуйте позже.';
      } else {
        errorMessageEl.innerText = '❌ Ошибка сети. Проверьте соединение.';
      }
    });

  logoutBtn.addEventListener('click', async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch {
    }
    window.location.href = '../index.html';
  });

  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      window.location.href = '../edit-profile/edit-profile.html';
    });
  }

  if (adminPanelBtn) {
    adminPanelBtn.addEventListener('click', () => {
      window.location.href = '../admin-dashboard/admin-dashboard.html';
    });
  }
}

export {};
