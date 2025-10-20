import { Component, EventEmitter, Input, Output } from '@angular/core';
import { filterCurrencies } from '../../utils/currency';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-currency-dropdown',
  imports: [CommonModule, FormsModule],
  templateUrl: './currency-dropdown.component.html',
})
export class CurrencyDropdownComponent {
  @Input({ required: true }) label: string = '';
  @Input({ required: true }) selected: string = '';
  @Input({ required: true }) currencies: string[] = [];

  @Output() selectedChange = new EventEmitter<string>();

  showDropdown = false;
  search = '';

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    if (!this.showDropdown) this.search = '';
  }

  closeDropdown() {
    this.showDropdown = false;
    this.search = '';
  }

  filteredCurrencies() {
    return filterCurrencies(this.currencies, this.search);
  }

  select(curr: string) {
    this.selectedChange.emit(curr);
    this.closeDropdown();
  }
}
