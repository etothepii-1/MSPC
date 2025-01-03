document.addEventListener('DOMContentLoaded', async () => {
  const userDataResponse = await fetch('/get-user');
  let userData;
  try {
    userData = await userDataResponse.json();
  } catch {
    userData = undefined;
  }
  if (userData) {
    const url = window.location.href;
    const idMatch = url.match(/\/problems\/(\d+)/);
    const problemId = idMatch[1];
    const problemExistsResponse = await fetch('/problem-exists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ problemId: problemId }),
    });
    const problemExists = await problemExistsResponse.json();
    if (problemExists.exists) {
      const userResponse = await fetch('/get-user');
      const user = await userResponse.json();
      const problemResponse = await fetch('/get-problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problem_id: problemId }),
      });
      const problem = await problemResponse.json();
      const userProblemScore = new Map(Object.entries(user.problem_score));
      const progressBar = document.getElementById('problem-score-bar');
      progressBar.style.width = `${((userProblemScore.get(problemId) ?? 0) / problem.score) * 100}%`;
      progressBar.textContent = `${userProblemScore.get(`${problemId}`) ?? 0}/${problem.score}`;
      const progress = document.getElementById('problem-score');
      if (!userProblemScore.get(problemId)) progress.textContent = `/${problem.score}`;
      document.getElementById('title').textContent = `${problemId}. ${problem.title}`;
      document.getElementById('description').innerHTML = problem.description;
      document.getElementById('input').innerHTML = problem.input;
      document.getElementById('output').innerHTML = problem.output;

      const sampleCount = problem.sample_input.length;
      const leftContainer = document.getElementById('left-container');
      for (let i = 0; i < sampleCount; i++) {
        const sampleContainer = document.createElement('div');
        sampleContainer.className = 'row mb-4';
        const sampleInputContainer = document.createElement('div');
        sampleInputContainer.className = 'col-6';
        const sampleInputTitleContainer = document.createElement('div');
        sampleInputTitleContainer.style.display = 'flex';
        const sampleInputTitle = document.createElement('h4');
        sampleInputTitle.textContent = `예제 입력 ${i + 1}`;
        const inputCopyButton = document.createElement('button');
        inputCopyButton.type = 'button';
        inputCopyButton.className = 'btn btn-link ms-1';
        inputCopyButton.textContent = '복사';
        inputCopyButton.onclick = () => navigator.clipboard.writeText(problem.sample_input[i]);
        sampleInputTitleContainer.appendChild(sampleInputTitle);
        sampleInputTitleContainer.appendChild(inputCopyButton);
        const sampleInputData = document.createElement('pre');
        sampleInputData.className = 'sample-data';
        sampleInputData.textContent = problem.sample_input[i];
        sampleInputContainer.appendChild(sampleInputTitleContainer);
        sampleInputContainer.appendChild(sampleInputData);
        sampleContainer.appendChild(sampleInputContainer);
        const sampleOutputContainer = document.createElement('div');
        sampleOutputContainer.className = 'col-6';
        const sampleOutputTitleContainer = document.createElement('div');
        sampleOutputTitleContainer.style.display = 'flex';
        const sampleOutputTitle = document.createElement('h4');
        sampleOutputTitle.textContent = `예제 출력 ${i + 1}`;
        const outputCopyButton = document.createElement('button');
        outputCopyButton.type = 'button';
        outputCopyButton.className = 'btn btn-link ms-1';
        outputCopyButton.textContent = '복사';
        outputCopyButton.onclick = () => navigator.clipboard.writeText(problem.sample_output[i]);
        sampleOutputTitleContainer.appendChild(sampleOutputTitle);
        sampleOutputTitleContainer.appendChild(outputCopyButton);
        const sampleOutputData = document.createElement('pre');
        sampleOutputData.className = 'sample-data';
        sampleOutputData.textContent = problem.sample_output[i];
        sampleOutputContainer.appendChild(sampleOutputTitleContainer);
        sampleOutputContainer.appendChild(sampleOutputData);
        sampleContainer.appendChild(sampleOutputContainer);
        leftContainer.appendChild(sampleContainer);
      }
      const timeLimit = document.createElement('h5');
      timeLimit.textContent = `시간 제한: ${problem.time_limit}초`;
      leftContainer.appendChild(timeLimit);
      MathJax.Hub.Queue(['Typeset', MathJax.Hub]);

      let initLanguage = user.language;
      if (sessionStorage.getItem('init-language') === 'true') initLanguage = sessionStorage.getItem('language');
      if (initLanguage == 49) initLanguage = 'c';
      else if (initLanguage === '53') initLanguage = 'cpp';
      else if (initLanguage === '71') initLanguage = 'python';
      else if (initLanguage === '62') initLanguage = 'java';
      else if (initLanguage === '73') initLanguage = 'rust';
      else if (initLanguage === '60') initLanguage = 'go';
      else if (initLanguage === '51') initLanguage = 'csharp';
      else if (initLanguage === '63') initLanguage = 'javascript';
      else if (initLanguage === '72') initLanguage = 'ruby';
      document.getElementById(initLanguage).selected = true;
      let editor;
      require.config({ paths: { vs: 'https://unpkg.com/monaco-editor/min/vs' } });
      require(['vs/editor/editor.main'], function () {
        const initCode = sessionStorage.getItem('code');
        editor = monaco.editor.create(document.getElementById('editor'), {
          value: initCode,
          language: initLanguage,
          theme: 'vs-dark',
          minimap: {
            enabled: false,
          },
        });
        sessionStorage.removeItem('code');
        sessionStorage.removeItem('language');
        sessionStorage.removeItem('init-language');

        document.getElementById('language').addEventListener('change', function (event) {
          let language = event.target.value;
          if (language == 49) language = 'c';
          else if (language === '53') language = 'cpp';
          else if (language === '71') language = 'python';
          else if (language === '62') language = 'java';
          else if (language === '73') language = 'rust';
          else if (language === '60') language = 'go';
          else if (language === '51') language = 'csharp';
          else if (language === '63') language = 'javascript';
          else if (language === '72') language = 'ruby';
          monaco.editor.setModelLanguage(editor.getModel(), language);
        });

        document.getElementById('submit-form').addEventListener('submit', async function (event) {
          event.preventDefault();
          if (editor.getValue() !== '') {
            const modalElement = document.getElementById('result-modal');
            const modalInstance = new bootstrap.Modal(modalElement);
            modalInstance.show();
            const url = window.location.href;
            const idMatch = url.match(/\/problems\/(\d+)/);
            const problemId = idMatch[1];
            const language = document.getElementById('language').value;
            const code = editor.getValue();
            const response = await fetch('/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ problemId: problemId, language: language, code: code }),
            });
            const data = await response.json();
            const modalBody = document.getElementById('modalBody');
            if (data.result === 3) {
              modalBody.textContent = '맞았습니다!';
              modalBody.style.color = '#009874';
              modalBody.style.fontWeight = 'bold';
            } else if (data.result === 4) {
              modalBody.textContent = '틀렸습니다';
              modalBody.style.color = '#dd4124';
            } else if (data.result === 5) {
              modalBody.textContent = '시간 초과';
              modalBody.style.color = '#fa7268';
            } else if (data.result === 6 || data.result === 13 || data.result === 14) {
              modalBody.textContent = '컴파일 에러';
              modalBody.style.color = '#0f4c81';
            } else {
              modalBody.textContent = '런타임 에러';
              modalBody.style.color = '#5f4b8b';
            }
            document.getElementById('close-button').style.display = 'block';
          } else {
            alert('내용을 입력하세요');
          }
        });
      });

      document.getElementById('close-button').addEventListener('click', function () {
        const code = editor.getValue();
        const language = document.getElementById('language').value;
        sessionStorage.setItem('code', code);
        sessionStorage.setItem('init-language', true);
        sessionStorage.setItem('language', language);
        location.reload(true);

        function renderMathJax() {
          MathJax.typeset();
        }
        document.addEventListener('DOMContentLoaded', renderMathJax);
        document.addEventListener('DOMNodeInserted', renderMathJax);
      });
    } else document.querySelector('body').style.display = 'none';
  } else {
    document.querySelector('.row').style.display = 'none';
    const requireLogin = document.createElement('h1');
    requireLogin.className = 'mt-5';
    const requireLoginBold = document.createElement('b');
    requireLoginBold.textContent = '로그인해주세요';
    requireLogin.appendChild(requireLoginBold);
    document.querySelector('.container').appendChild(requireLogin);
  }
  document.body.style.visibility = 'visible';
});
