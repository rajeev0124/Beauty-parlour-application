import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Admin Login – Beauty Parlour',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    title: 'Admin Register – Beauty Parlour',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // User-facing pages
  {
    path: '',
    loadComponent: () => import('./layouts/user-layout/user-layout.component').then(m => m.UserLayoutComponent),
    children: [
      { path: '', title: 'Beauty Parlour – Premium Salon & Spa', loadComponent: () => import('./features/user/home/home.component').then(m => m.HomeComponent) },
      { path: 'services', title: 'Our Services – Beauty Parlour', loadComponent: () => import('./features/user/services/user-services.component').then(m => m.UserServicesComponent) },
      { path: 'products', title: 'Shop Products – Beauty Parlour', loadComponent: () => import('./features/user/products/user-products.component').then(m => m.UserProductsComponent) },
      { path: 'book', title: 'Book Appointment – Beauty Parlour', loadComponent: () => import('./features/user/book/book-appointment.component').then(m => m.BookAppointmentComponent) },
      { path: 'about', title: 'About Us – Beauty Parlour', loadComponent: () => import('./features/user/about/about.component').then(m => m.AboutComponent) },
      { path: 'gallery', title: 'Gallery – Beauty Parlour', loadComponent: () => import('./features/user/gallery/gallery.component').then(m => m.GalleryComponent) },
      { path: 'contact', title: 'Contact Us – Beauty Parlour', loadComponent: () => import('./features/user/contact/contact.component').then(m => m.ContactComponent) },
      { path: 'profile', title: 'My Profile – Beauty Parlour', loadComponent: () => import('./features/user/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'my-appointments', title: 'My Appointments – Beauty Parlour', loadComponent: () => import('./features/user/my-appointments/my-appointments.component').then(m => m.MyAppointmentsComponent) },
      { path: 'wishlist', title: 'My Wishlist – Beauty Parlour', loadComponent: () => import('./features/user/wishlist/wishlist.component').then(m => m.WishlistComponent) },
      { path: 'rewards', title: 'My Rewards – Beauty Parlour', loadComponent: () => import('./features/user/rewards/my-rewards.component').then(m => m.MyRewardsComponent) },
      { path: 'sign-in', title: 'Sign In – Beauty Parlour', loadComponent: () => import('./features/user/auth/customer-login/customer-login.component').then(m => m.CustomerLoginComponent) },
      { path: 'sign-up', title: 'Create Account – Beauty Parlour', loadComponent: () => import('./features/user/auth/customer-register/customer-register.component').then(m => m.CustomerRegisterComponent) },
      { path: 'forgot-password', title: 'Forgot Password – Beauty Parlour', loadComponent: () => import('./features/user/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: 'reset-password', title: 'Reset Password – Beauty Parlour', loadComponent: () => import('./features/user/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
    ]
  },

  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        title: 'Dashboard – Beauty Parlour Admin',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'services',
        title: 'Manage Services – Beauty Parlour Admin',
        loadComponent: () => import('./features/services/services.component').then(m => m.ServicesComponent)
      },
      {
        path: 'appointments',
        title: 'Appointments – Beauty Parlour Admin',
        loadComponent: () => import('./features/appointments/appointments.component').then(m => m.AppointmentsComponent)
      },
      {
        path: 'customers',
        title: 'Customers – Beauty Parlour Admin',
        loadComponent: () => import('./features/customers/customers.component').then(m => m.CustomersComponent)
      },
      {
        path: 'staff',
        title: 'Staff – Beauty Parlour Admin',
        loadComponent: () => import('./features/staff/staff.component').then(m => m.StaffComponent)
      },
      {
        path: 'products',
        title: 'Products – Beauty Parlour Admin',
        loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent)
      },
      {
        path: 'orders',
        title: 'Orders – Beauty Parlour Admin',
        loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent)
      },
      {
        path: 'payments',
        title: 'Payments – Beauty Parlour Admin',
        loadComponent: () => import('./features/payments/payments.component').then(m => m.PaymentsComponent)
      },
      {
        path: 'inventory',
        title: 'Inventory – Beauty Parlour Admin',
        loadComponent: () => import('./features/inventory/inventory.component').then(m => m.InventoryComponent)
      },
      {
        path: 'reviews',
        title: 'Reviews – Beauty Parlour Admin',
        loadComponent: () => import('./features/reviews/reviews.component').then(m => m.ReviewsComponent)
      },
      {
        path: 'coupons',
        title: 'Coupons – Beauty Parlour Admin',
        loadComponent: () => import('./features/coupons/coupons.component').then(m => m.CouponsComponent)
      },
      {
        path: 'expenses',
        title: 'Expenses – Beauty Parlour Admin',
        loadComponent: () => import('./features/expenses/expenses.component').then(m => m.ExpensesComponent)
      },
      {
        path: 'loyalty',
        title: 'Loyalty Program – Beauty Parlour Admin',
        loadComponent: () => import('./features/loyalty/loyalty.component').then(m => m.LoyaltyComponent)
      },
      {
        path: 'packages',
        title: 'Service Packages – Beauty Parlour Admin',
        loadComponent: () => import('./features/packages/packages.component').then(m => m.PackagesComponent)
      },
      {
        path: 'schedule',
        title: 'Staff Schedule – Beauty Parlour Admin',
        loadComponent: () => import('./features/schedule/schedule.component').then(m => m.ScheduleComponent)
      },
      {
        path: 'settings',
        title: 'Settings – Beauty Parlour Admin',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
