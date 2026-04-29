import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly apiUrl = `${environment.apiUrl}/upload`;

  constructor(private http: HttpClient) {}

  uploadSingle(file: File, folder?: string): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    return this.http.post<UploadResponse>(`${this.apiUrl}/single`, formData);
  }

  uploadMultiple(files: File[], folder?: string): Observable<UploadResponse[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (folder) formData.append('folder', folder);
    return this.http.post<UploadResponse[]>(`${this.apiUrl}/multiple`, formData);
  }

  uploadProductImage(file: File, productId: string): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productId', productId);
    return this.http.post<UploadResponse>(`${this.apiUrl}/product`, formData);
  }

  uploadServiceImage(file: File, serviceId: string): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('serviceId', serviceId);
    return this.http.post<UploadResponse>(`${this.apiUrl}/service`, formData);
  }

  getFileUrl(filename: string): string {
    return `${environment.apiUrl}/upload/file/${filename}`;
  }

  deleteFile(filename: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/file/${filename}`);
  }
}
