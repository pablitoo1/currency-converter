import { Routes } from '@angular/router';
import { ConverterComponent } from './components/converter/converter.component';

export const routes: Routes = [
  {
    path: 'converter',
    component: ConverterComponent,
    title: 'Currency Converter',
  },
  { path: '', redirectTo: 'converter', pathMatch: 'full' },
];
