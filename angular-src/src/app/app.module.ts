import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { FlashMessagesModule } from 'angular2-flash-messages'
import { HttpModule } from '@angular/http';

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

import { MoodleApiService } from './services/moodle-api.service';
import { CoursePageComponent } from './components/course-page/course-page.component';
import { SearchComponent } from './components/search/search.component';
import { UserComponent } from './components/user/user.component';

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
    UserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    FlashMessagesModule.forRoot(),
    HttpModule
  ],
  providers: [
    ValidateService,
    AuthService,
    AuthGuard,
    MoodleService,
    MoodleApiService

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
