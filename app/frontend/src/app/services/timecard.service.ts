import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TimecardService {
  private apiUrl = '/api/timecards';

  constructor(private http: HttpClient) {}

  clockIn(employeeId: string, notes?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/clock-in`, { employeeId, notes });
  }

  clockOut(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/clock-out`, {});
  }

  getByEmployee(employeeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/employee/${employeeId}`);
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}
