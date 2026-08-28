import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

type Phase = 'typing' | 'holding' | 'deleting';

@Component({
  selector: 'app-typewriter-text',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="typewriter-container" [style.color]="color">
      @if (prefix) {
        <span class="typewriter-prefix" [style.color]="prefixColor">{{ prefix }}</span>
      }
      <span class="typewriter-text-wrap">
        <span class="typewriter-highlight">{{ displayedText }}</span>
        <span 
          class="typewriter-cursor"
          [style.width.px]="cursorWidth"
          [style.height]="cursorHeight"
          [style.background-color]="cursorColor"
          [style.opacity]="cursorOn ? 1 : 0">
        </span>
      </span>
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    .typewriter-container {
      display: inline-flex;
      align-items: center;
      flex-wrap: wrap;
      white-space: pre-wrap;
    }
    .typewriter-prefix {
      margin-right: 0.25em;
    }
    .typewriter-text-wrap {
      display: inline-flex;
      align-items: center;
      position: relative;
    }
    .typewriter-highlight {
      background: linear-gradient(135deg, #FF8D00 0%, #FF5500 50%, #C9748A 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: inherit;
    }
    .typewriter-cursor {
      display: inline-block;
      margin-left: 3px;
      vertical-align: middle;
      border-radius: 2px;
      transition: opacity 0.15s ease;
      will-change: opacity;
      box-shadow: 0 0 10px rgba(255, 141, 0, 0.7);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TypewriterTextComponent implements OnInit, OnDestroy {
  @Input() prefix: string = '';
  @Input() texts: string[] = ['Shop Our Beauty Products'];
  @Input() color: string = 'inherit';
  @Input() prefixColor: string = 'inherit';
  @Input() cursorColor: string = '#FF8D00';
  @Input() cursorWidth: number = 6;
  @Input() cursorHeight: string = '0.85em';
  @Input() typingSpeed: number = 65;
  @Input() deletingSpeed: number = 35;
  @Input() holdDuration: number = 2200;

  displayedText: string = '';
  cursorOn: boolean = true;

  private textIndex = 0;
  private charIndex = 0;
  private phase: Phase = 'typing';
  private timerId: any = null;
  private cursorIntervalId: any = null;
  private isBrowser: boolean;

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.texts || this.texts.length === 0) {
      this.texts = ['Beauty Products'];
    }
    if (this.isBrowser) {
      this.startCursorBlink();
      this.runAnimationLoop();
    } else {
      this.displayedText = this.texts[0] || '';
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private clearTimers(): void {
    if (this.timerId) clearTimeout(this.timerId);
    if (this.cursorIntervalId) clearInterval(this.cursorIntervalId);
  }

  private startCursorBlink(): void {
    this.ngZone.runOutsideAngular(() => {
      this.cursorIntervalId = setInterval(() => {
        this.cursorOn = !this.cursorOn;
        this.cdr.markForCheck();
      }, 530);
    });
  }

  private runAnimationLoop(): void {
    if (!this.isBrowser) return;

    this.ngZone.runOutsideAngular(() => {
      const currentFullText = this.texts[this.textIndex % this.texts.length] || '';

      if (this.phase === 'typing') {
        if (this.charIndex < currentFullText.length) {
          this.charIndex++;
          this.displayedText = currentFullText.slice(0, this.charIndex);
          this.cdr.markForCheck();
          this.timerId = setTimeout(() => this.runAnimationLoop(), this.typingSpeed);
        } else {
          this.phase = 'holding';
          this.timerId = setTimeout(() => this.runAnimationLoop(), this.holdDuration);
        }
      } else if (this.phase === 'holding') {
        this.phase = 'deleting';
        this.runAnimationLoop();
      } else if (this.phase === 'deleting') {
        if (this.charIndex > 0) {
          this.charIndex--;
          this.displayedText = currentFullText.slice(0, this.charIndex);
          this.cdr.markForCheck();
          this.timerId = setTimeout(() => this.runAnimationLoop(), this.deletingSpeed);
        } else {
          this.textIndex = (this.textIndex + 1) % this.texts.length;
          this.phase = 'typing';
          this.timerId = setTimeout(() => this.runAnimationLoop(), 300);
        }
      }
    });
  }
}
