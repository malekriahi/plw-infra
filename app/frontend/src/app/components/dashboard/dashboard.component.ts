import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  template: `
<!-- ==================  ADMIN DASHBOARD  ================== -->
<div *ngIf="isAdmin" style="padding:28px;background:#f4f6fb;min-height:100vh;font-family:Inter,system-ui,sans-serif;">
  <div style="margin-bottom:24px;">
    <h1 style="margin:0;font-size:22px;font-weight:700;color:#1a1a2e;">Tableau de bord RH</h1>
    <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Planisware HR — Vue Administration</p>
  </div>

  <!-- Stat cards -->
  <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:28px;">
    <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
      <div style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">Employés actifs</div>
      <div style="font-size:40px;font-weight:700;color:#e91e8c;line-height:1;">{{ stats.totalEmployees || 0 }}</div>
    </div>
    <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
      <div style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">Congés en attente</div>
      <div style="font-size:40px;font-weight:700;color:#f59e0b;line-height:1;">{{ stats.pendingDaysOff || 0 }}</div>
    </div>
    <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
      <div style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">WFH en attente</div>
      <div style="font-size:40px;font-weight:700;color:#8b5cf6;line-height:1;">{{ stats.pendingWFH || 0 }}</div>
    </div>
    <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
      <div style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">Timesheets soumises</div>
      <div style="font-size:40px;font-weight:700;color:#10b981;line-height:1;">{{ stats.pendingTimesheets || 0 }}</div>
    </div>
  </div>

  <!-- Pending requests -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
    <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <h3 style="margin:0;font-size:14px;font-weight:700;color:#1a1a2e;">📅 Demandes de congé</h3>
        <a routerLink="/requests" style="font-size:12px;color:#e91e8c;text-decoration:none;">Voir tout</a>
      </div>
      <div *ngFor="let r of pendingLeave" style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f3f4f6;">
        <div [style.background]="avatarColor(r)" style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0;">
          {{ (r.employeeId?.firstName || '?')[0] }}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:600;color:#1a1a2e;">{{ r.employeeId?.firstName }} {{ r.employeeId?.lastName }}</div>
          <div style="font-size:11px;color:#6b7280;">{{ r.startDate | date:'dd MMM' }} – {{ r.endDate | date:'dd MMM yyyy' }}</div>
        </div>
        <div style="display:flex;gap:6px;">
          <button (click)="approveLeave(r._id)" style="padding:5px 12px;background:#10b981;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer;">✓</button>
          <button (click)="rejectLeave(r._id)"  style="padding:5px 12px;background:#fff;color:#ef4444;border:1px solid #ef4444;border-radius:6px;font-size:12px;cursor:pointer;">✕</button>
        </div>
      </div>
      <div *ngIf="pendingLeave.length === 0" style="padding:20px;text-align:center;color:#9ca3af;font-size:13px;">Aucune demande en attente</div>
    </div>

    <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <h3 style="margin:0;font-size:14px;font-weight:700;color:#1a1a2e;">🏠 Demandes WFH</h3>
        <a routerLink="/requests" [queryParams]="{tab:'wfh'}" style="font-size:12px;color:#e91e8c;text-decoration:none;">Voir tout</a>
      </div>
      <div *ngFor="let w of pendingWFH" style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f3f4f6;">
        <div [style.background]="avatarColor(w)" style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0;">
          {{ (w.employeeId?.firstName || '?')[0] }}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:600;color:#1a1a2e;">{{ w.employeeId?.firstName }} {{ w.employeeId?.lastName }}</div>
          <div style="font-size:11px;color:#6b7280;">{{ w.date | date:'dd MMM yyyy' }}</div>
        </div>
        <div style="display:flex;gap:6px;">
          <button (click)="approveWFH(w._id)" style="padding:5px 12px;background:#10b981;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer;">✓</button>
          <button (click)="rejectWFH(w._id)"  style="padding:5px 12px;background:#fff;color:#ef4444;border:1px solid #ef4444;border-radius:6px;font-size:12px;cursor:pointer;">✕</button>
        </div>
      </div>
      <div *ngIf="pendingWFH.length === 0" style="padding:20px;text-align:center;color:#9ca3af;font-size:13px;">Aucune demande en attente</div>
    </div>
  </div>

  <!-- Employee list + Create account -->
  <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
      <h3 style="margin:0;font-size:14px;font-weight:700;color:#1a1a2e;">👥 Employés</h3>
      <div style="display:flex;gap:8px;">
        <a routerLink="/employees" style="padding:7px 16px;background:#f3f4f6;color:#374151;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;">Voir tout</a>
        <button (click)="showCreateForm = !showCreateForm" style="padding:7px 16px;background:#e91e8c;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">+ Créer un compte</button>
      </div>
    </div>

    <div *ngIf="showCreateForm" style="background:#fdf2f8;border:1px solid #fbcfe8;border-radius:10px;padding:16px;margin-bottom:16px;">
      <h4 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#be185d;">Nouveau compte employé</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <input [(ngModel)]="newEmp.firstName" placeholder="Prénom *" style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;outline:none;" />
        <input [(ngModel)]="newEmp.lastName"  placeholder="Nom *"    style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;outline:none;" />
        <input [(ngModel)]="newEmp.email"     placeholder="Email *"  style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;outline:none;" />
        <input [(ngModel)]="newEmp.password" type="password" placeholder="Mot de passe *" style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;outline:none;" />
        <input [(ngModel)]="newEmp.department" placeholder="Département *" style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;outline:none;" />
        <input [(ngModel)]="newEmp.position"   placeholder="Poste *"       style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;outline:none;" />
      </div>
      <div style="margin-top:12px;display:flex;gap:10px;justify-content:flex-end;">
        <button (click)="showCreateForm=false" style="padding:7px 16px;background:#fff;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;cursor:pointer;">Annuler</button>
        <button (click)="createEmployee()" style="padding:7px 16px;background:#e91e8c;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">Créer</button>
      </div>
      <div *ngIf="createMsg" [style.color]="createOk ? '#065f46' : '#991b1b'" style="margin-top:8px;font-size:12px;">{{ createMsg }}</div>
    </div>

    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="background:#f9fafb;">
        <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;">Nom</th>
        <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;">Département</th>
        <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;">Congés restants</th>
        <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;">Statut</th>
      </tr></thead>
      <tbody>
        <tr *ngFor="let e of employees" style="border-bottom:1px solid #f3f4f6;">
          <td style="padding:12px 16px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div [style.background]="avatarColor(e)" style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0;">{{ e.firstName[0] }}</div>
              <div>
                <div style="font-size:13px;font-weight:600;color:#1a1a2e;">{{ e.firstName }} {{ e.lastName }}</div>
                <div style="font-size:11px;color:#6b7280;">{{ e.email }}</div>
              </div>
            </div>
          </td>
          <td style="padding:12px 16px;font-size:13px;color:#374151;">{{ e.department }}</td>
          <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#3b82f6;">{{ e.remainingLeaveDays }}/{{ e.annualLeaveDays }}j</td>
          <td style="padding:12px 16px;">
            <span [style.background]="e.isActive ? '#d1fae5' : '#fee2e2'" [style.color]="e.isActive ? '#065f46' : '#991b1b'"
              style="font-size:11px;padding:3px 10px;border-radius:20px;font-weight:600;">
              {{ e.isActive ? 'Actif' : 'Inactif' }}
            </span>
          </td>
        </tr>
        <tr *ngIf="employees.length === 0"><td colspan="4" style="padding:20px;text-align:center;color:#9ca3af;font-size:13px;">Aucun employé</td></tr>
      </tbody>
    </table>
  </div>
</div>

<!-- ==================  EMPLOYEE DASHBOARD  ================== -->
<div *ngIf="!isAdmin" style="padding:28px;background:#f4f6fb;min-height:100vh;font-family:Inter,system-ui,sans-serif;">
  <div style="margin-bottom:24px;">
    <h1 style="margin:0;font-size:22px;font-weight:700;color:#1a1a2e;">Bonjour, {{ user?.firstName || user?.name?.split(' ')[0] }} 👋</h1>
    <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Voici un résumé de votre situation</p>
  </div>

  <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-bottom:24px;">
    <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
      <div style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">Jours de congé restants</div>
      <div style="font-size:40px;font-weight:700;color:#3b82f6;line-height:1;">{{ empData.remainingLeaveDays || 0 }}</div>
      <div style="margin-top:8px;height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden;">
        <div [style.width]="leavePercent+'%'" style="height:100%;background:#3b82f6;border-radius:3px;"></div>
      </div>
      <div style="font-size:11px;color:#9ca3af;margin-top:4px;">{{ empData.remainingLeaveDays }}/{{ empData.annualLeaveDays || 30 }} jours</div>
    </div>
    <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
      <div style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">Demandes en attente</div>
      <div style="font-size:40px;font-weight:700;color:#f59e0b;line-height:1;">{{ stats.pendingDaysOff || 0 }}</div>
    </div>
    <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
      <div style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">Feuilles de temps</div>
      <div style="font-size:40px;font-weight:700;color:#10b981;line-height:1;">{{ myTimesheets.length }}</div>
    </div>
  </div>

  <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:20px;">
    <h3 style="margin:0 0 16px;font-size:14px;font-weight:700;color:#1a1a2e;">Actions rapides</h3>
    <div style="display:flex;gap:12px;">
      <a routerLink="/days-off" style="flex:1;padding:14px;background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:10px;text-align:center;text-decoration:none;display:block;">
        <div style="font-size:20px;margin-bottom:6px;">📅</div>
        <div style="font-size:12px;font-weight:600;color:#1d4ed8;">Demander un congé</div>
      </a>
      <a routerLink="/wfh" style="flex:1;padding:14px;background:#f5f3ff;border:1.5px solid #ddd6fe;border-radius:10px;text-align:center;text-decoration:none;display:block;">
        <div style="font-size:20px;margin-bottom:6px;">🏠</div>
        <div style="font-size:12px;font-weight:600;color:#6d28d9;">Demander WFH</div>
      </a>
      <a routerLink="/timecard" style="flex:1;padding:14px;background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:10px;text-align:center;text-decoration:none;display:block;">
        <div style="font-size:20px;margin-bottom:6px;">⏱️</div>
        <div style="font-size:12px;font-weight:600;color:#15803d;">Feuille de temps</div>
      </a>
      <a routerLink="/appraisals" style="flex:1;padding:14px;background:#fff7ed;border:1.5px solid #fed7aa;border-radius:10px;text-align:center;text-decoration:none;display:block;">
        <div style="font-size:20px;margin-bottom:6px;">⭐</div>
        <div style="font-size:12px;font-weight:600;color:#c2410c;">Mon évaluation</div>
      </a>
    </div>
  </div>

  <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
    <h3 style="margin:0 0 16px;font-size:14px;font-weight:700;color:#1a1a2e;">Dernières feuilles de temps</h3>
    <div *ngFor="let ts of myTimesheets.slice(0,4)" style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f3f4f6;">
      <div style="width:36px;height:36px;background:#eff6ff;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">⏱️</div>
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:600;color:#1a1a2e;">Semaine du {{ ts.weekStartDate | date:'dd MMM yyyy' }}</div>
        <div style="font-size:11px;color:#6b7280;">{{ ts.entries?.length || 0 }} tickets</div>
      </div>
      <span [style.background]="ts.status==='approved'?'#d1fae5':ts.status==='submitted'?'#dbeafe':ts.status==='rejected'?'#fee2e2':'#fef9c3'"
            [style.color]="ts.status==='approved'?'#065f46':ts.status==='submitted'?'#1d4ed8':ts.status==='rejected'?'#991b1b':'#92400e'"
            style="font-size:11px;padding:3px 10px;border-radius:20px;font-weight:600;">
        {{ ts.status === 'approved' ? '✓ Approuvée' : ts.status === 'submitted' ? '● Soumise' : ts.status === 'rejected' ? '✕ Refusée' : '● Brouillon' }}
      </span>
    </div>
    <div *ngIf="myTimesheets.length === 0" style="padding:20px;text-align:center;color:#9ca3af;font-size:13px;">Aucune feuille de temps</div>
  </div>
</div>
  `,
  styles: [`a { color: inherit; }`]
})
export class DashboardComponent implements OnInit {
  user: any;
  isAdmin = false;
  stats: any = {};
  employees: any[] = [];
  pendingLeave: any[] = [];
  pendingWFH: any[] = [];
  empData: any = { remainingLeaveDays: 0, annualLeaveDays: 30 };
  leavePercent = 0;
  myTimesheets: any[] = [];
  showCreateForm = false;
  newEmp: any = { firstName: '', lastName: '', email: '', password: '', department: '', position: '' };
  createMsg = '';
  createOk = true;
  private colors = ['#e91e8c','#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4'];

