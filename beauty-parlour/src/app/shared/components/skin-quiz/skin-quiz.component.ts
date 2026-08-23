import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

export interface QuizQuestionOption {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
}

@Component({
  selector: 'app-skin-quiz',
  standalone: true,
  imports: [CommonModule, DecimalPipe, MatIconModule, MatButtonModule],
  templateUrl: './skin-quiz.component.html',
  styleUrl: './skin-quiz.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkinQuizComponent {
  isOpen = false;
  currentStep = 1;

  @Output() quizClosed = new EventEmitter<void>();

  // Question 1: Skin Type
  skinTypes: QuizQuestionOption[] = [
    { key: 'dry', title: 'Dry & Dehydrated', subtitle: 'Feels tight, flaky, lacks natural lipid glow', icon: 'water_drop' },
    { key: 'oily', title: 'Oily & Congested', subtitle: 'Excess shine, enlarged pores, prone to breakout', icon: 'opacity' },
    { key: 'combination', title: 'Combination', subtitle: 'Oily T-zone with normal to dry cheeks', icon: 'tune' },
    { key: 'sensitive', title: 'Delicate & Sensitive', subtitle: 'Prone to redness, reactivity & irritation', icon: 'spa' }
  ];

  // Question 2: Primary Concern
  concerns: QuizQuestionOption[] = [
    { key: 'dullness', title: 'Dullness & Uneven Tone', subtitle: 'Wants luminous radiance, clarity and glow', icon: 'wb_sunny' },
    { key: 'aging', title: 'Fine Lines & Elasticity', subtitle: 'Target firming, collagen & smoothing', icon: 'auto_awesome' },
    { key: 'acne', title: 'Blemishes & Texture', subtitle: 'Pore refining, sebum balance & gentle renewal', icon: 'healing' },
    { key: 'dryness', title: 'Deep Barrier Repair', subtitle: 'Long-lasting 48H moisture & lipid barrier', icon: 'shield' }
  ];

  // Question 3: Desired Finish
  finishes: QuizQuestionOption[] = [
    { key: 'dewy', title: 'Glass Skin Dewy Glaze', subtitle: 'Ultra-hydrated, reflective, radiant finish', icon: 'auto_fix_high' },
    { key: 'matte', title: 'Velvet Soft Matte', subtitle: 'Poreless, balanced, clean velvety texture', icon: 'blur_on' },
    { key: 'barrier', title: 'Nourished & Plump Cushion', subtitle: 'Deep comfort, bouncy, calming barrier feel', icon: 'favorite' }
  ];

  selectedSkinType: string | null = null;
  selectedConcern: string | null = null;
  selectedFinish: string | null = null;

  // Generated Routine Products
  routineProducts: Product[] = [];
  bundleOriginalPrice = 0;
  bundleDiscountPrice = 0;

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  open(): void {
    this.isOpen = true;
    this.currentStep = 1;
    this.selectedSkinType = null;
    this.selectedConcern = null;
    this.selectedFinish = null;
    this.routineProducts = [];
    this.cdr.markForCheck();
  }

  close(): void {
    this.isOpen = false;
    this.quizClosed.emit();
    this.cdr.markForCheck();
  }

  selectSkinType(key: string): void {
    this.selectedSkinType = key;
    this.currentStep = 2;
    this.cdr.markForCheck();
  }

  selectConcern(key: string): void {
    this.selectedConcern = key;
    this.currentStep = 3;
    this.cdr.markForCheck();
  }

  selectFinish(key: string): void {
    this.selectedFinish = key;
    this.buildRoutineResult();
  }

  goToStep(stepNum: number): void {
    if (stepNum < this.currentStep) {
      this.currentStep = stepNum;
      this.cdr.markForCheck();
    }
  }

  private buildRoutineResult(): void {
    this.currentStep = 4;
    this.productService.getAll().subscribe({
      next: (products) => {
        let cleansers = products.filter(p => p.category === 'cleansers' || p.category === 'skincare');
        let serums = products.filter(p => p.category === 'serums' || p.category === 'skincare');
        let creams = products.filter(p => p.category === 'skincare' || p.category === 'masks');

        const p1 = cleansers[0] || products[0];
        const p2 = serums[1] || products[1] || products[0];
        const p3 = creams[2] || products[2] || products[0];

        this.routineProducts = [p1, p2, p3].filter(Boolean);
        this.bundleOriginalPrice = this.routineProducts.reduce((sum, item) => sum + (item.price || 899), 0);
        this.bundleDiscountPrice = Math.round(this.bundleOriginalPrice * 0.85); // 15% bundle discount
        this.cdr.markForCheck();
      },
      error: () => {
        this.bundleOriginalPrice = 2499;
        this.bundleDiscountPrice = 2124;
        this.cdr.markForCheck();
      }
    });
  }

  addBundleToCart(): void {
    if (this.routineProducts.length > 0) {
      this.routineProducts.forEach(product => {
        this.cartService.addItem(product, 1);
      });
    }
    this.close();
  }
}
