import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div style="padding:20px;max-width:1200px;margin:0 auto;">
      <h1 style="color:#880e4f;margin-bottom:8px;">🌸 Planisware-HR</h1>
      <p style="color:#666;margin-bottom:20px;">Welcome back, {{ user?.firstName }} {{ user?.lastName }}!</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:24px;">
        <div style="background:#fce4ec;padding:16px;border-radius:12px;text-align:center;border:1px solid #e5738a;">
          <h2 style="font-size:28px;color:#880e4f;">{{ stats.totalEmployees || 0 }}</h2><p style="color:#666;font-size:13px;">Employees</p>
        </div>
        <div style="background:#e8f5e9;padding:16px;border-radius:12px;text-align:center;">
          <h2 style="font-size:28px;color:#2e7d32;">{{ stats.openTimecards || 0 }}</h2><p style="color:#666;font-size:13px;">Open Timecards</p>
        </div>
        <div style="background:#fff3e0;padding:16px;border-radius:12px;text-align:center;">
          <h2 style="font-size:28px;color:#e65100;">{{ stats.pendingDaysOff || 0 }}</h2><p style="color:#666;font-size:13px;">Pending Days Off</p>
        </div>
        <div style="background:#f3e5f5;padding:16px;border-radius:12px;text-align:center;">
          <h2 style="font-size:28px;color:#6a1b9a;">{{ stats.pendingWFH || 0 }}</h2><p style="color:#666;font-size:13px;">Pending WFH</p>
        </div>
        <div style="background:#e0f7fa;padding:16px;border-radius:12px;text-align:center;">
          <h2 style="font-size:28px;color:#00695c;">{{ stats.todayInterviews || 0 }}</h2><p style="color:#666;font-size:13px;">Today's Interviews</p>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
        <a routerLink="/timecard" style="text-decoration:none;background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08);border-left:4px solid #c2185b;display:block;">
          <h4 style="color:#880e4f;">⏱️ Timecard</h4><p style="color:#666;font-size:13px;">Clock in/out</p>
        </a>
        <a routerLink="/days-off" style="text-decoration:none;background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08);border-left:4px solid #e65100;display:block;">
          <h4 style="color:#e65100;">📅 Days Off</h4><p style="color:#666;font-size:13px;">Request leave</p>
        </a>
        <a routerLink="/wfh" style="text-decoration:none;background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08);border-left:4px solid #2e7d32;display:block;">
          <h4 style="color:#2e7d32;">🏠 WFH</h4><p style="color:#666;font-size:13px;">Work from home</p>
        </a>
        <a routerLink="/interviews" style="text-decoration:none;background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08);border-left:4px solid #6a1b9a;display:block;">
          <h4 style="color:#6a1b9a;">🎯 Interviews</h4><p style="color:#666;font-size:13px;">Candidates</p>
        </a>
        <a routerLink="/appraisals" style="text-decoration:none;background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08);border-left:4px solid #00695c;display:block;">
          <h4 style="color:#00695c;">📊 Appraisals</h4><p style="color:#666;font-size:13px;">Reviews</p>
        </a>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  user: any; stats: any = {};
  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() {
    this.user = this.auth.getUser();
    this.http.get('/api/dashboard/stats').subscribe({ 
      next: (data: any) => this.stats = data, 
      error: (err: any) => console.error(err) 
    });
  }
}
