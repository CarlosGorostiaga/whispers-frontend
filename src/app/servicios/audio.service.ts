import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  // private apiUrl = 'http://localhost:3000/api/audio';
  private apiUrl = 'https://whispers-backend-production.up.railway.app/api/audio';

  constructor(private http: HttpClient) {}

  subirAudio(blob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('audio', blob, 'grabacion.webm');

    return this.http.post<any>(this.apiUrl, formData);
  }
}
