type ProfileResponse = {
  fullName?: string;
  birthDate?: string;
  username?: string;
  email?: string;
};

type UpdateErrorResponse = {
  message?: string;
};

const getInput = (id: string): HTMLInputElement | null => {
  return document.getElementById(id) as HTMLInputElement | null;
};

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadUserData();
});

function loadUserData(): void {
  const statusDiv = document.getElementById('status') as HTMLElement | null;
  const editForm = document.getElementById('editForm') as HTMLElement | null;

  if (!statusDiv || !editForm) {
    return;
  }

  statusDiv.style.display = 'block';
  statusDiv.textContent = '⏳ Загрузка данных...';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

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
    .then((data: ProfileResponse) => {
      statusDiv.style.display = 'none';
      editForm.style.display = 'block';

      const fullNameInput = getInput('fullName');
      const birthDateInput = getInput('birthDate');
      const usernameInput = getInput('username');
      const emailInput = getInput('email');

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
    .catch((error: Error) => {
      clearTimeout(timeoutId);

      statusDiv.style.display = 'none';

      if (error.message === 'session_expired') {
        showError('Сессия истекла. Перенаправление на логин...');
        setTimeout(() => {
          window.location.href = '../login/login.html';
        }, 2000);
        return;
      }

      let errorMessage = error.message;
      if (error.name === 'AbortError') {
        errorMessage = '❌ Timeout: Сервер не отвечает (проверьте, запущен ли Docker)';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = '❌ Ошибка сети: Не удается подключиться к серверу (проверьте localhost:3000)';
      }

      showError(errorMessage);
    });
}

function setupEventListeners(): void {
  const backBtn = document.getElementById('backBtn') as HTMLButtonElement | null;
  const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement | null;
  const cancelBtn = document.getElementById('cancelBtn') as HTMLButtonElement | null;
  const profileForm = document.getElementById('profileForm') as HTMLFormElement | null;

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '../dashboard/dashboard.html';
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      window.location.href = '../dashboard/dashboard.html';
    });
  }

  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }
}

function handleProfileUpdate(e: Event): void {
  e.preventDefault();

  const fullName = getInput('fullName')?.value.trim() || '';
  const birthDate = getInput('birthDate')?.value || '';
  const username = getInput('username')?.value.trim() || '';
  const email = getInput('email')?.value.trim() || '';
  const password = getInput('password')?.value || '';
  const confirmPassword = getInput('confirmPassword')?.value || '';

  if (password && password !== confirmPassword) {
    showError('Пароли не совпадают!');
    return;
  }

  if (password && password.length < 6) {
    showError('Пароль должен содержать минимум 6 символов!');
    return;
  }

  const updateData: Record<string, string> = {
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
          return response.json().then((data: UpdateErrorResponse) => {
            throw new Error(data.message || 'Ошибка при обновлении профиля');
          });
        }
        throw new Error('Ошибка при обновлении профиля');
      }
      return response.json();
    })
    .then(() => {
      showSuccess('Профиль успешно обновлен!');

      const passwordInput = getInput('password');
      const confirmPasswordInput = getInput('confirmPassword');
      if (passwordInput) passwordInput.value = '';
      if (confirmPasswordInput) confirmPasswordInput.value = '';

      setTimeout(() => {
        window.location.href = '../dashboard/dashboard.html?updated=true';
      }, 2000);
    })
    .catch((error: Error) => {
      showError(error.message);
    });
}

function showSuccess(message: string): void {
  const successDiv = document.getElementById('successMessage') as HTMLElement | null;
  if (!successDiv) return;
  successDiv.textContent = '✓ ' + message;
  successDiv.style.display = 'block';
}

function showError(message: string): void {
  const errorDiv = document.getElementById('errorMessage') as HTMLElement | null;
  const errorContainer = document.getElementById('errorContainer') as HTMLElement | null;
  const statusDiv = document.getElementById('status') as HTMLElement | null;

  if (statusDiv) {
    statusDiv.style.display = 'none';
  }

  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  } else if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
  } else {
    alert(message);
  }
}

async function logout(): Promise<void> {
  try {
    await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch {
  }
  window.location.href = '../login/login.html';
}

export {};
