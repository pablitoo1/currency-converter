import { Component } from '@angular/core';
import { pipe } from 'fp-ts/function';
import { fold as foldEither } from 'fp-ts/Either';
import { fold as foldOption, fromNullable } from 'fp-ts/Option';
import { fold as foldTask } from 'fp-ts/TaskEither';
import { CurrencyService } from '../../services/currency.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-converter',
  imports: [FormsModule],
  template: `<div class="converter">
    <h2 class="text-3xl">Currency converter</h2>

    <input [(ngModel)]="amount" placeholder="Kwota" />
    <select [(ngModel)]="from">
      <option>EUR</option>
      <option>USD</option>
      <option>PLN</option>
    </select>
    <select [(ngModel)]="to">
      <option>USD</option>
      <option>EUR</option>
      <option>PLN</option>
    </select>
    <button (click)="convert()">Przelicz</button>

    <p>{{ result }}</p>
  </div>`,
  styles: ``,
})
export class ConverterComponent {
  from = 'EUR';
  to = 'USD';
  amount = '';
  result: string = '';

  constructor(private currencyService: CurrencyService) {}

  convert() {
    const maybeAmount = fromNullable(this.amount);
    this.result = foldOption(
      () => 'Wpisz kwotę!',
      (val) => {
        const parsed = this.currencyService.parseAmount(val as string);

        return pipe(
          parsed,
          foldEither(
            (err) => err,
            (amountNum) => {
              const task = this.currencyService.getRate(this.from, this.to);
              this.currencyService.logIO(
                `Pobieranie kursu ${this.from}→${this.to}`
              )();

              pipe(
                task,
                foldTask(
                  (err) => async () => `Błąd: ${err.message}`,
                  (rate) => async () =>
                    `${amountNum} ${this.from} = ${(rate * amountNum).toFixed(
                      2
                    )} ${this.to}`
                )
              )().then((res) => (this.result = res));

              return 'Przeliczanie...';
            }
          )
        );
      }
    )(maybeAmount);
  }
}
