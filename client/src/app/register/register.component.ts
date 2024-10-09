import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  accountService = inject(AccountService);

  model: any = {};
  cancel = output<boolean>();

  register() {
    this.accountService.register(this.model)
      .subscribe({
        next: response => {
          console.log(response);
          this.cancelRegistration();
        },
        error: (err) => console.error(err)
      });
  }

  cancelRegistration() {
    this.cancel.emit(false);
  }
}
