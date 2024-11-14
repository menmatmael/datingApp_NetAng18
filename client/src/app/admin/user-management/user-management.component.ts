import { Component, inject, OnInit } from '@angular/core';
import { AdminService } from '../../_services/admin.service';
import { User } from '../../_models/user';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { RolesModalComponent } from '../../modals/roles-modal/roles-modal.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  users: User[] = [];
  bsModalRef = new BsModalRef<RolesModalComponent>();
  private modalService = inject(BsModalService);

  ngOnInit(): void {
    this.getUsersWithRoles();
  }

  openModal(user: User) {
    const initialState: ModalOptions = {
      class: 'modal-log',
      initialState: {
        title: 'User roles',
        username: user.username,
        availableRoles: ['Admin', 'Moderator', 'Member'],
        selectedRoles: [...user.roles],
        users: this.users,
        rolesUpdated: false
      }
    }
    this.bsModalRef = this.modalService.show(RolesModalComponent, initialState);
    this.bsModalRef.onHide?.subscribe(() => {
      if (this.bsModalRef.content && this.bsModalRef.content.rolesUpdated) {
        const selectedRoles = this.bsModalRef.content.selectedRoles;
        this.adminService.updateUserRoles(user.username, selectedRoles)
          .subscribe(roles => user.roles = roles);
      }
    });
  }

  getUsersWithRoles() {
    return this.adminService.getUsersWithRoles().subscribe(users => this.users = users);
  }

}
