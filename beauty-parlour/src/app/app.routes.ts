import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/user-layout/user-layout.component').then(m => m.UserLayoutComponent),
    children: [
      { path: '', title: 'Sindhura Makeovers – Premium Beauty Parlour', loadComponent: () => import('./features/user/home/home.component').then(m => m.HomeComponent) },
      { path: 'services', title: 'Our Services – Sindhura Makeovers', loadComponent: () => import('./features/user/services/user-services.component').then(m => m.UserServicesComponent) },
      { path: 'products', title: 'Shop Products – Sindhura Makeovers', loadComponent: () => import('./features/user/products/user-products.component').then(m => m.UserProductsComponent) },
      { path: 'cart', title: 'Beauty Bag & Checkout – Sindhura Makeovers', loadComponent: () => import('./features/user/cart/user-cart.component').then(m => m.UserCartComponent) },
      { path: 'checkout', redirectTo: 'cart', pathMatch: 'full' },
      { path: 'book', title: 'Book Appointment – Sindhura Makeovers', loadComponent: () => import('./features/user/book/book-appointment.component').then(m => m.BookAppointmentComponent) },
      { path: 'about', title: 'About Us – Sindhura Makeovers', loadComponent: () => import('./features/user/about/about.component').then(m => m.AboutComponent) },
      { path: 'gallery', title: 'Gallery – Sindhura Makeovers', loadComponent: () => import('./features/user/gallery/gallery.component').then(m => m.GalleryComponent) },
      { path: 'contact', title: 'Contact Us – Sindhura Makeovers', loadComponent: () => import('./features/user/contact/contact.component').then(m => m.ContactComponent) },
    ]
  },

  // Admin redirect (decoupled)
  {
    path: 'admin',
    redirectTo: '',
    pathMatch: 'prefix'
  },

  { path: '**', redirectTo: '' }
];
