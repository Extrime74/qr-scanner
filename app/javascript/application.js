import { BrowserMultiFormatReader } from '@zxing/browser';

document.addEventListener('DOMContentLoaded', async () => {
  const videoElement = document.getElementById('qr-video');
  const statusElement = document.getElementById('camera-status');

  if (!videoElement) return;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    statusElement.textContent = 'Ваш браузер не поддерживает доступ к камере';
    return;
  }

  const codeReader = new BrowserMultiFormatReader();
  let scanningActive = true; // Флаг для контроля процесса сканирования

  try {
    statusElement.textContent = 'Запрашиваем доступ к камере...';

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });

    videoElement.srcObject = stream;
    videoElement.play();
    statusElement.textContent = 'Камера активна. Наведите на QR-код...';

    codeReader.decodeFromVideoElement(videoElement, (result, error) => {
      if (!scanningActive) return; // Если сканирование остановлено, ничего не делаем

      if (result) {
        console.log('Найден QR-код:', result.text);
        scanningActive = false; // Останавливаем дальнейшее сканирование
        takeScreenshot(result.text);
      }
      if (error && !error.message.includes('No MultiFormat Readers were able to detect the code')) {
        console.error('Ошибка сканирования:', error);
      }
    });

  } catch (error) {
    console.error('Ошибка камеры:', error);
    statusElement.textContent = `Ошибка: ${error.message}`;

    if (error.name === 'NotAllowedError') {
      statusElement.textContent = 'Доступ к камере запрещен. Разрешите доступ в настройках браузера.';
    }
  }

  function takeScreenshot(qrText) {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0);

    const screenshot = canvas.toDataURL('image/png');
    showResult(qrText, screenshot);
  }

  function showResult(text, screenshot) {
    // Останавливаем поток камеры
    if (videoElement.srcObject) {
      videoElement.srcObject.getTracks().forEach(track => track.stop());
    }

    // Уменьшаем размер скриншота (если нужно)
    const compressedScreenshot = compressScreenshot(screenshot);

    // Отправляем данные на сервер
    fetch('/save_scan_result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Явно указываем ожидаемый формат
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({
        text: text,
        image: compressedScreenshot,
        date: new Date().toLocaleString()
      })
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      if (data.status === 'success') {
        window.location.href = '/scan_result';
      } else {
        console.error('Ошибка сервера:', data.message);
        alert('Ошибка сохранения результата. Попробуйте ещё раз.');
      }
    })
    .catch(error => {
      console.error('Ошибка:', error);
      alert('Произошла ошибка: ' + error.message);
    });
  }

  function compressScreenshot(dataUrl, quality = 0.7) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width * 0.5; // Уменьшаем размер
        canvas.height = img.height * 0.5;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = dataUrl;
    });
  }
});