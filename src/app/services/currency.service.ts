import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tryCatch, TaskEither } from 'fp-ts/TaskEither';
import { right, left, Either } from 'fp-ts/Either';
import { IO } from 'fp-ts/IO';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private API_URL = 'https://api.frankfurter.app/latest';

  constructor(private http: HttpClient) {}

  parseAmount(input: string): Either<string, number> {
    const num = Number(input);
    return isNaN(num) || num <= 0 ? left('Incorrect amount') : right(num);
  }

  getRate(
    from: string,
    to: string
  ): TaskEither<Error, { rate: number; date: string }> {
    return tryCatch(
      async () => {
        const res: any = await firstValueFrom(
          this.http.get(`${this.API_URL}?amount=1&from=${from}&to=${to}`)
        );
        const rate = res?.rates?.[to] as number;
        const date = res?.date as string;
        if (!rate) throw new Error('No exchange rate for a given currency');
        return { rate, date };
      },
      (reason) => new Error(String(reason))
    );
  }

  getCurrencies(): TaskEither<Error, string[]> {
    return tryCatch(
      async () => {
        const res: any = await firstValueFrom(this.http.get(this.API_URL));
        const rates = res?.rates;
        if (!rates) throw new Error('No currency data');
        const keys = Object.keys(rates);
        return ['EUR', ...keys].sort();
      },
      (reason) => new Error(String(reason))
    );
  }

  logIO =
    (msg: string): IO<void> =>
    () =>
      console.log('[LOG]', msg);
}
