export interface PagedResult<T> {
 items: Array<T>[],
 pagination:PaginationInfo
}

export interface PaginationInfo{
  pageIndex: number;
  pageSize:number;
  totalRecords: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage:boolean;
}