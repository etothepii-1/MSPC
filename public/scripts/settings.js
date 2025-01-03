document.addEventListener('DOMContentLoaded', async () => {
  const userDataResponse = await fetch('/get-user');
  let userData;
  try {
    userData = await userDataResponse.json();
  } catch {
    userData = undefined;
  }
  if (userData) {
    const userResponse = await fetch('/get-user');
    const user = await userResponse.json();
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

  document.getElementById('change-id-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const userId = document.getElementById('id').value;
    fetch('/change-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: userId }),
    });
    localStorage.setItem('userId', userId);
    location.reload(true);
  });

  document.getElementById('change-language-form').addEventListener('submit', async function (event) {
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

  document.getElementById('id').addEventListener('input', (event) => {
    document.getElementById('change-id-btn').className = 'btn btn-dark mt-3';
  });

  document.getElementById('language').addEventListener('change', (event) => {
    document.getElementById('change-language-btn').className = 'btn btn-dark mt-3';
  });

  document.body.style.visibility = 'visible';
});
