import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoginComponent } from './components/auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TimecardComponent } from './components/timecard/timecard.component';
import { DaysOffComponent } from './components/days-off/days-off.component';
import { WFHComponent } from './components/wfh/wfh.component';
import { InterviewsComponent } from './components/interviews/interviews.component';
import { AppraisalsComponent } from './components/appraisals/appraisals.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';

import { AuthGuard } from './guards/auth.guard';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent, LoginComponent, DashboardComponent, TimecardComponent,
    DaysOffComponent, WFHComponent, InterviewsComponent, AppraisalsComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
