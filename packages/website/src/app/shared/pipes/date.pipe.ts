import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'date',
  pure: true,
  standalone: true
})
export class DatePipe implements PipeTransform {
  transform(value: Date | string): unknown {
    return new Date(value).toLocaleDateString();
  }
}
