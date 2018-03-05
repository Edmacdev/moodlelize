import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AddMoodleDialogComponent } from '../add-moodle-dialog/add-moodle-dialog.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MoodleService } from '../../services/moodle.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  user: any;
  constructor(
    private router: Router,
    private authService: AuthService,
    public dialog: MatDialog,
    private moodleService:MoodleService
  ) { }

  ngOnInit() {
    this.authService.user.subscribe(
      user => {
        this.user = user
      }
    )
  }
  openAddMoodleDialog(){
    let dialogRef = this.dialog.open(AddMoodleDialogComponent,{
      width: '600px'

    });
    dialogRef.afterClosed().subscribe(
      result => {
        if(result.status == "confirm"){
          this.moodleService.addMoodle(this.user.uid, result.value)
          .then(
            () => {
              swal('', 'Moodle adicionado', 'success')
            }
          )
        }
      }
    );
  }
}
