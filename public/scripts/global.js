async function loadGoogleSignIn() {
  const response = await fetch('/get-client-id');
  const data = await response.json();
  return data.clientId;
}

function updateUI(userId) {
  if (userId) {
    document.querySelector('.g_id_signin').style.display = 'none';
    document.getElementById('user-name').textContent = userId;
    document.getElementById('user-name').style.display = 'block';
    document.getElementById('user-info').style.display = 'block';
  } else {
    document.getElementById('user-name').style.display = 'none';
    document.getElementById('user-info').style.display = 'none';
    document.querySelector('.g_id_signin').style.display = 'block';
  }
}

async function userRegister(userName, userSub) {
  const response = await fetch('/user-register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_name: userName, user_sub: userSub }),
  });
  const data = await response.json();
  return data.id;
}

async function handleCredentialResponse(response) {
  const payload = JSON.parse(
    decodeURIComponent(
      atob(response.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
  );
  const userName = payload.name;
  const userSub = payload.sub;
  userId = await userRegister(userName, userSub);
  localStorage.setItem('isSignedIn', 'true');
  localStorage.setItem('userId', userId);
  localStorage.setItem('userSub', userSub);
  updateUI(userId);
  location.reload(true);
}

document.addEventListener('DOMContentLoaded', async () => {
  const clientId = await loadGoogleSignIn();
  if (localStorage.getItem('isSignedIn') === 'true') {
    const userId = localStorage.getItem('userId');
    updateUI(userId);
  } else {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
    });
    google.accounts.id.renderButton(document.querySelector('.g_id_signin'), {
      type: 'standard',
      shape: 'rectangular',
      theme: 'filled_black',
      text: 'signin_with',
      size: 'large',
      logo_alignment: 'left',
      width: '40',
    });
    document.querySelector('.g_id_signin').style.display = 'block';
  }

  document.getElementById('logout-btn').onclick = () => {
    localStorage.removeItem('isSignedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('userSub');
    updateUI(null);
    location.reload(true);
  };
});
