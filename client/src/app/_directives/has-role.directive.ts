import { AccountService } from './../_services/account.service';
import { Directive, inject, input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appHasRole]',  // *appHasRole
  standalone: true
})
export class HasRoleDirective implements OnInit {
  appHasRole = input<string[]>([]);
  private accountService = inject(AccountService);
  private viewContainerRef = inject(ViewContainerRef);
  private templateRef = inject(TemplateRef);

  ngOnInit(): void {
    if (this.accountService.roles()?.some((r: string) => this.appHasRole().includes(r))) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }
}
