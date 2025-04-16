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

  constructor(private audioService: AudioService) {}

  startRecording() { // Inicia la grabacion de audio
    this.isRecording = true;
    this.resumen = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.start();

      this.audioChunks = [];

      this.mediaRecorder.addEventListener("dataavailable", event => {
        this.audioChunks.push(event.data);
      });

      this.mediaRecorder.addEventListener("stop", () => {
        this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioURL = URL.createObjectURL(this.audioBlob);
      });
    });
  }

  stopRecording() { // para la grabacion de audio
    this.isRecording = false;
    this.mediaRecorder.stop();
  }

  onFileSelected(event: any) { // Selecciona el archivo directamente del almacenamiento local del movil 
    const file: File = event.target.files[0];

    if (file && file.type.startsWith('audio/')) {
      this.audioBlob = file;
      this.audioURL = URL.createObjectURL(file);
      this.resumen = [];
    } else {
      alert("Por favor selecciona un archivo de audio válido.");
    }
  }

  enviarAudio() { // Lo envia diractemte al Bakend 
    if (this.audioBlob) {
      this.audioService.subirAudio(this.audioBlob).subscribe(res => {
        this.resumen = res.resumen;
      });
    }
  }
}
