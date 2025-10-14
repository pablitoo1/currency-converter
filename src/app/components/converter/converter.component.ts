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
  template: `<div
    class="h-[100vh] w-full bg-gradient-to-br bg-purple-500 p-8 flex flex-col items-center justify-center"
  >
    <h2 class="text-6xl font-mono font-bold mb-8 text-gray-100">
      Currency converter
    </h2>

    <div class="flex flex-col gap-2 text-lg font-mono w-1/6">
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
    </div>

    <button
      (click)="convert()"
      class="mt-8 bg-gray-100 text-purple-800 px-4 py-2 rounded-lg font-mono font-bold hover:bg-purple-100 ease-in-out duration-200 transition-all hover:cursor-pointer"
    >
      Przelicz
    </button>

    <div>
      <p>{{ result }}</p>
    </div>
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
