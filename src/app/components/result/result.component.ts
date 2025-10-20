import { Component, Input } from '@angular/core';
import { Result } from '../../utils/result';

@Component({
  selector: 'app-result',
  imports: [],
  templateUrl: './result.component.html',
})
export class ResultComponent {
  @Input({ required: true }) result: Result = { converted: '', date: '' };
}
