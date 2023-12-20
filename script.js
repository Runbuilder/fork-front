function handleFileSelect(event) {
  previewImage(event);

  // 파일이 선택되면 버튼 활성화
  const hasFile = event.target.files.length > 0;
  document.getElementById('generateButton').disabled = !hasFile;
}

function previewImage(event) {
  var reader = new FileReader();
  reader.onload = function() {
    var output = document.getElementById('imagePreview');
    output.src = reader.result;
    output.classList.remove('hidden');
  };
  reader.readAsDataURL(event.target.files[0]);
}

function generateContent() {
  document.getElementById('response').innerHTML = '';
  const imageInput = document.getElementById('imageInput');
  const textInput = document.getElementById('textInput').value;

  if (imageInput.files.length === 0) {
    Swal.fire({
      title: '경고',
      text: '사진을 먼저 선택해주세요.',
      icon: 'warning',
      confirmButtonText: '확인'
    });
    return;
  }

  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('generateButton').classList.add('hidden');

  const formData = new FormData();
  formData.append('image', imageInput.files[0]);
  formData.append('text', textInput); // 텍스트 데이터 추가

  const jcookUrl = 'https://port-0-jcook-9zxht12blq81t0ot.sel4.cloudtype.app/generate'
  fetch(jcookUrl, {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      const titleMatch = data.generatedText.match(/\*\*(.*?)\*\*/);
      const title = titleMatch ? titleMatch[1] : '분석 결과';

      // '**제목**' 제거 및 마침표 기준으로 줄바꿈 추가
      let content = data.generatedText.replace(/\*\*.*?\*\*/g, '').trim();

      // 숫자 다음의 마침표를 제외하고, 마침표 뒤에 줄바꿈 추가
      content = content.split('.').map((sentence, index, array) => {
        if (index < array.length - 1 && !sentence.match(/\d$/)) {
          return sentence + '.<br>';
        }
        return sentence;
      }).join('');


      // '만드는 방법' 주위에 줄바꿈 추가
      content = content.replace(/만드는 방법/g, '<br><br><b>😁만드는 방법</b><br>');


      Swal.fire({
        title: title,
        html: content,
        icon: 'info',
        confirmButtonText: '닫기'
      });

      document.getElementById('loading').classList.add('hidden');
      document.getElementById('generateButton').classList.remove('hidden');
    })
    .catch(error => {
      console.error('Error:', error);
      Swal.fire({
        title: '에러',
        text: '분석 중 에러가 발생했습니다!',
        icon: 'error',
        confirmButtonText: '닫기'
      });
      document.getElementById('loading').classList.add('hidden');
      document.getElementById('generateButton').classList.remove('hidden');
    });
}