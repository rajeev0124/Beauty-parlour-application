import { Routes } from '@angular/router';
import { adminGuard, serverReadyGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // User-facing pages
  {
    path: '',
    loadComponent: () => import('./layouts/user-layout/user-layout.component').then(m => m.UserLayoutComponent),
    children: [
      { path: '', title: 'Sindhura Makeovers – Premium Beauty Parlour', loadComponent: () => import('./features/user/home/home.component').then(m => m.HomeComponent) },
      { path: 'services', title: 'Our Services – Sindhura Makeovers', canActivate: [serverReadyGuard], loadComponent: () => import('./features/user/services/user-services.component').then(m => m.UserServicesComponent) },
      { path: 'products', title: 'Shop Products – Sindhura Makeovers', canActivate: [serverReadyGuard], loadComponent: () => import('./features/user/products/user-products.component').then(m => m.UserProductsComponent) },
      { path: 'cart', title: 'Beauty Bag & Checkout – Sindhura Makeovers', canActivate: [serverReadyGuard], loadComponent: () => import('./features/user/cart/user-cart.component').then(m => m.UserCartComponent) },
      { path: 'checkout', redirectTo: 'cart', pathMatch: 'full' },
      { path: 'book', title: 'Book Appointment – Sindhura Makeovers', canActivate: [serverReadyGuard], loadComponent: () => import('./features/user/book/book-appointment.component').then(m => m.BookAppointmentComponent) },
      { path: 'about', title: 'About Us – Sindhura Makeovers', loadComponent: () => import('./features/user/about/about.component').then(m => m.AboutComponent) },
      { path: 'gallery', title: 'Gallery – Sindhura Makeovers', loadComponent: () => import('./features/user/gallery/gallery.component').then(m => m.GalleryComponent) },
      { path: 'contact', title: 'Contact Us – Sindhura Makeovers', loadComponent: () => import('./features/user/contact/contact.component').then(m => m.ContactComponent) },
      { path: 'profile', title: 'My Profile – Sindhura Makeovers', canActivate: [serverReadyGuard], loadComponent: () => import('./features/user/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'my-appointments', title: 'My Appointments – Sindhura Makeovers', canActivate: [serverReadyGuard], loadComponent: () => import('./features/user/my-appointments/my-appointments.component').then(m => m.MyAppointmentsComponent) },
      { path: 'wishlist', title: 'My Wishlist – Sindhura Makeovers', canActivate: [serverReadyGuard], loadComponent: () => import('./features/user/wishlist/wishlist.component').then(m => m.WishlistComponent) },
      { path: 'rewards', title: 'My Rewards – Sindhura Makeovers', canActivate: [serverReadyGuard], loadComponent: () => import('./features/user/rewards/my-rewards.component').then(m => m.MyRewardsComponent) },
    ]
  },

  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard, serverReadyGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        title: 'Dashboard – Sindhura Makeovers Admin',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'services',
        title: 'Manage Services – Sindhura Makeovers Admin',
        loadComponent: () => import('./features/services/services.component').then(m => m.ServicesComponent)
      },
      {
        path: 'appointments',
        title: 'Appointments – Sindhura Makeovers Admin',
        loadComponent: () => import('./features/appointments/appointments.component').then(m => m.AppointmentsComponent)
      },
      {
        path: 'customers',
        title: 'Customers – Sindhura Makeovers Admin',
        loadComponent: () => import('./features/customers/customers.component').then(m => m.CustomersComponent)
      },
      {
        path: 'staff',
        title: 'Staff – Sindhura Makeovers Admin',
        loadComponent: () => import('./features/staff/staff.component').then(m => m.StaffComponent)
      },
      {
        path: 'products',
        title: 'Products – Sindhura Makeovers Admin',
        loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent)
      },
      {
        path: 'orders',
        title: 'Orders – Sindhura Makeovers Admin',
        loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent)
      },
      {
        path: 'payments',
        title: 'Payments – Sindhura Makeovers Admin',
        loadComponent: () => import('./features/payments/payments.component').then(m => m.PaymentsComponent)
      },
      {
        path: 'inventory',
        title: 'Inventory – Sindhura Makeovers Admin',
        loadComponent: () => import('./features/inventory/inventory.component').then(m => m.InventoryComponent)
      },

      {
        path: 'coupons',
        title: 'Coupons – Sindhura Makeovers Admin',
        loadComponent: () => import('./features/coupons/coupons.component').then(m => m.CouponsComponent)
      },
      {
        path: 'expenses',
        title: 'Expenses – Sindhura Makeovers Admin',
        loadComponent: () => import('./features/expenses/expenses.component').then(m => m.ExpensesComponent)
      },
      {
        path: 'loyalty',
        title: 'Loyalty Program – Sindhura Makeovers Admin',
        loadComponent: () => import('./features/loyalty/loyalty.component').then(m => m.LoyaltyComponent)
      },
      {
        path: 'packages',
        title: 'Service Packages – Sindhura Makeovers Admin',
        loadComponent: () => import('./features/packages/packages.component').then(m => m.PackagesComponent)
      },
      {
        path: 'schedule',
        title: 'Staff Schedule – Sindhura Makeovers Admin',
        loadComponent: () => import('./features/schedule/schedule.component').then(m => m.ScheduleComponent)
      },
      {
        path: 'settings',
        title: 'Settings – Sindhura Makeovers Admin',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
