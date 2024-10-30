import { Component, inject, OnInit, output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { JsonPipe, NgIf } from '@angular/common';
import { TextInputComponent } from "../_forms/text-input/text-input.component";
import { DatePickerComponent } from '../_forms/date-picker/date-picker.component';
import { Router } from '@angular/router';

function matchValues(matchTo: string): ValidatorFn {
  return (control: AbstractControl) => {
    const controlValue = control.value;
    const otherControlValue = control.parent?.get(matchTo)?.value;

    return controlValue === otherControlValue ? null : { isNotMatching: true }
  }
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, JsonPipe, NgIf, TextInputComponent, DatePickerComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  cancel = output<boolean>();

  registerForm: FormGroup = new FormGroup({});
  maxDate = new Date();
  validationErrors: string[] | undefined;

  ngOnInit(): void {
    this.initializeForm();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      gender: ['male'],
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(10)]],
      confirmPassword: ['', [Validators.required, matchValues('password')]],
    });
    this.registerForm.controls['password'].valueChanges
      .subscribe(() => this.registerForm.controls['confirmPassword'].updateValueAndValidity())
  }

  register() {
    const dob = this.getDateOnly(this.registerForm.get('dateOfBirth')?.value);
    const model = { ...this.registerForm.value, dateOfBirth: dob };
    // this.registerForm.patchValue({dateOfBirth: dob});
    // console.log(this.registerForm.value);
    this.accountService.register(model)
      .subscribe({
        next: () => this.router.navigateByUrl('/members'),
        error: (err) => this.validationErrors = err
      });
  }

  cancelRegistration() {
    this.cancel.emit(false);
  }

  private getDateOnly(dob: string | undefined) {
    if (!dob) return;
    return new Date(dob).toISOString().slice(0, 10);
  }
}
