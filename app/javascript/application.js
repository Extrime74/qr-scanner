// app/javascript/application.js
import "@hotwired/turbo-rails"
import { BrowserMultiFormatReader } from '@zxing/browser'


class QrCodeScanner {
  constructor() {
    this.codeReader = new BrowserMultiFormatReader();
    this.scanButton = document.getElementById('scan-button');
    this.resultElement = document.getElementById('qr-result');
    this.videoElement = document.getElementById('qr-video');
    this.canvasElement = document.getElementById('qr-canvas');
    this.ctx = this.canvasElement.getContext('2d');

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.scanButton.addEventListener('click', async () => {
      try {
        // Захватываем кадр с видео
        this.canvasElement.width = this.videoElement.videoWidth;
        this.canvasElement.height = this.videoElement.videoHeight;
        this.ctx.drawImage(this.videoElement, 0, 0);

        // Декодируем QR-код
        const result = await this.codeReader.decodeFromCanvas(this.canvasElement);
        this.resultElement.textContent = result.text;
      } catch (error) {
        this.resultElement.textContent = `Ошибка: ${error.message}`;
        console.error(error);
      }
    });
  }

  async initCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      this.videoElement.srcObject = stream;
      await this.videoElement.play();
    } catch (error) {
      console.error("Ошибка доступа к камере:", error);
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const scanner = new QrCodeScanner();
  await scanner.initCamera();
});