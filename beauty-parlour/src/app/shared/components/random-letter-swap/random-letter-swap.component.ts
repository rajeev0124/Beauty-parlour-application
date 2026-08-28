import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID,
  NgZone
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

export interface LetterChar {
  char: string;
  delayMs: number;
  swapped: boolean;
}

export interface LetterWord {
  chars: LetterChar[];
}

@Component({
  selector: 'app-random-letter-swap',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="random-swap-container" 
      (mouseenter)="onHoverStart()" 
      (mouseleave)="onHoverEnd()"
      (click)="onClick()">
      <span class="sr-only">{{ text }}</span>
      <span class="swap-words-wrap" aria-hidden="true">
        @for (word of words; track $index) {
          <span class="swap-word-unit">
            @for (item of word.chars; track $index) {
              <span class="letter-slot">
                <span 
                  class="letter-char primary-char"
                  [class.swapped]="item.swapped"
                  [style.transition-delay]="item.delayMs + 'ms'">
                  {{ item.char }}
                </span>
                <span 
                  class="letter-char secondary-char"
                  [class.swapped]="item.swapped"
                  [style.transition-delay]="item.delayMs + 'ms'">
                  {{ item.char }}
                </span>
              </span>
            }
          </span>
          @if (!$last) {
            <span class="space-slot">&nbsp;</span>
          }
        }
      </span>
    </span>
  `,
  styles: [`
    :host {
      display: inline;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      color: inherit;
      line-height: inherit;
      letter-spacing: inherit;
      background: inherit;
      -webkit-background-clip: inherit;
      -webkit-text-fill-color: inherit;
      vertical-align: baseline;
    }

    .random-swap-container {
      display: inline-flex;
      align-items: baseline;
      flex-wrap: wrap;
      position: relative;
      cursor: pointer;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      color: inherit;
      background: inherit;
      -webkit-background-clip: inherit;
      -webkit-text-fill-color: inherit;
      vertical-align: baseline;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .swap-words-wrap {
      display: inline-flex;
      align-items: baseline;
      flex-wrap: wrap;
      position: relative;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      color: inherit;
      background: inherit;
      -webkit-background-clip: inherit;
      -webkit-text-fill-color: inherit;
    }

    .swap-word-unit {
      display: inline-flex;
      align-items: baseline;
      white-space: nowrap;
      position: relative;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      color: inherit;
      background: inherit;
      -webkit-background-clip: inherit;
      -webkit-text-fill-color: inherit;
    }

    .space-slot {
      display: inline;
      white-space: pre;
    }

    .letter-slot {
      display: inline-flex;
      position: relative;
      overflow: hidden;
      vertical-align: baseline;
      line-height: 1;
      height: 1.15em;
      justify-content: center;
      align-items: center;
    }

    .letter-char {
      display: inline-block;
      white-space: pre;
      will-change: transform;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      color: inherit;
      background: inherit;
      -webkit-background-clip: inherit;
      -webkit-text-fill-color: inherit;
      transition: transform 0.65s cubic-bezier(0.34, 1.45, 0.64, 1);
    }

    .primary-char {
      position: relative;
      transform: translateY(0%);

      &.swapped {
        transform: translateY(-115%);
      }
    }

    .secondary-char {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translateY(115%);

      &.swapped {
        transform: translateY(0%);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RandomLetterSwapComponent implements OnInit, OnDestroy, OnChanges {
  @Input() text: string = '';
  @Input() mode: 'forward' | 'pingpong' = 'pingpong';
  @Input() staggerDuration: number = 28;
  @Input() autoLoopInterval: number = 3200;
  @Input() enableAutoLoop: boolean = true;

  words: LetterWord[] = [];
  allCharRefs: LetterChar[] = [];
  private isBrowser: boolean;
  private autoLoopTimer: any = null;
  private isSwapped = false;
  private isHovered = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.buildWords();
    if (this.isBrowser && this.enableAutoLoop) {
      this.startAutoLoop();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoLoop();
  }

  ngOnChanges(): void {
    this.buildWords();
  }

  private buildWords(): void {
    if (!this.text) {
      this.words = [];
      this.allCharRefs = [];
      return;
    }

    const rawWords = this.text.split(' ');
    this.allCharRefs = [];

    this.words = rawWords.map((word) => {
      const chars: LetterChar[] = Array.from(word).map((char) => {
        const charObj: LetterChar = {
          char,
          delayMs: 0,
          swapped: false
        };
        this.allCharRefs.push(charObj);
        return charObj;
      });
      return { chars };
    });
  }

  private shuffleIndices(): number[] {
    const indices = this.allCharRefs.map((_, idx) => idx);
    const shuffled = [...indices];
    shuffled.sort(() => Math.random() - 0.5);
    return shuffled;
  }

  triggerSwap(targetState: boolean): void {
    const shuffled = this.shuffleIndices();
    shuffled.forEach((charIndex, order) => {
      this.allCharRefs[charIndex].delayMs = order * this.staggerDuration;
      this.allCharRefs[charIndex].swapped = targetState;
    });
    this.isSwapped = targetState;
    this.cdr.markForCheck();
  }

  onHoverStart(): void {
    this.isHovered = true;
    this.triggerSwap(true);
  }

  onHoverEnd(): void {
    this.isHovered = false;
    if (this.mode === 'pingpong') {
      this.triggerSwap(false);
    }
  }

  onClick(): void {
    this.triggerSwap(!this.isSwapped);
  }

  private startAutoLoop(): void {
    this.stopAutoLoop();
    if (!this.isBrowser || this.autoLoopInterval <= 0) return;

    // Trigger first animation shortly after page load
    setTimeout(() => {
      if (!this.isHovered) {
        this.triggerSwap(true);
        setTimeout(() => {
          if (!this.isHovered) {
            this.triggerSwap(false);
          }
        }, 1800);
      }
    }, 600);

    this.ngZone.runOutsideAngular(() => {
      this.autoLoopTimer = setInterval(() => {
        if (!this.isHovered) {
          this.ngZone.run(() => {
            this.triggerSwap(true);
            setTimeout(() => {
              if (!this.isHovered) {
                this.triggerSwap(false);
              }
            }, 1800);
          });
        }
      }, this.autoLoopInterval);
    });
  }

  private stopAutoLoop(): void {
    if (this.autoLoopTimer) {
      clearInterval(this.autoLoopTimer);
      this.autoLoopTimer = null;
    }
  }
}
