import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoyaltyService, LoyaltyAccount, LoyaltyTransaction, LoyaltyConfig, LeaderboardEntry, LoyaltyTier } from '../../../core/services/loyalty.service';

@Component({
  selector: 'app-my-rewards',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, MatButtonModule, MatIconModule, MatCardModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatProgressBarModule,
    MatChipsModule, MatTabsModule, MatFormFieldModule, MatInputModule, MatTooltipModule
  ],
  templateUrl: './my-rewards.component.html',
  styleUrl: './my-rewards.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class MyRewardsComponent implements OnInit {
  loading = true;
  account: LoyaltyAccount | null = null;
  config: LoyaltyConfig | null = null;
  transactions: LoyaltyTransaction[] = [];
  leaderboard: LeaderboardEntry[] = [];
  tierProgress = 0;
  pointsToNextTier = 0;
  nextTier = 'Silver';

  // Inline Premium Modal (instant display)
  showModal = false;
  modalType: 'redeem' | 'referral' | 'benefits' = 'redeem';
  modalInput = '';
  modalBenefits: string[] = [];
  modalTierName = '';

  constructor(
    private loyaltyService: LoyaltyService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.loyaltyService.getConfig().subscribe({
      next: (config) => {
        this.config = config;
        this.calculateTierProgress();
        this.cdr.markForCheck();
      }
    });

    this.loyaltyService.getMyAccount().subscribe({
      next: (account) => {
        this.account = account;
        this.calculateTierProgress();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });

    this.loyaltyService.getHistory().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.cdr.markForCheck();
      }
    });

    this.loyaltyService.getLeaderboard(10).subscribe({
      next: (leaderboard) => {
        this.leaderboard = leaderboard;
        this.cdr.markForCheck();
      }
    });
  }

  calculateTierProgress(): void {
    if (!this.config?.tiers || !this.account) return;

    const currentPoints = this.account.lifetimePoints || 0;
    const tiers = this.config.tiers.sort((a, b) => a.minPoints - b.minPoints);
    
    const currentTierIndex = tiers.findIndex(t => t.name === this.account?.tier);
    const nextTierObj = tiers[currentTierIndex + 1];

    if (nextTierObj) {
      const currentTierMin = tiers[currentTierIndex]?.minPoints || 0;
      const nextTierMin = nextTierObj.minPoints;
      this.pointsToNextTier = nextTierMin - currentPoints;
      this.nextTier = nextTierObj.name;
      this.tierProgress = ((currentPoints - currentTierMin) / (nextTierMin - currentTierMin)) * 100;
    } else {
      this.tierProgress = 100;
      this.pointsToNextTier = 0;
      this.nextTier = 'Max Level';
    }
  }

  getTierIcon(tier?: string): string {
    const icons: Record<string, string> = {
      'Bronze': 'workspace_premium',
      'Silver': 'military_tech',
      'Gold': 'emoji_events',
      'Platinum': 'diamond'
    };
    return icons[tier || 'Bronze'] || 'workspace_premium';
  }

  getAvatarGradient(rank: number): string {
    if (rank === 1) return 'linear-gradient(135deg, #FFD700, #FFA500)';
    if (rank === 2) return 'linear-gradient(135deg, #C0C0C0, #A0A0A0)';
    if (rank === 3) return 'linear-gradient(135deg, #CD7F32, #B8860B)';
    return 'linear-gradient(135deg, #7C3AED, #9333EA)';
  }

  getTransactionIcon(type: string): string {
    const icons: Record<string, string> = {
      'earn': 'add_circle',
      'redeem': 'remove_circle',
      'bonus': 'card_giftcard',
      'expire': 'schedule',
      'adjustment': 'tune'
    };
    return icons[type] || 'receipt';
  }

  // Inline Premium Modal Methods (instant display)
  showRedeemDialog(): void {
    console.log('Opening redeem dialog');
    this.modalType = 'redeem';
    this.modalInput = '100';
    this.showModal = true;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  showReferralDialog(): void {
    console.log('Opening referral dialog');
    this.modalType = 'referral';
    this.modalInput = '';
    this.showModal = true;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  showBenefits(): void {
    console.log('Opening benefits dialog');
    const tier = this.config?.tiers?.find(t => t.name === this.account?.tier);
    if (tier) {
      this.modalType = 'benefits';
      this.modalBenefits = tier.benefits || [];
      this.modalTierName = tier.name;
      this.showModal = true;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    } else {
      // Show default benefits if no tier config
      this.modalType = 'benefits';
      this.modalBenefits = ['Earn points on every purchase', 'Exclusive member discounts', 'Birthday bonus points'];
      this.modalTierName = this.account?.tier || 'Bronze';
      this.showModal = true;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  confirmModal(): void {
    if (this.modalType === 'redeem') {
      this.processRedeem();
    } else if (this.modalType === 'referral') {
      this.processReferral();
    } else {
      this.closeModal();
    }
  }

  private processRedeem(): void {
    const minPoints = this.config?.minRedeemPoints || 100;
    const maxPoints = this.account?.points || 0;
    const points = +this.modalInput;

    if (!points || isNaN(points)) {
      this.snackBar.open('Please enter a valid number', 'Close', {
        duration: 3000, panelClass: ['warning-snackbar'], horizontalPosition: 'center', verticalPosition: 'top'
      });
      return;
    }

    if (points < minPoints) {
      this.snackBar.open(`Minimum ${minPoints} points required`, 'Close', {
        duration: 4000, panelClass: ['warning-snackbar'], horizontalPosition: 'center', verticalPosition: 'top'
      });
      return;
    }

    if (points > maxPoints) {
      this.snackBar.open('Insufficient points', 'Close', {
        duration: 4000, panelClass: ['error-snackbar'], horizontalPosition: 'center', verticalPosition: 'top'
      });
      return;
    }

    this.closeModal();
    this.loyaltyService.redeemPoints(points).subscribe({
      next: (res) => {
        this.snackBar.open(`🎉 ${res.message}`, 'OK', {
          duration: 5000, panelClass: ['success-snackbar'], horizontalPosition: 'center', verticalPosition: 'top'
        });
        this.loadData();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to redeem points', 'Close', {
          duration: 4000, panelClass: ['error-snackbar'], horizontalPosition: 'center', verticalPosition: 'top'
        });
      }
    });
  }

  private processReferral(): void {
    const code = this.modalInput?.trim();
    if (!code) {
      this.snackBar.open('Please enter a referral code', 'Close', {
        duration: 3000, panelClass: ['warning-snackbar'], horizontalPosition: 'center', verticalPosition: 'top'
      });
      return;
    }

    this.closeModal();
    this.loyaltyService.applyReferral(code).subscribe({
      next: (res: any) => {
        const bonus = res.bonusPoints || res.points || 100;
        this.snackBar.open(`🎉 ${res.message || 'Referral applied!'} +${bonus} points!`, 'OK', {
          duration: 5000, panelClass: ['success-snackbar'], horizontalPosition: 'center', verticalPosition: 'top'
        });
        this.loadData();
      },
      error: () => this.snackBar.open('Invalid or already used referral code', 'Close', {
        duration: 4000, panelClass: ['error-snackbar'], horizontalPosition: 'center', verticalPosition: 'top'
      })
    });
  }

  copyReferralCode(): void {
    navigator.clipboard.writeText(this.account?.referralCode || 'BEAUTY123');
    this.snackBar.open('Referral code copied!', 'Close', { duration: 2000 });
  }
}
