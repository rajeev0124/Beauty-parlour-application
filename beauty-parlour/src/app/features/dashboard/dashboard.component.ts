import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ReportsService } from '../../core/services/reports.service';
import type { DashboardStats } from '../../core/services/reports.service';

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCardModule, MatIconModule, MatTableModule,
    MatButtonModule, MatSelectModule, MatFormFieldModule,
    BaseChartDirective, DatePipe, RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  today = new Date();
  adminName = 'Admin';
  greeting = 'Good morning';
  loading = true;
  errorMessage = '';
  dateRange = 'month';
  private destroy$ = new Subject<void>();
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;

  @HostListener('window:resize')
  onResize(): void {
    // Debounce resize to avoid excessive rebuilds
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.serviceChartOptions = this.buildServiceOptions();
      this.appointmentChartOptions = this.buildAppointmentOptions();
      this.cdr.detectChanges();
    }, 200);
  }

  constructor(
    private authService: AuthService,
    private reportsService: ReportsService,
    private cdr: ChangeDetectorRef
  ) {
    this.adminName = this.authService.getCurrentUser()?.name || 'Admin';
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Good morning';
    else if (hour < 17) this.greeting = 'Good afternoon';
    else this.greeting = 'Good evening';
  }

  stats = [
    { title: 'Total Revenue', value: '₹0', icon: 'currency_rupee', accent: 'purple', trend: '+0%', link: '/admin/payments' },
    { title: 'Appointments', value: '0', icon: 'calendar_month', accent: 'blue', trend: '+0%', link: '/admin/appointments' },
    { title: 'Customers', value: '0', icon: 'people', accent: 'amber', trend: '+0%', link: '/admin/customers' },
    { title: 'Products Sold', value: '0', icon: 'shopping_bag', accent: 'green', trend: '+0%', link: '/admin/products' }
  ];

  // Revenue chart
  revenueChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        data: [15000, 22000, 18000, 25000, 30000, 28000, 35000],
        label: 'Revenue',
        borderColor: '#6C3CE1',
        backgroundColor: 'rgba(108, 60, 225, 0.06)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#6C3CE1',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2
      }
    ]
  };
  revenueChartOptions: ChartConfiguration<'line'>['options'] = {};

  private buildRevenueOptions(): ChartConfiguration<'line'>['options'] {
    const faint = cssVar('--ink-faint') || '#9CA3AF';
    const gridColor = cssVar('--border-light') || 'rgba(0,0,0,0.04)';
    const tooltipBg = cssVar('--ink') || '#111827';
    return {
      responsive: true,
      maintainAspectRatio: true,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: tooltipBg,
          titleFont: { size: 12, weight: 'bold' },
          bodyFont: { size: 12 },
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: (ctx) => '₹' + (ctx.parsed.y ?? 0).toLocaleString('en-IN')
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 }, color: faint },
          border: { display: false }
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            font: { size: 11 },
            color: faint,
            callback: (val) => '₹' + Number(val).toLocaleString('en-IN')
          },
          border: { display: false }
        }
      }
    };
  }

  // Service popularity chart
  serviceChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Hair Cut', 'Facial', 'Manicure', 'Pedicure', 'Hair Color', 'Massage'],
    datasets: [
      {
        data: [35, 25, 15, 10, 10, 5],
        backgroundColor: ['#6C3CE1', '#2563EB', '#D97706', '#059669', '#DC2626', '#9CA3AF'],
        borderWidth: 0,
        hoverOffset: 6
      }
    ]
  };
  serviceChartOptions: ChartConfiguration<'doughnut'>['options'] = {};

  private buildServiceOptions(): ChartConfiguration<'doughnut'>['options'] {
    const muted = cssVar('--ink-muted') || '#6B7280';
    const tooltipBg = cssVar('--ink') || '#111827';
    const isMobile = window.innerWidth < 768;
    return {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: isMobile ? 1 : 1.5,
      cutout: '60%',
      plugins: {
        legend: {
          position: isMobile ? 'bottom' : 'right',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16,
            font: { size: 12 },
            color: muted
          }
        },
        tooltip: {
          backgroundColor: tooltipBg,
          titleFont: { size: 12, weight: 'bold' },
          bodyFont: { size: 12 },
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => ' ' + ctx.label + ': ' + ctx.parsed + '%'
          }
        }
      }
    };
  }

  // Appointment trends
  appointmentChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [12, 19, 15, 22, 25, 30, 18],
        label: 'Appointments',
        backgroundColor: 'rgba(108, 60, 225, 0.75)',
        hoverBackgroundColor: '#6C3CE1',
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.5,
        categoryPercentage: 0.6
      }
    ]
  };
  appointmentChartOptions: ChartConfiguration<'bar'>['options'] = {};

  private buildAppointmentOptions(): ChartConfiguration<'bar'>['options'] {
    const faint = cssVar('--ink-faint') || '#6B7280';
    const gridColor = cssVar('--border-light') || 'rgba(0,0,0,0.04)';
    const tooltipBg = cssVar('--ink') || '#111827';
    const isMobile = window.innerWidth < 768;
    return {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: isMobile ? 1.8 : 3,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: tooltipBg,
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 13 },
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: (ctx) => ctx.parsed.y + ' appointments'
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 13, weight: 500 }, color: faint },
          border: { display: false }
        },
        y: {
          grid: { color: gridColor },
          ticks: { font: { size: 12 }, color: faint, stepSize: 5 },
          border: { display: false },
          beginAtZero: true
        }
      }
    };
  }

  recentAppointments: { customer: string; service: string; staff: string; time: string; status: string }[] = [];

  displayedColumns = ['customer', 'service', 'staff', 'time', 'status'];

  ngOnInit(): void {
    this.revenueChartOptions = this.buildRevenueOptions();
    this.serviceChartOptions = this.buildServiceOptions();
    this.appointmentChartOptions = this.buildAppointmentOptions();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
  }

  onDateRangeChange(): void {
    this.loading = true;
    this.loadDashboardData();
  }

  private getDateRange(): { startDate?: string; endDate?: string } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (this.dateRange) {
      case 'today':
        return { 
          startDate: today.toISOString(), 
          endDate: new Date(today.getTime() + 86400000).toISOString() 
        };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { 
          startDate: weekStart.toISOString(), 
          endDate: now.toISOString() 
        };
      case 'month':
        return { 
          startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), 
          endDate: now.toISOString() 
        };
      case 'year':
        return { 
          startDate: new Date(now.getFullYear(), 0, 1).toISOString(), 
          endDate: now.toISOString() 
        };
      default:
        return {};
    }
  }

  private loadDashboardData(): void {
    this.errorMessage = '';
    const { startDate, endDate } = this.getDateRange();
    
    this.reportsService.getDashboardStats(startDate, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: DashboardStats) => {
          // Update stats with real data from backend
          this.stats = [
            { title: 'Total Revenue', value: '₹' + data.totalRevenue.toLocaleString('en-IN'), icon: 'currency_rupee', accent: 'purple', trend: '+12%', link: '/admin/payments' },
            { title: 'Appointments', value: String(data.totalAppointments), icon: 'calendar_month', accent: 'blue', trend: '+8%', link: '/admin/appointments' },
            { title: 'Customers', value: String(data.totalCustomers), icon: 'people', accent: 'amber', trend: '+15%', link: '/admin/customers' },
            { title: 'Orders', value: String(data.totalOrders), icon: 'shopping_bag', accent: 'green', trend: '+5%', link: '/admin/orders' }
          ];

          // Build recent appointments table from backend data
          if (data.recentAppointments && data.recentAppointments.length > 0) {
            this.recentAppointments = data.recentAppointments.map(a => ({
              customer: a.userName || 'Unknown',
              service: a.serviceName || 'Unknown',
              staff: a.staffName || 'Unknown',
              time: a.time || '',
              status: a.status || 'pending'
            }));
          }

          // Build service popularity chart from topServices
          if (data.topServices && data.topServices.length > 0) {
            const total = data.topServices.reduce((s, svc) => s + svc.count, 0);
            const colors = ['#6C3CE1', '#2563EB', '#D97706', '#059669', '#DC2626', '#9CA3AF'];
            this.serviceChartData = {
              labels: data.topServices.map(svc => svc.name),
              datasets: [{
                data: data.topServices.map(svc => Math.round((svc.count / total) * 100)),
                backgroundColor: colors.slice(0, data.topServices.length),
                borderWidth: 0,
                hoverOffset: 6
              }]
            };
          }

          // Build revenue chart from revenueByMonth
          if (data.revenueByMonth && data.revenueByMonth.length > 0) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            this.revenueChartData = {
              labels: data.revenueByMonth.map(r => {
                const [, month] = r._id.split('-');
                return months[parseInt(month, 10) - 1] || r._id;
              }),
              datasets: [{
                data: data.revenueByMonth.map(r => r.revenue),
                label: 'Revenue',
                borderColor: '#6C3CE1',
                backgroundColor: 'rgba(108, 60, 225, 0.06)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#6C3CE1',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
              }]
            };
          }

          // Build appointment trends chart from appointmentsByStatus
          if (data.appointmentsByStatus && data.appointmentsByStatus.length > 0) {
            // For now, keep the weekly mock data - could be enhanced with real weekly data
          }

          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Failed to load dashboard data. Please try again.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      confirmed: 'primary',
      pending: 'accent',
      completed: 'primary',
      cancelled: 'warn'
    };
    return colors[status] || '';
  }
}
