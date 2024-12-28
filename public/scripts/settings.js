document.addEventListener('DOMContentLoaded', async () => {
  if (localStorage.getItem('isSignedIn') === 'true') {
    const userSub = localStorage.getItem('userSub');
    const userResponse = await fetch('/get-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_sub: userSub }),
    });
    const user = await userResponse.json();
    document.getElementById('id').value = user.id;
    document.getElementById(user.language).selected = true;
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
    const userSub = localStorage.getItem('userSub');
    const userId = document.getElementById('id').value;
    fetch('/change-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_sub: userSub, id: userId }),
    });
    localStorage.setItem('userId', userId);
    location.reload(true);
  });

  document.getElementById('change-language-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const userSub = localStorage.getItem('userSub');
    const language = document.getElementById('language').value;
    await fetch('/change-language', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_sub: userSub, language: language }),
    });
    location.reload(true);
  });

  document.body.style.visibility = 'visible';
});
