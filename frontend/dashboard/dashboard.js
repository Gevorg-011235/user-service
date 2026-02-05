const statusEl = document.getElementById('status');
const userInfoEl = document.getElementById('userInfo');
const userFullNameEl = document.getElementById('userFullName');
const userBirthDateEl = document.getElementById('userBirthDate');
const userEmailEl = document.getElementById('userEmail');
const userUsernameEl = document.getElementById('userUsername');
const userRoleEl = document.getElementById('userRole');
const userStatusEl = document.getElementById('userStatus');
const errorMessageEl = document.getElementById('errorMessage');
const logoutBtn = document.getElementById('logoutBtn');
const editProfileBtn = document.getElementById('editProfileBtn');

// Проверить, был ли профиль обновлен
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
  .then(data => {
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

    userEmailEl.innerText = data.email || 'Пользователь';
    userUsernameEl.innerText = data.username || 'Не указано';
    if (userRoleEl) {
      userRoleEl.innerText = data.role || 'user';
    }
    if (userStatusEl) {
      userStatusEl.innerText = data.isActive === false ? 'Заблокирован' : 'Активен';
    }
    if (data.message) {
      const messageEl = document.createElement('p');
      messageEl.innerText = data.message;
      userInfoEl.appendChild(messageEl);
    }

    // Если профиль был обновлен, можно отображать сообщение (не используем sessionStorage)
    if (isUpdated) {
      // no-op for now
    }
  })
  .catch(err => {
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
  } catch (err) {
    // игнорируем ошибку выхода
  }
  window.location.href = '../index.html';
});

// Кнопка редактирования профиля
if (editProfileBtn) {
  editProfileBtn.addEventListener('click', () => {
    window.location.href = '../edit-profile/edit-profile.html';
  });
}
