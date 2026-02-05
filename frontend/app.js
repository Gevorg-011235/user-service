async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const messageEl = document.getElementById('message');

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

    const data = await res.json();

    if (res.ok) {
      window.location.href = '../dashboard/dashboard.html';
    } else {
      messageEl.innerText = data.message || 'Ошибка входа';
    }
  } catch (err) {
    messageEl.innerText = 'Ошибка сети. Проверьте соединение.';
  }
}

async function register() {
  const fullName = document.getElementById('fullName').value;
  const birthDate = document.getElementById('birthDate').value;
  const email = document.getElementById('email').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const messageEl = document.getElementById('message');

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

    const data = await res.json();

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
  } catch (err) {
    messageEl.innerText = 'Ошибка сети. Проверьте соединение.';
    messageEl.classList.remove('success');
    messageEl.classList.add('error');
    messageEl.style.display = 'block';
  }
}
