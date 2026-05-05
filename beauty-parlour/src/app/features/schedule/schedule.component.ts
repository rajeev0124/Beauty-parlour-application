import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { ScheduleService, Schedule, ScheduleStats } from '../../core/services/schedule.service';
import { StaffService } from '../../core/services/staff.service';
import { ScheduleDialogComponent } from './schedule-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatCardModule, MatDialogModule, MatSnackBarModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatChipsModule,
    MatProgressSpinnerModule, MatTooltipModule, MatTabsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="schedule-page">
      <!-- Header Section -->
      <div class="sch-header">
        <div class="sch-header-content">
          <div class="sch-header-icon">
            <mat-icon>calendar_month</mat-icon>
          </div>
          <div class="sch-header-text">
            <h1>Staff Schedule</h1>
            <p>Manage staff availability and shifts</p>
          </div>
        </div>
        <div class="sch-header-actions">
          <button class="sch-btn secondary" (click)="addLeave()">
            <mat-icon>event_busy</mat-icon>
            Add Leave
          </button>
          <button class="sch-btn primary" (click)="createSchedule()">
            <mat-icon>add</mat-icon>
            Create Schedule
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="sch-stats">
        <div class="sch-stat-card total">
          <div class="stat-icon"><mat-icon>groups</mat-icon></div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.totalStaff }}</span>
            <span class="stat-label">Total Staff</span>
          </div>
        </div>
        <div class="sch-stat-card available">
          <div class="stat-icon"><mat-icon>how_to_reg</mat-icon></div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.availableToday }}</span>
            <span class="stat-label">Available Today</span>
          </div>
        </div>
        <div class="sch-stat-card on-leave">
          <div class="stat-icon"><mat-icon>beach_access</mat-icon></div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.onLeaveToday }}</span>
            <span class="stat-label">On Leave Today</span>
          </div>
        </div>
      </div>

      <!-- Main Content Card -->
      <div class="sch-main-card">
        <!-- Tab Navigation -->
        <div class="sch-tabs">
          <button class="sch-tab" [class.active]="activeTab === 'today'" (click)="activeTab = 'today'">
            <mat-icon>today</mat-icon>
            <span>Today</span>
          </button>
          <button class="sch-tab" [class.active]="activeTab === 'week'" (click)="activeTab = 'week'">
            <mat-icon>date_range</mat-icon>
            <span>This Week</span>
          </button>
          <button class="sch-tab" [class.active]="activeTab === 'leaves'" (click)="activeTab = 'leaves'">
            <mat-icon>event_busy</mat-icon>
            <span>Leaves</span>
            @if (stats.upcomingLeaves.length > 0) {
              <span class="tab-badge">{{ stats.upcomingLeaves.length }}</span>
            }
          </button>
        </div>

        <!-- Today's Schedule Tab -->
        @if (activeTab === 'today') {
          <div class="sch-tab-content">
            @if (loading) {
              <div class="sch-grid">
                @for (i of [1,2,3,4]; track i) {
                  <div class="sch-staff-card skeleton-card">
                    <div class="skeleton skeleton-avatar"></div>
                    <div class="skeleton-info">
                      <div class="skeleton skeleton-name"></div>
                      <div class="skeleton skeleton-status"></div>
                    </div>
                  </div>
                }
              </div>
            } @else if (todaySchedules.length === 0) {
              <div class="sch-empty">
                <div class="empty-icon">
                  <mat-icon>event_note</mat-icon>
                </div>
                <h3>No schedules for today</h3>
                <p>Create a schedule to manage staff availability</p>
                <button class="sch-btn primary" (click)="createSchedule()">
                  <mat-icon>add</mat-icon> Create Schedule
                </button>
              </div>
            } @else {
              <div class="sch-grid">
                @for (schedule of todaySchedules; track schedule._id) {
                  <div class="sch-staff-card" [class.leave]="schedule.isLeave" [class.available]="schedule.isAvailable && !schedule.isLeave" [class.off]="!schedule.isAvailable && !schedule.isLeave">
                    <div class="staff-header">
                      <div class="staff-avatar-wrapper">
                        <div class="staff-avatar" [style.background]="getAvatarColor(schedule.staff.name)">
                          {{ schedule.staff.name.charAt(0).toUpperCase() || '?' }}
                        </div>
                        <span class="status-indicator" [class.available]="schedule.isAvailable && !schedule.isLeave" [class.leave]="schedule.isLeave" [class.off]="!schedule.isAvailable && !schedule.isLeave"></span>
                      </div>
                      <div class="staff-details">
                        <h4>{{ schedule.staff.name || 'Unknown Staff' }}</h4>
                        <span class="staff-role">{{ schedule.staff.role || 'Staff' }}</span>
                      </div>
                      <div class="card-menu">
                        <button class="menu-btn edit" (click)="editSchedule(schedule)" matTooltip="Edit">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button class="menu-btn delete" (click)="deleteSchedule(schedule)" matTooltip="Delete">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>
                    <div class="staff-status-section">
                      @if (schedule.isLeave) {
                        <div class="status-badge leave">
                          <mat-icon>beach_access</mat-icon>
                          <span>On Leave</span>
                        </div>
                        @if (schedule.leaveReason) {
                          <p class="status-detail">{{ schedule.leaveReason }}</p>
                        }
                      } @else if (schedule.isAvailable) {
                        <div class="status-badge available">
                          <mat-icon>check_circle</mat-icon>
                          <span>Available</span>
                        </div>
                        <div class="time-info">
                          <div class="time-row">
                            <mat-icon>schedule</mat-icon>
                            <span>{{ schedule.startTime || '9:00 AM' }} - {{ schedule.endTime || '6:00 PM' }}</span>
                          </div>
                          @if (schedule.breakStart) {
                            <div class="time-row break">
                              <mat-icon>coffee</mat-icon>
                              <span>Break: {{ schedule.breakStart }} - {{ schedule.breakEnd }}</span>
                            </div>
                          }
                        </div>
                      } @else {
                        <div class="status-badge off">
                          <mat-icon>do_not_disturb</mat-icon>
                          <span>Day Off</span>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Week View Tab -->
        @if (activeTab === 'week') {
          <div class="sch-tab-content">
            <div class="sch-week-view">
              @for (day of weekDays; track day.date) {
                <div class="week-day" [class.today]="day.isToday">
                  <div class="day-header">
                    <span class="day-name">{{ day.name }}</span>
                    <span class="day-number">{{ day.date | date:'d' }}</span>
                  </div>
                  <div class="day-content">
                    @if (day.schedules.length === 0) {
                      <div class="no-schedule">
                        <mat-icon>event_busy</mat-icon>
                      </div>
                    } @else {
                      @for (schedule of day.schedules; track schedule._id) {
                        <div class="mini-card" [class.leave]="schedule.isLeave" [class.available]="schedule.isAvailable && !schedule.isLeave">
                          <div class="mini-avatar" [style.background]="getAvatarColor(schedule.staff.name)">
                            {{ schedule.staff.name.charAt(0).toUpperCase() || '?' }}
                          </div>
                          <div class="mini-info">
                            <span class="mini-name">{{ schedule.staff.name || 'Staff' }}</span>
                            @if (schedule.isLeave) {
                              <span class="mini-status leave">Leave</span>
                            } @else if (schedule.isAvailable) {
                              <span class="mini-time">{{ schedule.startTime || '9AM' }}</span>
                            } @else {
                              <span class="mini-status off">Off</span>
                            }
                          </div>
                        </div>
                      }
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Leaves Tab -->
        @if (activeTab === 'leaves') {
          <div class="sch-tab-content">
            @if (stats.upcomingLeaves.length === 0) {
              <div class="sch-empty">
                <div class="empty-icon leaves">
                  <mat-icon>event_available</mat-icon>
                </div>
                <h3>No upcoming leaves</h3>
                <p>All staff members are available</p>
              </div>
            } @else {
              <div class="leaves-grid">
                @for (leave of stats.upcomingLeaves; track leave.date) {
                  <div class="leave-card">
                    <div class="leave-date-box">
                      <span class="leave-day">{{ leave.date | date:'d' }}</span>
                      <span class="leave-month">{{ leave.date | date:'MMM' }}</span>
                    </div>
                    <div class="leave-details">
                      <h4>{{ leave.staff }}</h4>
                      <p>{{ leave.reason || 'Personal Leave' }}</p>
                    </div>
                    <div class="leave-type">
                      <mat-icon>beach_access</mat-icon>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .schedule-page {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    // ========== HEADER ==========
    .sch-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .sch-header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .sch-header-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, #06b6d4, #0891b2);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(6, 182, 212, 0.3);
      
      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: #fff;
      }
    }

    .sch-header-text {
      h1 {
        margin: 0;
        font-size: 26px;
        font-weight: 700;
        color: #1f2937;
      }
      
      p {
        margin: 4px 0 0;
        font-size: 14px;
        color: #6b7280;
      }
    }

    .sch-header-actions {
      display: flex;
      gap: 10px;
    }

    .sch-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      
      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      
      &.primary {
        background: linear-gradient(135deg, #7c3aed, #9333ea);
        color: #fff;
        box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
        }
      }
      
      &.secondary {
        background: #fff;
        color: #6b7280;
        border: 1px solid #e5e7eb;
        
        &:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }
      }
    }

    // ========== STATS ==========
    .sch-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .sch-stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: #fff;
      border-radius: 16px;
      border: 1px solid #f3f4f6;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      transition: all 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      }
      
      .stat-icon {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        mat-icon {
          font-size: 26px;
          width: 26px;
          height: 26px;
        }
      }
      
      .stat-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #1f2937;
        line-height: 1;
      }
      
      .stat-label {
        font-size: 13px;
        color: #6b7280;
        font-weight: 500;
      }
      
      &.total .stat-icon {
        background: #dbeafe;
        mat-icon { color: #2563eb; }
      }
      
      &.available .stat-icon {
        background: #d1fae5;
        mat-icon { color: #059669; }
      }
      
      &.on-leave .stat-icon {
        background: #fef3c7;
        mat-icon { color: #d97706; }
      }
    }

    // ========== MAIN CARD ==========
    .sch-main-card {
      background: #fff;
      border-radius: 16px;
      border: 1px solid #f3f4f6;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      overflow: hidden;
    }

    // ========== TABS ==========
    .sch-tabs {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      background: #f9fafb;
      border-bottom: 1px solid #f3f4f6;
    }

    .sch-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: transparent;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s ease;
      
      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      
      .tab-badge {
        background: #ef4444;
        color: #fff;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 600;
      }
      
      &:hover {
        background: #fff;
        color: #374151;
      }
      
      &.active {
        background: #fff;
        color: #7c3aed;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        
        mat-icon { color: #7c3aed; }
      }
    }

    .sch-tab-content {
      padding: 20px;
    }

    // ========== STAFF GRID ==========
    .sch-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }

    .sch-staff-card {
      background: #fff;
      border-radius: 14px;
      border: 1px solid #e5e7eb;
      padding: 16px;
      transition: all 0.2s ease;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        transform: translateY(-2px);
      }
      
      &.available {
        border-left: 4px solid #10b981;
        background: linear-gradient(135deg, #f0fdf4 0%, #fff 100%);
      }
      
      &.leave {
        border-left: 4px solid #f59e0b;
        background: linear-gradient(135deg, #fffbeb 0%, #fff 100%);
      }
      
      &.off {
        border-left: 4px solid #9ca3af;
        background: #f9fafb;
        opacity: 0.8;
      }
    }

    .staff-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 14px;
    }

    .staff-avatar-wrapper {
      position: relative;
      flex-shrink: 0;
    }

    .staff-avatar {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 700;
      color: #fff;
    }

    .status-indicator {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid #fff;
      
      &.available { background: #10b981; }
      &.leave { background: #f59e0b; }
      &.off { background: #9ca3af; }
    }

    .staff-details {
      flex: 1;
      min-width: 0;
      
      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .staff-role {
        font-size: 12px;
        color: #6b7280;
      }
    }

    .card-menu {
      display: flex;
      gap: 4px;
    }

    .menu-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
      
      &.edit {
        background: #ede9fe;
        color: #7c3aed;
        &:hover { background: #ddd6fe; }
      }
      
      &.delete {
        background: #fee2e2;
        color: #dc2626;
        &:hover { background: #fecaca; }
      }
    }

    .staff-status-section {
      padding-top: 12px;
      border-top: 1px solid #f3f4f6;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      
      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
      
      &.available {
        background: #d1fae5;
        color: #065f46;
      }
      
      &.leave {
        background: #fef3c7;
        color: #92400e;
      }
      
      &.off {
        background: #f3f4f6;
        color: #6b7280;
      }
    }

    .status-detail {
      margin: 8px 0 0;
      font-size: 13px;
      color: #6b7280;
    }

    .time-info {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .time-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #374151;
      
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: #9ca3af;
      }
      
      &.break {
        font-size: 12px;
        color: #6b7280;
      }
    }

    // ========== WEEK VIEW ==========
    .sch-week-view {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 8px;
    }

    .week-day {
      min-width: 130px;
      background: #f9fafb;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      
      &.today {
        .day-header {
          background: linear-gradient(135deg, #7c3aed, #9333ea);
          color: #fff;
        }
      }
    }

    .day-header {
      padding: 12px 8px;
      text-align: center;
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
      
      .day-name {
        display: block;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #6b7280;
      }
      
      .day-number {
        display: block;
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
        line-height: 1.2;
      }
      
      .week-day.today & {
        .day-name, .day-number { color: #fff; }
      }
    }

    .day-content {
      padding: 8px;
      min-height: 180px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .no-schedule {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #d1d5db;
      
      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
    }

    .mini-card {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      
      &.available {
        border-color: #10b981;
        background: #f0fdf4;
      }
      
      &.leave {
        border-color: #f59e0b;
        background: #fffbeb;
      }
    }

    .mini-avatar {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      color: #fff;
      flex-shrink: 0;
    }

    .mini-info {
      flex: 1;
      min-width: 0;
      
      .mini-name {
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: #374151;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .mini-time {
        font-size: 10px;
        color: #10b981;
        font-weight: 500;
      }
      
      .mini-status {
        font-size: 10px;
        font-weight: 500;
        
        &.leave { color: #d97706; }
        &.off { color: #9ca3af; }
      }
    }

    // ========== LEAVES TAB ==========
    .leaves-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .leave-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 12px;
      transition: all 0.2s ease;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
      }
    }

    .leave-date-box {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      
      .leave-day {
        font-size: 24px;
        font-weight: 700;
        color: #fff;
        line-height: 1;
      }
      
      .leave-month {
        font-size: 11px;
        font-weight: 600;
        color: rgba(255,255,255,0.9);
        text-transform: uppercase;
      }
    }

    .leave-details {
      flex: 1;
      min-width: 0;
      
      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
      }
      
      p {
        margin: 4px 0 0;
        font-size: 13px;
        color: #6b7280;
      }
    }

    .leave-type {
      width: 40px;
      height: 40px;
      background: #fef3c7;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      
      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #d97706;
      }
    }

    // ========== EMPTY STATE ==========
    .sch-empty {
      padding: 60px 24px;
      text-align: center;
      
      .empty-icon {
        width: 80px;
        height: 80px;
        margin: 0 auto 20px;
        background: #f3f4f6;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        
        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
          color: #d1d5db;
        }
        
        &.leaves {
          background: #d1fae5;
          mat-icon { color: #10b981; }
        }
      }
      
      h3 {
        margin: 0 0 8px;
        font-size: 18px;
        font-weight: 600;
        color: #374151;
      }
      
      p {
        margin: 0 0 20px;
        font-size: 14px;
        color: #6b7280;
      }
    }

    // ========== SKELETON ==========
    .skeleton-card {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      padding: 16px;
    }

    .skeleton {
      background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
    }

    .skeleton-avatar {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      flex-shrink: 0;
    }

    .skeleton-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skeleton-name {
      height: 20px;
      width: 120px;
    }

    .skeleton-status {
      height: 28px;
      width: 80px;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    // ========== RESPONSIVE ==========
    @media (max-width: 1024px) {
      .sch-stats {
        grid-template-columns: repeat(3, 1fr);
      }
      
      .sch-week-view {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    @media (max-width: 768px) {
      .schedule-page {
        padding: 16px;
      }
      
      .sch-header {
        flex-direction: column;
        align-items: stretch;
      }
      
      .sch-header-content {
        justify-content: center;
        text-align: center;
        flex-direction: column;
      }
      
      .sch-header-actions {
        justify-content: center;
      }
      
      .sch-stats {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      .sch-stat-card {
        padding: 16px;
        
        .stat-icon {
          width: 44px;
          height: 44px;
        }
        
        .stat-value { font-size: 24px; }
      }
      
      .sch-tabs {
        overflow-x: auto;
        flex-wrap: nowrap;
        
        &::-webkit-scrollbar { display: none; }
      }
      
      .sch-tab {
        flex-shrink: 0;
        padding: 8px 14px;
        font-size: 13px;
        
        span:not(.tab-badge) { display: none; }
      }
      
      .sch-grid {
        grid-template-columns: 1fr;
      }
      
      .sch-week-view {
        grid-template-columns: repeat(7, 100px);
      }
      
      .week-day {
        min-width: 100px;
      }
      
      .day-content {
        min-height: 140px;
      }
    }

    @media (max-width: 480px) {
      .sch-header-icon {
        width: 48px;
        height: 48px;
        mat-icon { font-size: 24px; width: 24px; height: 24px; }
      }
      
      .sch-header-text h1 { font-size: 22px; }
      
      .sch-btn {
        padding: 10px 16px;
        font-size: 13px;
      }
      
      .sch-stat-card {
        padding: 14px;
        gap: 12px;
        
        .stat-icon {
          width: 40px;
          height: 40px;
          mat-icon { font-size: 22px; width: 22px; height: 22px; }
        }
        
        .stat-value { font-size: 22px; }
        .stat-label { font-size: 12px; }
      }
      
      .sch-tab-content {
        padding: 16px;
      }
      
      .leave-card {
        padding: 12px;
        gap: 12px;
      }
      
      .leave-date-box {
        width: 50px;
        height: 50px;
        
        .leave-day { font-size: 20px; }
      }
    }
  `]
})
export class ScheduleComponent implements OnInit {
  loading = true;
  activeTab: 'today' | 'week' | 'leaves' = 'today';
  todaySchedules: Schedule[] = [];
  weekDays: { name: string; date: Date; isToday: boolean; schedules: Schedule[] }[] = [];
  stats: ScheduleStats = { totalStaff: 0, availableToday: 0, onLeaveToday: 0, upcomingLeaves: [] };
  staffList: any[] = [];

  constructor(
    private scheduleService: ScheduleService,
    private staffService: StaffService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.generateWeekDays();
  }

  getAvatarColor(name: string | undefined): string {
    const colors = [
      'linear-gradient(135deg, #7c3aed, #9333ea)',
      'linear-gradient(135deg, #3b82f6, #2563eb)',
      'linear-gradient(135deg, #10b981, #059669)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #ec4899, #db2777)',
      'linear-gradient(135deg, #06b6d4, #0891b2)',
      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    ];
    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  loadData(): void {
    this.loading = true;

    // Load today's schedules
    this.scheduleService.getToday().subscribe({
      next: (data) => {
        // Compute isAvailable for each schedule
        this.todaySchedules = data.map(s => ({
          ...s,
          isAvailable: !s.isLeave && s.status !== 'leave'
        }));
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading today schedules:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });

    // Load stats
    this.scheduleService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading stats:', err);
      }
    });

    // Load staff list
    this.staffService.getAll().subscribe({
      next: (staff) => {
        this.staffList = staff;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading staff list:', err);
      }
    });
  }

  generateWeekDays(): void {
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + i);
      this.weekDays.push({
        name: dayNames[i],
        date: date,
        isToday: date.toDateString() === today.toDateString(),
        schedules: []
      });
    }

    // Load week schedules
    const startDate = this.weekDays[0].date.toISOString().split('T')[0];
    const endDate = this.weekDays[6].date.toISOString().split('T')[0];
    
    this.scheduleService.getRange(startDate, endDate).subscribe({
      next: (schedules) => {
        schedules.forEach(schedule => {
          const scheduleDate = new Date(schedule.date).toDateString();
          const dayIndex = this.weekDays.findIndex(d => d.date.toDateString() === scheduleDate);
          if (dayIndex >= 0) {
            // Add isAvailable computed property
            const enrichedSchedule = {
              ...schedule,
              isAvailable: !schedule.isLeave && schedule.status !== 'leave'
            };
            this.weekDays[dayIndex].schedules.push(enrichedSchedule);
          }
        });
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading week schedules:', err);
      }
    });
  }

  createSchedule(): void {
    const dialogRef = this.dialog.open(ScheduleDialogComponent, {
      width: '100%',
      maxWidth: '520px',
      maxHeight: '90vh',
      panelClass: 'premium-dialog',
      autoFocus: false,
      data: {
        staffList: this.staffList,
        mode: 'create'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
        this.generateWeekDays();
      }
    });
  }

  addLeave(): void {
    const dialogRef = this.dialog.open(ScheduleDialogComponent, {
      width: '100%',
      maxWidth: '520px',
      maxHeight: '90vh',
      panelClass: 'premium-dialog',
      autoFocus: false,
      data: {
        staffList: this.staffList,
        mode: 'leave'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
        this.generateWeekDays();
      }
    });
  }

  editSchedule(schedule: Schedule): void {
    const dialogRef = this.dialog.open(ScheduleDialogComponent, {
      width: '100%',
      maxWidth: '520px',
      maxHeight: '90vh',
      panelClass: 'premium-dialog',
      autoFocus: false,
      data: {
        schedule,
        staffList: this.staffList,
        mode: 'edit'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
        this.generateWeekDays();
      }
    });
  }

  deleteSchedule(schedule: Schedule): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'premium-dialog',
      data: {
        title: 'Delete Schedule',
        message: `Are you sure you want to delete this schedule for ${schedule.staff?.name || 'this staff member'}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.scheduleService.delete(schedule._id).subscribe({
          next: () => {
            this.snackBar.open('Schedule deleted!', 'Close', { duration: 3000 });
            this.loadData();
            this.generateWeekDays();
          },
          error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 })
        });
      }
    });
  }
}
