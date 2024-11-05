import { Pagination } from "./pagination";


export class PaginatedResult<T> {
  items?: T;
  pagination?: Pagination;
}
