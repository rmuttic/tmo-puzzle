import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { FetchPriceQuery } from './price-query.actions';
import { PriceQueryPartialState } from './price-query.reducer';
import { getSelectedSymbol, getAllPriceQueries } from './price-query.selectors';
import { map, skip } from 'rxjs/operators';

@Injectable()
export class PriceQueryFacade {
  selectedSymbol$ = this.store.pipe(select(getSelectedSymbol));
  priceQueries$ = this.store.pipe(
    select(getAllPriceQueries),
    map(priceQueries =>
      priceQueries.map(priceQuery => [priceQuery.date, priceQuery.close])
    )
  );

  priceQueriesWithDate(stDate: Date, endDate: Date) {
    return this.store.pipe(
      select(getAllPriceQueries),
      map(priceQueries =>
        priceQueries
          .filter(
            data =>
              new Date(data.date).getTime() >= stDate.getTime() &&
              new Date(data.date).getTime() <= endDate.getTime()
          )
          .map(priceQuery => [priceQuery.date, priceQuery.close])
      )
    );
  }

  constructor(private store: Store<PriceQueryPartialState>) {}

  fetchQuote(symbol: string, period: string) {
    this.store.dispatch(new FetchPriceQuery(symbol, period));
  }
}
