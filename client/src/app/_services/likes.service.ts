import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Member } from '../_models/member';
import { LikesParams } from "../_models/LikesParams";
import { PaginatedResult } from '../_models/PaginatedResult';
import { setPaginatedResponse, setPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class LikesService {
  baseUrl = environment.apiUrl;

  private http = inject(HttpClient);

  likeIds = signal<number[]>([]);
  likesParams = signal<LikesParams>(new LikesParams());
  paginatedResult = signal<PaginatedResult<Member[]> | null>(null);

  toggleLike(targetId: number) {
    return this.http.post(`${this.baseUrl}likes/${targetId}`, {});
  }

  getLikes(predicate: string) {
    let params = setPaginationHeaders(this.likesParams().pageNumber, this.likesParams().pageSize);
    params = params.append('predicate', predicate);

    return this.http.get<Member[]>(`${this.baseUrl}likes`, { observe: 'response', params })
      .subscribe(response => {
        setPaginatedResponse(response, this.paginatedResult);
      });
  }

  getLikeIds() {
    return this.http.get<number[]>(`${this.baseUrl}likes/list`).subscribe(ids => this.likeIds.set(ids));
  }
}
