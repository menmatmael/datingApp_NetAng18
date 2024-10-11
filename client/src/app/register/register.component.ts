import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  accountService = inject(AccountService);
  private toastr = inject(ToastrService);

  model: any = {};
  cancel = output<boolean>();

  register() {
    this.accountService.register(this.model)
      .subscribe({
        next: response => {
          console.log(response);
          this.cancelRegistration();
        },
        error: (err) => this.toastr.error(err.error)
      });
  }

  cancelRegistration() {
    this.cancel.emit(false);
  }
}
