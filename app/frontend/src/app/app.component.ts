import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  template: ``,
  styles: []
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
