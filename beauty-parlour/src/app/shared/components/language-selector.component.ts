import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { TranslateService, SupportedLanguage } from '../../core/services/translate.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatFormFieldModule, MatIconModule],
  template: `
    <mat-form-field appearance="outline" class="language-selector">
      <mat-icon matPrefix>language</mat-icon>
      <mat-select [value]="translateService.currentLanguage()" (selectionChange)="onLanguageChange($event.value)">
        @for (lang of translateService.availableLanguages; track lang.code) {
          <mat-option [value]="lang.code">
            {{ lang.nativeName }}
          </mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  styles: [`
    .language-selector {
      width: 140px;

      ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }

      ::ng-deep .mat-mdc-text-field-wrapper {
        padding: 0 8px;
      }

      ::ng-deep .mat-mdc-form-field-icon-prefix {
        padding-right: 8px;
      }
    }
  `]
})
export class LanguageSelectorComponent {
  constructor(public translateService: TranslateService) {}

  onLanguageChange(lang: SupportedLanguage): void {
    this.translateService.setLanguage(lang);
  }
}
