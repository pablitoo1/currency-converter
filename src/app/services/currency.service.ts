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
    return isNaN(num) || num <= 0 ? left('Niepoprawna kwota') : right(num);
  }

  getRate(from: string, to: string): TaskEither<Error, number> {
    return tryCatch(
      async () => {
        const res: any = await firstValueFrom(
          this.http.get(`${this.API_URL}?amount=1&from=${from}&to=${to}`)
        );
        const rate = res?.rates?.[to];
        if (!rate) throw new Error('Brak kursu dla podanej waluty');
        return rate as number;
      },
      (reason) => new Error(String(reason))
    );
  }

  logIO =
    (msg: string): IO<void> =>
    () =>
      console.log('[LOG]', msg);
}
