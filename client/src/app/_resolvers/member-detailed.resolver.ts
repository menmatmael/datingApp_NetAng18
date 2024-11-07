import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { MembersService } from '../_services/members.service';
import { Member } from '../_models/member';

export const memberDetailedResolver: ResolveFn<Member | null> = (route: ActivatedRouteSnapshot, state) => {
  const username = route.paramMap.get('username');

  if (!username) return null;

  return inject(MembersService).getMember(username);
};
