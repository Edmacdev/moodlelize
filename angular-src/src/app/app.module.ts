import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { FlashMessagesModule } from 'angular2-flash-messages'
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCardModule, MatMenuModule, MatToolbarModule, MatIconModule } from '@angular/material';
import {MatDialogModule} from '@angular/material/dialog';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { MoodleRegComponent } from './components/moodle-reg/moodle-reg.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';

import { ValidateService } from './services/validate.service';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { MoodleService } from './services/moodle.service';
import { UtilService } from './services/util.service';

import { MoodleApiService } from './services/moodle-api.service';
import { CoursePageComponent } from './components/course-page/course-page.component';
import { SearchComponent } from './components/search/search.component';
import { UserComponent } from './components/user/user.component';
import { DisplayCoursesComponent } from './components/display-courses/display-courses.component';
import { DisplayUsersComponent } from './components/display-users/display-users.component';

import 'hammerjs';
import { DisplayUsersDialogComponent } from './components/display-users-dialog/display-users-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    HomeComponent,
    DashboardComponent,
    ProfileComponent,
    MoodleRegComponent,
    CoursePageComponent,
    SearchComponent,
    UserComponent,
    DisplayCoursesComponent,
    DisplayUsersComponent,
    DisplayUsersDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    FlashMessagesModule.forRoot(),
    HttpModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatDialogModule
  ],
  providers: [
    ValidateService,
    AuthService,
    AuthGuard,
    MoodleService,
    MoodleApiService,
    UtilService
  ],
  bootstrap: [AppComponent],
  entryComponents:[
    DisplayUsersDialogComponent
  ]
})
export class AppModule { }
