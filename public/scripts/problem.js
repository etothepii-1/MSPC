document.addEventListener('DOMContentLoaded', () => {
  let initLanguage = document.getElementById('language').value;
  if (sessionStorage.getItem('init-language') === 'true') initLanguage = sessionStorage.getItem('language');
  const languageMap = { 49: 'c', 53: 'cpp', 71: 'python', 62: 'java', 73: 'rust', 60: 'go', 51: 'csharp', 63: 'javascript', 72: 'ruby' };
  initLanguage = languageMap[initLanguage];
  document.getElementById(initLanguage).selected = true;
  let editor;
  require.config({ paths: { vs: 'https://unpkg.com/monaco-editor/min/vs' } });
  require(['vs/editor/editor.main'], () => {
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

    document.getElementById('language').addEventListener('change', (event) => {
      let language = event.target.value;
      language = languageMap[language];
      monaco.editor.setModelLanguage(editor.getModel(), language);
    });

    document.getElementById('submit-form').addEventListener('submit', async (event) => {
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
          body: JSON.stringify({ problemId, language, code }),
        });
        const data = await response.json();
        const modalBody = document.getElementById('modalBody');
        const resultMessages = {
          3: { text: '맞았습니다!', color: '#009874', fontWeight: 'bold' },
          4: { text: '틀렸습니다', color: '#dd4124' },
          5: { text: '시간 초과', color: '#fa7268' },
          6: { text: '컴파일 에러', color: '#0f4c81' },
          13: { text: '컴파일 에러', color: '#0f4c81' },
          14: { text: '컴파일 에러', color: '#0f4c81' },
          default: { text: '런타임 에러', color: '#5f4b8b' },
        };
        const result = resultMessages[data.result] || resultMessages.default;
        modalBody.textContent = result.text;
        modalBody.style.color = result.color;
        if (result.fontWeight) modalBody.style.fontWeight = result.fontWeight;
        document.getElementById('close-button').style.display = 'block';
      } else {
        alert('내용을 입력하세요');
      }
    });
  });

  document.getElementById('close-button').addEventListener('click', () => {
    const code = editor.getValue();
    const language = document.getElementById('language').value;
    sessionStorage.setItem('code', code);
    sessionStorage.setItem('init-language', true);
    sessionStorage.setItem('language', language);
    location.reload(true);
  });
});
