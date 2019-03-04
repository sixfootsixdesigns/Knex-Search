import { Search } from './search';

export class MockSearch extends Search {
  public testBuildQuery() {
    return this.buildQuery();
  }
}
