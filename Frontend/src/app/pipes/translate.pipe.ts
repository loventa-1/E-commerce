import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  constructor(private translations: TranslationService) {}

  transform(value: string | null | undefined): string {
    return this.translations.translate(value);
  }
}