import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  template: `
<div style="width:220px;background:#1a1a2e;display:flex;flex-direction:column;flex-shrink:0;position:fixed;top:0;left:0;height:100vh;z-index:100;overflow-y:auto;">
  <!-- Logo -->
  <div style="padding:24px 20px 20px;border-bottom:1px solid #2d2d4e;">
    <div style="font-size:18px;font-weight:700;color:#fff;">🌸 PLW HR</div>
    <div style="font-size:11px;margin-top:4px;font-weight:500;text-transform:uppercase;letter-spacing:.08em;"
         [style.color]="isAdmin ? '#e91e8c' : '#3b82f6'">
      {{ isAdmin ? 'Admin RH' : 'Employé' }}
    </div>
  </div>

  <!-- Nav Admin -->
  <nav *ngIf="isAdmin" style="padding:12px 0;flex:1;">
    <a routerLink="/dashboard" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:true}"
       style="display:block;padding:10px 20px;text-decoration:none;" [class.active-link]="current==='/dashboard'">
      <span [style.color]="current==='/dashboard' ? '#e91e8c' : '#9090b8'" style="font-size:13px;font-weight:600;">📊 Tableau de bord</span>
    </a>
    <a routerLink="/employees" style="display:block;padding:10px 20px;text-decoration:none;">
      <span [style.color]="current==='/employees' ? '#e91e8c' : '#9090b8'" style="font-size:13px;">👥 Employés</span>
    </a>
    <a routerLink="/requests" style="display:block;padding:10px 20px;text-decoration:none;">
      <span [style.color]="current==='/requests' ? '#e91e8c' : '#9090b8'" style="font-size:13px;">📋 Demandes</span>
    </a>
    <a routerLink="/days-off" style="display:block;padding:10px 20px;text-decoration:none;">
      <span [style.color]="current==='/days-off' ? '#e91e8c' : '#9090b8'" style="font-size:13px;">📅 Congés</span>
    </a>
    <a routerLink="/wfh" style="display:block;padding:10px 20px;text-decoration:none;">
      <span [style.color]="current==='/wfh' ? '#e91e8c' : '#9090b8'" style="font-size:13px;">🏠 Télétravail</span>
    </a>
    <a routerLink="/timecard" style="display:block;padding:10px 20px;text-decoration:none;">
      <span [style.color]="current==='/timecard' ? '#e91e8c' : '#9090b8'" style="font-size:13px;">⏱ Feuilles de temps</span>
    </a>
    <a routerLink="/appraisals" style="display:block;padding:10px 20px;text-decoration:none;">
      <span [style.color]="current==='/appraisals' ? '#e91e8c' : '#9090b8'" style="font-size:13px;">⭐ Évaluations</span>
    </a>
    <a routerLink="/interviews" style="display:block;padding:10px 20px;text-decoration:none;">
      <span [style.color]="current==='/interviews' ? '#e91e8c' : '#9090b8'" style="font-size:13px;">🎯 Entretiens</span>
    </a>
  </nav>

  <!-- Nav Employé -->
  <nav *ngIf="!isAdmin" style="padding:12px 0;flex:1;">
    <a routerLink="/dashboard" style="display:block;padding:10px 20px;text-decoration:none;">
      <span [style.color]="current==='/dashboard' ? '#3b82f6' : '#9090b8'" style="font-size:13px;font-weight:600;">📊 Tableau de bord</span>
    </a>
    <a routerLink="/timecard" style="display:block;padding:10px 20px;text-decoration:none;">
      <span [style.color]="current==='/timecard' ? '#3b82f6' : '#9090b8'" style="font-size:13px;">⏱ Feuilles de temps</span>
    </a>
    <a routerLink="/days-off" style="display:block;padding:10px 20px;text-decoration:none;">
      <span [style.color]="current==='/days-off' ? '#3b82f6' : '#9090b8'" style="font-size:13px;">📅 Congés</span>
    </a>
    <a routerLink="/wfh" style="display:block;padding:10px 20px;text-decoration:none;">
      <span [style.color]="current==='/wfh' ? '#3b82f6' : '#9090b8'" style="font-size:13px;">🏠 Télétravail</span>
    </a>
    <a routerLink="/appraisals" style="display:block;padding:10px 20px;text-decoration:none;">
      <span [style.color]="current==='/appraisals' ? '#3b82f6' : '#9090b8'" style="font-size:13px;">⭐ Évaluations</span>
    </a>
    <a routerLink="/interviews" style="display:block;padding:10px 20px;text-decoration:none;">
      <span [style.color]="current==='/interviews' ? '#3b82f6' : '#9090b8'" style="font-size:13px;">🎯 Entretiens</span>
    </a>
  </nav>

  <!-- User + Logout -->
  <div style="padding:16px 20px;border-top:1px solid #2d2d4e;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <div [style.background]="isAdmin ? '#e91e8c' : '#3b82f6'"
           style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0;">
        {{ initials }}
      </div>
      <div style="min-width:0;">
        <div style="font-size:12px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ user?.firstName }} {{ user?.lastName }}</div>
        <div style="font-size:10px;color:#7b7ba8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ user?.email }}</div>
      </div>
    </div>
    <button (click)="logout()"
      style="width:100%;padding:8px;border:1px solid #3d3d5e;border-radius:6px;background:transparent;color:#9090b8;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .2s;"
      onmouseover="this.style.background='#e91e8c22';this.style.color='#fff';this.style.borderColor='#e91e8c'"
      onmouseout="this.style.background='transparent';this.style.color='#9090b8';this.style.borderColor='#3d3d5e'">
      🚪 Déconnexion
    </button>
  </div>
</div>
  `,
  styles: []
})
export class SidebarComponent implements OnInit {
  user: any;
  isAdmin = false;
  current = '';
  initials = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    this.isAdmin = this.user?.role === 'admin';
    this.initials = ((this.user?.firstName?.[0] || '') + (this.user?.lastName?.[0] || '')).toUpperCase() || 'U';
    this.current = this.router.url.split('?')[0];
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.current = e.urlAfterRedirects.split('?')[0];
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
