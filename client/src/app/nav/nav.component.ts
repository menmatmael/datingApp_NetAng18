import { Component, inject, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [FormsModule, BsDropdownModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  accountService = inject(AccountService);
  private destroyRef = inject(DestroyRef);

  model: any = {};

  login() {
    const sub = this.accountService.login(this.model).subscribe({
      next: response => {
        console.log(response);
      },
      error: err => console.error(err.error)
    });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  logout() {
    this.accountService.logout();
  }
}
