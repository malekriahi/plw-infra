import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  template: `
    
🌸 Planisware HR
        
          Dashboard
          Timecard
          Days Off
          WFH
          Interviews
          Appraisals
        
      

        {{ user?.firstName }} {{ user?.lastName }}
        Logout
      

  `,
  styles: []
})
export class NavbarComponent {
  user: any;
  constructor(public auth: AuthService, private router: Router) { this.user = auth.getUser(); }
  logout() { this.auth.logout(); this.router.navigate(['/login']); }
}
