import { Component, Input, ElementRef, OnInit, AfterViewInit, OnDestroy, ViewChild, Inject, PLATFORM_ID, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';

@Component({
  selector: 'app-mechanical-flip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #container class="mech-flip-container" (mouseenter)="onPointerEnter()" (mouseleave)="onPointerLeave()">
      <span *ngFor="let item of charData" 
            class="char" 
            [ngClass]="item.class"
            [style.display]="'inline-block'" 
            [style.transform-origin]="transformOrigin"
            [innerHTML]="item.char === ' ' ? '&nbsp;' : item.char">
      </span>
    </div>
  `,
  styles: [`
    .mech-flip-container {
      margin: 0;
      display: inline-block;
      white-space: pre-wrap;
      perspective: 800px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class MechanicalFlipComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() text: string = 'Mechanical Flip';
  @Input() startRotationX: number = -90;
  @Input() transformOrigin: string = '50% 0%';
  @Input() staggerFrom: 'start' | 'center' | 'end' | 'random' = 'start';
  @Input() animation: 'hover' | 'enter' | 'continuous' = 'continuous';
  @Input() duration: number = 0.5;
  @Input() delay: number = 0;
  @Input() staggerChildren: number = 0.05;
  @Input() ease: string = 'back.out(1.7)';
  @Input() repeatDelay: number = 4;
  
  @Input() highlightWords: string[] = [];
  @Input() highlightClass: string = '';

  @ViewChild('container') containerRef!: ElementRef<HTMLElement>;

  charData: { char: string, class: string }[] = [];
  private canTriggerHover = true;
  private timeline: gsap.core.Timeline | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.parseText();
  }

  ngAfterViewInit() {
    if ((this.animation === 'enter' || this.animation === 'continuous') && isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.playAnimation(), 100);
    }
  }

  ngOnDestroy() {
    if (this.timeline) {
      this.timeline.kill();
    }
    if (isPlatformBrowser(this.platformId) && this.containerRef) {
      const chars = this.containerRef.nativeElement.querySelectorAll('.char');
      gsap.killTweensOf(chars);
    }
  }

  private parseText() {
    this.charData = [];
    const words = this.text.split(' ');
    
    words.forEach((word, wordIdx) => {
      const isHighlighted = this.highlightWords.includes(word);
      const cls = isHighlighted ? this.highlightClass : '';
      
      for (let i = 0; i < word.length; i++) {
        this.charData.push({ char: word[i], class: cls });
      }
      
      if (wordIdx < words.length - 1) {
        this.charData.push({ char: ' ', class: '' });
      }
    });
  }

  playAnimation() {
    if (!isPlatformBrowser(this.platformId) || !this.containerRef) return;

    const chars = this.containerRef.nativeElement.querySelectorAll('.char');
    
    if (this.timeline) {
      this.timeline.kill();
    }
    gsap.killTweensOf(chars);

    gsap.set(chars, {
      clearProps: 'transform,opacity',
      transformOrigin: this.transformOrigin,
    });

    const isContinuous = this.animation === 'continuous';

    this.timeline = gsap.timeline({
      repeat: isContinuous ? -1 : 0,
      repeatDelay: isContinuous ? this.repeatDelay : 0
    });

    this.timeline.from(chars, {
      rotationX: this.startRotationX,
      opacity: 0,
      transformOrigin: this.transformOrigin,
      duration: this.duration,
      stagger: {
        each: this.staggerChildren,
        from: this.staggerFrom,
      },
      ease: this.ease,
    });
  }

  onPointerEnter() {
    if (this.animation !== 'hover' || !this.canTriggerHover) return;
    this.canTriggerHover = false;
    this.playAnimation();
  }

  onPointerLeave() {
    this.canTriggerHover = true;
  }
}
