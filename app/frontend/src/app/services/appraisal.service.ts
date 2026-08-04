import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppraisalService {
  private apiUrl = '/api/appraisals';

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

  getByEmployee(employeeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/employee/${employeeId}`);
  }

  submitSelfEval(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/self`, data);
  }

  submitManagerEval(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/manager`, data);
  }

  complete(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/complete`, {});
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