  constructor(private http: HttpClient, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    this.isAdmin = this.user?.role === 'admin';
    this.http.get<any>('/api/dashboard/stats').subscribe({ next: d => this.stats = d, error: () => {} });
    if (this.isAdmin) { this.loadAdminData(); } else { this.loadEmployeeData(); }
  }

  private loadAdminData() {
    this.http.get<any[]>('/api/employees').subscribe({ next: d => this.employees = d, error: () => {} });
    this.http.get<any[]>('/api/days-off/pending').subscribe({ next: d => this.pendingLeave = d, error: () => {} });
    this.http.get<any[]>('/api/wfh/pending').subscribe({ next: d => this.pendingWFH = d, error: () => {} });
  }

  private loadEmployeeData() {
    if (!this.user?.id) return;
    this.http.get<any>(`/api/employees/${this.user.id}`).subscribe({
      next: e => { this.empData = e; this.leavePercent = Math.round(((e.remainingLeaveDays||0)/(e.annualLeaveDays||30))*100); },
      error: () => {}
    });
    this.http.get<any[]>(`/api/timesheets/employee/${this.user.id}`).subscribe({ next: t => this.myTimesheets = t, error: () => {} });
  }

  approveLeave(id: string) {
    this.http.put(`/api/days-off/${id}/approve`, { approvedBy: this.user?.id }).subscribe({
      next: () => this.pendingLeave = this.pendingLeave.filter(r => r._id !== id), error: () => {}
    });
  }
  rejectLeave(id: string) {
    this.http.put(`/api/days-off/${id}/reject`, {}).subscribe({
      next: () => this.pendingLeave = this.pendingLeave.filter(r => r._id !== id), error: () => {}
    });
  }
  approveWFH(id: string) {
    this.http.put(`/api/wfh/${id}/approve`, { approvedBy: this.user?.id }).subscribe({
      next: () => this.pendingWFH = this.pendingWFH.filter(w => w._id !== id), error: () => {}
    });
  }
  rejectWFH(id: string) {
    this.http.put(`/api/wfh/${id}/reject`, {}).subscribe({
      next: () => this.pendingWFH = this.pendingWFH.filter(w => w._id !== id), error: () => {}
    });
  }
  createEmployee() {
    const e = this.newEmp;
    if (!e.firstName || !e.lastName || !e.email || !e.password || !e.department || !e.position) {
      this.createMsg = 'Tous les champs sont requis.'; this.createOk = false; return;
    }
    this.http.post<any>('/api/admin/create-employee', e).subscribe({
      next: r => {
        this.createMsg = `Compte créé : ${r.employee?.name}`; this.createOk = true;
        this.newEmp = { firstName: '', lastName: '', email: '', password: '', department: '', position: '' };
        this.loadAdminData();
        setTimeout(() => { this.showCreateForm = false; this.createMsg = ''; }, 2000);
      },
      error: err => { this.createMsg = err.error?.message || 'Erreur lors de la création.'; this.createOk = false; }
    });
  }
  avatarColor(obj: any): string {
    const name = (obj?.firstName || obj?.email || '?');
    return this.colors[name.charCodeAt(0) % this.colors.length];
  }
}
