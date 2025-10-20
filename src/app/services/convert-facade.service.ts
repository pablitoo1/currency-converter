import { Injectable } from '@angular/core';
import { pipe } from 'fp-ts/function';
import {
  TaskEither,
  right,
  fromEither,
  chain,
  map,
  fold,
} from 'fp-ts/TaskEither';
import { mapLeft } from 'fp-ts/Either';
import { CurrencyService } from './currency.service';
import {
  formatConversion,
  parseAmount,
  validateDifferentCurrencies,
} from '../utils/currency';
import { Result } from '../utils/result';

@Injectable({
  providedIn: 'root',
})
export class ConvertFacadeService {
  constructor(private currencyService: CurrencyService) {}

  convert(from: string, to: string, amount: string): TaskEither<Error, Result> {
    if (!amount) return right({ converted: 'Enter the amount!', date: '' });

    return pipe(
      fromEither(
        pipe(
          parseAmount(amount),
          mapLeft((msg) => new Error(msg))
        )
      ),
      chain((amountNum) =>
        pipe(
          fromEither(
            pipe(
              validateDifferentCurrencies(from, to),
              mapLeft((msg) => new Error(msg))
            )
          ),
          map(() => amountNum)
        )
      ),
      chain((amountNum) => {
        this.currencyService.logIO(`Downloading the ${from}→${to} rate...`)();

        return pipe(
          this.currencyService.getRate(from, to),
          map(({ rate, date }) =>
            formatConversion(amountNum, from, to, rate, date)
          )
        );
      })
    );
  }

  loadCurrencies(): Promise<{
    currencies: string[];
    defaultFrom: string;
    defaultTo: string;
  }> {
    return pipe(
      this.currencyService.getCurrencies(),
      fold(
        (err) => async () => ({
          currencies: ['EUR', 'USD', 'PLN'],
          defaultFrom: 'EUR',
          defaultTo: 'PLN',
        }),
        (currencies) => async () => ({
          currencies,
          defaultFrom: 'EUR',
          defaultTo: currencies.includes('PLN') ? 'PLN' : currencies[0],
        })
      )
    )();
  }
}
