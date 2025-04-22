

import { Component } from '@angular/core';
import { AudioService } from 'src/app/servicios/audio.service';

@Component({
  selector: 'app-grabador',
  templateUrl: './grabador.component.html',
})
export class GrabadorComponent {
  mediaRecorder!: MediaRecorder;
  audioChunks: BlobPart[] = [];
  audioBlob: Blob | null = null;
  audioURL: string | null = null;
  isRecording = false;
  resumen: string[] = [];
  isLoading = false;
  fileInfo: any = null;
  errorMessage: string | null = null;

  constructor(private audioService: AudioService) {}

  startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.errorMessage = 'Este navegador no soporta grabación de audio.';
      return;
    }
    this.errorMessage = null;
    this.resumen = [];
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        // Elegimos el mimeType soportado
        let options: MediaRecorderOptions = {};
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options.mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          options.mimeType = 'audio/webm';
        } else {
          console.warn('No se soporta webm en este navegador, usando default.');
        }

        this.mediaRecorder = new MediaRecorder(stream, options);
        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
          console.log('Chunk disponible', event.data);
          this.audioChunks.push(event.data);
        };

        this.mediaRecorder.onstop = () => {
          console.log('Grabación detenida, montando Blob...');
          this.audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType });
          this.audioURL = URL.createObjectURL(this.audioBlob);
          this.fileInfo = {
            originalName: 'grabacion.webm',
            mimeType: this.audioBlob.type,
            filename: 'grabacion.webm',
            size: this.audioBlob.size
          };
        };

        this.mediaRecorder.onerror = (err) => {
          console.error('Error en MediaRecorder:', err);
          this.errorMessage = 'Error grabando audio.';
        };

        this.mediaRecorder.start();
        this.isRecording = true;
        console.log('MediaRecorder iniciado con opciones', options);
      })
      .catch(err => {
        console.error('getUserMedia fallo:', err);
        this.errorMessage = 'No se pudo acceder al micrófono.';
      });
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      console.log('Invocado stopRecording()');
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      this.audioBlob = file;
      this.audioURL = URL.createObjectURL(file);
      this.resumen = [];
      this.fileInfo = {
        originalName: file.name,
        mimeType: file.type,
        filename: file.name,
        size: file.size
      };
    } else {
      alert('Por favor selecciona un archivo de audio válido.');
    }
  }

  enviarAudio() {
    if (!this.audioBlob) return;
    this.isLoading = true;
    this.errorMessage = null;
    this.resumen = [];

    console.log('Enviando audio:', this.fileInfo);
    this.audioService.subirAudio(this.audioBlob).subscribe(
      res => {
        console.log('Respuesta backend:', res);
        this.resumen = res.resumen;
        this.isLoading = false;
      },
      err => {
        console.error('Error backend:', err);
        this.errorMessage = err.error?.error || 'Error interno del servidor';
        this.isLoading = false;
      }
    );
  }
}
