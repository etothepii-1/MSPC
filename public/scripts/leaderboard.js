document.addEventListener('DOMContentLoaded', async () => {
  const usersResponse = await fetch('/get-all-users');
  const usersJson = await usersResponse.json();
  const users = usersJson.users;
  const userIndex = usersJson.userIndex;
  let i = 0,
    j = 0;
  users.forEach((user) => {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.scope = 'row';
    if (j === userIndex) tr.classList.add('table-active');
    if (user.role === '') {
      th.textContent = i + 1;
      i++;
    } else th.textContent = user.role;
    const tdUserId = document.createElement('td');
    tdUserId.textContent = user.id;
    const tdTotalScore = document.createElement('td');
    tdTotalScore.textContent = user.totalScore;
    const tdScoreUpdate = document.createElement('td');
    const scoreUpdate = new Date(user.scoreUpdate);
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
