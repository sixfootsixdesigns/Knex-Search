# Knex Search

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

  const results = await searchObject.createSearch(query).run();

  consle.log(results);
```

## Named Request paramaters:
- `page` Defines the page of the results to go to. ie: `page=2`
- `perPage` Defines the number of results per page. ie: `perPage=50` default is `25`
- `orderBy` Defines the order for the search. format: `column,direction` ie: `orderBy=id,desc` or `orderBy=id,asc` or `orderBy=id`. You can also send multiple order bys ie: `orderBy=id,desc&orderBy=name,asc`. You can order by nulls as well: `orderBy=latitude,IS NULL` `orderBy=latitude,IS NOT NULL` `orderBy=latitude,NULLS LAST` `orderBy=latitude,NULLS FIRST`. Valid `directions` are `asc, desc, ASC, DESC, IS NULL, IS NOT NULL, NULLS LAST, NULLS FIRST`
- `columns` Defines the columns you want back in the results. You can send a comma separated list ie: `columns=id,city,state` or you can send an array `columns=id&columns=city&columns=state`. The columns you can display are limited by the `displayableFields` passed into the `Search` constructor.

## Search Terms
You can pass any number of search terms to the search end point. The columns you can search against are limited by the `searchableFields` passed into the `Search` constructor. ie: `city=Denver&state__li=CO`

You can also modify how the search term searches using modifiers. The Format is `term__modifier`; The following modifiers are available:
- `__li` Creates a Like query where wild cards are placed on each side of the search value. `city__li=den` => `where city like %den%;`
- `__in` Creates an In query. `city__in=denver&city__in=lakewood` => `where city in ('denver', 'lakewood')`
- `__nin` Creates a Not In query. `city__nin=denver&city__nin=lakewood` => `where city not in ('denver', 'lakewood')`
- `__gt` Creates a Greater Than query. `sqft__gt=100` => `where sqft > 100`
- `__gte` Creates a Greater Than Or Equal query. `sqft__gte=100` => `where sqft >= 100`
- `__lt` Creates a Less Than query. `sqft__lt=100` => `where sqft < 100`
- `__lte` Creates a Less Than Or Equal query. `sqft__lte=100` => `where sqft <= 100`
- `__btw` Creates a Between query. `sqft__btw=1000|2000` => `where sqft between 1000 and 2000`
- `__n` Creates a Where NULL query. `deleted_at__n=true` => `where deleted_at is null`
- `__nn` Creates a Where NOT NULL query. `deleted_at__nn=true` => `where deleted_at is not null`
- `__neq` Creates a Not Equals query. `city__neq=denver` => `where city != denver`
- `__eq` Creates an Equals query. `city__eq=denver` => `where city = denver`
- If no modifer is present it creates an `__eq` query
