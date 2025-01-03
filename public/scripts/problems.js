document.addEventListener('DOMContentLoaded', async () => {
  const userDataResponse = await fetch('/get-user');
  let userData;
  try {
    userData = await userDataResponse.json();
  } catch {
    userData = undefined;
  }
  if (userData) {
    const problemResponse = await fetch('/get-all-problems');
    const problems = await problemResponse.json();
    if (problems.started !== false) {
      const userResponse = await fetch('/get-user');
      const user = await userResponse.json();
      let totalScore = 0;
      const userProblemScore = new Map(Object.entries(user.problem_score));
      problems.forEach((problem) => {
        const problemLink = document.createElement('a');
        problemLink.href = `/problems/${problem.id}`;
        problemLink.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        const problemTitle = document.createElement('h5');
        problemTitle.className = 'col-8 my-1';
        problemTitle.innerHTML = `${problem.id}.&ensp;${problem.title}`;
        problemLink.appendChild(problemTitle);
        const problemProgress = document.createElement('div');
        problemProgress.className = 'progress col-4';
        problemProgress.style.height = '30px';
        const problemProgressBar = document.createElement('div');
        problemProgressBar.className = 'progress-bar bg-dark';
        problemProgressBar.style.width = `${((userProblemScore.get(`${problem.id}`) ?? 0) / problem.score) * 100}%`;
        problemProgressBar.textContent = `${userProblemScore.get(`${problem.id}`) ?? 0}/${problem.score}`;
        problemProgress.appendChild(problemProgressBar);
        if (!userProblemScore.get(`${problem.id}`)) problemProgress.textContent = `/${problem.score}`;
        problemLink.appendChild(problemProgress);
        document.querySelector('.list-group').appendChild(problemLink);
        totalScore += problem.score;
      });
      const userTotalScore = user.total_score ?? 0;
      const totalScoreProgressBar = document.getElementById('total-score-bar');
      totalScoreProgressBar.style.width = `${(userTotalScore / totalScore) * 100}%`;
      totalScoreProgressBar.textContent = `${userTotalScore}/${totalScore}`;
      if (!userTotalScore) document.getElementById('total-score').textContent = `/${totalScore}`;
    } else {
      document.querySelector('.mt-3').style.display = 'none';
      document.querySelector('.progress').style.display = 'none';
      const notStarted = document.createElement('h1');
      notStarted.className = 'mt-4';
      const notStartedBold = document.createElement('b');
      notStartedBold.textContent = '대회 시작 전입니다';
      notStarted.appendChild(notStartedBold);
      document.querySelector('.container').appendChild(notStarted);
    }
  } else {
    document.querySelector('.mt-3').style.display = 'none';
    document.querySelector('.progress').style.display = 'none';
    const requireLogin = document.createElement('h1');
    requireLogin.className = 'mt-4';
    const requireLoginBold = document.createElement('b');
    requireLoginBold.textContent = '로그인해주세요';
    requireLogin.appendChild(requireLoginBold);
    document.querySelector('.container').appendChild(requireLogin);
  }
  document.body.style.visibility = 'visible';
});
