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

function buildSmokyKeyframes(color: string, intensity: number): string {
  const n = (Math.max(1, Math.min(20, intensity)) - 1) / 19;
  const r = (v: number) => +v.toFixed(2);
  const peakB = Math.round(6 + n * 24); // 6px -> 30px gold smoke blur
  const initB = Math.round(2 + n * 12);
  const layers = 1 + Math.round(n * 2);
  const stack = (blur: number) =>
    Array.from({ length: layers }, (_, i) => `0 0 ${Math.round((blur * (i + 1)) / layers)}px ${color}`).join(',');
  const peak = stack(peakB);
  const init = stack(initB);
  const d = 0.8 + n * 0.6;

  return `
@keyframes smk-ap-a {
  0% { opacity: 0; text-shadow: ${init}; transform: translate3d(${r(-14 * d)}px, ${r(8 * d)}px, 0) rotate(15deg) skewX(-20deg) scale(0.85); filter: blur(4px); }
  45% { opacity: 0.85; text-shadow: ${peak}; filter: blur(2px); }
  100% { opacity: 1; text-shadow: 0 0 10px rgba(212, 163, 115, 0.4); transform: none; filter: blur(0); }
}
@keyframes smk-ap-b {
  0% { opacity: 0; text-shadow: ${init}; transform: translate3d(${r(-16 * d)}px, ${r(-8 * d)}px, 0) rotate(-15deg) skewX(20deg) scale(0.85); filter: blur(4px); }
  45% { opacity: 0.85; text-shadow: ${peak}; filter: blur(2px); }
  100% { opacity: 1; text-shadow: 0 0 10px rgba(212, 163, 115, 0.4); transform: none; filter: blur(0); }
}
`;
}

@Component({
  selector: 'app-smoky-text',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="smoky-text-container" 
      (mouseenter)="onMouseEnter()">
      @for (char of characters; track $index) {
        @if (char === ' ') {
          <span class="smoky-space">&nbsp;</span>
        } @else {
          <span 
            class="smoky-char"
            [class.gold-gradient]="useGoldGradient"
            [class.retrigger]="retriggering"
            [style.animation-name]="$index % 2 === 0 ? 'smk-ap-a' : 'smk-ap-b'"
            [style.animation-duration.s]="charDuration"
            [style.animation-delay.s]="getDelay($index)"
            [style.animation-timing-function]="'cubic-bezier(0.175, 0.885, 0.32, 1.275)'"
            [style.animation-fill-mode]="'both'"
            [style.color]="useGoldGradient ? 'transparent' : color">
            {{ char }}
          </span>
        }
      }
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
      vertical-align: middle;
    }
    .smoky-text-container {
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
      user-select: none;
    }
    .smoky-char {
      display: inline-block;
      backface-visibility: hidden;
      will-change: transform, opacity, text-shadow, filter;

      &.gold-gradient {
        background: linear-gradient(135deg, #1C1C1C 0%, #D4A373 45%, #E6CA85 70%, #C9748A 100%);
        background-size: 200% 200%;
        -webkit-background-clip: text !important;
        background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
      }

      &.retrigger {
        animation: none !important;
      }
    }
    .smoky-space {
      display: inline-block;
      width: 0.25em;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmokyTextComponent implements OnInit, OnDestroy {
  @Input() text: string = 'SINDHURA';
  @Input() color: string = '#D4A373';
  @Input() useGoldGradient: boolean = true;
  @Input() intensity: number = 10;
  @Input() duration: number = 1.6;
  @Input() continuous: boolean = true;
  @Input() repeatInterval: number = 4200;

  characters: string[] = [];
  charDuration: number = 0.8;
  retriggering: boolean = false;
  private maxDelay: number = 0;
  private styleEl: HTMLStyleElement | null = null;
  private loopTimerId: any = null;
  private isBrowser: boolean;

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.characters = (this.text || '').split('');
    this.charDuration = this.duration * 0.5;
    this.maxDelay = this.characters.length * 0.08;

    if (this.isBrowser) {
      this.injectStyles();
      if (this.continuous) {
        this.startContinuousLoop();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.loopTimerId) {
      clearInterval(this.loopTimerId);
    }
    if (this.styleEl && this.styleEl.parentNode) {
      this.styleEl.parentNode.removeChild(this.styleEl);
    }
  }

  getDelay(index: number): number {
    if (this.maxDelay <= 0) return 0;
    const raw = index * 0.08;
    return (raw * (this.duration * 0.5)) / this.maxDelay;
  }

  onMouseEnter(): void {
    if (this.isBrowser) {
      this.triggerReplay();
    }
  }

  private triggerReplay(): void {
    this.retriggering = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.retriggering = false;
      this.cdr.markForCheck();
    }, 40);
  }

  private startContinuousLoop(): void {
    this.ngZone.runOutsideAngular(() => {
      this.loopTimerId = setInterval(() => {
        this.ngZone.run(() => {
          this.triggerReplay();
        });
      }, this.repeatInterval);
    });
  }

  private injectStyles(): void {
    if (!this.isBrowser) return;
    this.styleEl = document.createElement('style');
    this.styleEl.textContent = buildSmokyKeyframes('#D4A373', this.intensity);
    document.head.appendChild(this.styleEl);
  }
}
