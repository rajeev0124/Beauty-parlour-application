import {
  Component,
  ElementRef,
  Input,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  Inject,
  PLATFORM_ID,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';

@Component({
  selector: 'app-circular-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './circular-gallery.component.html',
  styleUrl: './circular-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CircularGalleryComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() images: string[] = [];
  @Input() count = 72;
  @Input() tilt = 55;
  @Input() radius = 380;
  @Input() itemWidth = 54;
  @Input() itemHeight = 76;
  @Input() autoRotate = true;
  @Input() autoRotateSpeed = 2.5;
  @Input() showPreview = true;
  @Input() parallax = true;

  @ViewChild('rootRef', { static: false }) rootRef!: ElementRef<HTMLDivElement>;
  @ViewChild('galleryRef', { static: false }) galleryRef!: ElementRef<HTMLDivElement>;
  @ViewChild('previewRef', { static: false }) previewRef!: ElementRef<HTMLImageElement>;
  @ViewChild('previewWrapRef', { static: false }) previewWrapRef!: ElementRef<HTMLDivElement>;

  itemsArray: number[] = [];
  currentPreviewSrc = '';
  isDragging = false;
  private isBrowser: boolean;
  private tickFn: (() => void) | null = null;
  private pointerDownHandler: ((e: PointerEvent) => void) | null = null;
  private pointerMoveHandler: ((e: PointerEvent) => void) | null = null;
  private pointerUpHandler: ((e: PointerEvent) => void) | null = null;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.itemsArray = Array.from({ length: this.count }, (_, i) => i);
    if (this.images.length > 0) {
      this.currentPreviewSrc = this.images[0];
    }
  }

  getImageSrc(index: number): string {
    if (!this.images || this.images.length === 0) return '';
    return this.images[index % this.images.length];
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    setTimeout(() => {
      this.initGallery();
    }, 60);
  }

  private initGallery(): void {
    const root = this.rootRef?.nativeElement;
    const gallery = this.galleryRef?.nativeElement;
    if (!root || !gallery) return;

    const items = gsap.utils.toArray<HTMLElement>(gallery.querySelectorAll('[data-ring-item]'));
    if (items.length === 0) return;

    const angleIncrement = 360 / items.length;
    const baseAngles = items.map((_, i) => i * angleIncrement - 90);

    // Position each card on the 3D ring facing outwards with correct x/y centering
    items.forEach((item, i) => {
      gsap.set(item, {
        xPercent: -50,
        yPercent: -50,
        rotationY: 90,
        rotationZ: baseAngles[i],
        transformOrigin: `50% ${this.radius}px`,
        opacity: 1
      });
    });

    gsap.set(gallery, {
      xPercent: -50,
      rotationX: this.tilt,
      rotationY: 0,
      opacity: 1
    });

    // Make Center Preview Frame visible by default with soft fade
    if (this.previewWrapRef?.nativeElement) {
      gsap.set(this.previewWrapRef.nativeElement, { opacity: 1 });
    }

    const setZ = items.map((item) => gsap.quickSetter(item, 'rotationZ', 'deg'));

    // Entrance animation
    gsap.fromTo(
      gallery,
      { rotationX: this.tilt + 20, opacity: 0 },
      { rotationX: this.tilt, opacity: 1, duration: 1.2, ease: 'power3.out' }
    );

    // Rotation ticker
    let current = 0;
    let target = 0;
    let lastX = 0;

    this.tickFn = () => {
      if (this.autoRotate && !this.isDragging) {
        target += (this.autoRotateSpeed / 60) * gsap.ticker.deltaRatio();
      }
      current += (target - current) * 0.06;
      for (let i = 0; i < setZ.length; i++) {
        setZ[i](baseAngles[i] + current);
      }
    };

    gsap.ticker.add(this.tickFn);

    // Pointer Interaction (Drag / Swipe to spin)
    this.pointerDownHandler = (e: PointerEvent) => {
      this.isDragging = true;
      lastX = e.clientX;
      if (root.setPointerCapture) {
        try {
          root.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
      root.style.cursor = 'grabbing';
    };

    this.pointerMoveHandler = (e: PointerEvent) => {
      if (this.parallax) {
        const rect = root.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(gallery, {
          rotationX: this.tilt + py * 4,
          rotationY: px * 4,
          duration: 1.2,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }

      if (this.isDragging) {
        target += (e.clientX - lastX) * 0.35;
        lastX = e.clientX;
      }
    };

    this.pointerUpHandler = (e: PointerEvent) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      if (root.releasePointerCapture) {
        try {
          root.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
      root.style.cursor = 'grab';
    };

    root.addEventListener('pointerdown', this.pointerDownHandler);
    root.addEventListener('pointermove', this.pointerMoveHandler);
    root.addEventListener('pointerup', this.pointerUpHandler);
    root.addEventListener('pointerleave', this.pointerUpHandler);
  }

  showPreviewImage(src: string): void {
    if (!this.showPreview || !src) return;
    const img = this.previewRef?.nativeElement;
    const wrap = this.previewWrapRef?.nativeElement;
    if (!img || !wrap) return;

    img.src = src;
    gsap.to(wrap, { opacity: 1, duration: 0.2, ease: 'power2.out', overwrite: true });
  }

  hidePreviewImage(): void {
    const wrap = this.previewWrapRef?.nativeElement;
    if (!wrap) return;
    gsap.to(wrap, { opacity: 0, duration: 0.3, ease: 'power1.out', overwrite: true });
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;

    if (this.tickFn) {
      gsap.ticker.remove(this.tickFn);
    }

    const root = this.rootRef?.nativeElement;
    if (root) {
      if (this.pointerDownHandler) root.removeEventListener('pointerdown', this.pointerDownHandler);
      if (this.pointerMoveHandler) root.removeEventListener('pointermove', this.pointerMoveHandler);
      if (this.pointerUpHandler) {
        root.removeEventListener('pointerup', this.pointerUpHandler);
        root.removeEventListener('pointerleave', this.pointerUpHandler);
      }
    }

    if (this.galleryRef?.nativeElement) {
      gsap.killTweensOf(this.galleryRef.nativeElement);
    }
  }
}
