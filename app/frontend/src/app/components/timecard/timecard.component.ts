import { Component, OnInit } from '@angular/core';
import { TimesheetService, Timesheet, TimesheetEntry, DayHours } from '../../services/timesheet.service';
import { AuthService } from '../../services/auth.service';

const DAYS: (keyof DayHours)[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

@Component({
  selector: 'app-timecard',   // keep selector so navbar link still works
  template: `
<div style="display:flex;min-height:100vh;background:#f4f6fb;font-family:Inter,system-ui,sans-serif;">

  <!-- Sidebar -->
  <div style="width:220px;background:#1a1a2e;display:flex;flex-direction:column;flex-shrink:0;position:sticky;top:0;height:100vh;">
    <div style="padding:24px 20px 20px;border-bottom:1px solid #2d2d4e;">
      <div style="font-size:18px;font-weight:700;color:#fff;">🌸 PLW HR</div>
      <div style="font-size:11px;color:#7b7ba8;margin-top:4px;font-weight:500;text-transform:uppercase;letter-spacing:.08em;">
        {{ user?.role === 'admin' ? 'Admin RH' : 'Espace Employé' }}
      </div>
    </div>
    <nav style="padding:12px 0;flex:1;">
      <a routerLink="/dashboard"  style="display:block;padding:10px 20px;text-decoration:none;"><span style="font-size:13px;color:#9090b8;">📊 Tableau de bord</span></a>
      <a routerLink="/days-off"   style="display:block;padding:10px 20px;text-decoration:none;"><span style="font-size:13px;color:#9090b8;">📅 Congés</span></a>
      <a routerLink="/wfh"        style="display:block;padding:10px 20px;text-decoration:none;"><span style="font-size:13px;color:#9090b8;">🏠 Télétravail</span></a>
      <a routerLink="/timecard"   style="display:block;padding:10px 20px;background:#3b82f618;border-left:3px solid #3b82f6;text-decoration:none;">
        <span style="font-size:13px;font-weight:600;color:#60a5fa;">⏱️ Feuille de temps</span>
      </a>
      <a routerLink="/appraisals" style="display:block;padding:10px 20px;text-decoration:none;"><span style="font-size:13px;color:#9090b8;">⭐ Évaluation</span></a>
    </nav>
    <div style="padding:16px 20px;border-top:1px solid #2d2d4e;display:flex;align-items:center;gap:10px;">
      <div style="width:32px;height:32px;border-radius:50%;background:#3b82f6;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0;">
        {{ (user?.name || 'U')[0].toUpperCase() }}
      </div>
      <div>
        <div style="font-size:12px;font-weight:600;color:#fff;">{{ user?.name }}</div>
        <div style="font-size:10px;color:#7b7ba8;">{{ user?.email }}</div>
      </div>
    </div>
  </div>

  <!-- Main -->
  <div style="flex:1;padding:28px;overflow-y:auto;">

    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
      <div>
        <h1 style="margin:0;font-size:22px;font-weight:700;color:#1a1a2e;">Feuille de temps</h1>
        <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">
          Semaine du {{ weekLabel }} &nbsp;·&nbsp;
          <span [style.color]="weekStatus === 'submitted' ? '#10b981' : weekStatus === 'draft' ? '#f59e0b' : '#6b7280'">
            {{ weekStatus === 'submitted' ? '✓ Soumise' : weekStatus === 'approved' ? '✓ Approuvée' : weekStatus === 'rejected' ? '✕ Refusée' : '● Brouillon' }}
          </span>
        </p>
      </div>
      <div style="display:flex;gap:10px;align-items:center;">
        <button (click)="prevWeek()" style="padding:8px 14px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;font-size:13px;">‹ Semaine préc.</button>
        <button (click)="nextWeek()" style="padding:8px 14px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;font-size:13px;">Semaine suiv. ›</button>
        <button (click)="goToday()"  style="padding:8px 14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;cursor:pointer;font-size:13px;color:#0369a1;">Auj.</button>
        <button (click)="submitSheet()" [disabled]="weekStatus === 'submitted' || weekStatus === 'approved'"
          style="padding:8px 20px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">
          {{ weekStatus === 'submitted' ? '✓ Soumise' : 'Soumettre' }}
        </button>
      </div>
    </div>

    <!-- Timesheet grid -->
    <div style="background:#fff;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.06);overflow:auto;">
      <table style="width:100%;border-collapse:collapse;min-width:700px;">
        <!-- Column headers -->
        <thead>
          <tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;">
            <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:700;color:#374151;width:40%;">Ticket</th>
            <th *ngFor="let dl of dayLabels;let i=index" style="padding:12px 10px;text-align:center;font-size:12px;font-weight:700;color:#374151;min-width:80px;">
              <div>{{ dl }}</div>
              <div style="font-size:10px;color:#9ca3af;font-weight:400;">{{ dayDates[i] }}</div>
            </th>
            <th style="padding:12px 10px;text-align:center;font-size:12px;font-weight:700;color:#374151;min-width:70px;">Total</th>
          </tr>
        </thead>
        <tbody>
          <!-- Ticket rows -->
          <tr *ngFor="let entry of entries;let ei=index" style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:12px 16px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:11px;font-weight:700;color:#3b82f6;background:#eff6ff;padding:2px 8px;border-radius:4px;white-space:nowrap;">{{ entry.ticketId }}</span>
                <input [(ngModel)]="entry.ticketTitle" (change)="autoSave()"
                  style="border:none;background:transparent;font-size:13px;color:#1a1a2e;width:100%;outline:none;"
                  placeholder="Titre du ticket" />
              </div>
              <div style="margin-top:2px;margin-left:60px;">
                <input [(ngModel)]="entry.category" (change)="autoSave()"
                  style="border:none;background:transparent;font-size:11px;color:#9ca3af;width:100%;outline:none;"
                  placeholder="Catégorie (ex: DevOps)" />
              </div>
            </td>
            <td *ngFor="let day of days" style="padding:8px 6px;text-align:center;">
              <input type="number" min="0" max="24" step="0.5"
                [(ngModel)]="entry.hours[day]"
                (ngModelChange)="onHoursChange()"
                [disabled]="weekStatus === 'submitted' || weekStatus === 'approved'"
                style="width:56px;height:36px;text-align:center;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;font-weight:600;background:#f9fafb;color:#1a1a2e;outline:none;"
                [style.border-color]="getDayTotal(day) === 8 ? '#10b981' : getDayTotal(day) > 0 ? '#f59e0b' : '#e5e7eb'" />
            </td>
            <td style="padding:8px 10px;text-align:center;">
              <span style="font-size:13px;font-weight:700;color:#1a1a2e;">{{ getEntryTotal(entry) }}h</span>
              <button (click)="removeEntry(ei)" *ngIf="weekStatus !== 'submitted' && weekStatus !== 'approved'"
                style="display:block;margin:2px auto 0;background:none;border:none;color:#ef4444;cursor:pointer;font-size:11px;">✕</button>
            </td>
          </tr>

          <!-- Add ticket row -->
          <tr *ngIf="weekStatus !== 'submitted' && weekStatus !== 'approved'" style="border-bottom:1px solid #f3f4f6;background:#fafafa;">
            <td colspan="7" style="padding:12px 16px;">
              <div style="display:flex;gap:10px;align-items:center;">
                <input [(ngModel)]="newTicketId" placeholder="ID Ticket (ex: PLW-200)"
                  style="padding:8px 12px;border:1.5px dashed #d1d5db;border-radius:8px;font-size:13px;width:180px;outline:none;background:#fff;" />
                <input [(ngModel)]="newTicketTitle" placeholder="Titre du ticket"
                  style="padding:8px 12px;border:1.5px dashed #d1d5db;border-radius:8px;font-size:13px;flex:1;outline:none;background:#fff;" />
                <input [(ngModel)]="newCategory" placeholder="Catégorie"
                  style="padding:8px 12px;border:1.5px dashed #d1d5db;border-radius:8px;font-size:13px;width:140px;outline:none;background:#fff;" />
                <button (click)="addEntry()"
                  style="padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;white-space:nowrap;">+ Ajouter</button>
              </div>
            </td>
          </tr>

          <!-- Footer totals -->
          <tr style="background:#f9fafb;border-top:2px solid #e5e7eb;">
            <td style="padding:12px 16px;font-size:12px;font-weight:700;color:#374151;">TOTAL / JOUR</td>
            <td *ngFor="let day of days" style="padding:12px 6px;text-align:center;">
              <span [style.background]="getDayTotal(day) === 8 ? '#d1fae5' : getDayTotal(day) > 0 ? '#fef9c3' : '#fee2e2'"
                    [style.color]="getDayTotal(day) === 8 ? '#065f46' : getDayTotal(day) > 0 ? '#92400e' : '#991b1b'"
                    style="font-size:12px;font-weight:700;padding:4px 10px;border-radius:6px;display:inline-block;">
                {{ getDayTotal(day) }}h
                <span style="font-size:10px;opacity:.8;">{{ getDayTotal(day) === 8 ? '✓' : getDayTotal(day) === 0 ? '✕' : '⚠' }}</span>
              </span>
            </td>
            <td style="padding:12px 10px;text-align:center;font-size:13px;font-weight:700;color:#1a1a2e;">{{ weekTotal }}h / 40h</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Legend -->
    <div style="margin-top:16px;display:flex;gap:20px;font-size:12px;color:#6b7280;flex-wrap:wrap;">
      <span style="display:flex;align-items:center;gap:6px;"><span style="width:12px;height:12px;background:#d1fae5;border-radius:3px;display:inline-block;"></span> 8h — complet</span>
      <span style="display:flex;align-items:center;gap:6px;"><span style="width:12px;height:12px;background:#fef9c3;border-radius:3px;display:inline-block;"></span> Partiel</span>
      <span style="display:flex;align-items:center;gap:6px;"><span style="width:12px;height:12px;background:#fee2e2;border-radius:3px;display:inline-block;"></span> Non rempli</span>
      <span style="margin-left:auto;color:#9ca3af;">Date limite de soumission : vendredi 18h00</span>
    </div>

    <!-- Message -->
    <div *ngIf="message" [style.background]="messageOk ? '#d1fae5' : '#fee2e2'"
      [style.color]="messageOk ? '#065f46' : '#991b1b'"
      style="margin-top:16px;padding:12px 16px;border-radius:8px;font-size:13px;">
      {{ message }}
    </div>
  </div>
</div>
  `,
  styles: [`
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { opacity: 1; }
    a { color: inherit; }
  `]
})
export class TimecardComponent implements OnInit {
  user: any;
  days = DAYS;
  dayLabels = DAY_LABELS;
  dayDates: string[] = [];
  weekStart!: Date;
  weekLabel = '';
  weekStatus: string = 'draft';
  weekTotal = 0;

  entries: TimesheetEntry[] = [];
  newTicketId = '';
  newTicketTitle = '';
  newCategory = '';

  message = '';
  messageOk = true;
  private saveTimer: any;
  private currentSheetId: string | null = null;

  constructor(private svc: TimesheetService, private auth: AuthService) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    this.goToday();
  }

  goToday() {
    this.weekStart = getMonday(new Date());
    this.loadWeek();
  }

  prevWeek() {
    this.weekStart = addDays(this.weekStart, -7);
    this.loadWeek();
  }

  nextWeek() {
    this.weekStart = addDays(this.weekStart, 7);
    this.loadWeek();
  }

  private loadWeek() {
    this.updateLabels();
    if (!this.user) return;
    this.svc.getWeek(this.user.id, formatDate(this.weekStart)).subscribe({
      next: (sheet: any) => {
        this.currentSheetId = sheet._id || null;
        this.weekStatus = sheet.status || 'draft';
        this.entries = (sheet.entries || []).map((e: any) => ({
          ticketId: e.ticketId,
          ticketTitle: e.ticketTitle,
          category: e.category || '',
          hours: { mon: e.hours?.mon || 0, tue: e.hours?.tue || 0, wed: e.hours?.wed || 0, thu: e.hours?.thu || 0, fri: e.hours?.fri || 0 }
        }));
        this.recalc();
      },
      error: () => { this.entries = []; this.weekStatus = 'draft'; }
    });
  }

  private updateLabels() {
    const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
    this.weekLabel = this.weekStart.toLocaleDateString('fr-FR', opts) + ' – ' +
      addDays(this.weekStart, 4).toLocaleDateString('fr-FR', opts);
    this.dayDates = DAYS.map((_, i) => addDays(this.weekStart, i).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
  }

  addEntry() {
    if (!this.newTicketId.trim()) { this.showMsg('Entrez un ID ticket', false); return; }
    this.entries.push({
      ticketId: this.newTicketId.trim().toUpperCase(),
      ticketTitle: this.newTicketTitle.trim() || '(sans titre)',
      category: this.newCategory.trim(),
      hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 }
    });
    this.newTicketId = '';
    this.newTicketTitle = '';
    this.newCategory = '';
    this.autoSave();
  }

  removeEntry(i: number) {
    this.entries.splice(i, 1);
    this.recalc();
    this.autoSave();
  }

  getDayTotal(day: keyof DayHours): number {
    return this.entries.reduce((s, e) => s + (e.hours[day] || 0), 0);
  }

  getEntryTotal(e: TimesheetEntry): number {
    return DAYS.reduce((s, d) => s + (e.hours[d] || 0), 0);
  }

  onHoursChange() {
    this.recalc();
    this.autoSave();
  }

  private recalc() {
    this.weekTotal = DAYS.reduce((s, d) => s + this.getDayTotal(d), 0);
  }

  autoSave() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.doSave(), 1500);
  }

  private doSave() {
    if (!this.user) return;
    this.svc.save({
      employeeId: this.user.id,
      weekStartDate: formatDate(this.weekStart),
      entries: this.entries
    }).subscribe({
      next: (s: any) => { this.currentSheetId = s._id; },
      error: () => {}
    });
  }

  submitSheet() {
    if (!this.user) return;
    this.svc.submit({
      employeeId: this.user.id,
      weekStartDate: formatDate(this.weekStart),
      entries: this.entries
    }).subscribe({
      next: () => {
        this.weekStatus = 'submitted';
        this.showMsg('Feuille de temps soumise avec succès ✓', true);
      },
      error: (err: any) => this.showMsg('Erreur : ' + (err.error?.message || err.message), false)
    });
  }

  private showMsg(msg: string, ok: boolean) {
    this.message = msg;
    this.messageOk = ok;
    setTimeout(() => this.message = '', 4000);
  }
}
