import { Component, OnInit } from '@angular/core';
import { pipe } from 'fp-ts/function';
import { fold as foldEither } from 'fp-ts/Either';
import { fold as foldOption, fromNullable } from 'fp-ts/Option';
import { fold as foldTask } from 'fp-ts/TaskEither';
import { CurrencyService } from '../../services/currency.service';
import {
  formatConversion,
  validateDifferentCurrencies,
} from '../../utils/currency';
import { Result } from '../../utils/result';
import { ResultComponent } from '../result/result.component';
import { AmountInputComponent } from '../amount-input/amount-input.component';
import { CurrencyDropdownComponent } from '../currency-dropdown/currency-dropdown.component';

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

  constructor(private currencyService: CurrencyService) {}

  ngOnInit() {
    pipe(
      this.currencyService.getCurrencies(),
      foldTask(
        (err) => async () => {
          this.result = {
            converted: 'Błąd ładowania walut: ' + err.message,
            date: '',
          } as Result;
          this.currencies = ['EUR', 'USD', 'PLN'];
        },
        (currs) => async () => {
          this.currencies = currs;
          this.from = 'EUR';
          this.to = currs.includes('PLN') ? 'PLN' : currs[0];
        }
      )
    )();
  }

  convert() {
    const maybeAmount = fromNullable(this.amount);

    this.result = foldOption(
      () => ({ converted: 'Enter the amount!', date: '' }),
      (val) => {
        const parsed = this.currencyService.parseAmount(val as string);

        return pipe(
          parsed,
          foldEither(
            (err) => ({ converted: err, date: '' }),
            (amountNum) =>
              pipe(
                validateDifferentCurrencies(this.from, this.to),
                foldEither(
                  (msg) => ({ converted: msg, date: '' }),
                  () => {
                    const task = this.currencyService.getRate(
                      this.from,
                      this.to
                    );
                    this.currencyService.logIO(
                      `Downloading the ${this.from}→${this.to} rate...`
                    )();

                    pipe(
                      task,
                      foldTask(
                        (err) => async () => ({
                          converted: `Error: ${err.message}`,
                          date: '',
                        }),
                        ({ rate, date }) =>
                          async () =>
                            formatConversion(
                              amountNum,
                              this.from,
                              this.to,
                              rate,
                              date
                            )
                      )
                    )().then((res) => (this.result = res));

                    return { converted: 'Converting...', date: '' };
                  }
                )
              )
          )
        );
      }
    )(maybeAmount);
  }
}
