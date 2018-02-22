import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlashMessagesModule } from 'angular2-flash-messages'
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCardModule, MatMenuModule, MatToolbarModule,
        MatIconModule, MatDialogModule, MatSelectModule, MatInputModule,MatExpansionModule } from '@angular/material';
import { AngularFireModule  } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';

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
import { FlashMessagesService } from 'angular2-flash-messages';

import { MoodleApiService } from './services/moodle-api.service';
import { CoursePageComponent } from './components/course-page/course-page.component';
import { SearchComponent } from './components/search/search.component';
import { UserComponent } from './components/user/user.component';

import { environment } from '../environments/environment';

import 'hammerjs';
import { DisplayUsersDialogComponent } from './components/display-users-dialog/display-users-dialog.component';
import { UsersAddComponent } from './components/users-add/users-add.component';
import { RemoveMoodleDialogComponent } from './components/remove-moodle-dialog/remove-moodle-dialog.component';
import { EditMoodleDialogComponent } from './components/edit-moodle-dialog/edit-moodle-dialog.component';

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
    DisplayUsersDialogComponent,
    UsersAddComponent,
    RemoveMoodleDialogComponent,
    EditMoodleDialogComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    FlashMessagesModule.forRoot(),
    HttpModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    MatInputModule,
    MatExpansionModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule // imports firebase/storage only needed for storage features
  ],
  providers: [
    ValidateService,
    AuthService,
    AuthGuard,
    MoodleService,
    MoodleApiService,
    FlashMessagesService
  ],
  bootstrap: [AppComponent],
  entryComponents:[
    DisplayUsersDialogComponent,
    EditMoodleDialogComponent,
    RemoveMoodleDialogComponent
  ]
})
export class AppModule { }