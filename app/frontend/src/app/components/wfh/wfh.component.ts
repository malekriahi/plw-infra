import { Component, OnInit } from '@angular/core';
import { WFHService } from '../../services/wfh.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-wfh',
  template: `
    <div style="padding:20px;max-width:800px;margin:0 auto;">
      <h1 style="color:#880e4f;">🏠 Work From Home</h1>
      <p style="color:#666;margin-bottom:20px;">Book work-from-home days and see who's in the office</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
        <div style="background:#e3f2fd;padding:16px;border-radius:12px;text-align:center;">
          <h3 style="font-size:28px;color:#0d47a1;">{{ pendingRequests }}</h3>
          <p style="color:#666;font-size:13px;">Pending WFH Requests</p>
        </div>
        <div style="background:#e8f5e9;padding:16px;border-radius:12px;text-align:center;">
          <h3 style="font-size:28px;color:#2e7d32;">{{ todayWFH }}</h3>
          <p style="color:#666;font-size:13px;">WFH Today</p>
        </div>
      </div>
      <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08);margin-bottom:20px;">
        <h3>Request WFH</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px;">
          <div>
            <label style="display:block;font-size:13px;color:#666;">Date</label>
            <input type="date" [(ngModel)]="newRequest.date" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
          </div>
          <div>
            <label style="display:block;font-size:13px;color:#666;">Reason</label>
            <input [(ngModel)]="newRequest.reason" placeholder="Optional" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
          </div>
        </div>
        <button (click)="submitRequest()" style="margin-top:12px;padding:8px 20px;border:none;border-radius:6px;background:#880e4f;color:#fff;cursor:pointer;">Submit Request</button>
      </div>
      <h3>Your WFH Requests</h3>
      <table style="width:100%;border-collapse:collapse;margin-top:10px;">
        <thead><tr style="background:#f5f5f5;">
          <th style="padding:10px;text-align:left;">Date</th>
          <th style="padding:10px;text-align:left;">Reason</th>
          <th style="padding:10px;text-align:left;">Status</th>
        </tr></thead>
        <tbody>
          <tr *ngFor="let req of requests" style="border-bottom:1px solid #eee;">
            <td style="padding:10px;">{{ req.date | date:'MMM d, y' }}</td>
            <td style="padding:10px;">{{ req.reason || '-' }}</td>
            <td style="padding:10px;">
              <span [style.background]="req.status === 'approved' ? '#e8f5e9' : req.status === 'rejected' ? '#ffebee' : '#fff3e0'" style="padding:2px 12px;border-radius:20px;font-size:12px;text-transform:capitalize;">
                {{ req.status }}
              </span>
            </td>
          </tr>
          <tr *ngIf="requests.length === 0"><td colspan="3" style="padding:20px;text-align:center;color:#999;">No WFH requests yet</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: []
})
export class WFHComponent implements OnInit {
  requests: any[] = [];
  pendingRequests: number = 0;
  todayWFH: number = 0;
  user: any;
  newRequest: any = { date: '', reason: '' };

  constructor(private wfhService: WFHService, private auth: AuthService) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    this.loadData();
  }

  loadData() {
    if (!this.user) return;
    this.wfhService.getAll().subscribe({
      next: (data: any) => {
        this.requests = data.filter((r: any) => r.employeeId._id === this.user.id);
        this.pendingRequests = data.filter((r: any) => r.status === 'pending').length;
      },
      error: (err: any) => console.error(err)
    });
    this.wfhService.getToday().subscribe({
      next: (data: any) => { this.todayWFH = data.length; },
      error: (err: any) => console.error(err)
    });
  }

  submitRequest() {
    if (!this.newRequest.date) {
      alert('Please select a date');
      return;
    }
    this.wfhService.request({
      ...this.newRequest,
      employeeId: this.user.id
    }).subscribe({
      next: () => {
        this.newRequest = { date: '', reason: '' };
        this.loadData();
      },
      error: (err: any) => alert(err.error?.error || 'Error submitting request')
    });
  }
}
