import { Component } from '@angular/core';
import { AudioService } from 'src/app/servicios/audio.service';

@Component({
  selector: 'app-grabador',
  templateUrl: './grabador.component.html',
})
export class GrabadorComponent {
  mediaRecorder!: MediaRecorder;
  audioChunks: any[] = [];
  audioBlob: Blob | null = null;
  audioURL: string | null = null;
  isRecording = false;
  resumen: string[] = [];
  isLoading: boolean = false; // para el loader
  fileInfo: any = null;       // para mostrar datos del archivo
  errorMessage: string | null = null;  // <-- nuevo

  constructor(private audioService: AudioService) {}

  // Función para grabar audio en tiempo real
  startRecording() {
    this.isRecording = true;
    this.resumen = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      this.mediaRecorder.start();

      this.audioChunks = [];

      this.mediaRecorder.addEventListener("dataavailable", event => {
        this.audioChunks.push(event.data);
      });

      this.mediaRecorder.addEventListener("stop", () => {
        this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioURL = URL.createObjectURL(this.audioBlob);
        // Al grabar en el momento, simulamos algunos datos para mostrar
        this.fileInfo = {
          originalName: 'grabacion.webm',
          mimeType: this.audioBlob.type,
          filename: 'grabacion.webm',
          size: this.audioBlob.size
        };
      });
    });
  }

  // Detiene la grabación
  stopRecording() {
    this.isRecording = false;
    this.mediaRecorder.stop();
  }

  // Selecciona un archivo de audio ya grabado desde el dispositivo
  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file && file.type.startsWith('audio/')) {
      this.audioBlob = file;
      this.audioURL = URL.createObjectURL(file);
      this.resumen = [];
      // Guarda los detalles del archivo para mostrarlos en el HTML
      this.fileInfo = {
        originalName: file.name,
        mimeType: file.type,
        filename: file.name,
        size: file.size
      };
    } else {
      alert("Por favor selecciona un archivo de audio válido.");
    }
  }

  // Envía el audio al backend y muestra un loader hasta recibir la respuesta
  enviarAudio() {
    if (this.audioBlob) {
      this.isLoading = true;
      this.errorMessage = null;                    // limpia errores previos
      this.resumen = [];                           // limpia resumen previo

      this.audioService.subirAudio(this.audioBlob).subscribe(
        res => {
          this.resumen = res.resumen;
          this.isLoading = false;
        },
        err => {
          console.error(err);
          // Si el backend envía { error: 'mensaje...' }, lo usamos;
          // si no, caemos a un mensaje genérico.
          this.errorMessage = err.error?.error 
            || 'Ha ocurrido un error procesando el audio.';
          this.isLoading = false;
        }
      );
    }
  }
}

