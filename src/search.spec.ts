import { expect } from 'chai';
import { Search, ISearchConfig } from './search';
import * as knex from 'knex';
import { MockSearch } from './mock-search';

describe('Search', async () => {
  let builder: knex.QueryBuilder;
  const searchableFields = ['city', 'state', 'zip'];
  const displayableFields = ['city', 'state'];

  const createSearchOjbect = (config = {}): Search => {
    const opts: ISearchConfig = {
      queryBuilder: builder,
      searchableFields,
      displayableFields,
      ...config
    };

    return new Search(opts);
  };

  beforeEach(() => {
    builder = knex({
      client: 'pg'
    })('table');
  });

  it('Creates search object', () => {
    const search = createSearchOjbect();
    const fields = ['city', 'state', 'zip', 'id'];
    expect(search.searchableFields).to.deep.equal(fields);
    expect(search.displayableFields).to.deep.equal(displayableFields);
    expect(search.hasSoftDeletes).to.equal(true);
    expect(search.withDeleted).to.equal(false);
  });

  it('Creates search from fields', () => {
    const query = {
      city: 'denver',
      state: 'co',
      zip: '80206',
      country: 'usa', // should be ignored
      page: 5,
      perPage: 10,
      columns: ['city'],
      orderBy: 'city,desc'
    };
    const search = createSearchOjbect().createSearch(query);
    expect(search.filters).to.deep.equal({
      city: 'denver',
      state: 'co',
      zip: '80206'
    });
    expect(search.perPage).to.equal(10);
    expect(search.page).to.equal(5);
    expect(search.columns).to.deep.equal(['city']);
    expect(search.orderBy).to.deep.equal([
      {
        column: 'city',
        direction: 'desc'
      }
    ]);
  });

  it('Creates search without paging', () => {
    const query = {
      city: 'denver',
      noPaging: true
    };
    const search = createSearchOjbect({ paging: false }).createSearch(query);
    expect(search.filters).to.deep.equal({
      city: 'denver'
    });
    expect(search.skipPaging).to.equal(true);
  });

  it('Creates search with deleted', () => {
    const query = {
      city: 'denver',
      withDeleted: true
    };
    const search = createSearchOjbect({ paging: false }).createSearch(query);
    expect(search.filters).to.deep.equal({
      city: 'denver'
    });
    expect(search.hasSoftDeletes).to.equal(true);
    expect(search.withDeleted).to.equal(true);
  });

  it('Creates search with multiple order bys from fields', () => {
    const query = {
      orderBy: ['city,desc', 'state,NULLS LAST', 'zip', 'county,asc']
    };
    const search = createSearchOjbect().createSearch(query);
    expect(search.orderBy).to.deep.equal([
      { column: 'city', direction: 'desc' },
      { column: 'state', direction: 'NULLS LAST' },
      { column: 'zip', direction: 'asc' }
    ]);
  });

  describe('setFilter', () => {
    it('Sets', () => {
      const search = createSearchOjbect();
      search.setFilter('city', 'denver');
      expect(search.filters).to.deep.equal({
        city: 'denver'
      });
    });

    it('Sets with __', () => {
      const search = createSearchOjbect();
      search.setFilter('city__li', 'denver');
      expect(search.filters).to.deep.equal({
        city__li: 'denver'
      });
    });

    it('Ignores not listed column', () => {
      const search = createSearchOjbect();
      search.setFilter('cheese', 'denver');
      expect(search.filters).to.deep.equal({});
    });
  });

  describe('setField', () => {
    it('Sets page', () => {
      const search = createSearchOjbect();
      search.setField('page', 2);
      expect(search.page).to.deep.equal(2);
    });

    it('Sets orderby', () => {
      const search = createSearchOjbect();
      search.setField('orderBy', 'city,desc');
      expect(search.orderBy).to.deep.equal([
        {
          column: 'city',
          direction: 'desc'
        }
      ]);
    });

    it('Sets orderby with bad column', () => {
      const search = createSearchOjbect();
      search.setField('orderBy', 'foo,desc');
      expect(search.orderBy).to.deep.equal([]);
    });

    it('Sets orderby with bad direction', () => {
      const search = createSearchOjbect();
      search.setField('orderBy', 'city,DANGER');
      expect(search.orderBy).to.deep.equal([
        { column: 'city', direction: 'asc' }
      ]);
    });

    it('Sets multiple orderby', () => {
      const search = createSearchOjbect();
      search.setField('orderBy', 'city');
      search.setField('orderBy', 'state,desc');
      search.setField('orderBy', 'zip,NULLS LAST');
      expect(search.orderBy).to.deep.equal([
        { column: 'city', direction: 'asc' },
        { column: 'state', direction: 'desc' },
        { column: 'zip', direction: 'NULLS LAST' }
      ]);
    });

    it('Sets columns', () => {
      const search = createSearchOjbect();
      search.setField('columns', ['city', 'state', '']);
      expect(search.columns).to.deep.equal(['city', 'state']);
    });
  });

  describe('buildQuery', async () => {
    it('Searches', async () => {
      const query = {
        city: 'denver',
        state: 'co',
        zip: '80206',
        columns: ['city'],
        orderBy: 'city,desc',
        page: 3,
        perPage: 200
      };

      const search = new MockSearch({
        queryBuilder: builder,
        searchableFields,
        displayableFields
      }).createSearch(query);

      expect(search.testBuildQuery().toString()).to.equal(
        'select "city" from "table" where ' +
          '"city" = \'denver\' ' +
          'and "state" = \'co\' ' +
          'and "zip" = \'80206\' ' +
          'and "deleted_at" is null ' +
          'order by "city" desc ' +
          'limit 200 ' +
          'offset 3'
      );
    });

    it('Searches Multiple Order By', async () => {
      const query = {
        city: 'denver',
        columns: ['city'],
        orderBy: ['city,desc', 'state,NULLS LAST', 'zip'],
        page: 3,
        perPage: 200
      };

      const search = new MockSearch({
        queryBuilder: builder,
        searchableFields,
        displayableFields
      }).createSearch(query);

      expect(search.testBuildQuery().toString()).to.equal(
        'select "city" from "table" where ' +
          '"city" = \'denver\' ' +
          'and "deleted_at" is null ' +
          'order by "city" desc, "state" NULLS LAST, "zip" asc ' +
          'limit 200 ' +
          'offset 3'
      );
    });
  });
});
