import { User } from "./user";

export class UserParams {
  gender: string; // gender filter
  minAge = 18;
  maxAge = 99;
  pageSize = 5;
  pageNumber = 1;
  orderBy = 'lastActive';

  constructor(user: User | null) {
    this.gender = user?.gender === 'female' ? 'male' : 'female';
  }

}
