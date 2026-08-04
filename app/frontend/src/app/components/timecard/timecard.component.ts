import { Component, OnInit } from '@angular/core';
import { TimecardService } from '../../services/timecard.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-timecard',
  template: `
    <div style="padding:20px;max-width:800px;margin:0 auto;">
      <h1 style="color:#880e4f;">⏱️ Timecard</h1>
      <p style="color:#666;margin-bottom:20px;">Clock in/out and track your working hours</p>
      <div style="background:#e8f5e9;padding:20px;border-radius:12px;margin-bottom:20px;text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">{{ openTimecard ? '🟢' : '⏸️' }}</div>
        <h2>{{ openTimecard ? 'Currently Clocked In' : 'Not Clocked In' }}</h2>
        <p style="color:#666;">{{ openTimecard ? 'Clocked in at ' + (openTimecard.clockIn | date:'HH:mm') : 'Ready to start your shift' }}</p>
        <button (click)="toggleClock()" style="margin-top:12px;padding:10px 30px;border:none;border-radius:8px;background:#880e4f;color:#fff;font-size:16px;cursor:pointer;">
          {{ openTimecard ? '🔴 Clock Out' : '🟢 Clock In' }}
        </button>
      </div>
      <h3>Recent Timecards</h3>
      <table style="width:100%;border-collapse:collapse;margin-top:10px;">
        <thead><tr style="background:#f5f5f5;">
          <th style="padding:10px;text-align:left;">Date</th>
          <th style="padding:10px;text-align:left;">Clock In</th>
          <th style="padding:10px;text-align:left;">Clock Out</th>
          <th style="padding:10px;text-align:left;">Hours</th>
          <th style="padding:10px;text-align:left;">Status</th>
        </tr></thead>
        <tbody>
          <tr *ngFor="let tc of timecards" style="border-bottom:1px solid #eee;">
            <td style="padding:10px;">{{ tc.date | date:'MMM d, y' }}</td>
            <td style="padding:10px;">{{ tc.clockIn | date:'HH:mm' }}</td>
            <td style="padding:10px;">{{ tc.clockOut ? (tc.clockOut | date:'HH:mm') : '-' }}</td>
            <td style="padding:10px;">{{ tc.totalHours ? (tc.totalHours | number:'1.1-1') : '-' }}</td>
            <td style="padding:10px;">
              <span [style.background]="tc.status === 'open' ? '#e3f2fd' : '#e8f5e9'" style="padding:2px 12px;border-radius:20px;font-size:12px;">
                {{ tc.status }}
              </span>
            </td>
          </tr>
          <tr *ngIf="timecards.length === 0"><td colspan="5" style="padding:20px;text-align:center;color:#999;">No timecards yet</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: []
})
export class TimecardComponent implements OnInit {
  timecards: any[] = [];
  openTimecard: any = null;
  user: any;

  constructor(private timecardService: TimecardService, private auth: AuthService) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    this.loadTimecards();
  }

  loadTimecards() {
    if (!this.user) return;
    this.timecardService.getByEmployee(this.user.id).subscribe({
      next: (data: any) => {
        this.timecards = data;
        this.openTimecard = data.find((t: any) => t.status === 'open') || null;
      },
      error: (err: any) => console.error(err)
    });
  }

  toggleClock() {
    if (this.openTimecard) {
      this.timecardService.clockOut(this.openTimecard._id).subscribe({
        next: () => this.loadTimecards(),
        error: (err: any) => console.error(err)
      });
    } else {
      this.timecardService.clockIn(this.user.id).subscribe({
        next: () => this.loadTimecards(),
        error: (err: any) => console.error(err)
      });
    }
  }
}
