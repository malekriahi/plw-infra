import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WFHService {
  private apiUrl = '/api/wfh';

  constructor(private http: HttpClient) {}

  request(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, data);
  }

  approve(id: string, approvedBy: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/approve`, { approvedBy });
  }

  reject(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/reject`, {});
  }

  getAll(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }

  getToday(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/today`);
  }
}
