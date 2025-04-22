// import { Component, NgZone } from '@angular/core';
// import { AudioService } from 'src/app/servicios/audio.service';

// @Component({
//   selector: 'app-grabador',
//   templateUrl: './grabador.component.html',
// })
// export class GrabadorComponent {
//   mediaRecorder!: MediaRecorder;
//   audioChunks: BlobPart[] = [];
//   audioBlob: File | null = null;
//   audioURL: string | null = null;
//   isRecording = false;
//   resumen: string[] = [];
//   isLoading = false;
//   fileInfo: any = null;
//   errorMessage: string | null = null;

//   constructor(private audioService: AudioService, private ngZone: NgZone) {}

//   startRecording() {
//     if (!navigator.mediaDevices?.getUserMedia) {
//       this.errorMessage = 'Este navegador no soporta grabación de audio.';
//       return;
//     }
//     this.errorMessage = null;
//     this.resumen = [];
//     navigator.mediaDevices.getUserMedia({ audio: true })
//       .then(stream => {
//         let options: MediaRecorderOptions = {};
//         if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
//           options.mimeType = 'audio/webm;codecs=opus';
//         } else if (MediaRecorder.isTypeSupported('audio/webm')) {
//           options.mimeType = 'audio/webm';
//         } else {
//           console.warn('No se soporta webm en este navegador, usando default.');
//         }

//         this.mediaRecorder = new MediaRecorder(stream, options);
//         this.audioChunks = [];

//         this.mediaRecorder.ondataavailable = event => {
//           console.log('Chunk disponible:', event.data);
//           this.audioChunks.push(event.data);
//         };

//         this.mediaRecorder.onerror = err => {
//           console.error('Error en MediaRecorder:', err);
//           this.errorMessage = 'Error grabando audio.';
//         };

//         this.mediaRecorder.onstop = () => {
//           console.log('Grabación detenida, chunks recibidos:', this.audioChunks.length);
//           const blob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType });
//           const file = new File([blob], 'grabacion.webm', { type: blob.type });
//           console.log('Blob final size:', file.size);

//           const url = URL.createObjectURL(file);
//           this.ngZone.run(() => {
//             this.audioBlob = file;
//             this.audioURL = url;
//             this.fileInfo = {
//               originalName: file.name,
//               mimeType: file.type,
//               filename: file.name,
//               size: file.size
//             };
//           });
//         };

//         this.mediaRecorder.start();
//         this.isRecording = true;
//         console.log('MediaRecorder iniciado con opciones', options);
//       })
//       .catch(err => {
//         console.error('getUserMedia falló:', err);
//         this.errorMessage = 'No se pudo acceder al micrófono.';
//       });
//   }

//   stopRecording() {
//     if (this.mediaRecorder && this.isRecording) {
//       this.mediaRecorder.stop();
//       this.isRecording = false;
//       console.log('Invocado stopRecording()');
//     }
//   }

//   onFileSelected(event: any) {
//     const file: File = event.target.files[0];
//     if (file && file.type.startsWith('audio/')) {
//       this.audioBlob = file;
//       this.audioURL = URL.createObjectURL(file);
//       this.resumen = [];
//       this.fileInfo = {
//         originalName: file.name,
//         mimeType: file.type,
//         filename: file.name,
//         size: file.size
//       };
//     } else {
//       alert('Por favor selecciona un archivo de audio válido.');
//     }
//   }

//   enviarAudio() {
//     if (!this.audioBlob) return;
//     this.isLoading = true;
//     this.errorMessage = null;
//     this.resumen = [];

//     console.log('Enviando audio:', this.fileInfo);
//     this.audioService.subirAudio(this.audioBlob).subscribe(
//       res => {
//         console.log('Respuesta backend:', res);
//         this.resumen = res.resumen;
//         this.isLoading = false;
//       },
//       err => {
//         console.error('Error backend:', err);
//         this.errorMessage = err.error?.error || 'Error interno del servidor';
//         this.isLoading = false;
//       }
//     );
//   }
// }


import { Component, NgZone } from '@angular/core';
import { AudioService } from 'src/app/servicios/audio.service';

