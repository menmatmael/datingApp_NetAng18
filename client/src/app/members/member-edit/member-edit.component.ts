import { Component, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { Member } from '../../_models/member';
import { AccountService } from '../../_services/account.service';
import { MembersService } from '../../_services/members.service';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AbstractControl, FormControl, FormGroup, FormsModule, NgForm, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PhotoEditorComponent } from "../photo-editor/photo-editor.component";


function conditionalValidator(condition: boolean, validator: ValidatorFn): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!condition) {
      return null;
    }

    return validator(control);
  };
}

@Component({
  selector: 'app-member-edit',
  standalone: true,
  imports: [TabsModule, FormsModule, PhotoEditorComponent],
  templateUrl: './member-edit.component.html',
  styleUrl: './member-edit.component.css'
})
export class MemberEditComponent implements OnInit {
  private accountService = inject(AccountService);
  private memberService = inject(MembersService);
  private toastr = inject(ToastrService);

  member?: Member;

  editForm = viewChild<NgForm>('editForm');
  @HostListener('window:beforeunload', ['$event']) notify($event: any) {
    if (this.editForm()?.dirty) {
      $event.returnValue = true;
    }
  }

  ngOnInit(): void {
    this.loadMember();
    // Using the conditionalValidator with a FormControl
    //  const myFormControl = new FormControl('', conditionalValidator(condition, Validators.required));

    const myFormControl = new FormControl('', { validators: Validators.required, updateOn: 'blur' });
    const myFormGroup = new FormGroup(
      { name: new FormControl('', { validators: Validators.required, updateOn: 'blur' }) },
      { updateOn: 'submit' }
    );
  }

  loadMember() {
    const user = this.accountService.currentUser();
    if (!user) return;
    this.memberService.getMember(user.username)
      .subscribe(member => this.member = member);
  }

  updateMember() {
    this.memberService.updateMember(this.editForm()?.value)
      .subscribe(() => {
        this.toastr.success('Profile updated successfully');
        this.editForm()?.reset(this.member);
      });
  }

  onMemberPhotosEdit(event: Member) {
    this.member = event;
  }
}
