# Knex Search

## Install
```
yarn add knex-search
```

## Example
```
  import * as knex from 'knex';
  import { Search } from 'knex-search';

  const searchObject = new Search({
    queryBuilder: knex({ client: 'pg' })('your_table'),
    searchableFields: ['name', 'id', 'created_at', 'deleted_at'],
    displayableFields: ['name', 'id', 'created_at', 'deleted_at'],
  });

  const query = {
    name__li: 'denver',
    orderBy: ['name,desc'],
  };

  const result = await searchObject.createSearch(query).run();

  /*
  // result...
  {
    count: 25,
    currentPage: 1,
    filters: {
      name__li: "denver",
    },
    firstPage: 1,
    lastPage: 2,
    nextPage: 1,
    orderBy: [{column: "name", direction: "desc"}],
    perPage: 25,
    prevPage: null,
    results: [{id: 1, name: "denver"}, ...],
    total: 50,
    totalPages: 2,
  }
  */
```

## Named Query Keys:

`page` Defines the page of the results to go to.
```
const query = {
  name: 'Denver',
  page: 2
};
const results = await searchObject.createSearch(query).run();
```

`perPage` Defines the number of results per page. Default is `25`
```
const query = {
  name: 'Denver',
  perPage: 40
};
const results = await searchObject.createSearch(query).run();
```

`orderBy` Defines the order for the search. format: `column,direction`. 
Valid `directions` are `asc, desc, ASC, DESC, IS NULL, IS NOT NULL, NULLS LAST, NULLS FIRST`. 
The columns you can order by are limited by the `searchableFields` passed into the `Search` constructor.

```
const query = {
  name: 'Denver',
  orderBy: 'id,desc'
};
const results = await searchObject.createSearch(query).run();
```

Multiple order bys
```
const query = {
  name: 'Denver',
  orderBy: ['id,decs', 'name,asc']
};
const results = await searchObject.createSearch(query).run();
```

`columns` Defines the columns you want back in the results.
```
const query = {
  name: 'Denver',
  columns: ['id', 'name']
};
const results = await searchObject.createSearch(query).run();
```

`noPaging` If passed in the paging will not be calculated
```
const query = {
  name: 'Denver',
  noPaging: true
};
const results = await searchObject.createSearch(query).run();
```

`withDeleted` If passed in the paging will included deleted records
```
const query = {
  name: 'Denver',
  withDeleted: true
};
const results = await searchObject.createSearch(query).run();
```

## Search Terms
You can pass any number of search class. 
The columns you can search against are limited by the `searchableFields` passed into the `Search` constructor.
You can also modify how the search term searches using modifiers. 
The Format is `column__modifier`; 

The following modifiers are available:
- `__li` Creates a Like query where wild cards are placed on each side of the search value. `column__li: 'fo'`
- `__in` Creates an In query. `column__in: ['foo', 'bar']`
- `__nin` Creates a Not In query. `column__nin: ['foo', 'bar']`
- `__gt` Creates a Greater Than query. `column__gt: '100'`
- `__gte` Creates a Greater Than Or Equal query. `column__gte: '100'`
- `__lt` Creates a Less Than query. `column__lt: '100'`
- `__lte` Creates a Less Than Or Equal query. `column__lte: '100'`
- `__btw` Creates a Between query. `column__btw: '1000|2000'`
- `__n` Creates a Where NULL query. `column__n: true`
- `__nn` Creates a Where NOT NULL query. `column__nn: true`
- `__neq` Creates a Not Equals query. `column__neq: 'foo'`
- `__eq` Creates an Equals query. `column__eq: 'foo'`
- If no modifer is present it creates an `__eq` query

```
const query = {
  name_li: 'dave',
  age_gt: 30,
};
const results = await searchObject.createSearch(query).run();
```
