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
  await fetch('/user-register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userName, userSub }),
  });
  location.reload(true);
}

document.addEventListener('DOMContentLoaded', async () => {
  if (document.querySelector('.g_id_signin')) {
    try {
      const response = await fetch('/get-client-id');
      const data = await response.json();
      const clientId = data.clientId;
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });
      sessionStorage.removeItem('reloadAttempts');
    } catch {
      const reloadAttempts = parseInt(sessionStorage.getItem('reloadAttempts') || '0');
      if (reloadAttempts < 3) {
        sessionStorage.setItem('reloadAttempts', reloadAttempts + 1);
        setTimeout(() => {
          location.reload(true);
        }, 10);
      } else {
        alert('탭이나 브라우저를 닫았다가 재접속해주세요. 재접속해도 문제가 계속되면 크롬 브라우저를 사용해주세요.');
        setTimeout(() => {
          location.reload(true);
        }, 10);
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
  }

  document.getElementById('logout-btn').onclick = async (event) => {
    event.preventDefault();
    await fetch('/logout');
    location.reload(true);
  };
});
