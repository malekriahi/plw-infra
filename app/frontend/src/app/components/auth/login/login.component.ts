import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
    <div style="display:flex;justify-content:center;align-items:center;min-height:100vh;background:#fce4ec;">
      <div style="background:#fff;padding:40px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,.1);width:360px;">
        <h1 style="text-align:center;color:#880e4f;">🌸 Planisware-HR</h1>
        <p style="text-align:center;color:#666;font-size:14px;margin-bottom:24px;">Timecard · Days Off · HR Management</p>
        <div *ngIf="error" style="background:#ffebee;padding:10px;border-radius:6px;color:#c62828;font-size:13px;margin-bottom:12px;">{{ error }}</div>
        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:13px;color:#666;margin-bottom:4px;">Email</label>
          <input [(ngModel)]="email" type="email" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;">
        </div>
        <div style="margin-bottom:20px;">
          <label style="display:block;font-size:13px;color:#666;margin-bottom:4px;">Password</label>
          <input [(ngModel)]="password" type="password" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;">
        </div>
        <button (click)="login()" [disabled]="loading" style="width:100%;padding:12px;border:none;border-radius:6px;background:#c2185b;color:#fff;font-size:16px;cursor:pointer;">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        <p style="text-align:center;font-size:12px;color:#999;margin-top:14px;">Default: admin&#64;planisware.com / admin123</p>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  email = 'admin@planisware.com';
  password = 'admin123';
  loading = false;
  error = '';
  constructor(private auth: AuthService, private router: Router) {}
  login() {
    this.loading = true; this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/dashboard']); },
      error: () => { this.loading = false; this.error = 'Invalid credentials'; }
    });
  }
}
