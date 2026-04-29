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
    <div class="schedule-container page-shell">
      <div class="header">
        <h1>
          <mat-icon>calendar_month</mat-icon>
          Staff Schedule
        </h1>
        <div class="header-actions">
          <button mat-stroked-button (click)="addLeave()">
            <mat-icon>event_busy</mat-icon>
            Add Leave
          </button>
          <button mat-raised-button color="primary" (click)="createSchedule()">
            <mat-icon>add</mat-icon>
            Create Schedule
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-cards">
        <mat-card class="stat-card hover-lift">
          <mat-card-content>
            <div class="stat-icon total"><mat-icon>groups</mat-icon></div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalStaff }}</span>
              <span class="stat-label">Total Staff</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card hover-lift">
          <mat-card-content>
            <div class="stat-icon active"><mat-icon>check_circle</mat-icon></div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.availableToday }}</span>
              <span class="stat-label">Available Today</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card hover-lift">
          <mat-card-content>
            <div class="stat-icon pending"><mat-icon>event_busy</mat-icon></div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.onLeaveToday }}</span>
              <span class="stat-label">On Leave Today</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-tab-group>
        <!-- Today's Schedule -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>today</mat-icon>
            <span>Today</span>
          </ng-template>
          <div class="tab-content">
            <div class="schedule-grid">
              @if (loading) {
                @for (i of [1,2,3,4]; track i) {
                  <mat-card class="staff-schedule-card">
                    <div class="skeleton" style="width: 60px; height: 60px; border-radius: 50%;"></div>
                    <div class="skeleton" style="width: 120px; height: 20px; margin-top: 12px;"></div>
                  </mat-card>
                }
              } @else {
                @for (schedule of todaySchedules; track schedule._id) {
                  <mat-card class="staff-schedule-card" [class.on-leave]="schedule.isLeave" [class.available]="schedule.isAvailable && !schedule.isLeave">
                    <div class="staff-avatar">
                      <img [src]="schedule.staff.profileImage || 'assets/avatar-placeholder.png'" [alt]="schedule.staff.name">
                      <span class="status-dot" [class.available]="schedule.isAvailable && !schedule.isLeave" [class.leave]="schedule.isLeave"></span>
                    </div>
                    <div class="staff-info">
                      <h4>{{ schedule.staff.name }}</h4>
                      @if (schedule.isLeave) {
                        <span class="status leave">On Leave</span>
                        <p class="leave-reason">{{ schedule.leaveReason }}</p>
                      } @else if (schedule.isAvailable) {
                        <span class="status available">Available</span>
                        <p class="time-slot">{{ schedule.startTime }} - {{ schedule.endTime }}</p>
                        @if (schedule.breakStart) {
                          <p class="break-time">Break: {{ schedule.breakStart }} - {{ schedule.breakEnd }}</p>
                        }
                      } @else {
                        <span class="status off">Day Off</span>
                      }
                    </div>
                    <div class="card-actions">
                      <button mat-icon-button matTooltip="Edit" (click)="editSchedule(schedule)">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" matTooltip="Delete" (click)="deleteSchedule(schedule)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </mat-card>
                }
                @if (todaySchedules.length === 0) {
                  <div class="empty-state">
                    <mat-icon>event_note</mat-icon>
                    <p>No schedules for today</p>
                    <button mat-raised-button color="primary" (click)="createSchedule()">Create Schedule</button>
                  </div>
                }
              }
            </div>
          </div>
        </mat-tab>

        <!-- Weekly View -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>view_week</mat-icon>
            <span>This Week</span>
          </ng-template>
          <div class="tab-content">
            <div class="week-calendar">
              @for (day of weekDays; track day.date) {
                <div class="day-column">
                  <div class="day-header" [class.today]="day.isToday">
                    <span class="day-name">{{ day.name }}</span>
                    <span class="day-date">{{ day.date | date:'d' }}</span>
                  </div>
                  <div class="day-schedules">
                    @for (schedule of day.schedules; track schedule._id) {
                      <div class="mini-schedule" [class.leave]="schedule.isLeave" [class.available]="schedule.isAvailable">
                        <span class="staff-name">{{ schedule.staff.name }}</span>
                        @if (!schedule.isLeave && schedule.isAvailable) {
                          <span class="time">{{ schedule.startTime }}</span>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </mat-tab>

        <!-- Upcoming Leaves -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>event_busy</mat-icon>
            <span>Leaves</span>
          </ng-template>
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Upcoming Leaves</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="leaves-list">
                  @for (leave of stats.upcomingLeaves; track leave.date) {
                    <div class="leave-item">
                      <div class="leave-date">
                        <span class="day">{{ leave.date | date:'d' }}</span>
                        <span class="month">{{ leave.date | date:'MMM' }}</span>
                      </div>
                      <div class="leave-info">
                        <span class="staff">{{ leave.staff }}</span>
                        <span class="reason">{{ leave.reason }}</span>
                      </div>
                    </div>
                  }
                  @if (stats.upcomingLeaves.length === 0) {
                    <p class="no-leaves">No upcoming leaves scheduled</p>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .schedule-container { padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .header h1 { display: flex; align-items: center; gap: 8px; margin: 0; }
    .header-actions { display: flex; gap: 12px; }
    .stats-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card mat-card-content { display: flex; align-items: center; gap: 16px; padding: 16px; }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon.total { background: #e3f2fd; color: #1976d2; }
    .stat-icon.active { background: #e8f5e9; color: #388e3c; }
    .stat-icon.pending { background: #fff3e0; color: #f57c00; }
    .stat-value { font-size: 24px; font-weight: 600; display: block; }
    .stat-label { font-size: 12px; color: #666; }
    .tab-content { padding: 16px 0; }
    .schedule-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .staff-schedule-card { display: flex; align-items: center; padding: 16px; gap: 16px; transition: all 0.2s; }
    .staff-schedule-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .staff-schedule-card.on-leave { border-left: 4px solid #ff9800; background: #fff8e1; }
    .staff-schedule-card.available { border-left: 4px solid #4caf50; }
    .staff-avatar { position: relative; }
    .staff-avatar img { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; }
    .status-dot { position: absolute; bottom: 2px; right: 2px; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; }
    .status-dot.available { background: #4caf50; }
    .status-dot.leave { background: #ff9800; }
    .staff-info { flex: 1; }
    .staff-info h4 { margin: 0 0 4px; font-size: 16px; }
    .status { font-size: 12px; padding: 2px 8px; border-radius: 12px; font-weight: 500; }
    .status.available { background: #e8f5e9; color: #388e3c; }
    .status.leave { background: #fff3e0; color: #f57c00; }
    .status.off { background: #f5f5f5; color: #9e9e9e; }
    .time-slot, .break-time, .leave-reason { font-size: 13px; color: #666; margin: 4px 0 0; }
    .break-time { font-size: 12px; color: #999; }
    .card-actions { display: flex; flex-direction: column; }
    .week-calendar { display: flex; gap: 8px; overflow-x: auto; padding: 8px 0; }
    .day-column { flex: 1; min-width: 140px; background: #fafafa; border-radius: 12px; overflow: hidden; }
    .day-header { padding: 12px; text-align: center; background: #e3f2fd; }
    .day-header.today { background: #e91e63; color: white; }
    .day-name { display: block; font-size: 12px; font-weight: 500; }
    .day-date { display: block; font-size: 24px; font-weight: 600; }
    .day-schedules { padding: 8px; display: flex; flex-direction: column; gap: 6px; min-height: 200px; }
    .mini-schedule { padding: 8px; border-radius: 6px; font-size: 12px; background: white; border: 1px solid #e0e0e0; }
    .mini-schedule.leave { background: #fff8e1; border-color: #ff9800; }
    .mini-schedule.available { background: #e8f5e9; border-color: #4caf50; }
    .mini-schedule .staff-name { display: block; font-weight: 500; }
    .mini-schedule .time { color: #666; font-size: 11px; }
    .leaves-list { display: flex; flex-direction: column; gap: 12px; }
    .leave-item { display: flex; align-items: center; gap: 16px; padding: 12px; background: #fafafa; border-radius: 8px; }
    .leave-date { text-align: center; padding: 8px 16px; background: #ff9800; color: white; border-radius: 8px; }
    .leave-date .day { display: block; font-size: 24px; font-weight: 600; }
    .leave-date .month { display: block; font-size: 12px; text-transform: uppercase; }
    .leave-info .staff { display: block; font-weight: 500; }
    .leave-info .reason { font-size: 13px; color: #666; }
    .no-leaves { text-align: center; color: #999; padding: 24px; }
    .empty-state { text-align: center; padding: 48px; color: #666; }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; color: #ccc; }
    .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `]
})
export class ScheduleComponent implements OnInit {
  loading = true;
  todaySchedules: Schedule[] = [];
  weekDays: { name: string; date: Date; isToday: boolean; schedules: Schedule[] }[] = [];
  stats: ScheduleStats = { totalStaff: 0, availableToday: 0, onLeaveToday: 0, upcomingLeaves: [] };
  staffList: any[] = [];

  constructor(
    private scheduleService: ScheduleService,
    private staffService: StaffService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.generateWeekDays();
  }

  loadData(): void {
    this.loading = true;

    // Load today's schedules
    this.scheduleService.getToday().subscribe({
      next: (data) => {
        this.todaySchedules = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });

    // Load stats
    this.scheduleService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.cdr.markForCheck();
      }
    });

    // Load staff list
    this.staffService.getAll().subscribe({
      next: (staff) => {
        this.staffList = staff;
        this.cdr.markForCheck();
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
            this.weekDays[dayIndex].schedules.push(schedule);
          }
        });
        this.cdr.markForCheck();
      }
    });
  }

  createSchedule(): void {
    const staffName = prompt('Enter staff name (from list):');
    if (!staffName) return;

    const date = prompt('Enter date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!date) return;

    const startTime = prompt('Start time (HH:mm):', '09:00');
    const endTime = prompt('End time (HH:mm):', '18:00');

    this.scheduleService.create({
      date: new Date(date),
      startTime: startTime || '09:00',
      endTime: endTime || '18:00',
      isAvailable: true,
      isLeave: false
    } as any).subscribe({
      next: () => {
        this.snackBar.open('Schedule created!', 'Close', { duration: 3000 });
        this.loadData();
        this.generateWeekDays();
      },
      error: () => this.snackBar.open('Failed to create schedule', 'Close', { duration: 3000 })
    });
  }

  addLeave(): void {
    const staffName = prompt('Enter staff name:');
    if (!staffName) return;

    const date = prompt('Leave date (YYYY-MM-DD):');
    if (!date) return;

    const reason = prompt('Leave reason:') || 'Personal leave';

    this.scheduleService.createLeave('staff-id', date, reason).subscribe({
      next: () => {
        this.snackBar.open('Leave added!', 'Close', { duration: 3000 });
        this.loadData();
      },
      error: () => this.snackBar.open('Failed to add leave', 'Close', { duration: 3000 })
    });
  }

  editSchedule(schedule: Schedule): void {
    const startTime = prompt('Start time:', schedule.startTime);
    const endTime = prompt('End time:', schedule.endTime);

    if (startTime && endTime) {
      this.scheduleService.update(schedule._id, { startTime, endTime }).subscribe({
        next: () => {
          this.snackBar.open('Schedule updated!', 'Close', { duration: 3000 });
          this.loadData();
        },
        error: () => this.snackBar.open('Failed to update', 'Close', { duration: 3000 })
      });
    }
  }

  deleteSchedule(schedule: Schedule): void {
    if (confirm('Delete this schedule?')) {
      this.scheduleService.delete(schedule._id).subscribe({
        next: () => {
          this.snackBar.open('Schedule deleted!', 'Close', { duration: 3000 });
          this.loadData();
        },
        error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 })
      });
    }
  }
}
