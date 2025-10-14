import { Component, OnInit } from '@angular/core';
import { pipe } from 'fp-ts/function';
import { fold as foldEither } from 'fp-ts/Either';
import { fold as foldOption, fromNullable } from 'fp-ts/Option';
import { fold as foldTask } from 'fp-ts/TaskEither';
import { CurrencyService } from '../../services/currency.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-converter',
  imports: [FormsModule],
  template: `
    <div
      class="h-[100vh] w-full bg-gradient-to-br from-purple-600 to-purple-800 p-8 flex flex-col items-center justify-center"
    >
      <div
        class="flex flex-col items-center justify-center bg-gradient-to-br from-purple-700 to-purple-800 border-purple-900 border-2 py-16 px-32 rounded-2xl"
      >
        <h2 class="text-5xl font-mono font-bold mb-8 text-gray-100">
          Currency Converter
        </h2>

        <div class="flex flex-col gap-4 text-lg font-mono w-72">
          <input
            (input)="onAmountInput($event)"
            [(ngModel)]="amount"
            placeholder="Amount"
            class="border border-purple-300 p-2 rounded-lg bg-purple-700 text-white focus:outline-none"
          />

          <div class="relative">
            <button
              (click)="
                showFromDropdown = !showFromDropdown;
                showToDropdown = false;
                fromSearch = ''
              "
              (keydown.escape)="showFromDropdown = false; fromSearch = ''"
              class="w-full cursor-pointer tracking-widest border border-purple-300 bg-purple-700 text-white focus:outline-none rounded-lg px-2 py-1 text-left"
            >
              {{ from }}
            </button>

            @if (showFromDropdown) {
            <div
              class="absolute z-10 bg-white border border-purple-300 rounded-lg w-full max-h-48 overflow-y-auto mt-1 shadow-lg"
            >
              <input
                [(ngModel)]="fromSearch"
                (keydown.escape)="showFromDropdown = false; fromSearch = ''"
                placeholder="Search..."
                maxlength="3"
                class="w-full tracking-widest uppercase px-2 py-1 border-b border-purple-200 bg-purple-700 text-white italic outline-none"
              />
              @for (c of filteredFrom(); track c) {
              <div
                (click)="selectFrom(c)"
                class="px-2 py-1 tracking-widest bg-purple-700 hover:bg-purple-600 cursor-pointer text-white"
              >
                {{ c }}
              </div>
              } @if (filteredFrom().length === 0) {
              <div class="px-2 py-1 bg-purple-700 text-gray-300">
                No results
              </div>
              }
            </div>
            }
          </div>

          <div class="relative">
            <button
              (click)="
                showToDropdown = !showToDropdown;
                showFromDropdown = false;
                toSearch = ''
              "
              (keydown.escape)="showToDropdown = false; toSearch = ''"
              class="w-full cursor-pointer tracking-widest border border-purple-300 bg-purple-700 text-white focus:outline-none rounded-lg px-2 py-1 text-left"
            >
              {{ to }}
            </button>

            @if (showToDropdown) {
            <div
              class="absolute z-10 bg-white border border-purple-300 rounded-lg w-full max-h-48 overflow-y-auto mt-1 shadow-lg"
            >
              <input
                [(ngModel)]="toSearch"
                (keydown.escape)="showToDropdown = false; toSearch = ''"
                placeholder="Search..."
                maxlength="3"
                class="w-full tracking-widest uppercase px-2 py-1 border-b border-purple-200 bg-purple-700 text-white italic outline-none"
              />
              @for (c of filteredTo(); track c) {
              <div
                (click)="selectTo(c)"
                class="px-2 py-1 tracking-widest bg-purple-700 hover:bg-purple-600 cursor-pointer text-white"
              >
                {{ c }}
              </div>
              } @if (filteredTo().length === 0) {
              <div class="px-2 py-1 bg-purple-700 text-gray-300">
                No results
              </div>
              }
            </div>
            }
          </div>
        </div>

        <button
          (click)="convert()"
          class="mt-8 bg-gray-100 text-purple-800 px-4 py-2 rounded-lg font-mono font-bold hover:bg-purple-100 ease-in-out duration-200 transition-all hover:cursor-pointer"
        >
          CONVERT
        </button>

        <div>
          <p class="text-gray-100 text-xl mt-4 font-mono font-bold text-center">
            @if (result) {
            {{ result }}<hr>
            <span class="text-base font-medium italic"
              >exchange rate is from {{ date }}</span
            >
            } @else { &nbsp; }
          </p>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class ConverterComponent implements OnInit {
  from = 'EUR';
  to = 'USD';
  amount = '';
  result: string = '';
  date: string = '';
  currencies: string[] = [];

  showFromDropdown = false;
  showToDropdown = false;
  fromSearch = '';
  toSearch = '';

  constructor(private currencyService: CurrencyService) {}

  ngOnInit() {
    pipe(
      this.currencyService.getCurrencies(),
      foldTask(
        (err) => async () => {
          this.result = 'Błąd ładowania walut: ' + err.message;
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

  filteredFrom() {
    return this.currencies.filter((c) =>
      c.toLowerCase().includes(this.fromSearch.toLowerCase())
    );
  }

  filteredTo() {
    return this.currencies.filter((c) =>
      c.toLowerCase().includes(this.toSearch.toLowerCase())
    );
  }

  selectFrom(curr: string) {
    this.from = curr;
    this.showFromDropdown = false;
  }

  selectTo(curr: string) {
    this.to = curr;
    this.showToDropdown = false;
  }

  onAmountInput(event: Event) {
    const input = event.target as HTMLInputElement;

    let value = input.value.replace(/[^0-9.]/g, '');

    if (value.includes('.')) {
      const [intPart, decPart] = value.split('.');
      value = intPart + '.' + decPart.slice(0, 2);
    }

    input.value = value;
    this.amount = value;
  }

  convert() {
    const maybeAmount = fromNullable(this.amount);
    this.result = foldOption(
      () => 'Enter the amount!',
      (val) => {
        const parsed = this.currencyService.parseAmount(val as string);

        return pipe(
          parsed,
          foldEither(
            (err) => err,
            (amountNum) => {
              const task = this.currencyService.getRate(this.from, this.to);
              this.currencyService.logIO(
                `Downloading the ${this.from}→${this.to} rate...`
              )();

              pipe(
                task,
                foldTask(
                  (err) => async () => `Error: ${err.message}`,
                  ({ rate, date }) =>
                    async () => {
                      this.date = date;
                      return `${amountNum} ${this.from} = ${(
                        rate * amountNum
                      ).toFixed(2)} ${this.to}`;
                    }
                )
              )().then((res) => (this.result = res));

              return 'Converting...';
            }
          )
        );
      }
    )(maybeAmount);
  }
}
