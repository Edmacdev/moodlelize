import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-edit-moodle-dialog',
  templateUrl: './edit-moodle-dialog.component.html',
  styleUrls: ['./edit-moodle-dialog.component.scss']
})
export class EditMoodleDialogComponent implements OnInit {
  rForm: FormGroup;

  form_name: string;
  form_url: string;
  form_token: string;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditMoodleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.rForm = fb.group({
      'name': [this.form_name, Validators.required],
      'url': [this.form_url, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(30)])],
      'token': [this.form_token, Validators.required]
    })
  }

  ngOnInit() {
    this.form_name = this.data.name;
    this.form_url = this.data.url;
    this.form_token = this.data.token;
  }
  onCloseConfirm(){
    this.rForm.value._id = this.data._id
    let data {
      status: 'confirm',
      value: this.rForm.value
    }
    this.dialogRef.close(data)

  }
  onCloseCancel(){
    this.dialogRef.close("cancel")
  }

}
