import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, HostListener, ChangeDetectionStrategy, ChangeDetectorRef, NgZone, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export type FlipDirection = 'up' | 'down' | 'left' | 'right';

interface DirConfig {
  axis: 'rotateX' | 'rotateY';
  dim: 'h' | 'w';
  hover: number;
}

const DIR_CONFIGS: Record<FlipDirection, DirConfig> = {
  down:  { axis: 'rotateX', dim: 'h', hover: -90 },
  up:    { axis: 'rotateX', dim: 'h', hover: 90 },
  right: { axis: 'rotateY', dim: 'w', hover: 90 },
  left:  { axis: 'rotateY', dim: 'w', hover: -90 },
};

@Component({
  selector: 'app-flip-button',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <a 
      *ngIf="routerLink; else buttonTpl"
      [routerLink]="routerLink"
      class="flip-btn-wrapper"
      (pointerenter)="onPointerEnter()"
      (pointerleave)="onPointerLeave()"
      (focus)="onFocus($event)"
      (blur)="onBlur()"
      [style.--btn-radius]="radius"
      [attr.aria-label]="label">
      <ng-container *ngTemplateOutlet="cubeContent"></ng-container>
    </a>

    <ng-template #buttonTpl>
      <button
        type="button"
        class="flip-btn-wrapper"
        (pointerenter)="onPointerEnter()"
        (pointerleave)="onPointerLeave()"
        (focus)="onFocus($event)"
        (blur)="onBlur()"
        (click)="clicked.emit($event)"
        [style.--btn-radius]="radius"
        [attr.aria-label]="label">
        <ng-container *ngTemplateOutlet="cubeContent"></ng-container>
      </button>
    </ng-template>

    <ng-template #cubeContent>
      <div 
        #cubeRef
        class="flip-cube"
        [ngClass]="'dir-' + direction"
        [style.transform]="currentTransform"
        [style.--cube-half.px]="half">
        
        <!-- Front Face (Default State, sits at z = 0 in 3D space) -->
        <div class="cube-face face-front" [style.background]="fill" [style.color]="textColor" [style.border-color]="borderColor">
          <mat-icon *ngIf="icon" class="face-icon">{{ icon }}</mat-icon>
          <span class="face-label">{{ label }}</span>
        </div>

        <!-- Flipped Face (Hover / Focus State, rotates in on turn) -->
        <div class="cube-face face-flipped" [style.background]="hoverFill" [style.color]="hoverTextColor" [style.border-color]="hoverBorderColor || borderColor">
          <mat-icon *ngIf="hoverIcon || icon" class="face-icon">{{ hoverIcon || icon }}</mat-icon>
          <span class="face-label">{{ hoverLabel || label }}</span>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    :host {
      display: inline-block;
      vertical-align: middle;
    }

    .flip-btn-wrapper {
      display: inline-block;
      position: relative;
      perspective: 800px;
      perspective-origin: 50% 50%;
      background: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
      text-decoration: none;
      outline: none;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      border-radius: var(--btn-radius, 14px);

      &:focus-visible {
        box-shadow: 0 0 0 3px rgba(201, 116, 138, 0.5);
      }
    }

    .flip-cube {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transform-style: preserve-3d;
      border-radius: var(--btn-radius, 14px);
      transition: transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1); // Physics spring match
      will-change: transform;
    }

    .cube-face {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px 28px;
      font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.03em;
      white-space: nowrap;
      border-radius: var(--btn-radius, 14px);
      border: 1.5px solid transparent;
      box-sizing: border-box;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      box-shadow: 0 4px 14px rgba(28, 28, 28, 0.08);

      .face-icon {
        font-size: 19px;
        width: 19px;
        height: 19px;
        flex-shrink: 0;
      }
    }

    // Direction Geometry Configurations
    .flip-cube.dir-down {
      .face-front   { transform: rotateX(0deg) translateZ(var(--cube-half, 24px)); }
      .face-flipped { position: absolute; inset: 0; transform: rotateX(90deg) translateZ(var(--cube-half, 24px)); }
    }

    .flip-cube.dir-up {
      .face-front   { transform: rotateX(0deg) translateZ(var(--cube-half, 24px)); }
      .face-flipped { position: absolute; inset: 0; transform: rotateX(-90deg) translateZ(var(--cube-half, 24px)); }
    }

    .flip-cube.dir-right {
      .face-front   { transform: rotateY(0deg) translateZ(var(--cube-half, 80px)); }
      .face-flipped { position: absolute; inset: 0; transform: rotateY(-90deg) translateZ(var(--cube-half, 80px)); }
    }

    .flip-cube.dir-left {
      .face-front   { transform: rotateY(0deg) translateZ(var(--cube-half, 80px)); }
      .face-flipped { position: absolute; inset: 0; transform: rotateY(90deg) translateZ(var(--cube-half, 80px)); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlipButtonComponent implements AfterViewInit, OnDestroy {
  @Input() label = 'Button';
  @Input() hoverLabel?: string;
  @Input() icon?: string;
  @Input() hoverIcon?: string;
  @Input() direction: FlipDirection = 'down';
  @Input() routerLink?: string;
  @Input() radius = '32px';

  // Colors
  @Input() fill = 'linear-gradient(135deg, #1C1C1C 0%, #2A2A2A 100%)';
  @Input() textColor = '#FFFFFF';
  @Input() borderColor = 'transparent';

  @Input() hoverFill = 'linear-gradient(135deg, #C9748A 0%, #B9386E 100%)';
  @Input() hoverTextColor = '#FFFFFF';
  @Input() hoverBorderColor?: string;

  @Output() clicked = new EventEmitter<MouseEvent>();

  @ViewChild('cubeRef') cubeRef!: ElementRef<HTMLElement>;

  private hovered = false;
  private focused = false;
  private turned = false;
  private flipping = false;
  private resizeObserver?: ResizeObserver;
  private autoIntervalId: any = null;
  private isBrowser: boolean;

  half = 24;
  currentTransform = 'translateZ(-24px) rotateX(0deg)';

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.measure();
    if (typeof ResizeObserver !== 'undefined' && this.cubeRef?.nativeElement) {
      this.resizeObserver = new ResizeObserver(() => this.measure());
      this.resizeObserver.observe(this.cubeRef.nativeElement);
    }
    this.initMobileAutoFlip();
  }

  private initMobileAutoFlip(): void {
    if (!this.isBrowser) return;
    const isMobile = window.innerWidth <= 768 || window.matchMedia('(hover: none)').matches;
    if (isMobile) {
      this.ngZone.runOutsideAngular(() => {
        const interval = 4000 + Math.random() * 1000;
        this.autoIntervalId = setInterval(() => {
          if (!this.hovered && !this.focused) {
            this.turned = !this.turned;
            this.updateTransform(this.turned);
            this.cdr.markForCheck();
          }
        }, interval);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.autoIntervalId) {
      clearInterval(this.autoIntervalId);
    }
    this.resizeObserver?.disconnect();
  }

  private measure(): void {
    if (!this.cubeRef?.nativeElement) return;
    const el = this.cubeRef.nativeElement;
    const cfg = DIR_CONFIGS[this.direction] ?? DIR_CONFIGS.down;
    const size = cfg.dim === 'h' ? el.offsetHeight : el.offsetWidth;
    this.half = Math.max(1, Math.round(size / 2));
    this.updateTransform(this.turned);
    this.cdr.markForCheck();
  }

  private updateTransform(isTurned: boolean): void {
    const cfg = DIR_CONFIGS[this.direction] ?? DIR_CONFIGS.down;
    const angle = isTurned ? cfg.hover : 0;
    this.currentTransform = `translateZ(-${this.half}px) ${cfg.axis}(${angle}deg)`;
  }

  // Exact sync engine port: prevents interrupted flips & hard-snaps
  private sync(): void {
    if (this.flipping) return;
    const want = this.hovered || this.focused;
    if (want === this.turned) return;

    this.turned = want;
    this.flipping = true;
    this.updateTransform(this.turned);
    this.cdr.markForCheck();

    // Duration matches the 0.42s spring transition
    setTimeout(() => {
      this.flipping = false;
      this.sync(); // Re-check live state on settle
    }, 420);
  }

  onPointerEnter(): void {
    this.hovered = true;
    this.sync();
  }

  onPointerLeave(): void {
    this.hovered = false;
    this.sync();
  }

  onFocus(e: FocusEvent): void {
    let visible = true;
    try {
      visible = (e.currentTarget as HTMLElement)?.matches(':focus-visible') ?? true;
    } catch {
      visible = true;
    }
    if (!visible) return;
    this.focused = true;
    this.sync();
  }

  onBlur(): void {
    this.focused = false;
    this.sync();
  }
}
