import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AccountService } from './account.service';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private accountService = inject(AccountService);

  baseUrl = environment.apiUrl;


  getUsersWithRoles() {
    return this.http.get<User[]>(`${this.baseUrl}admin/users-with-roles`);
  }

  updateUserRoles(username: string, roles: string[]) {
    return this.http.post<string[]>(
      `${this.baseUrl}admin/edit-roles/${username}?roles=${roles}`, {}
    );
  }
}
