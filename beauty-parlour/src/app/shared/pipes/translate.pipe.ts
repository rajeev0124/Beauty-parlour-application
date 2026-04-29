import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '../../core/services/translate.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Make it impure to update when language changes
})
export class TranslatePipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(key: string, params?: { [key: string]: string | number }): string {
    return this.translateService.translate(key, params);
  }
}
