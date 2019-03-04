import { SearchTerm } from './search-term';
import * as knex from 'knex';

export interface ISearchConfig {
  queryBuilder: knex.QueryBuilder;
  searchableFields: string[];
  displayableFields: string[];
  hasSoftDeletes?: boolean;
  idField?: string;
}

export interface IPagingFields {
  total: number;
  perPage: number;
  currentPage: number;
  totalPages: number;
  nextPage: number;
  prevPage: number;
  firstPage: number;
  lastPage: number;
}

export interface ISearchResult {
  results: any;
  filters: any;
  orderBy: IOrderBy[];
  count: number;
  paging: IPagingFields | null;
}

export interface IOrderBy {
  column: string;
  direction: string;
}

const VALID_DIRECTIONS = [
  'asc',
  'desc',
  'ASC',
  'DESC',
  'IS NULL',
  'IS NOT NULL',
  'NULLS LAST',
  'NULLS FIRST'
];

export class Search {
  public perPage: number = 25;
  public total: number;
  public page: number;
  public filters: any;
  public columns: string[];
  public orderBy: IOrderBy[];
  public queryBuilder: knex.QueryBuilder;
  public searchableFields: string[];
  public displayableFields: string[];
  public skipPaging = false;
  public withDeleted = false;
  public hasSoftDeletes = true;
  public idField = 'id';

  constructor(config: ISearchConfig) {
    this.queryBuilder = config.queryBuilder;
    this.searchableFields = config.searchableFields;
    this.displayableFields = config.displayableFields;
    if (config.hasOwnProperty('hasSoftDeletes')) {
      this.hasSoftDeletes = config.hasSoftDeletes;
    }
    if (config.hasOwnProperty('idField')) {
      this.idField = config.idField;
    }
    this.searchableFields.push(this.idField);
  }

  public createSearch(fields = {}): this {
    const setable = [
      'columns',
      'noPaging',
      'orderBy',
      'page',
      'perPage',
      'withDeleted'
    ];

    Object.keys(fields).forEach(f => {
      if (setable.includes(f)) {
        this.setField(f, fields[f]);
      } else {
        this.setFilter(f, fields[f]);
      }
    });

    return this;
  }

  public setFilter(field: string, value: any): void {
    const column = field.split('__');

    if (!this.filters) {
      this.filters = {};
    }

    // make sure the filter's column is searchable
    if (this.searchableFields.includes(column[0])) {
      this.filters[field] = value;
    }
  }

  public setField(field: string, value: any): void {
    if (field === 'orderBy') {
      if (!Array.isArray(this[field])) {
        this[field] = [];
      }

      if (Array.isArray(value)) {
        value.forEach(v => {
          this.setField(field, v);
        });
        return;
      }

      const oderByValue = this.parseOrderBy(value);

      if (oderByValue) {
        this[field].push(oderByValue);
      }

      return;
    }

    if (field === 'withDeleted') {
      this.withDeleted = true;
      return;
    }

    if (field === 'noPaging') {
      this.skipPaging = true;
    }

    if (field === 'columns') {
      value = this.parseColumns(value);
    }

    this[field] = value;
  }

  public async run(): Promise<ISearchResult> {
    let pagingData = null;
    if (!this.skipPaging) {
      pagingData = await this.getPaging();
    }
    const query = this.buildQuery();
    const results = await query;
    return {
      count: Number(results.length || 0),
      orderBy: this.orderBy || null,
      filters: this.filters || {},
      results: results || {},
      paging: pagingData
    };
  }

  public modifyQuery(query: knex.QueryBuilder) {
    // allow modifing the query
  }

  protected async getPaging(): Promise<IPagingFields> {
    this.total = await this.getTotal();
    const perPage = Number(this.perPage || 25);
    const totalPages = Math.ceil(this.total / this.perPage);
    const currentPage = Number(this.page || 1);
    const offset = (currentPage - 1) * perPage;
    const nextPage = currentPage >= totalPages ? null : currentPage + 1;
    const prevPage = currentPage <= 1 ? null : currentPage - 1;
    const firstPage = totalPages > 0 ? 1 : null;
    const lastPage = totalPages > 0 ? totalPages : null;
    this.page = offset;
    this.perPage = perPage;

    if (currentPage !== 1 && currentPage > totalPages) {
      throw new Error('Page does not exist');
    }
    return {
      total: this.total,
      perPage,
      currentPage,
      prevPage,
      nextPage,
      firstPage,
      lastPage,
      totalPages
    };
  }

  protected async getTotal(): Promise<number> {
    const query = this.queryBuilder
      .clearSelect()
      .clearWhere()
      .count(this.idField)
      .offset(0)
      .limit(1000000000000);

    this.addWhereClauses(query);

    const total = await query;

    return total.length ? Number(total[0].count) : 0;
  }

  protected buildQuery(): knex.QueryBuilder {
    const query = this.queryBuilder
      .clearSelect()
      .clearWhere()
      .select(this.getColumns());

    this.addWhereClauses(query);

    if (this.page) {
      query.offset(Number(this.page));
    }

    if (this.perPage && this.perPage > 0) {
      query.limit(Number(this.perPage));
    }

    if (this.orderBy && this.orderBy.length) {
      this.orderBy.forEach(o => {
        if (this.searchableFields.includes(o.column)) {
          query.orderByRaw(
            `"${o.column}"${o.direction ? ' ' + o.direction : ''}`
          );
        }
      });
    }

    this.modifyQuery(query);

    return query;
  }

  private getColumns(): string[] {
    if (!this.columns || !this.columns.length) {
      this.columns = this.displayableFields;
    }
    const columns = [this.idField, ...this.columns].filter((elem, pos, arr) => {
      if (
        elem !== undefined &&
        elem !== '' &&
        elem !== null &&
        this.displayableFields.includes(elem) &&
        arr.indexOf(elem) === pos
      ) {
        return true;
      }
      return false;
    });
    return columns.length ? columns : [this.idField];
  }

  private addWhereClauses(query: knex.QueryBuilder) {
    for (const column in this.filters) {
      if (this.filters.hasOwnProperty(column)) {
        const term = new SearchTerm(column, this.filters[column]);
        term.appendWhereClauseToQuery(query);
      }
    }
    if (this.hasSoftDeletes && !this.withDeleted) {
      query.whereNull('deleted_at');
    }
  }

  private parseOrderBy(v: any): IOrderBy {
    v = v.split(',');

    if (!this.searchableFields.includes(v[0])) {
      return null;
    }

    return {
      column: v[0],
      direction: VALID_DIRECTIONS.includes(v[1]) ? v[1] : 'asc'
    };
  }

  private parseColumns(v: any): string[] {
    v = Array.isArray(v) ? v : v.split(',');
    return v.filter((elem, pos, arr) => {
      if (
        elem !== undefined &&
        elem !== null &&
        elem !== '' &&
        arr.indexOf(elem) === pos
      ) {
        return true;
      }
      return false;
    });
  }
}
