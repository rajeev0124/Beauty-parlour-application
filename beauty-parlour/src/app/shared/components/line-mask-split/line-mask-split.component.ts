import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Inject,
  PLATFORM_ID,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SplitChar {
  content: string;
  delay: number;
}

export interface SplitWord {
  items: SplitChar[];
}

@Component({
  selector: 'app-line-mask-split',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="line-mask-split-wrap">
      @for (word of words; track $index) {
        <span class="lms-word">
          @for (item of word.items; track $index) {
            <span 
              class="lms-char"
              [style.animation-delay]="item.delay + 's'"
            >{{ item.content }}</span>
          }
        </span>
        @if (!$last) {
          <span class="lms-space">&nbsp;</span>
        }
      }
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
      vertical-align: baseline;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      line-height: inherit;
      letter-spacing: inherit;
      color: inherit;
      background: inherit;
      -webkit-background-clip: inherit;
      -webkit-text-fill-color: inherit;
    }

    .line-mask-split-wrap {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: baseline;
      vertical-align: baseline;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      line-height: inherit;
      letter-spacing: inherit;
      color: inherit;
      background: inherit;
      -webkit-background-clip: inherit;
      -webkit-text-fill-color: inherit;
    }

    .lms-word {
      display: inline-flex;
      align-items: baseline;
      white-space: nowrap;
      vertical-align: baseline;
      overflow: hidden;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      line-height: inherit;
      letter-spacing: inherit;
      color: inherit;
      background: inherit;
      -webkit-background-clip: inherit;
      -webkit-text-fill-color: inherit;
    }

    .lms-space {
      display: inline;
      white-space: pre;
    }

    .lms-char {
      display: inline-block;
      white-space: pre;
      color: inherit;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      line-height: inherit;
      letter-spacing: inherit;
      background: inherit;
      -webkit-background-clip: inherit;
      -webkit-text-fill-color: inherit;
      will-change: transform, opacity, filter;
      animation: originkitLineMaskReveal 4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
    }

    @keyframes originkitLineMaskReveal {
      0% {
        transform: translateY(105%);
        opacity: 0;
        filter: blur(18px);
      }
      18%, 80% {
        transform: translateY(0%);
        opacity: 1;
        filter: blur(0px);
      }
      96%, 100% {
        transform: translateY(-105%);
        opacity: 0;
        filter: blur(18px);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineMaskSplitComponent implements OnInit, OnChanges {
  @Input() text = '';
  @Input() splitMode: 'chars' | 'words' = 'chars';
  @Input() duration = 0.8;
  @Input() delay = 0;
  @Input() blurIntensity = 18;

  words: SplitWord[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.prepareItems();
  }

  ngOnChanges(): void {
    this.prepareItems();
  }

  private prepareItems(): void {
    if (!this.text) {
      this.words = [];
      return;
    }

    const rawWords = this.text.split(' ');
    let globalCharIndex = 0;
    const stagger = 0.042;

    this.words = rawWords.map((rawWord) => {
      const chars = Array.from(rawWord);
      const items: SplitChar[] = chars.map((char) => {
        const itemDelay = +(this.delay + globalCharIndex * stagger).toFixed(3);
        globalCharIndex++;
        return { content: char, delay: itemDelay };
      });
      return { items };
    });

    this.cdr.markForCheck();
  }
}
