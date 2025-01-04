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
    body: JSON.stringify({ userName, userSub }),
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
  const userId = await userRegister(userName, userSub);
  updateUI(userId);
  location.reload(true);
}

document.addEventListener('DOMContentLoaded', async () => {
  const clientId = await loadGoogleSignIn();
  const userDataResponse = await fetch('/get-user');
  let userData;
  try {
    userData = await userDataResponse.json();
  } catch {
    userData = undefined;
  }
  if (userData) {
    const userId = userData.id;
    updateUI(userId);
  } else {
    try {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });
      sessionStorage.removeItem('reloadAttempts');
    } catch {
      const reloadAttempts = parseInt(sessionStorage.getItem('reloadAttempts') || '0');
      if (reloadAttempts < 5) {
        sessionStorage.setItem('reloadAttempts', reloadAttempts + 1);
        setTimeout(() => {
          location.reload(true);
        }, 100);
      } else {
        alert('탭이나 브라우저를 닫았다가 재접속해주세요. 재접속해도 문제가 계속되면 크롬 브라우저를 사용해주세요.');
        setTimeout(() => {
          location.reload(true);
        }, 100);
      }
    }
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

  document.getElementById('logout-btn').onclick = async () => {
    await fetch('/logout');
    updateUI(null);
    location.reload(true);
  };
});
