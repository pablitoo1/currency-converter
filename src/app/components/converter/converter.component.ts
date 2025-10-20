import { Component, OnInit } from '@angular/core';
import { pipe } from 'fp-ts/function';
import { fold as foldTask } from 'fp-ts/TaskEither';
import { CurrencyService } from '../../services/currency.service';
import { Result } from '../../utils/result';
import { ResultComponent } from '../result/result.component';
import { AmountInputComponent } from '../amount-input/amount-input.component';
import { CurrencyDropdownComponent } from '../currency-dropdown/currency-dropdown.component';
import { ConvertFacadeService } from '../../services/convert-facade.service';

@Component({
  selector: 'app-converter',
  imports: [ResultComponent, AmountInputComponent, CurrencyDropdownComponent],
  templateUrl: './converter.component.html',
})
export class ConverterComponent implements OnInit {
  from = 'EUR';
  to = 'PLN';
  amount = '';
  result: Result = { converted: '', date: '' };
  currencies: string[] = [];

  constructor(
    private currencyService: CurrencyService,
    private convertFacadeService: ConvertFacadeService
  ) {}

  ngOnInit() {
    this.convertFacadeService
      .loadCurrencies()
      .then(({ currencies, defaultFrom, defaultTo }) => {
        this.currencies = currencies;
        this.from = defaultFrom;
        this.to = defaultTo;
      });
  }

  convert() {
    this.result = { converted: 'Converting...', date: '' };

    pipe(
      this.convertFacadeService.convert(this.from, this.to, this.amount),
      foldTask(
        (err) => async () => ({ converted: `${err.message}`, date: '' }),
        (res) => async () => res
      )
    )().then((res) => (this.result = res));
  }
}
