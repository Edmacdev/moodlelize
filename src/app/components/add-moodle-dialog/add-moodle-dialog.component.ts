import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-add-moodle-dialog',
  templateUrl: './add-moodle-dialog.component.html',
  styleUrls: ['./add-moodle-dialog.component.scss']
})
export class AddMoodleDialogComponent implements OnInit {
  fg_add_moodle: FormGroup;

  form_name: string;
  form_url: string;
  form_token: string;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditMoodleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.fg_add_moodle = fb.group({
      'name': [null, Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(30)])],
      'url': [null, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(30)])],
      'token': [null, Validators.compose([Validators.required, Validators.minLength(32)])]
    })
  }

  ngOnInit() {
  }
  onCloseConfirm(){
    this.fg_add_moodle.value.id = this.data.id
    let data ={
      status: 'confirm',
      value: this.fg_add_moodle.value
    }
    this.dialogRef.close(data)

  }
  onCloseCancel(){
    this.dialogRef.close("cancel")
  }

}
