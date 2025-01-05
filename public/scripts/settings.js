(async () => {
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
})();
