import { Component, EventEmitter, Input, Output } from '@angular/core';
import { sanitizeAmount } from '../../utils/currency';

@Component({
  selector: 'app-amount-input',
  imports: [],
  templateUrl: './amount-input.component.html',
})
export class AmountInputComponent {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const sanitized = sanitizeAmount(input.value);
    input.value = sanitized;
    this.valueChange.emit(sanitized);
  }
}
