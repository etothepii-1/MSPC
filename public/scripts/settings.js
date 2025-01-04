document.addEventListener('DOMContentLoaded', async () => {
  const userResponse = await fetch('/get-user');
  let user;
  try {
    user = await userResponse.json();
  } catch {
    user = undefined;
  }
  if (user) {
    document.getElementById('id').value = user.id;
    document.getElementById(user.language).selected = true;
    document.getElementById('change-id-btn').className = 'btn btn-dark mt-3 disabled';
    document.getElementById('change-language-btn').className = 'btn btn-dark mt-3 disabled';
  } else {
    document.getElementById('change-id-form').style.display = 'none';
    document.getElementById('change-language-form').style.display = 'none';
    const requireLogin = document.createElement('h1');
    requireLogin.className = 'mt-3';
    const requireLoginBold = document.createElement('b');
    requireLoginBold.textContent = '로그인해주세요';
    requireLogin.appendChild(requireLoginBold);
    document.querySelector('.container').appendChild(requireLogin);
  }

  document.getElementById('change-id-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const userId = document.getElementById('id').value;
    await fetch('/change-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: userId }),
    });
    localStorage.setItem('userId', userId);
    location.reload(true);
  });

  document.getElementById('change-language-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const language = document.getElementById('language').value;
    await fetch('/change-language', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ language: language }),
    });
    location.reload(true);
  });

  document.getElementById('id').addEventListener('input', () => {
    document.getElementById('change-id-btn').className = 'btn btn-dark mt-3';
  });

  document.getElementById('language').addEventListener('change', () => {
    document.getElementById('change-language-btn').className = 'btn btn-dark mt-3';
  });

  document.body.style.visibility = 'visible';
});
