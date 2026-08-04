import { Component, OnInit } from '@angular/core';
import { InterviewService } from '../../services/interview.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-interviews',
  template: `
    <div style="padding:20px;max-width:800px;margin:0 auto;">
      <h1 style="color:#880e4f;">🎯 Interviews</h1>
      <p style="color:#666;margin-bottom:20px;">Schedule candidate interviews and provide feedback</p>
      <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08);margin-bottom:20px;">
        <h3>Schedule Interview</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px;">
          <div>
            <label style="display:block;font-size:13px;color:#666;">Candidate Name</label>
            <input [(ngModel)]="newInterview.candidateName" placeholder="Full name" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
          </div>
          <div>
            <label style="display:block;font-size:13px;color:#666;">Email</label>
            <input [(ngModel)]="newInterview.candidateEmail" type="email" placeholder="Email" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
          </div>
          <div>
            <label style="display:block;font-size:13px;color:#666;">Position</label>
            <input [(ngModel)]="newInterview.position" placeholder="Position" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
          </div>
          <div>
            <label style="display:block;font-size:13px;color:#666;">Department</label>
            <input [(ngModel)]="newInterview.department" placeholder="Department" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
          </div>
          <div>
            <label style="display:block;font-size:13px;color:#666;">Date</label>
            <input type="date" [(ngModel)]="newInterview.scheduledDate" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
          </div>
          <div>
            <label style="display:block;font-size:13px;color:#666;">Time</label>
            <input type="time" [(ngModel)]="newInterview.scheduledTime" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
          </div>
        </div>
        <button (click)="scheduleInterview()" style="margin-top:12px;padding:8px 20px;border:none;border-radius:6px;background:#880e4f;color:#fff;cursor:pointer;">Schedule Interview</button>
      </div>
      <h3>Upcoming Interviews</h3>
      <table style="width:100%;border-collapse:collapse;margin-top:10px;">
        <thead><tr style="background:#f5f5f5;">
          <th style="padding:10px;text-align:left;">Candidate</th>
          <th style="padding:10px;text-align:left;">Position</th>
          <th style="padding:10px;text-align:left;">Date/Time</th>
          <th style="padding:10px;text-align:left;">Status</th>
        </tr></thead>
        <tbody>
          <tr *ngFor="let iv of interviews" style="border-bottom:1px solid #eee;">
            <td style="padding:10px;">{{ iv.candidateName }}</td>
            <td style="padding:10px;">{{ iv.position }}</td>
            <td style="padding:10px;">{{ iv.scheduledDate | date:'MMM d' }} at {{ iv.scheduledTime }}</td>
            <td style="padding:10px;">
              <span [style.background]="iv.status === 'scheduled' ? '#e3f2fd' : iv.status === 'completed' ? '#e8f5e9' : '#ffebee'" style="padding:2px 12px;border-radius:20px;font-size:12px;text-transform:capitalize;">
                {{ iv.status }}
              </span>
            </td>
          </tr>
          <tr *ngIf="interviews.length === 0"><td colspan="4" style="padding:20px;text-align:center;color:#999;">No interviews scheduled</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: []
})
export class InterviewsComponent implements OnInit {
  interviews: any[] = [];
  user: any;
  newInterview: any = { candidateName: '', candidateEmail: '', position: '', department: '', scheduledDate: '', scheduledTime: '' };

  constructor(private interviewService: InterviewService, private auth: AuthService) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    this.loadInterviews();
  }

  loadInterviews() {
    this.interviewService.getAll().subscribe({
      next: (data: any) => { this.interviews = data; },
      error: (err: any) => console.error(err)
    });
  }

  scheduleInterview() {
    if (!this.newInterview.candidateName || !this.newInterview.scheduledDate) {
      alert('Please fill in all required fields');
      return;
    }
    this.interviewService.create(this.newInterview).subscribe({
      next: () => {
        this.newInterview = { candidateName: '', candidateEmail: '', position: '', department: '', scheduledDate: '', scheduledTime: '' };
        this.loadInterviews();
      },
      error: (err: any) => alert(err.error?.error || 'Error scheduling interview')
    });
  }
}
