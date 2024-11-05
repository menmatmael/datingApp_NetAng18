import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { User } from '../_models/user';
import { environment } from '../../environments/environment';
import { LikesService } from './likes.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private likesService = inject(LikesService);
  baseUrl = environment.apiUrl;

  currentUser = signal<User | null>(null);

  login(model: any): Observable<any> {
    return this.http.post<User>(`${this.baseUrl}account/login`, model)
      .pipe(
        tap(user => {
          if (user) this.setCurrentUser(user);
        })
      );
  }

  setCurrentUser(user: User) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUser.set(user);
    this.likesService.getLikeIds();
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUser.set(null);
  }

  register(model: any): Observable<any> {
    return this.http.post<User>(`${this.baseUrl}account/register`, model)
      .pipe(
        tap(user => {
          if (user) this.setCurrentUser(user);
        })
      );
  }
}
