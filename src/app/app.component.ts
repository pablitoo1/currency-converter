import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <div
      class="max-w-full min-h-all overflow-x-hidden overflow-y-hidden relative z-40"
    >
      <router-outlet></router-outlet>
    </div>
  `,
})
export class AppComponent {
  title = 'currency-converter';
}
