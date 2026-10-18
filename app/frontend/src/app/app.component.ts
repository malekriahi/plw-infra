import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `
<div style="display:flex;min-height:100vh;background:#f4f6fb;font-family:Inter,system-ui,sans-serif;">
  <!-- Sidebar visible sauf sur login -->
  <app-sidebar *ngIf="showSidebar"></app-sidebar>
  <!-- Contenu principal décalé si sidebar visible -->
  <div [style.margin-left]="showSidebar ? '220px' : '0'" style="flex:1;min-height:100vh;overflow-y:auto;">
    <router-outlet></router-outlet>
  </div>
</div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  showSidebar = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      const url = e.urlAfterRedirects;
      this.showSidebar = this.auth.isAuthenticated() && !url.startsWith('/login');
    });
    // initial check
    this.showSidebar = this.auth.isAuthenticated() && !this.router.url.startsWith('/login');
  }
}
