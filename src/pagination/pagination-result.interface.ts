export interface PaginationResult<PaginationEntity> {
  result: PaginationEntity[];
  page: number;
  limit: number;
  count: number;
}
