import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-requests',
  template: `
<div style="padding:28px;">
  <div style="margin-bottom:24px;">
    <h1 style="margin:0;font-size:22px;font-weight:700;color:#1a1a2e;">📋 Demandes en attente</h1>
    <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Gérer les demandes de congés et de télétravail</p>
  </div>

  <!-- Tabs -->
  <div style="display:flex;gap:4px;background:#f3f4f6;padding:4px;border-radius:10px;width:fit-content;margin-bottom:24px;">
    <button (click)="tab='conges'"
      [style.background]="tab==='conges' ? '#fff' : 'transparent'"
      [style.color]="tab==='conges' ? '#e91e8c' : '#6b7280'"
      [style.box-shadow]="tab==='conges' ? '0 1px 3px rgba(0,0,0,.1)' : 'none'"
      style="padding:8px 20px;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;">
      📅 Congés <span style="background:#fce7f3;color:#e91e8c;border-radius:20px;padding:1px 8px;font-size:11px;margin-left:4px;">{{ leaves.length }}</span>
    </button>
    <button (click)="tab='wfh'"
      [style.background]="tab==='wfh' ? '#fff' : 'transparent'"
      [style.color]="tab==='wfh' ? '#3b82f6' : '#6b7280'"
      [style.box-shadow]="tab==='wfh' ? '0 1px 3px rgba(0,0,0,.1)' : 'none'"
      style="padding:8px 20px;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;">
      🏠 Télétravail <span style="background:#eff6ff;color:#3b82f6;border-radius:20px;padding:1px 8px;font-size:11px;margin-left:4px;">{{ wfhList.length }}</span>
    </button>
  </div>

  <!-- CONGÉS -->
  <div *ngIf="tab==='conges'">
    <div *ngIf="leaves.length === 0" style="background:#fff;border-radius:12px;padding:40px;text-align:center;color:#9ca3af;box-shadow:0 1px 4px rgba(0,0,0,.06);">
      ✅ Aucune demande de congé en attente
    </div>
    <div *ngFor="let req of leaves" style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:12px;display:flex;align-items:center;gap:16px;">
      <div style="width:44px;height:44px;border-radius:50%;background:#fce7f3;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">📅</div>
      <div style="flex:1;">
        <div style="font-size:14px;font-weight:600;color:#1a1a2e;">{{ req.employeeId?.firstName }} {{ req.employeeId?.lastName }}</div>
        <div style="font-size:12px;color:#6b7280;margin-top:2px;">
          {{ req.startDate | date:'dd/MM/yyyy' }} → {{ req.endDate | date:'dd/MM/yyyy' }}
          &nbsp;·&nbsp; <strong>{{ req.numberOfDays }} jour(s)</strong>
          &nbsp;·&nbsp; <span style="text-transform:capitalize;">{{ req.type }}</span>
        </div>
        <div *ngIf="req.reason" style="font-size:12px;color:#9ca3af;margin-top:2px;">💬 {{ req.reason }}</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button (click)="approveLeave(req._id)"
          style="padding:7px 16px;border:none;border-radius:7px;background:#22c55e;color:#fff;font-size:12px;font-weight:600;cursor:pointer;">
          ✓ Approuver
        </button>
        <button (click)="rejectLeave(req._id)"
          style="padding:7px 16px;border:none;border-radius:7px;background:#ef4444;color:#fff;font-size:12px;font-weight:600;cursor:pointer;">
          ✕ Refuser
        </button>
      </div>
    </div>
  </div>

  <!-- TÉLÉTRAVAIL -->
  <div *ngIf="tab==='wfh'">
    <div *ngIf="wfhList.length === 0" style="background:#fff;border-radius:12px;padding:40px;text-align:center;color:#9ca3af;box-shadow:0 1px 4px rgba(0,0,0,.06);">
      ✅ Aucune demande de télétravail en attente
    </div>
    <div *ngFor="let req of wfhList" style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:12px;display:flex;align-items:center;gap:16px;">
      <div style="width:44px;height:44px;border-radius:50%;background:#eff6ff;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">🏠</div>
      <div style="flex:1;">
        <div style="font-size:14px;font-weight:600;color:#1a1a2e;">{{ req.employeeId?.firstName }} {{ req.employeeId?.lastName }}</div>
        <div style="font-size:12px;color:#6b7280;margin-top:2px;">
          {{ req.date | date:'EEEE dd/MM/yyyy' }}
          <span *ngIf="req.employeeId?.department">&nbsp;·&nbsp; {{ req.employeeId?.department }}</span>
        </div>
        <div *ngIf="req.reason" style="font-size:12px;color:#9ca3af;margin-top:2px;">💬 {{ req.reason }}</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button (click)="approveWFH(req._id)"
          style="padding:7px 16px;border:none;border-radius:7px;background:#22c55e;color:#fff;font-size:12px;font-weight:600;cursor:pointer;">
          ✓ Approuver
        </button>
        <button (click)="rejectWFH(req._id)"
          style="padding:7px 16px;border:none;border-radius:7px;background:#ef4444;color:#fff;font-size:12px;font-weight:600;cursor:pointer;">
          ✕ Refuser
        </button>
      </div>
    </div>
  </div>
</div>
  `,
  styles: []
})
export class RequestsComponent implements OnInit {
  tab: 'conges' | 'wfh' = 'conges';
  leaves: any[] = [];
  wfhList: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadLeaves();
    this.loadWFH();
  }

  loadLeaves() {
    this.http.get<any[]>('/api/days-off/pending').subscribe({
      next: d => this.leaves = d,
      error: () => {}
    });
  }

  loadWFH() {
    this.http.get<any[]>('/api/wfh/pending').subscribe({
      next: d => this.wfhList = d,
      error: () => {}
    });
  }

  approveLeave(id: string) {
    this.http.put(`/api/days-off/${id}/approve`, {}).subscribe(() => this.loadLeaves());
  }

  rejectLeave(id: string) {
    this.http.put(`/api/days-off/${id}/reject`, {}).subscribe(() => this.loadLeaves());
  }

  approveWFH(id: string) {
    this.http.put(`/api/wfh/${id}/approve`, {}).subscribe(() => this.loadWFH());
  }

  rejectWFH(id: string) {
    this.http.put(`/api/wfh/${id}/reject`, {}).subscribe(() => this.loadWFH());
  }
}
