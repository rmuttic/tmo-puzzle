import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PriceQueryFacade } from '@coding-challenge/stocks/data-access-price-query';
import { max } from 'date-fns';
import { debounceTime,takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'coding-challenge-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit,OnDestroy {
  stockPickerForm: FormGroup;
  symbol: string;
  period: string;
  fromDate: Date;
  toDate: Date;
  maxDate: Date = new Date();
  startDate: Date;
  quotes$: any;
  unsubscribe: Subject<void> = new Subject();

  private calcDaysDiff(fromDate:Date) : void {
    const fromDat: Date = new Date(fromDate);
    let daysDiff = Math.floor(Math.abs(<any>new Date() - <any>fromDat) / (1000*60*60*24));
    this.period = "max";
    switch(true){
      case (daysDiff < 28):
        this.period = "1m";
        break;
      case (daysDiff < 88):
        this.period = "3m";
        break;
      case (daysDiff < 179):
        this.period = "6m";
        break;
      case (daysDiff < 365):
        this.period = "1y";
        break;
      case (daysDiff < 730):
        this.period = "2y";
        break;
      case (daysDiff < 1825):
        this.period = "5y";
        break;
      default:
        break;
    }
  }

  constructor(private fb: FormBuilder, private priceQuery: PriceQueryFacade) {
    this.stockPickerForm = fb.group({
      symbol: [null, Validators.required],
      fromDate: [null,Validators.required],
      toDate: [null,Validators.required]
    });
  }

  ngOnInit() {
    this.stockPickerForm.valueChanges.pipe(takeUntil(this.unsubscribe)).pipe(debounceTime(320)).subscribe(() => {
    this.startDate = this.stockPickerForm.get('fromDate').value;
    this.fetchQuote();
    });
  }

  fetchQuote() {
    if (this.stockPickerForm.valid) {
      const { symbol, fromDate, toDate } = this.stockPickerForm.value;
      this.calcDaysDiff(fromDate);
      this.priceQuery.fetchQuote(symbol, this.period);
      this.quotes$ = this.priceQuery.priceQueriesWithDate(fromDate, toDate);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
