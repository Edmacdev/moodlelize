import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AppComponent } from './app.component';
import { MoodlesComponent } from './components/moodles/moodles.component';
import { ProfileComponent } from './components/profile/profile.component';
import { UserComponent } from './components/user/user.component';
import { ReportComponent } from './components/report/report.component';
import { CoursePageComponent } from './components/course-page/course-page.component';

import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [

  {
    path: 'perfil',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'moodles',
    component: MoodlesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'relatorio',
    component: ReportComponent
  },
  {
    path: '',
    component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
