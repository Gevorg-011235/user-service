type AuthResponse = {
  message?: string;
};

const getInputValue = (id: string): string => {
  const el = document.getElementById(id) as HTMLInputElement | null;
  return el ? el.value : '';
};

const getMessageEl = (): HTMLElement | null => {
  return document.getElementById('message');
};

const login = async (): Promise<void> => {
  const email = getInputValue('email');
  const password = getInputValue('password');
  const messageEl = getMessageEl();

  if (!messageEl) return;

  if (!email || !password) {
    messageEl.innerText = 'Пожалуйста, заполните все поля';
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = (await res.json()) as AuthResponse;

    if (res.ok) {
      window.location.href = '../dashboard/dashboard.html';
    } else {
      messageEl.innerText = data.message || 'Ошибка входа';
    }
  } catch {
    messageEl.innerText = 'Ошибка сети. Проверьте соединение.';
  }
};

const register = async (): Promise<void> => {
  const fullName = getInputValue('fullName');
  const birthDate = getInputValue('birthDate');
  const email = getInputValue('email');
  const username = getInputValue('username');
  const password = getInputValue('password');
  const confirmPassword = getInputValue('confirmPassword');
  const messageEl = getMessageEl();

  if (!messageEl) return;

  if (!fullName || !birthDate || !email || !username || !password || !confirmPassword) {
    messageEl.innerText = 'Пожалуйста, заполните все поля';
    messageEl.classList.remove('success');
    messageEl.classList.add('error');
    messageEl.style.display = 'block';
    return;
  }

  if (password !== confirmPassword) {
    messageEl.innerText = 'Пароли не совпадают';
    messageEl.classList.remove('success');
    messageEl.classList.add('error');
    messageEl.style.display = 'block';
    return;
  }

  if (password.length < 6) {
    messageEl.innerText = 'Пароль должен быть не менее 6 символов';
    messageEl.classList.remove('success');
    messageEl.classList.add('error');
    messageEl.style.display = 'block';
    return;
  }

  if (username.length < 3) {
    messageEl.innerText = 'Имя пользователя должно быть не менее 3 символов';
    messageEl.classList.remove('success');
    messageEl.classList.add('error');
    messageEl.style.display = 'block';
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ fullName, birthDate, email, username, password })
    });

    const data = (await res.json()) as AuthResponse;

    if (res.ok) {
      messageEl.innerText = 'Регистрация успешна! Перенаправление...';
      messageEl.classList.remove('error');
      messageEl.classList.add('success');
      messageEl.style.display = 'block';
      setTimeout(() => {
        window.location.href = '../login/login.html';
      }, 2000);
    } else {
      messageEl.innerText = data.message || 'Ошибка регистрации';
      messageEl.classList.remove('success');
      messageEl.classList.add('error');
      messageEl.style.display = 'block';
    }
  } catch {
    messageEl.innerText = 'Ошибка сети. Проверьте соединение.';
    messageEl.classList.remove('success');
    messageEl.classList.add('error');
    messageEl.style.display = 'block';
  }
};

declare global {
  interface Window {
    login: () => Promise<void>;
    register: () => Promise<void>;
  }
}

window.login = login;
window.register = register;

export {};
