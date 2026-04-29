import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { LoyaltyService, LoyaltyAccount, LoyaltyTransaction, LoyaltyConfig, LeaderboardEntry, LoyaltyTier } from '../../../core/services/loyalty.service';

@Component({
  selector: 'app-my-rewards',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule, MatCardModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatProgressBarModule,
    MatChipsModule, MatTabsModule, MatFormFieldModule, MatInputModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rewards-container">
      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Loading your rewards...</p>
        </div>
      } @else {
        <!-- Hero Section -->
        <div class="rewards-hero" [class]="account?.tier?.toLowerCase() || 'bronze'">
          <div class="hero-content">
            <div class="tier-badge">
              <mat-icon>{{ getTierIcon(account?.tier) }}</mat-icon>
              <span>{{ account?.tier || 'Bronze' }} Member</span>
            </div>
            <div class="points-display">
              <span class="points-value">{{ account?.points || 0 | number }}</span>
              <span class="points-label">Available Points</span>
            </div>
            <div class="lifetime-points">
              Lifetime: {{ account?.lifetimePoints || 0 | number }} points
            </div>
          </div>
          <div class="tier-progress">
            <span>Progress to next tier</span>
            <mat-progress-bar mode="determinate" [value]="tierProgress"></mat-progress-bar>
            <span class="progress-text">{{ pointsToNextTier }} points to {{ nextTier }}</span>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <mat-card class="action-card hover-lift" (click)="showRedeemDialog()">
            <mat-icon>redeem</mat-icon>
            <span>Redeem Points</span>
          </mat-card>
          <mat-card class="action-card hover-lift" (click)="showReferralDialog()">
            <mat-icon>share</mat-icon>
            <span>Refer & Earn</span>
          </mat-card>
          <mat-card class="action-card hover-lift" (click)="showBenefits()">
            <mat-icon>card_giftcard</mat-icon>
            <span>My Benefits</span>
          </mat-card>
        </div>

        <mat-tab-group>
          <!-- How to Earn -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>emoji_events</mat-icon>
              <span>Earn Points</span>
            </ng-template>
            <div class="tab-content">
              <div class="earn-ways">
                <mat-card class="earn-card">
                  <mat-icon>spa</mat-icon>
                  <h4>Book Services</h4>
                  <p>Earn {{ config?.pointsPerRupee || 1 }} point per ₹1 spent</p>
                </mat-card>
                <mat-card class="earn-card">
                  <mat-icon>shopping_bag</mat-icon>
                  <h4>Buy Products</h4>
                  <p>Earn {{ config?.pointsPerRupee || 1 }} point per ₹1 spent</p>
                </mat-card>
                <mat-card class="earn-card">
                  <mat-icon>person_add</mat-icon>
                  <h4>Refer Friends</h4>
                  <p>Get {{ config?.referralBonus || 100 }} bonus points</p>
                </mat-card>
                <mat-card class="earn-card">
                  <mat-icon>cake</mat-icon>
                  <h4>Birthday Bonus</h4>
                  <p>Get {{ config?.birthdayBonus || 50 }} points on your birthday</p>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Transaction History -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>history</mat-icon>
              <span>History</span>
            </ng-template>
            <div class="tab-content">
              <div class="transactions-list">
                @for (txn of transactions; track txn._id) {
                  <div class="transaction-item" [class]="txn.type">
                    <div class="txn-icon">
                      <mat-icon>{{ getTransactionIcon(txn.type) }}</mat-icon>
                    </div>
                    <div class="txn-info">
                      <span class="txn-description">{{ txn.description }}</span>
                      <span class="txn-date">{{ txn.createdAt | date:'medium' }}</span>
                    </div>
                    <div class="txn-points" [class.positive]="txn.type !== 'redeem'" [class.negative]="txn.type === 'redeem'">
                      {{ txn.type === 'redeem' ? '-' : '+' }}{{ txn.points | number }}
                    </div>
                  </div>
                }
                @if (transactions.length === 0) {
                  <div class="empty-history">
                    <mat-icon>receipt_long</mat-icon>
                    <p>No transactions yet. Start earning points!</p>
                  </div>
                }
              </div>
            </div>
          </mat-tab>

          <!-- Leaderboard -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>leaderboard</mat-icon>
              <span>Leaderboard</span>
            </ng-template>
            <div class="tab-content">
              <div class="leaderboard">
                @for (entry of leaderboard; track entry.rank) {
                  <div class="leaderboard-entry" [class.top-3]="entry.rank <= 3" [class.me]="entry.user._id === account?.user?._id">
                    <span class="rank">
                      @if (entry.rank === 1) { 🥇 }
                      @else if (entry.rank === 2) { 🥈 }
                      @else if (entry.rank === 3) { 🥉 }
                      @else { {{ entry.rank }} }
                    </span>
                    <div class="user-info">
                      <span class="name">{{ entry.user.name }}</span>
                      <span class="tier">{{ entry.tier }}</span>
                    </div>
                    <span class="points">{{ entry.points | number }} pts</span>
                  </div>
                }
              </div>
            </div>
          </mat-tab>

          <!-- Tier Benefits -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>diamond</mat-icon>
              <span>Tiers</span>
            </ng-template>
            <div class="tab-content">
              <div class="tiers-list">
                @for (tier of config?.tiers; track tier.name) {
                  <mat-card class="tier-card" [class.current]="tier.name === account?.tier">
                    <div class="tier-header" [class]="tier.name.toLowerCase()">
                      <mat-icon>{{ getTierIcon(tier.name) }}</mat-icon>
                      <h3>{{ tier.name }}</h3>
                      <span class="min-points">{{ tier.minPoints | number }}+ points</span>
                    </div>
                    <mat-card-content>
                      <div class="multiplier">
                        <span class="value">{{ tier.multiplier }}x</span>
                        <span class="label">Points Multiplier</span>
                      </div>
                      <ul class="benefits-list">
                        @for (benefit of tier.benefits; track benefit) {
                          <li><mat-icon>check_circle</mat-icon> {{ benefit }}</li>
                        }
                      </ul>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>

        <!-- Referral Section -->
        <mat-card class="referral-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>card_giftcard</mat-icon>
              Refer & Earn
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Share your referral code with friends and earn {{ config?.referralBonus || 100 }} points for each signup!</p>
            <div class="referral-code">
              <span class="code">{{ account?.referralCode || 'BEAUTY123' }}</span>
              <button mat-icon-button (click)="copyReferralCode()" matTooltip="Copy code">
                <mat-icon>content_copy</mat-icon>
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .rewards-container { padding: 24px; max-width: 900px; margin: 0 auto; }
    .loading-state { text-align: center; padding: 64px; }
    .rewards-hero { background: linear-gradient(135deg, #cd7f32, #b87333); color: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; }
    .rewards-hero.silver { background: linear-gradient(135deg, #c0c0c0, #a8a8a8); }
    .rewards-hero.gold { background: linear-gradient(135deg, #ffd700, #ffb347); }
    .rewards-hero.platinum { background: linear-gradient(135deg, #e5e4e2, #a8a8a8); }
    .hero-content { text-align: center; margin-bottom: 24px; }
    .tier-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; margin-bottom: 16px; }
    .points-display { margin-bottom: 8px; }
    .points-value { font-size: 56px; font-weight: 700; display: block; }
    .points-label { font-size: 14px; opacity: 0.9; }
    .lifetime-points { font-size: 14px; opacity: 0.8; }
    .tier-progress { background: rgba(255,255,255,0.2); padding: 16px; border-radius: 8px; }
    .tier-progress span { font-size: 12px; }
    .progress-text { display: block; margin-top: 8px; text-align: right; }
    .quick-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .action-card { text-align: center; padding: 24px 16px; cursor: pointer; transition: transform 0.2s; }
    .action-card:hover { transform: translateY(-4px); }
    .action-card mat-icon { font-size: 32px; width: 32px; height: 32px; color: #e91e63; margin-bottom: 8px; }
    .action-card span { display: block; font-weight: 500; }
    .tab-content { padding: 24px 0; }
    .earn-ways { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .earn-card { text-align: center; padding: 24px; }
    .earn-card mat-icon { font-size: 40px; width: 40px; height: 40px; color: #e91e63; }
    .earn-card h4 { margin: 12px 0 8px; }
    .earn-card p { color: #666; font-size: 14px; margin: 0; }
    .transactions-list { display: flex; flex-direction: column; gap: 12px; }
    .transaction-item { display: flex; align-items: center; gap: 16px; padding: 16px; background: #fafafa; border-radius: 8px; }
    .txn-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .transaction-item.earn .txn-icon { background: #e8f5e9; color: #388e3c; }
    .transaction-item.redeem .txn-icon { background: #ffebee; color: #c62828; }
    .transaction-item.bonus .txn-icon { background: #e3f2fd; color: #1565c0; }
    .txn-info { flex: 1; }
    .txn-description { display: block; font-weight: 500; }
    .txn-date { font-size: 12px; color: #666; }
    .txn-points { font-size: 18px; font-weight: 600; }
    .txn-points.positive { color: #388e3c; }
    .txn-points.negative { color: #c62828; }
    .empty-history { text-align: center; padding: 48px; color: #666; }
    .empty-history mat-icon { font-size: 64px; width: 64px; height: 64px; color: #e0e0e0; }
    .leaderboard { display: flex; flex-direction: column; gap: 8px; }
    .leaderboard-entry { display: flex; align-items: center; gap: 16px; padding: 16px; background: #fafafa; border-radius: 8px; }
    .leaderboard-entry.top-3 { background: linear-gradient(135deg, #fff8e1, #fffde7); }
    .leaderboard-entry.me { border: 2px solid #e91e63; }
    .rank { font-size: 20px; width: 40px; text-align: center; }
    .user-info { flex: 1; }
    .user-info .name { display: block; font-weight: 500; }
    .user-info .tier { font-size: 12px; color: #666; }
    .points { font-weight: 600; color: #e91e63; }
    .tiers-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
    .tier-card { overflow: hidden; }
    .tier-card.current { border: 2px solid #e91e63; }
    .tier-header { padding: 24px; text-align: center; color: white; }
    .tier-header.bronze { background: linear-gradient(135deg, #cd7f32, #b87333); }
    .tier-header.silver { background: linear-gradient(135deg, #c0c0c0, #a8a8a8); }
    .tier-header.gold { background: linear-gradient(135deg, #ffd700, #ffb347); }
    .tier-header.platinum { background: linear-gradient(135deg, #e5e4e2, #8e8e8e); }
    .tier-header h3 { margin: 8px 0 4px; }
    .tier-header .min-points { font-size: 12px; opacity: 0.9; }
    .multiplier { text-align: center; padding: 16px; background: #fafafa; margin: -16px -16px 16px; }
    .multiplier .value { font-size: 32px; font-weight: 700; color: #e91e63; display: block; }
    .multiplier .label { font-size: 12px; color: #666; }
    .benefits-list { list-style: none; padding: 0; margin: 0; }
    .benefits-list li { display: flex; align-items: center; gap: 8px; padding: 8px 0; font-size: 14px; }
    .benefits-list mat-icon { font-size: 18px; width: 18px; height: 18px; color: #4caf50; }
    .referral-card { margin-top: 24px; background: linear-gradient(135deg, #fce4ec, #f8bbd9); }
    .referral-card mat-card-title { display: flex; align-items: center; gap: 8px; }
    .referral-code { display: flex; align-items: center; gap: 8px; background: white; padding: 12px 16px; border-radius: 8px; margin-top: 16px; }
    .referral-code .code { font-size: 24px; font-weight: 700; letter-spacing: 2px; color: #e91e63; }
    @media (max-width: 600px) {
      .quick-actions { grid-template-columns: 1fr; }
      .points-value { font-size: 40px; }
    }
  `]
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

  showRedeemDialog(): void {
    const points = prompt(`How many points to redeem? (Min: ${this.config?.minRedeemPoints || 100})`, '100');
    if (points && !isNaN(+points)) {
      if (+points < (this.config?.minRedeemPoints || 100)) {
        this.snackBar.open(`Minimum ${this.config?.minRedeemPoints || 100} points required`, 'Close', { duration: 3000 });
        return;
      }
      if (+points > (this.account?.points || 0)) {
        this.snackBar.open('Insufficient points', 'Close', { duration: 3000 });
        return;
      }
      this.loyaltyService.redeemPoints(+points).subscribe({
        next: (res) => {
          this.snackBar.open(res.message, 'Close', { duration: 3000 });
          this.loadData();
        },
        error: () => this.snackBar.open('Failed to redeem points', 'Close', { duration: 3000 })
      });
    }
  }

  showReferralDialog(): void {
    const code = prompt('Enter referral code:');
    if (code) {
      this.loyaltyService.applyReferral(code).subscribe({
        next: (res) => {
          this.snackBar.open(`${res.message} +${res.bonusPoints} points!`, 'Close', { duration: 3000 });
          this.loadData();
        },
        error: () => this.snackBar.open('Invalid or already used referral code', 'Close', { duration: 3000 })
      });
    }
  }

  showBenefits(): void {
    const tier = this.config?.tiers?.find(t => t.name === this.account?.tier);
    if (tier) {
      alert(`Your ${tier.name} Benefits:\n\n${tier.benefits.join('\n')}`);
    }
  }

  copyReferralCode(): void {
    navigator.clipboard.writeText(this.account?.referralCode || 'BEAUTY123');
    this.snackBar.open('Referral code copied!', 'Close', { duration: 2000 });
  }
}
