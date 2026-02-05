// Переход на страницу редактирования при клике
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadUserData();
});

function loadUserData() {
  const statusDiv = document.getElementById('status');
  const editForm = document.getElementById('editForm');

  // Проверка на существование элементов
  if (!statusDiv || !editForm) {
    return;
  }

  statusDiv.style.display = 'block';
  statusDiv.textContent = '⏳ Загрузка данных...';

  // Добавляю timeout для предотвращения бесконечного ожидания
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд

  fetch('http://localhost:3000/api/auth/profile', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    signal: controller.signal
  })
    .then(response => {
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('session_expired');
        }
        if (response.status === 403) {
          throw new Error('Доступ запрещен.');
        }
        if (response.status === 404) {
          throw new Error('Маршрут /api/auth/profile не найден на сервере.');
        }
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      statusDiv.style.display = 'none';
      editForm.style.display = 'block';

      const fullNameInput = document.getElementById('fullName');
      const birthDateInput = document.getElementById('birthDate');
      const usernameInput = document.getElementById('username');
      const emailInput = document.getElementById('email');

      if (fullNameInput && birthDateInput && usernameInput && emailInput) {
        fullNameInput.value = data.fullName || '';
        if (data.birthDate) {
          const d = new Date(data.birthDate);
          if (!Number.isNaN(d.getTime())) {
            birthDateInput.value = d.toISOString().slice(0, 10);
          }
        }
        usernameInput.value = data.username || '';
        emailInput.value = data.email || '';
      }
    })
    .catch(error => {
      clearTimeout(timeoutId);

      statusDiv.style.display = 'none';

      if (error.message === 'session_expired') {
        showError('Сессия истекла. Перенаправление на логин...');
        setTimeout(() => {
          window.location.href = '../login/login.html';
        }, 2000);
        return;
      }

      // Определить тип ошибки
      let errorMessage = error.message;
      if (error.name === 'AbortError') {
        errorMessage = '❌ Timeout: Сервер не отвечает (проверьте, запущен ли Docker)';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = '❌ Ошибка сети: Не удается подключиться к серверу (проверьте localhost:3000)';
      }

      showError(errorMessage);
    });
}

function setupEventListeners() {
  // Кнопка возврата на панель
  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = '../dashboard/dashboard.html';
  });

  // Кнопка выхода
  document.getElementById('logoutBtn').addEventListener('click', logout);

  // Кнопка отмены
  document.getElementById('cancelBtn').addEventListener('click', () => {
    window.location.href = '../dashboard/dashboard.html';
  });

  // Отправка формы
  document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
}

function handleProfileUpdate(e) {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const birthDate = document.getElementById('birthDate').value;
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Проверка валидации пароля
  if (password && password !== confirmPassword) {
    showError('Пароли не совпадают!');
    return;
  }

  if (password && password.length < 6) {
    showError('Пароль должен содержать минимум 6 символов!');
    return;
  }

  const updateData = {
    fullName,
    birthDate,
    username,
    email
  };

  if (password) {
    updateData.password = password;
  }

  fetch('http://localhost:3000/api/auth/update-profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updateData)
  })
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Токен истек. Пожалуйста, войдите заново.');
        }
        if (response.status === 400) {
          return response.json().then(data => {
            throw new Error(data.message || 'Ошибка при обновлении профиля');
          });
        }
        throw new Error('Ошибка при обновлении профиля');
      }
      return response.json();
    })
    .then(data => {
      showSuccess('Профиль успешно обновлен!');

      // Очистить поле пароля
      document.getElementById('password').value = '';
      document.getElementById('confirmPassword').value = '';

      // Перенаправить на панель через 2 секунды с форсированием обновления
      setTimeout(() => {
        window.location.href = '../dashboard/dashboard.html?updated=true';
      }, 2000);
    })
    .catch(error => {
      showError(error.message);
    });
}

function showSuccess(message) {
  const successDiv = document.getElementById('successMessage');
  successDiv.textContent = '✓ ' + message;
  successDiv.style.display = 'block';
}

function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  const errorContainer = document.getElementById('errorContainer');
  const statusDiv = document.getElementById('status');

  // Скрыть статус если он видим
  if (statusDiv) {
    statusDiv.style.display = 'none';
  }

  // Попытаться показать ошибку в форме
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  } else if (errorContainer) {
    // Иначе показать в контейнере ошибок
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
  } else {
    // Если элементов нет - вывести в alert
    alert(message);
  }
}

async function logout() {
  try {
    await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (err) {
    // игнорируем ошибку выхода
  }
  window.location.href = '../login/login.html';
}
