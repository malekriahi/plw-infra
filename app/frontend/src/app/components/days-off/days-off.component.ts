import { Component, OnInit } from '@angular/core';
import { DaysOffService } from '../../services/days-off.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-days-off',
  template: `
    <div style="padding:20px;max-width:800px;margin:0 auto;">
      <h1 style="color:#880e4f;">📅 Days Off</h1>
      <p style="color:#666;margin-bottom:20px;">Request vacation, sick days, or personal leave</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
        <div style="background:#e3f2fd;padding:16px;border-radius:12px;text-align:center;">
          <h3 style="font-size:28px;color:#0d47a1;">{{ remainingDays }}</h3>
          <p style="color:#666;font-size:13px;">Remaining Leave Days</p>
        </div>
        <div style="background:#fff3e0;padding:16px;border-radius:12px;text-align:center;">
          <h3 style="font-size:28px;color:#e65100;">{{ pendingRequests }}</h3>
          <p style="color:#666;font-size:13px;">Pending Requests</p>
        </div>
      </div>
      <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08);margin-bottom:20px;">
        <h3>New Request</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px;">
          <div>
            <label style="display:block;font-size:13px;color:#666;">Type</label>
            <select [(ngModel)]="newRequest.type" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
              <option value="vacation">Vacation</option>
              <option value="sick">Sick</option>
              <option value="personal">Personal</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-size:13px;color:#666;">Start Date</label>
            <input type="date" [(ngModel)]="newRequest.startDate" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
          </div>
          <div>
            <label style="display:block;font-size:13px;color:#666;">End Date</label>
            <input type="date" [(ngModel)]="newRequest.endDate" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
          </div>
          <div>
            <label style="display:block;font-size:13px;color:#666;">Reason</label>
            <input [(ngModel)]="newRequest.reason" placeholder="Optional" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
          </div>
        </div>
        <button (click)="submitRequest()" style="margin-top:12px;padding:8px 20px;border:none;border-radius:6px;background:#880e4f;color:#fff;cursor:pointer;">Submit Request</button>
      </div>
      <h3>Your Requests</h3>
      <table style="width:100%;border-collapse:collapse;margin-top:10px;">
        <thead><tr style="background:#f5f5f5;">
          <th style="padding:10px;text-align:left;">Type</th>
          <th style="padding:10px;text-align:left;">Start</th>
          <th style="padding:10px;text-align:left;">End</th>
          <th style="padding:10px;text-align:left;">Status</th>
        </tr></thead>
        <tbody>
          <tr *ngFor="let req of requests" style="border-bottom:1px solid #eee;">
            <td style="padding:10px;text-transform:capitalize;">{{ req.type }}</td>
            <td style="padding:10px;">{{ req.startDate | date:'MMM d' }}</td>
            <td style="padding:10px;">{{ req.endDate | date:'MMM d' }}</td>
            <td style="padding:10px;">
              <span [style.background]="req.status === 'approved' ? '#e8f5e9' : req.status === 'rejected' ? '#ffebee' : '#fff3e0'" style="padding:2px 12px;border-radius:20px;font-size:12px;text-transform:capitalize;">
                {{ req.status }}
              </span>
            </td>
          </tr>
          <tr *ngIf="requests.length === 0"><td colspan="4" style="padding:20px;text-align:center;color:#999;">No requests yet</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: []
})
export class DaysOffComponent implements OnInit {
  requests: any[] = [];
  remainingDays: number = 0;
  pendingRequests: number = 0;
  user: any;
  newRequest: any = { type: 'vacation', startDate: '', endDate: '', reason: '' };

  constructor(private daysOffService: DaysOffService, private auth: AuthService) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    this.loadData();
  }

  loadData() {
    if (!this.user) return;
    this.daysOffService.getByEmployee(this.user.id).subscribe({
      next: (data: any) => {
        this.requests = data;
        this.pendingRequests = data.filter((r: any) => r.status === 'pending').length;
        const userData = this.auth.getUser();
        this.remainingDays = userData?.remainingLeaveDays || 25;
      },
      error: (err: any) => console.error(err)
    });
  }

  submitRequest() {
    if (!this.newRequest.startDate || !this.newRequest.endDate) {
      alert('Please select start and end dates');
      return;
    }
    this.daysOffService.request({
      ...this.newRequest,
      employeeId: this.user.id
    }).subscribe({
      next: () => {
        this.newRequest = { type: 'vacation', startDate: '', endDate: '', reason: '' };
        this.loadData();
      },
      error: (err: any) => alert(err.error?.error || 'Error submitting request')
    });
  }
}
