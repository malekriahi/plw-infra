import { Component, OnInit } from '@angular/core';
import { AppraisalService } from '../../services/appraisal.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-appraisals',
  template: `
<div style="padding:28px;max-width:900px;">
  <div style="margin-bottom:24px;">
    <h1 style="margin:0;font-size:22px;font-weight:700;color:#1a1a2e;">⭐ Évaluations</h1>
    <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Planifier et suivre les entretiens d'évaluation Teams</p>
  </div>

  <!-- Créer une évaluation -->
  <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:24px;">
    <h3 style="margin:0 0 16px;font-size:15px;font-weight:700;color:#1a1a2e;">📅 Planifier une réunion d'évaluation Teams</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
      <div>
        <label style="display:block;font-size:12px;font-weight:600;color:#6b7280;margin-bottom:4px;">Période *</label>
        <input [(ngModel)]="newAppraisal.period" placeholder="ex: Q4 2026"
          style="width:100%;padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box;">
      </div>
      <div>
        <label style="display:block;font-size:12px;font-weight:600;color:#6b7280;margin-bottom:4px;">ID du Reviewer *</label>
        <input [(ngModel)]="newAppraisal.reviewerId" placeholder="ID de l'évaluateur"
          style="width:100%;padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box;">
      </div>
      <div style="grid-column:1/-1;">
        <label style="display:block;font-size:12px;font-weight:600;color:#6b7280;margin-bottom:4px;">📅 Date et heure de la réunion Teams *</label>
        <input type="datetime-local" [(ngModel)]="newAppraisal.meetingDate"
          style="width:100%;padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box;">
      </div>
      <div style="grid-column:1/-1;">
        <label style="display:block;font-size:12px;font-weight:600;color:#6b7280;margin-bottom:4px;">Commentaires (optionnel)</label>
        <textarea [(ngModel)]="newAppraisal.comments" placeholder="Notes préliminaires..."
          style="width:100%;padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box;min-height:70px;resize:vertical;"></textarea>
      </div>
    </div>
    <button (click)="createAppraisal()"
      style="margin-top:16px;padding:10px 24px;border:none;border-radius:8px;background:#e91e8c;color:#fff;font-size:13px;font-weight:600;cursor:pointer;">
      + Planifier la réunion
    </button>
  </div>

  <!-- Liste des évaluations -->
  <h3 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#1a1a2e;">Mes évaluations</h3>
  <div *ngIf="appraisals.length === 0" style="background:#fff;border-radius:12px;padding:40px;text-align:center;color:#9ca3af;box-shadow:0 1px 4px rgba(0,0,0,.06);">
    Aucune évaluation planifiée
  </div>
  <div *ngFor="let a of appraisals" style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:12px;display:flex;align-items:center;gap:16px;">
    <div style="width:48px;height:48px;border-radius:10px;background:#fce7f3;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">🎥</div>
    <div style="flex:1;">
      <div style="font-size:14px;font-weight:700;color:#1a1a2e;">{{ a.period }}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:3px;">
        📅 {{ a.meetingDate | date:'EEEE dd/MM/yyyy à HH:mm' }}
      </div>
      <div style="font-size:12px;color:#9ca3af;margin-top:2px;" *ngIf="a.comments">💬 {{ a.comments }}</div>
    </div>
    <div>
      <span [style.background]="statusBg(a.status)" [style.color]="statusColor(a.status)"
        style="padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;text-transform:capitalize;">
        {{ statusLabel(a.status) }}
      </span>
      <div *ngIf="a.finalRating" style="text-align:center;margin-top:6px;font-size:13px;color:#f59e0b;">
        {{ '★'.repeat(a.finalRating) }}{{ '☆'.repeat(5 - a.finalRating) }}
      </div>
    </div>
  </div>
</div>
  `,
  styles: []
})
export class AppraisalsComponent implements OnInit {
  appraisals: any[] = [];
  user: any;
  newAppraisal: any = { period: '', reviewerId: '', meetingDate: '', comments: '' };

  constructor(private appraisalService: AppraisalService, private auth: AuthService) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    this.loadAppraisals();
  }

  loadAppraisals() {
    if (!this.user) return;
    this.appraisalService.getByEmployee(this.user.id).subscribe({
      next: (data: any) => this.appraisals = data,
      error: () => {}
    });
  }

  createAppraisal() {
    if (!this.newAppraisal.period || !this.newAppraisal.meetingDate) {
      alert('Veuillez remplir la période et la date de réunion');
      return;
    }
    // On envoie meetingDate comme startDate et endDate pour compatibilité backend
    this.appraisalService.create({
      ...this.newAppraisal,
      startDate: this.newAppraisal.meetingDate,
      endDate: this.newAppraisal.meetingDate,
      employeeId: this.user.id
    }).subscribe({
      next: () => {
        this.newAppraisal = { period: '', reviewerId: '', meetingDate: '', comments: '' };
        this.loadAppraisals();
      },
      error: (err: any) => alert(err.error?.error || 'Erreur lors de la création')
    });
  }

  statusLabel(s: string) {
    const map: any = { draft: 'Planifiée', submitted: 'Soumise', reviewed: 'Révisée', completed: 'Terminée' };
    return map[s] || s;
  }
  statusBg(s: string) {
    const map: any = { draft: '#f3f4f6', submitted: '#eff6ff', reviewed: '#fef3c7', completed: '#f0fdf4' };
    return map[s] || '#f3f4f6';
  }
  statusColor(s: string) {
    const map: any = { draft: '#6b7280', submitted: '#3b82f6', reviewed: '#f59e0b', completed: '#22c55e' };
    return map[s] || '#6b7280';
  }
}
