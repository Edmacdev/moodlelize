import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-display-users-dialog',
  templateUrl: './display-users-dialog.component.html',
  styleUrls: ['./display-users-dialog.component.scss']
})
export class DisplayUsersDialogComponent  {

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }


  onCloseConfirm() {
    this.dialogRef.close('Confirmar');
  }
  onCloseCancel() {
    this.dialogRef.close('Cancel');
  }
}
