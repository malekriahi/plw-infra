import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TimecardComponent } from './components/timecard/timecard.component';
import { DaysOffComponent } from './components/days-off/days-off.component';
import { WFHComponent } from './components/wfh/wfh.component';
import { InterviewsComponent } from './components/interviews/interviews.component';
import { AppraisalsComponent } from './components/appraisals/appraisals.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'timecard', component: TimecardComponent, canActivate: [AuthGuard] },
  { path: 'days-off', component: DaysOffComponent, canActivate: [AuthGuard] },
  { path: 'wfh', component: WFHComponent, canActivate: [AuthGuard] },
  { path: 'interviews', component: InterviewsComponent, canActivate: [AuthGuard] },
  { path: 'appraisals', component: AppraisalsComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({ imports: [RouterModule.forRoot(routes)], exports: [RouterModule] })
export class AppRoutingModule { }
