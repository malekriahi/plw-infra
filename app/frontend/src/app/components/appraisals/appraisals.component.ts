import { Component, OnInit } from '@angular/core';
import { AppraisalService } from '../../services/appraisal.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-appraisals',
  template: `
    <div style="padding:20px;max-width:800px;margin:0 auto;">
      <h1 style="color:#880e4f;">📊 Appraisals</h1>
      <p style="color:#666;margin-bottom:20px;">Complete self-evaluations and view performance reviews</p>
      <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08);margin-bottom:20px;">
        <h3>Create Appraisal</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px;">
          <div>
            <label style="display:block;font-size:13px;color:#666;">Period</label>
            <input [(ngModel)]="newAppraisal.period" placeholder="e.g. Q1 2024" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
          </div>
          <div>
            <label style="display:block;font-size:13px;color:#666;">Reviewer</label>
            <input [(ngModel)]="newAppraisal.reviewerId" placeholder="Reviewer ID" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
          </div>
          <div>
            <label style="display:block;font-size:13px;color:#666;">Start Date</label>
            <input type="date" [(ngModel)]="newAppraisal.startDate" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
          </div>
          <div>
            <label style="display:block;font-size:13px;color:#666;">End Date</label>
            <input type="date" [(ngModel)]="newAppraisal.endDate" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
          </div>
        </div>
        <button (click)="createAppraisal()" style="margin-top:12px;padding:8px 20px;border:none;border-radius:6px;background:#880e4f;color:#fff;cursor:pointer;">Create Appraisal</button>
      </div>
      <h3>Your Appraisals</h3>
      <table style="width:100%;border-collapse:collapse;margin-top:10px;">
        <thead><tr style="background:#f5f5f5;">
          <th style="padding:10px;text-align:left;">Period</th>
          <th style="padding:10px;text-align:left;">Reviewer</th>
          <th style="padding:10px;text-align:left;">Status</th>
          <th style="padding:10px;text-align:left;">Rating</th>
        </tr></thead>
        <tbody>
          <tr *ngFor="let a of appraisals" style="border-bottom:1px solid #eee;">
            <td style="padding:10px;">{{ a.period }}</td>
            <td style="padding:10px;">{{ a.reviewerId?.firstName || 'N/A' }} {{ a.reviewerId?.lastName || '' }}</td>
            <td style="padding:10px;">
              <span [style.background]="a.status === 'completed' ? '#e8f5e9' : a.status === 'submitted' ? '#e3f2fd' : '#fff3e0'" style="padding:2px 12px;border-radius:20px;font-size:12px;text-transform:capitalize;">
                {{ a.status }}
              </span>
            </td>
            <td style="padding:10px;">{{ a.finalRating || '-' }}</td>
          </tr>
          <tr *ngIf="appraisals.length === 0"><td colspan="4" style="padding:20px;text-align:center;color:#999;">No appraisals yet</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: []
})
export class AppraisalsComponent implements OnInit {
  appraisals: any[] = [];
  user: any;
  newAppraisal: any = { period: '', reviewerId: '', startDate: '', endDate: '' };

  constructor(private appraisalService: AppraisalService, private auth: AuthService) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    this.loadAppraisals();
  }

  loadAppraisals() {
    if (!this.user) return;
    this.appraisalService.getByEmployee(this.user.id).subscribe({
      next: (data: any) => { this.appraisals = data; },
      error: (err: any) => console.error(err)
    });
  }

  createAppraisal() {
    if (!this.newAppraisal.period || !this.newAppraisal.startDate) {
      alert('Please fill in all required fields');
      return;
    }
    this.appraisalService.create({
      ...this.newAppraisal,
      employeeId: this.user.id
    }).subscribe({
      next: () => {
        this.newAppraisal = { period: '', reviewerId: '', startDate: '', endDate: '' };
        this.loadAppraisals();
      },
      error: (err: any) => alert(err.error?.error || 'Error creating appraisal')
    });
  }
}
