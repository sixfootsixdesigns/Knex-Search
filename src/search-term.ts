import * as knex from 'knex';

export class SearchTerm {
  protected values: any;
  protected column: string;
  protected operator: string;

  constructor(column: string, values: any) {
    const raw = column.split('__');
    this.column = raw[0];
    this.operator = raw.length === 2 ? raw[1] : null;
    this.values = values;
  }

  public appendWhereClauseToQuery(query: knex.QueryBuilder) {
    if (
      this.values === '' ||
      this.values === null ||
      this.values === undefined
    ) {
      return;
    }

    // clean blank/bad values out of arrays
    if (Array.isArray(this.values)) {
      this.values = this.values.filter(
        v => v !== '' && v !== undefined && v !== null
      );
      if (!this.values.length) {
        return;
      }
    }

    switch (this.operator) {
      case 'li':
        this.appendWhereLikeClause(query, this.column, this.values);
        break;
      case 'in':
        this.appendWhereInClause(query, this.column, this.values);
        break;
      case 'nin':
        this.appendNotWhereInClause(query, this.column, this.values);
        break;
      case 'gt':
        this.appendWhereClause(query, this.column, '>', this.values);
        break;
      case 'gte':
        this.appendWhereClause(query, this.column, '>=', this.values);
        break;
      case 'lt':
        this.appendWhereClause(query, this.column, '<', this.values);
        break;
      case 'lte':
        this.appendWhereClause(query, this.column, '<=', this.values);
        break;
      case 'btw':
        this.appendWhereBetweenClause(query, this.column, this.values);
        break;
      case 'n':
        this.appendWhereNullClause(query, this.column);
        break;
      case 'nn':
        this.appendWhereNotNullClause(query, this.column);
        break;
      case 'neq':
        this.appendWhereClause(query, this.column, '!=', this.values);
        break;
      case 'eq':
      default:
        this.appendWhereClause(query, this.column, '=', this.values);
    }
  }

  public appendWhereBetweenClause(
    query: knex.QueryBuilder,
    column: string,
    values: any
  ) {
    const args = values.split('|');
    if (args.length === 2 && args[0] !== '' && args[1] !== '') {
      query.whereBetween(column, args);
    } else {
      throw new Error('Between search must contain min|max');
    }
  }

  public appendWhereLikeClause(
    query: knex.QueryBuilder,
    column: string,
    values: any
  ) {
    if (Array.isArray(values)) {
      const [firstValue, ...restOfValues] = values;

      query.where(column, 'ILIKE', `%${firstValue}%`, [firstValue]);

      restOfValues.forEach(t => {
        query.orWhere(column, 'ILIKE', `%${t}%`, [t]);
      });
    } else {
      query.where(column, 'ILIKE', `%${values}%`, [values]);
    }
  }

  public appendWhereInClause(
    query: knex.QueryBuilder,
    column: string,
    values: any
  ) {
    query.whereIn(column, values);
  }

  public appendNotWhereInClause(
    query: knex.QueryBuilder,
    column: string,
    values: any
  ) {
    query.whereNotIn(column, values);
  }

  public appendWhereNotNullClause(query: knex.QueryBuilder, column: string) {
    query.whereNotNull(column);
  }

  public appendWhereNullClause(query: knex.QueryBuilder, column: string) {
    query.whereNull(column);
  }

  public appendWhereClause(
    query: knex.QueryBuilder,
    column: string,
    operator: string,
    values: any
  ) {
    if (Array.isArray(values)) {
      values.forEach(t => {
        query.where(column, operator, t);
      });
    } else {
      query.where(column, operator, values);
    }
  }
}
