import { expect } from 'chai';
import { SearchTerm } from './search-term';
import * as knex from 'knex';

describe('Search Terms', () => {
  let builder: knex.QueryBuilder;

  beforeEach(() => {
    builder = knex({
      client: 'pg'
    })('table');
  });

  describe('Where Like', () => {
    it('Creates query', () => {
      const term = new SearchTerm('city__li', 'Denver');
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "city" ilike \'%Denver%\''
      );
    });

    it('Creates query with array of values', () => {
      const term = new SearchTerm('city__li', ['Denver', 'Lakewood']);
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "city" ilike \'%Denver%\' or "city" ilike \'%Lakewood%\''
      );
    });
  });

  describe('Where In', () => {
    it('Creates query', () => {
      const term = new SearchTerm('city__in', 'Denver');
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "city" in \'Denver\''
      );
    });

    it('Creates query with array of values', () => {
      const term = new SearchTerm('city__in', ['Denver', 'Lakewood']);
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "city" in (\'Denver\', \'Lakewood\')'
      );
    });
  });

  describe('Where Not In', () => {
    it('Creates query', () => {
      const term = new SearchTerm('city__nin', 'Denver');
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "city" not in \'Denver\''
      );
    });

    it('Creates query with array of values', () => {
      const term = new SearchTerm('city__nin', ['Denver', 'Lakewood']);
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "city" not in (\'Denver\', \'Lakewood\')'
      );
    });
  });

  describe('Where >', () => {
    it('Creates query', () => {
      const term = new SearchTerm('price__gt', '100');
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "price" > \'100\''
      );
    });

    it('Creates query with array of values', () => {
      const term = new SearchTerm('price__gt', ['100', '200']);
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "price" > \'100\' and "price" > \'200\''
      );
    });
  });

  describe('Where >=', () => {
    it('Creates query', () => {
      const term = new SearchTerm('price__gte', '100');
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "price" >= \'100\''
      );
    });

    it('Creates query with array of values', () => {
      const term = new SearchTerm('price__gte', ['100', '200']);
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "price" >= \'100\' and "price" >= \'200\''
      );
    });
  });

  describe('Where <', () => {
    it('Creates query', () => {
      const term = new SearchTerm('price__lt', '100');
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "price" < \'100\''
      );
    });

    it('Creates query with array of values', () => {
      const term = new SearchTerm('price__lt', ['100', '200']);
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "price" < \'100\' and "price" < \'200\''
      );
    });
  });

  describe('Where <=', () => {
    it('Creates query', () => {
      const term = new SearchTerm('price__lte', '100');
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "price" <= \'100\''
      );
    });

    it('Creates query with array of values', () => {
      const term = new SearchTerm('price__lte', ['100', '200']);
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "price" <= \'100\' and "price" <= \'200\''
      );
    });
  });

  describe('Between', () => {
    it('Creates query', () => {
      const term = new SearchTerm('price__btw', '100|200');
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "price" between \'100\' and \'200\''
      );
    });

    it('Error if bad format', () => {
      const term = new SearchTerm('price__btw', '100');
      expect(() => {
        term.appendWhereClauseToQuery(builder);
      }).to.throw('Between search must contain min|max');
    });

    it('Error if empty end param', () => {
      const term = new SearchTerm('price__btw', '100|');
      expect(() => {
        term.appendWhereClauseToQuery(builder);
      }).to.throw('Between search must contain min|max');
    });

    it('Error if empty start param', () => {
      const term = new SearchTerm('price__btw', '|200');
      expect(() => {
        term.appendWhereClauseToQuery(builder);
      }).to.throw('Between search must contain min|max');
    });
  });

  describe('Where Null', () => {
    it('Creates query', () => {
      const term = new SearchTerm('deleted_at__n', 'true');
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "deleted_at" is null'
      );
    });

    it('Creates query with array of values', () => {
      const term = new SearchTerm('deleted_at__n', ['true', 'false']);
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "deleted_at" is null'
      );
    });
  });

  describe('Where Not Null', () => {
    it('Creates query', () => {
      const term = new SearchTerm('deleted_at__nn', 'true');
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "deleted_at" is not null'
      );
    });

    it('Creates query with array of values', () => {
      const term = new SearchTerm('deleted_at__nn', ['true', 'false']);
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "deleted_at" is not null'
      );
    });
  });

  describe('Send Empty', () => {
    it('Creates query', () => {
      const term = new SearchTerm('city', '');
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal('select * from "table"');
    });

    it('Creates query', () => {
      const term = new SearchTerm('city', null);
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal('select * from "table"');
    });

    it('Creates query', () => {
      const term = new SearchTerm('city', undefined);
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal('select * from "table"');
    });

    it('Creates query', () => {
      const term = new SearchTerm('city', []);
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal('select * from "table"');
    });

    it('Creates query', () => {
      const term = new SearchTerm('city', ['', null]);
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal('select * from "table"');
    });
  });

  describe('Where !=', () => {
    it('Creates query', () => {
      const term = new SearchTerm('city__neq', 'Denver');
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "city" != \'Denver\''
      );
    });

    it('Creates query with array of values', () => {
      const term = new SearchTerm('city__neq', ['Denver', 'Lakewood']);
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "city" != \'Denver\' and "city" != \'Lakewood\''
      );
    });
  });

  describe('Where =', () => {
    it('Creates query', () => {
      const term = new SearchTerm('city', 'Denver');
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "city" = \'Denver\''
      );
    });

    it('Creates query with array of values', () => {
      const term = new SearchTerm('city', ['Denver', 'Lakewood']);
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "city" = \'Denver\' and "city" = \'Lakewood\''
      );
    });

    it('Creates query using __eq', () => {
      const term = new SearchTerm('city__eq', 'Denver');
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "city" = \'Denver\''
      );
    });

    it('Creates query with array of values', () => {
      const term = new SearchTerm('city__eq', ['Denver', 'Lakewood']);
      term.appendWhereClauseToQuery(builder);
      expect(builder.toString()).to.equal(
        'select * from "table" where "city" = \'Denver\' and "city" = \'Lakewood\''
      );
    });
  });
});
