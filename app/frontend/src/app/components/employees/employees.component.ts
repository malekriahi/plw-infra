import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-employees',
  template: `
<div style="padding:28px;">
  <div style="margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;">
    <div>
      <h1 style="margin:0;font-size:22px;font-weight:700;color:#1a1a2e;">👥 Employés</h1>
      <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Liste de tous les employés actifs</p>
    </div>
    <div style="font-size:13px;color:#6b7280;background:#fff;padding:8px 16px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
      Total : <strong style="color:#1a1a2e;">{{ employees.length }}</strong>
    </div>
  </div>

  <!-- Barre de recherche -->
  <div style="background:#fff;border-radius:12px;padding:16px 20px;box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:20px;">
    <input [(ngModel)]="search" placeholder="🔍 Rechercher par nom, email ou département..."
      style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;outline:none;box-sizing:border-box;">
  </div>

  <!-- Tableau -->
  <div style="background:#fff;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.06);overflow:hidden;">
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:#f9fafb;border-bottom:1px solid #e5e7eb;">
          <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Employé</th>
          <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Email</th>
          <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Département</th>
          <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Poste</th>
          <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Congés restants</th>
          <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Rôle</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let emp of filtered" style="border-bottom:1px solid #f3f4f6;">
          <td style="padding:14px 16px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:36px;height:36px;border-radius:50%;background:#e91e8c22;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#e91e8c;flex-shrink:0;">
                {{ (emp.firstName?.[0] || '') + (emp.lastName?.[0] || '') | uppercase }}
              </div>
              <div>
                <div style="font-size:14px;font-weight:600;color:#1a1a2e;">{{ emp.firstName }} {{ emp.lastName }}</div>
                <div style="font-size:11px;color:#9ca3af;">Depuis {{ emp.startDate | date:'MMM yyyy' }}</div>
              </div>
            </div>
          </td>
          <td style="padding:14px 16px;font-size:13px;color:#374151;">{{ emp.email }}</td>
          <td style="padding:14px 16px;">
            <span style="background:#f3f4f6;padding:3px 10px;border-radius:20px;font-size:12px;color:#374151;">{{ emp.department || '—' }}</span>
          </td>
          <td style="padding:14px 16px;font-size:13px;color:#374151;">{{ emp.position || '—' }}</td>
          <td style="padding:14px 16px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="flex:1;height:6px;background:#f3f4f6;border-radius:3px;max-width:80px;">
                <div [style.width.%]="(emp.remainingLeaveDays / 30) * 100"
                     style="height:100%;border-radius:3px;"
                     [style.background]="emp.remainingLeaveDays > 10 ? '#22c55e' : emp.remainingLeaveDays > 5 ? '#f59e0b' : '#ef4444'"></div>
              </div>
              <span style="font-size:13px;font-weight:600;color:#374151;">{{ emp.remainingLeaveDays || 0 }}/30</span>
            </div>
          </td>
          <td style="padding:14px 16px;">
            <span [style.background]="emp.role === 'admin' ? '#fce7f3' : '#eff6ff'"
                  [style.color]="emp.role === 'admin' ? '#e91e8c' : '#3b82f6'"
                  style="padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;text-transform:capitalize;">
              {{ emp.role === 'admin' ? 'Admin RH' : 'Employé' }}
            </span>
          </td>
        </tr>
        <tr *ngIf="filtered.length === 0">
          <td colspan="6" style="padding:40px;text-align:center;color:#9ca3af;font-size:14px;">Aucun employé trouvé</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div *ngIf="loading" style="text-align:center;padding:40px;color:#9ca3af;">Chargement...</div>
</div>
  `,
  styles: []
})
export class EmployeesComponent implements OnInit {
  employees: any[] = [];
  search = '';
  loading = true;

  get filtered() {
    const q = this.search.toLowerCase();
    return this.employees.filter(e =>
      !q ||
      (e.firstName + ' ' + e.lastName).toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.department?.toLowerCase().includes(q)
    );
  }

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.http.get<any[]>('/api/employees').subscribe({
      next: (data) => { this.employees = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
