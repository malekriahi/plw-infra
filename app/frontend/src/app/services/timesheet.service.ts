import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DayHours { mon: number; tue: number; wed: number; thu: number; fri: number; }
export interface TimesheetEntry { ticketId: string; ticketTitle: string; category: string; hours: DayHours; }
export interface Timesheet {
  _id?: string;
  employeeId: string;
  weekStartDate: string;
  entries: TimesheetEntry[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

@Injectable({ providedIn: 'root' })
export class TimesheetService {
  private api = '/api/timesheets';

  constructor(private http: HttpClient) {}

  getWeek(employeeId: string, date?: string): Observable<Timesheet> {
    let params = new HttpParams().set('employeeId', employeeId);
    if (date) params = params.set('date', date);
    return this.http.get<Timesheet>(`${this.api}/week`, { params });
  }

  getByEmployee(employeeId: string): Observable<Timesheet[]> {
    return this.http.get<Timesheet[]>(`${this.api}/employee/${employeeId}`);
  }

  save(payload: Partial<Timesheet>): Observable<Timesheet> {
    return this.http.post<Timesheet>(`${this.api}/save`, payload);
  }

  submit(payload: Partial<Timesheet>): Observable<any> {
    return this.http.post<any>(`${this.api}/submit`, payload);
  }

  // Admin
  getAll(status?: string): Observable<Timesheet[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Timesheet[]>(`${this.api}/all`, { params });
  }

  approve(id: string, adminId: string): Observable<Timesheet> {
    return this.http.put<Timesheet>(`${this.api}/${id}/approve`, { adminId });
  }

  reject(id: string, reason: string): Observable<Timesheet> {
    return this.http.put<Timesheet>(`${this.api}/${id}/reject`, { reason });
  }
}
