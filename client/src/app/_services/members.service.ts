import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member } from '../_models/member';
import { Photo } from '../_models/photo';
import { PaginatedResult } from "../_models/PaginatedResult";
import { UserParams } from '../_models/userParams';
import { of } from 'rxjs';
import { AccountService } from './account.service';
import { setPaginatedResponse, setPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private http = inject(HttpClient);
  private accountService = inject(AccountService);

  baseUrl = environment.apiUrl;
  paginatedResult = signal<PaginatedResult<Member[]> | null>(null);
  memberCache = new Map<string, HttpResponse<Member[]>>();
  loggedInUser = this.accountService.currentUser();
  userParams = signal<UserParams>(new UserParams(this.loggedInUser));

  resetUserParams() {
    this.userParams.set(new UserParams(this.loggedInUser));
  }

  getMembers() {
    const cacheKey = Object.values(this.userParams()).join('-');
    const response = this.memberCache.get(cacheKey);

    if (response) return setPaginatedResponse(response, this.paginatedResult);

    let params = setPaginationHeaders(this.userParams().pageNumber, this.userParams().pageSize);

    params = params.append('minAge', this.userParams().minAge);
    params = params.append('maxAge', this.userParams().maxAge);
    params = params.append('gender', this.userParams().gender);
    params = params.append('orderBy', this.userParams().orderBy);

    return this.http.get<Member[]>(`${this.baseUrl}users`, { observe: 'response', params })
      .subscribe(response => {
        setPaginatedResponse(response, this.paginatedResult);
        this.memberCache.set(cacheKey, response);
      });
  }

  getMember(username: string) {
    const cachedMember = [...this.memberCache.values()]
      .map(response => response.body)
      .flat()
      .find(member => member?.username === username);

    if (cachedMember) return of(cachedMember);

    return this.http.get<Member>(`${this.baseUrl}users/${username}`);
  }

  updateMember(member: Member) {
    return this.http.put(`${this.baseUrl}users`, member);
  }

  setMainPhoto(photo: Photo) {
    return this.http.put(`${this.baseUrl}users/set-main-photo/${photo.id}`, {});
  }

  deletePhoto(photo: Photo) {
    return this.http.delete(`${this.baseUrl}users/delete-photo/${photo.id}`);
  }
}
