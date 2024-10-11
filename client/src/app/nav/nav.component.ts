import { Component, inject, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [FormsModule, BsDropdownModule, RouterLink, RouterLinkActive, TitleCasePipe],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  accountService = inject(AccountService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  model: any = {};

  login() {
    const sub = this.accountService.login(this.model).subscribe({
      next: () => this.router.navigateByUrl('/members'),
      error: err => this.toastr.error(err.error)
    });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }
}
