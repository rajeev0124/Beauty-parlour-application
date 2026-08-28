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
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auto-moving-image',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div 
      class="auto-moving-wrapper" 
      (mouseenter)="onMouseEnter()" 
      (mouseleave)="onMouseLeave()">
      
      @if (imageList.length > 0) {
        @for (img of imageList; track img; let i = $index) {
          <div 
            class="image-slide" 
            [class.active]="i === currentIndex"
            [class.previous]="i === previousIndex"
            [class.ken-burns]="enableKenBurns">
            <img 
              [src]="img" 
              [alt]="productName + ' view ' + (i + 1)" 
              class="slide-img"
              loading="lazy" 
              (error)="onImageError(i)"
            />
          </div>
        }
      } @else {
        <div class="fallback-placeholder">
          <mat-icon>inventory_2</mat-icon>
        </div>
      }

      <!-- Pagination Dots & Controls overlay -->
      @if (showControls && imageList.length > 1) {
        <div class="slide-controls">
          <div class="dots-bar">
            @for (img of imageList; track img; let i = $index) {
              <button 
                type="button" 
                class="dot" 
                [class.active]="i === currentIndex" 
                (click)="goToSlide(i, $event)"
                [attr.aria-label]="'View image ' + (i + 1) + ' of ' + productName">
              </button>
            }
          </div>
          <span class="slide-counter">{{ currentIndex + 1 }}/{{ imageList.length }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
      border-radius: inherit;
    }

    .auto-moving-wrapper {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
      background-color: #F8F5F2;
      border-radius: inherit;
    }

    .image-slide {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.8s ease;
      z-index: 1;
      will-change: transform, opacity;

      &.active {
        opacity: 1;
        visibility: visible;
        z-index: 2;
      }

      &.previous {
        z-index: 1;
      }

      .slide-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transform: scale(1);
        transition: transform 4s ease-out;
      }

      &.ken-burns.active .slide-img {
        transform: scale(1.09) rotate(0.5deg);
      }
    }

    .fallback-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9CA3AF;
      background-color: #F3F4F6;

      mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
      }
    }

    .slide-controls {
      position: absolute;
      bottom: 10px;
      left: 10px;
      right: 10px;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      pointer-events: none;
      opacity: 0.85;
      transition: opacity 0.3s ease;
    }

    .auto-moving-wrapper:hover .slide-controls {
      opacity: 1;
    }

    .dots-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      padding: 4px 8px;
      border-radius: 9999px;
      pointer-events: auto;
    }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      border: none;
      padding: 0;
      cursor: pointer;
      transition: all 0.3s ease;

      &.active {
        width: 16px;
        border-radius: 9999px;
        background: #FFFFFF;
        box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
      }

      &:hover:not(.active) {
        background: rgba(255, 255, 255, 0.8);
      }
    }

    .slide-counter {
      font-size: 10px;
      font-weight: 700;
      color: #FFFFFF;
      background: rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      padding: 3px 8px;
      border-radius: 9999px;
      letter-spacing: 0.05em;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutoMovingImageComponent implements OnInit, OnDestroy {
  @Input() images: string[] = [];
  @Input() src: string = '';
  @Input() productName: string = '';
  @Input() intervalMs: number = 3200;
  @Input() enableKenBurns: boolean = true;
  @Input() showControls: boolean = false;

  currentIndex = 0;
  previousIndex = 0;
  imageList: string[] = [];
  private timerId: any = null;
  private isBrowser: boolean;
  private isHovered = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.prepareImageList();
    if (this.isBrowser && this.imageList.length > 1) {
      this.startAutoTimer();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoTimer();
  }

  private prepareImageList(): void {
    if (Array.isArray(this.images) && this.images.length > 0) {
      this.imageList = this.images.filter(img => typeof img === 'string' && img.trim().length > 0);
    } else if (this.src) {
      this.imageList = [this.src];
    } else {
      this.imageList = [];
    }
  }

  startAutoTimer(): void {
    this.stopAutoTimer();
    if (!this.isBrowser || this.imageList.length <= 1) return;

    this.ngZone.runOutsideAngular(() => {
      this.timerId = setInterval(() => {
        if (!this.isHovered) {
          this.ngZone.run(() => {
            this.nextSlide();
          });
        }
      }, this.intervalMs);
    });
  }

  stopAutoTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  nextSlide(): void {
    if (this.imageList.length <= 1) return;
    this.previousIndex = this.currentIndex;
    this.currentIndex = (this.currentIndex + 1) % this.imageList.length;
    this.cdr.markForCheck();
  }

  goToSlide(index: number, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    if (index >= 0 && index < this.imageList.length && index !== this.currentIndex) {
      this.previousIndex = this.currentIndex;
      this.currentIndex = index;
      this.cdr.markForCheck();
      this.startAutoTimer();
    }
  }

  onMouseEnter(): void {
    this.isHovered = true;
  }

  onMouseLeave(): void {
    this.isHovered = false;
  }

  onImageError(index: number): void {
    if (index >= 0 && index < this.imageList.length) {
      this.imageList.splice(index, 1);
      if (this.currentIndex >= this.imageList.length) {
        this.currentIndex = 0;
      }
      this.cdr.markForCheck();
    }
  }
}
