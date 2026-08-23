import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { WakeupService, ServerStatus } from '../../core/services/wakeup.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-server-wakeup-banner',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressBarModule],
  template: `
    @if (status === 'waking') {
      <div class="wakeup-banner">
        <div class="wakeup-inner">
          <div class="wakeup-icon">
            <span class="pulse-ring"></span>
            <mat-icon>rocket_launch</mat-icon>
          </div>
          <div class="wakeup-text">
            <strong>Server is waking up…</strong>
            <span>Free hosting goes to sleep after inactivity. Please wait <b>{{ elapsed }}s</b> — this happens only on first visit.</span>
          </div>
          <div class="wakeup-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
        <mat-progress-bar mode="indeterminate" color="accent"></mat-progress-bar>
      </div>
    }

    @if (status === 'offline') {
      <div class="wakeup-banner offline">
        <div class="wakeup-inner">
          <mat-icon>wifi_off</mat-icon>
          <div class="wakeup-text">
            <strong>Server is unavailable</strong>
            <span>Could not connect after 2 minutes. Please refresh the page or try again later.</span>
          </div>
          <button class="retry-btn" (click)="retry()">
            <mat-icon>refresh</mat-icon> Retry
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .wakeup-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #fff;
      box-shadow: 0 4px 24px rgba(0,0,0,0.4);
      animation: slideDown 0.4s ease-out;

      &.offline {
        background: linear-gradient(135deg, #c0392b 0%, #922b21 100%);
      }
    }

    @keyframes slideDown {
      from { transform: translateY(-100%); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    .wakeup-inner {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 20px;
    }

    .wakeup-icon {
      position: relative;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;

      mat-icon {
        font-size: 22px;
        color: #f39c12;
        z-index: 1;
      }

      .pulse-ring {
        position: absolute;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid #f39c12;
        animation: pulse 1.5s ease-out infinite;
      }
    }

    @keyframes pulse {
      0%   { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    .wakeup-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;

      strong {
        font-size: 13px;
        font-weight: 600;
        color: #f39c12;
      }

      span {
        font-size: 12px;
        color: rgba(255,255,255,0.75);
      }
    }

    /* Three bouncing dots */
    .wakeup-dots {
      display: flex;
      gap: 4px;
      flex-shrink: 0;

      span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #f39c12;
        animation: bounce 1.2s ease-in-out infinite;

        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }

    @keyframes bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40%           { transform: translateY(-6px); }
    }

    .retry-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      color: #fff;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      flex-shrink: 0;
      transition: background 0.2s;

      &:hover { background: rgba(255,255,255,0.25); }

      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    mat-progress-bar {
      height: 3px;
    }
  `]
})
export class ServerWakeupBannerComponent implements OnInit, OnDestroy {
  status: ServerStatus = 'checking';
  elapsed = 0;

  private subs: Subscription[] = [];

  constructor(private wakeupService: WakeupService) {}

  ngOnInit(): void {
    this.subs.push(
      this.wakeupService.status$.subscribe(s => this.status = s),
      this.wakeupService.elapsedSeconds$.subscribe(s => this.elapsed = s)
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  retry(): void {
    window.location.reload();
  }
}