@Component({
  selector: 'app-grabador',
  templateUrl: './grabador.component.html',
})
export class GrabadorComponent {
  mediaRecorder!: MediaRecorder;
  audioChunks: BlobPart[] = [];
  audioBlob: File | null = null;
  audioURL: string | null = null;
  isRecording = false;
  resumen: string[] = [];
  isLoading = false;
  fileInfo: any = null;
  errorMessage: string | null = null;

  constructor(private audioService: AudioService, private ngZone: NgZone) {}

  startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.errorMessage = 'Este navegador no soporta grabación de audio.';
      return;
    }
    this.errorMessage = null;
    this.resumen = [];
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        let options: MediaRecorderOptions = {};
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options.mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          options.mimeType = 'audio/webm';
        }

        this.mediaRecorder = new MediaRecorder(stream, options);
        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = event => {
          this.audioChunks.push(event.data);
        };

        this.mediaRecorder.onerror = err => {
          console.error('Error en MediaRecorder:', err);
          this.errorMessage = 'Error grabando audio.';
        };

        this.mediaRecorder.onstop = async () => {
          // 1) blob WebM original
          const blob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType });
          console.log('Chunks recibidos:', this.audioChunks.length, 'Size:', blob.size);

          // 2) convertimos a WAV PCM 16 kHz mono
          try {
            const wavBuffer = await this.convertToWav(blob);
            const wavFile   = new File([wavBuffer], 'grabacion.wav', { type: 'audio/wav' });
            const url       = URL.createObjectURL(wavFile);

            this.ngZone.run(() => {
              this.audioBlob = wavFile;
              this.audioURL  = url;
              this.fileInfo = {
                originalName: wavFile.name,
                mimeType: wavFile.type,
                filename:   wavFile.name,
                size:       wavFile.size
              };
            });
          } catch (e) {
            console.error('Error convirtiendo a WAV:', e);
            this.errorMessage = 'Falló la conversión de audio.';
          }
        };

        this.mediaRecorder.start();
        this.isRecording = true;
      })
      .catch(err => {
        console.error('getUserMedia falló:', err);
        this.errorMessage = 'No se pudo acceder al micrófono.';
      });
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      this.audioBlob = file;
      this.audioURL  = URL.createObjectURL(file);
      this.resumen   = [];
      this.fileInfo  = {
        originalName: file.name,
        mimeType:     file.type,
        filename:     file.name,
        size:         file.size
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

    this.audioService.subirAudio(this.audioBlob).subscribe(
      res => {
        this.resumen = res.resumen;
        this.isLoading = false;
      },
      err => {
        this.errorMessage = err.error?.error || 'Error interno del servidor';
        this.isLoading = false;
      }
    );
  }

  // —————— Conversión a WAV puro ——————

  private async convertToWav(blob: Blob): Promise<ArrayBuffer> {
    // Decodifica a AudioBuffer con sampleRate 16 kHz
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new AudioContext({ sampleRate: 16000 });
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // Forzar mono (promedio de canales si >1)
    const nch = audioBuffer.numberOfChannels;
    const len = audioBuffer.length;
    const bufferData = audioBuffer.getChannelData(0);
    if (nch > 1) {
      for (let i = 0; i < len; i++) {
        let sum = bufferData[i];
        for (let c = 1; c < nch; c++) {
          sum += audioBuffer.getChannelData(c)[i];
        }
        bufferData[i] = sum / nch;
      }
    }

    return this.encodeWAV([bufferData], 16000);
  }

  private encodeWAV(channels: Float32Array[], sampleRate: number): ArrayBuffer {
    const len = channels[0].length;
    const buffer = new ArrayBuffer(44 + len * 2);
    const view = new DataView(buffer);

    // RIFF header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + len * 2, true);
    this.writeString(view, 8, 'WAVE');

    // fmt chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);          // chunk size
    view.setUint16(20, 1, true);           // PCM
    view.setUint16(22, 1, true);           // mono
    view.setUint32(24, sampleRate, true);  // sample rate
    view.setUint32(28, sampleRate * 2, true); // byte rate
    view.setUint16(32, 2, true);           // block align
    view.setUint16(34, 16, true);          // bits/sample

    // data chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, len * 2, true);

    // samples
    let offset = 44;
    const samples = channels[0];
    for (let i = 0; i < len; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return buffer;
  }

  private writeString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }
}


