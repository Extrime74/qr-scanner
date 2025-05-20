import { BrowserMultiFormatReader } from '@zxing/browser';

document.addEventListener('DOMContentLoaded', async () => {
  const videoElement = document.getElementById('qr-video');
  const statusElement = document.getElementById('camera-status');

  if (!videoElement) return;

  // Проверка поддержки MediaDevices
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    statusElement.textContent = 'Ваш браузер не поддерживает доступ к камере';
    return;
  }

  const codeReader = new BrowserMultiFormatReader();

  try {
    statusElement.textContent = 'Запрашиваем доступ к камере...';

    // Явно запрашиваем разрешение на камеру
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

    // Начинаем сканирование
    codeReader.decodeFromVideoElement(videoElement, (result, error) => {
      if (result) {
        console.log('Найден QR-код:', result.text);
        // Остановка сканирования
        codeReader.reset();
        // Делаем скриншот
        takeScreenshot(result.text);
      }
      if (error) {
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
    videoElement.srcObject.getTracks().forEach(track => track.stop());

    // Сохраняем данные
    sessionStorage.setItem('lastScan', JSON.stringify({
      text: text,
      image: screenshot,
      date: new Date().toLocaleString()
    }));

    // Переходим на страницу результата
    window.location.href = '/scan_result';
  }
});