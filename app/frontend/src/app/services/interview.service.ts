import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InterviewService {
  private apiUrl = '/api/interviews';

  constructor(private http: HttpClient) {}

  create(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, data);
  }

  getAll(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  update(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  addFeedback(id: string, feedback: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/feedback`, feedback);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
