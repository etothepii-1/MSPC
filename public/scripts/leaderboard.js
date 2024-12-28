document.addEventListener('DOMContentLoaded', async () => {
  const userSub = localStorage.getItem('userSub');
  const usersResponse = await fetch('/get-all-users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userSub: userSub }),
  });
  const usersJson = await usersResponse.json();
  const users = usersJson.users;
  const userIndex = usersJson.user_index;
  let i = 0,
    j = 0;
  users.forEach((user) => {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.scope = 'row';
    if (j === userIndex) tr.classList.add('table-active');
    if (user.position === '') {
      th.textContent = i + 1;
      i++;
    } else th.textContent = user.position;
    const tdUserId = document.createElement('td');
    tdUserId.textContent = user.id;
    const tdTotalScore = document.createElement('td');
    tdTotalScore.textContent = user.total_score;
    const tdScoreUpdate = document.createElement('td');
    const scoreUpdate = new Date(user.score_update);
    scoreUpdate.setHours(scoreUpdate.getHours() + 9);
    tdScoreUpdate.textContent = scoreUpdate.toISOString().replace('T', ' ').slice(0, -1);
    tr.appendChild(th);
    tr.appendChild(tdUserId);
    tr.appendChild(tdTotalScore);
    tr.appendChild(tdScoreUpdate);
    document.querySelector('tbody').appendChild(tr);
    j++;
  });
  document.body.style.visibility = 'visible';
});
