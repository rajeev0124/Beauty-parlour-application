import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type SupportedLanguage = 'en' | 'te' | 'hi';

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  private translations = signal<{ [lang: string]: TranslationDictionary }>({});
  private currentLang = signal<SupportedLanguage>('en');
  private isBrowser: boolean;

  readonly currentLanguage = computed(() => this.currentLang());
  
  readonly availableLanguages: { code: SupportedLanguage; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  ];

  constructor() {
    const platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadInitialLanguage();
  }

  private loadInitialLanguage(): void {
    if (this.isBrowser) {
      const savedLang = localStorage.getItem('preferredLanguage') as SupportedLanguage;
      if (savedLang && this.availableLanguages.some(l => l.code === savedLang)) {
        this.setLanguage(savedLang);
      } else {
        // Try to detect browser language
        const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
        if (this.availableLanguages.some(l => l.code === browserLang)) {
          this.setLanguage(browserLang);
        } else {
          this.setLanguage('en');
        }
      }
    }
  }

  async setLanguage(lang: SupportedLanguage): Promise<void> {
    if (!this.translations()[lang]) {
      await this.loadTranslations(lang);
    }
    this.currentLang.set(lang);
    if (this.isBrowser) {
      localStorage.setItem('preferredLanguage', lang);
      document.documentElement.lang = lang;
    }
  }

  private async loadTranslations(lang: SupportedLanguage): Promise<void> {
    try {
      const module = await import(`./i18n/${lang}.json`);
      this.translations.update(t => ({
        ...t,
        [lang]: module.default
      }));
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error);
      // Fallback to English
      if (lang !== 'en') {
        await this.loadTranslations('en');
      }
    }
  }

  translate(key: string, params?: { [key: string]: string | number }): string {
    const lang = this.currentLang();
    const translations = this.translations()[lang];
    
    if (!translations) {
      return key;
    }

    let result = this.getNestedValue(translations, key);
    
    if (!result) {
      // Fallback to English
      const enTranslations = this.translations()['en'];
      result = enTranslations ? this.getNestedValue(enTranslations, key) : key;
    }

    if (typeof result !== 'string') {
      return key;
    }

    // Replace parameters
    if (params) {
      Object.keys(params).forEach(param => {
        result = (result as string).replace(new RegExp(`{{${param}}}`, 'g'), String(params[param]));
      });
    }

    return result;
  }

  private getNestedValue(obj: TranslationDictionary, key: string): string | TranslationDictionary | undefined {
    const keys = key.split('.');
    let value: string | TranslationDictionary | undefined = obj;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }

    return value;
  }

  instant(key: string, params?: { [key: string]: string | number }): string {
    return this.translate(key, params);
  }
}
