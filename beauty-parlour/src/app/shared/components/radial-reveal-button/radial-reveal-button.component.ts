import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  NgZone,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-radial-reveal-button',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <a
      *ngIf="link; else buttonTpl"
      [routerLink]="isExternalLink(link) ? null : link"
      [attr.href]="isExternalLink(link) ? link : null"
      [attr.target]="isExternalLink(link) && newTab ? '_blank' : null"
      [attr.rel]="isExternalLink(link) && newTab ? 'noopener noreferrer' : null"
      #scopeRef
      class="radial-reveal-btn"
      (pointerenter)="onPointerEnter($event)"
      (pointerleave)="onPointerLeave($event)"
      [style.border-radius]="radiusPx + 'px'"
      [style.border-width]="borderWidth"
      [style.border-style]="borderStyle"
      [style.border-color]="borderColor"
      [style.background-color]="fill"
      [attr.aria-label]="!showText ? (label || null) : null">
      <ng-container *ngTemplateOutlet="facesContent"></ng-container>
    </a>

    <ng-template #buttonTpl>
      <button
        type="button"
        #scopeRef
        class="radial-reveal-btn"
        (pointerenter)="onPointerEnter($event)"
        (pointerleave)="onPointerLeave($event)"
        (click)="clicked.emit($event)"
        [style.border-radius]="radiusPx + 'px'"
        [style.border-width]="borderWidth"
        [style.border-style]="borderStyle"
        [style.border-color]="borderColor"
        [style.background-color]="fill"
        [attr.aria-label]="!showText ? (label || null) : null">
        <ng-container *ngTemplateOutlet="facesContent"></ng-container>
      </button>
    </ng-template>

    <ng-template #facesContent>
      <!-- Resting Face -->
      <span
        class="face-content resting-face"
        [style.color]="textColor"
        [style.padding]="padding"
        [style.gap.px]="addIcon && showText ? gap : 0"
        [style.flex-direction]="iconSide === 'right' ? 'row-reverse' : 'row'">
        <ng-container *ngTemplateOutlet="iconAndText; context: { isHover: false }"></ng-container>
      </span>

      <!-- Hover Face (Revealed via radial clip-path) -->
      <span
        #overlayRef
        aria-hidden="true"
        class="face-content hover-face"
        [style.background-color]="hoverFill"
        [style.color]="hoverTextColor"
        [style.padding]="padding"
        [style.gap.px]="addIcon && showText ? gap : 0"
        [style.border-radius]="innerRadius"
        [style.clip-path]="clipPathValue"
        [style.-webkit-clip-path]="clipPathValue"
        [style.flex-direction]="iconSide === 'right' ? 'row-reverse' : 'row'">
        <ng-container *ngTemplateOutlet="iconAndText; context: { isHover: true }"></ng-container>
      </span>
    </ng-template>

    <ng-template #iconAndText let-isHover="isHover">
      <ng-container *ngIf="addIcon">
        <img
          *ngIf="iconType === 'image' && iconSrc"
          [src]="iconSrc"
          alt=""
          aria-hidden="true"
          draggable="false"
          class="btn-icon-img"
          [style.width.px]="iconSize"
          [style.height.px]="iconSize"
          [style.margin.px]="iconPadding"
          [style.border-radius.px]="iconRadiusPx"
        />
        <mat-icon
          *ngIf="iconType === 'mat-icon' || (iconType === 'symbol' && isMatIcon(iconSymbol))"
          aria-hidden="true"
          class="btn-icon-mat"
          [style.font-size.px]="iconSize"
          [style.width.px]="iconSize"
          [style.height.px]="iconSize"
          [style.margin.px]="iconPadding"
          [style.color]="isHover ? hoverIconColor : iconColor">
          {{ iconSymbol }}
        </mat-icon>
        <span
          *ngIf="iconType === 'symbol' && !isMatIcon(iconSymbol)"
          aria-hidden="true"
          class="btn-icon-symbol"
          [style.font-size.px]="iconSize"
          [style.margin.px]="iconPadding"
          [style.color]="isHover ? hoverIconColor : iconColor">
          {{ iconSymbol }}
        </span>
      </ng-container>
      <span *ngIf="showText" class="btn-label">{{ label }}</span>
    </ng-template>
  `,
  styles: [`
    :host {
      display: inline-block;
      vertical-align: middle;
    }

    .radial-reveal-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      cursor: pointer;
      overflow: hidden;
      box-sizing: border-box;
      user-select: none;
      font-family: inherit;
      font-weight: 600;
      font-size: 14px;
      line-height: 1.5;
      letter-spacing: 0.02em;
      outline: none;
      border: 1.5px solid transparent;
      padding: 0;
      transition: transform 0.25s ease, box-shadow 0.25s ease;

      &:focus-visible {
        box-shadow: 0 0 0 3px rgba(201, 116, 138, 0.4);
      }

      &:hover {
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0px) scale(0.98);
      }
    }

    .face-content {
      display: flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
    }

    .resting-face {
      position: relative;
    }

    .hover-face {
      position: absolute;
      inset: 0;
      pointer-events: none;
      will-change: clip-path;
    }

    .btn-icon-img {
      object-fit: cover;
      display: block;
      flex: none;
      pointer-events: none;
    }

    .btn-icon-mat {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      pointer-events: none;
    }

    .btn-icon-symbol {
      display: inline-block;
      line-height: 1;
      flex: none;
      pointer-events: none;
    }

    .btn-label {
      display: inline-block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadialRevealButtonComponent implements AfterViewInit, OnDestroy {
  @Input() label: string = 'RADIAL REVEAL';
  @Input() showText: boolean = true;
  @Input() padding: string = '12px 26px';
  @Input() rounded: number = 100; // 0 to 100 (100 = pill stadium)
  @Input() fill: string = '#1C1C1C';
  @Input() textColor: string = '#FFFFFF';
  @Input() hoverFill: string = '#C9748A';
  @Input() hoverTextColor: string = '#FFFFFF';

  // Icon configurations
  @Input() addIcon: boolean = false;
  @Input() iconType: 'symbol' | 'image' | 'mat-icon' = 'mat-icon';
  @Input() iconSymbol: string = 'arrow_forward';
  @Input() iconSrc: string = '';
  @Input() iconColor: string = '#FFFFFF';
  @Input() hoverIconColor: string = '#FFFFFF';
  @Input() iconSize: number = 18;
  @Input() iconPadding: number = 0;
  @Input() iconRounded: number = 100;
  @Input() iconSide: 'left' | 'right' = 'right';
  @Input() gap: number = 8;

  // Border configurations
  @Input() borderWidth: string = '1.5px';
  @Input() borderStyle: string = 'solid';
  @Input() borderColor: string = '#C9748A';

  // Navigation
  @Input() link?: string;
  @Input() newTab: boolean = false;
  @Input() duration: number = 450; // ms

  @Output() clicked = new EventEmitter<MouseEvent>();

  @ViewChild('scopeRef') scopeRef!: ElementRef<HTMLElement>;
  @ViewChild('overlayRef') overlayRef!: ElementRef<HTMLElement>;

  radiusPx = 9999;
  innerRadius = '9999px';
  clipPathValue = 'circle(0% at 100% 100%)';

  private resizeObserver?: ResizeObserver;
  private animRafId: number | null = null;
  private isBrowser: boolean;

  private clip = {
    r: 0,
    x: 100,
    y: 100,
    max: 160
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private autoIntervalId: any = null;

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.measureRadius();
    if (typeof ResizeObserver !== 'undefined' && this.scopeRef?.nativeElement) {
      this.resizeObserver = new ResizeObserver(() => this.measureRadius());
      this.resizeObserver.observe(this.scopeRef.nativeElement);
    }
    this.initMobileAutoReveal();
  }

  private initMobileAutoReveal(): void {
    if (!this.isBrowser) return;
    const isMobile = window.innerWidth <= 768 || window.matchMedia('(hover: none)').matches;
    if (isMobile) {
      this.clip.x = 50;
      this.clip.y = 50;
      this.clip.max = 135;
      this.ngZone.runOutsideAngular(() => {
        let isRevealed = false;
        const interval = 4500 + Math.random() * 1000;
        this.autoIntervalId = setInterval(() => {
          isRevealed = !isRevealed;
          if (isRevealed) {
            this.clip.x = 50;
            this.clip.y = 50;
            this.clip.max = 135;
            this.growTo(this.clip.max);
          } else {
            this.growTo(0);
          }
        }, interval);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.autoIntervalId) {
      clearInterval(this.autoIntervalId);
    }
    if (this.animRafId !== null) {
      cancelAnimationFrame(this.animRafId);
    }
    this.resizeObserver?.disconnect();
  }

  isExternalLink(url?: string): boolean {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
  }

  isMatIcon(str: string): boolean {
    return /^[a-z0-9_]+$/.test(str);
  }

  get iconRadiusPx(): number {
    return (this.iconSize / 2) * (Math.max(0, Math.min(100, this.iconRounded)) / 100);
  }

  private measureRadius(): void {
    if (!this.scopeRef?.nativeElement) return;
    const el = this.scopeRef.nativeElement;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (!w || !h) return;

    const shortSide = Math.min(w, h);
    const radius = (shortSide / 2) * (Math.max(0, Math.min(100, this.rounded)) / 100);
    this.radiusPx = Math.round(radius);

    const bWidth = parseFloat(this.borderWidth) || 0;
    const inner = Math.max(0, this.radiusPx - bWidth);
    this.innerRadius = `${inner}px`;
    this.cdr.markForCheck();
  }

  private anchorTo(e: PointerEvent): void {
    if (!this.scopeRef?.nativeElement) return;
    const rect = this.scopeRef.nativeElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const unit = Math.hypot(rect.width, rect.height) / Math.SQRT2;
    const far = Math.max(
      Math.hypot(px, py),
      Math.hypot(rect.width - px, py),
      Math.hypot(px, rect.height - py),
      Math.hypot(rect.width - px, rect.height - py)
    );

    this.clip.x = (px / rect.width) * 100;
    this.clip.y = (py / rect.height) * 100;
    this.clip.max = (far / unit) * 100 + 2; // +2% for anti-aliasing margin
  }

  private applyClip(): void {
    this.clipPathValue = `circle(${this.clip.r.toFixed(2)}% at ${this.clip.x.toFixed(2)}% ${this.clip.y.toFixed(2)}%)`;
    this.cdr.markForCheck();
  }

  private growTo(targetR: number): void {
    if (this.animRafId !== null) {
      cancelAnimationFrame(this.animRafId);
      this.animRafId = null;
    }

    const startR = this.clip.r;
    const delta = targetR - startR;
    if (Math.abs(delta) < 0.01) {
      this.clip.r = targetR;
      this.applyClip();
      return;
    }

    const startTime = performance.now();
    const duration = this.duration;

    this.ngZone.runOutsideAngular(() => {
      const animateStep = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // easeInOutCubic: t < 0.5 ? 4 * t^3 : 1 - Math.pow(-2 * t + 2, 3) / 2
        const ease =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        this.clip.r = startR + delta * ease;
        this.applyClip();

        if (progress < 1) {
          this.animRafId = requestAnimationFrame(animateStep);
        } else {
          this.clip.r = targetR;
          this.applyClip();
          this.animRafId = null;
        }
      };

      this.animRafId = requestAnimationFrame(animateStep);
    });
  }

  onPointerEnter(e: PointerEvent): void {
    this.anchorTo(e);
    this.applyClip();
    this.growTo(this.clip.max);
  }

  onPointerLeave(e: PointerEvent): void {
    if (this.clip.r >= this.clip.max - 0.5) {
      this.anchorTo(e);
      this.clip.r = this.clip.max;
      this.applyClip();
    }
    this.growTo(0);
  }
}
