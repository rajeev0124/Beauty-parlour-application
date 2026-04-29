import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  image: string;
  beforeImage: string;
  afterImage: string;
  description: string;
  service: string;
  stylist: string;
  featured?: boolean;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit {
  categories = [
    { key: 'All', label: 'All Work', icon: 'apps' },
    { key: 'Hair', label: 'Hair', icon: 'content_cut' },
    { key: 'Makeup', label: 'Makeup', icon: 'face_retouching_natural' },
    { key: 'Nails', label: 'Nails', icon: 'spa' },
    { key: 'Skincare', label: 'Skincare', icon: 'face' },
    { key: 'Bridal', label: 'Bridal', icon: 'favorite' }
  ];
  selectedCategory = 'All';
  selectedItem: GalleryItem | null = null;
  lightboxIndex = 0;

  stats = [
    { value: '2500+', label: 'Happy Clients', icon: 'people' },
    { value: '150+', label: 'Transformations', icon: 'auto_awesome' },
    { value: '50+', label: 'Expert Stylists', icon: 'brush' },
    { value: '4.9', label: 'Average Rating', icon: 'star' }
  ];

  // Professional gallery data with high-quality Unsplash images
  galleryItems: GalleryItem[] = [
    {
      id: 1,
      title: 'Sun-Kissed Balayage',
      category: 'Hair',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',
      beforeImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
      afterImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',
      description: 'Beautiful balayage highlights transforming dark hair to a stunning sun-kissed look with seamless color blending.',
      service: 'Balayage Highlights',
      stylist: 'Priya Sharma',
      featured: true
    },
    {
      id: 2,
      title: 'Royal Bridal Makeup',
      category: 'Bridal',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
      beforeImage: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80',
      afterImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
      description: 'Elegant and timeless bridal makeup featuring soft glam with traditional elements for the perfect wedding day look.',
      service: 'Bridal Package Deluxe',
      stylist: 'Meera Nair',
      featured: true
    },
    {
      id: 3,
      title: 'Geometric Nail Art',
      category: 'Nails',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80',
      beforeImage: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&q=80',
      afterImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80',
      description: 'Intricate geometric nail art design with premium gel polish finish for long-lasting beauty.',
      service: 'Nail Art Premium',
      stylist: 'Anjali Patel'
    },
    {
      id: 4,
      title: 'Glass Skin Facial',
      category: 'Skincare',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
      beforeImage: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=600&q=80',
      afterImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
      description: 'Korean-inspired glass skin facial treatment for that dewy, luminous glow.',
      service: 'Glass Skin Treatment',
      stylist: 'Dr. Kavitha',
      featured: true
    },
    {
      id: 5,
      title: 'Platinum Blonde Transformation',
      category: 'Hair',
      image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80',
      beforeImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
      afterImage: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80',
      description: 'Professional platinum blonde color correction bringing damaged hair back to stunning life.',
      service: 'Color Correction',
      stylist: 'Ravi Kumar'
    },
    {
      id: 6,
      title: 'Glamour Party Look',
      category: 'Makeup',
      image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80',
      beforeImage: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80',
      afterImage: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80',
      description: 'Show-stopping party makeup with dramatic smoky eyes and bold, perfectly shaped lips.',
      service: 'Party Makeup Glam',
      stylist: 'Neha Singh'
    },
    {
      id: 7,
      title: 'Classic French Tips',
      category: 'Nails',
      image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&q=80',
      beforeImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80',
      afterImage: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&q=80',
      description: 'Timeless French manicure with a modern twist and flawless application.',
      service: 'French Manicure Deluxe',
      stylist: 'Sneha Gupta'
    },
    {
      id: 8,
      title: 'Bridal Hair Updo',
      category: 'Bridal',
      image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&q=80',
      beforeImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
      afterImage: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&q=80',
      description: 'Elegant bridal updo with delicate floral accessories and intricate braiding.',
      service: 'Bridal Hair Styling',
      stylist: 'Pooja Desai'
    },
    {
      id: 9,
      title: 'Soft Glam Makeup',
      category: 'Makeup',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
      beforeImage: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80',
      afterImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
      description: 'Soft, romantic glam look perfect for special occasions and photoshoots.',
      service: 'Special Occasion Makeup',
      stylist: 'Divya Raj',
      featured: true
    },
    {
      id: 10,
      title: 'Keratin Treatment',
      category: 'Hair',
      image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&q=80',
      beforeImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
      afterImage: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&q=80',
      description: 'Frizz-free, silky smooth hair with our premium keratin treatment.',
      service: 'Keratin Smoothing',
      stylist: 'Arjun Mehta'
    },
    {
      id: 11,
      title: 'Anti-Aging Facial',
      category: 'Skincare',
      image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80',
      beforeImage: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=600&q=80',
      afterImage: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80',
      description: 'Advanced anti-aging facial with collagen boosting and skin tightening.',
      service: 'Anti-Aging Therapy',
      stylist: 'Dr. Sunita'
    },
    {
      id: 12,
      title: 'Rose Gold Ombre',
      category: 'Nails',
      image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&q=80',
      beforeImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80',
      afterImage: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&q=80',
      description: 'Stunning rose gold ombre effect with shimmer finish.',
      service: 'Ombre Nail Art',
      stylist: 'Preeti Shah'
    }
  ];

  filteredItems: GalleryItem[] = [];

  ngOnInit(): void {
    this.filterItems('All');
  }

  filterItems(category: string): void {
    this.selectedCategory = category;
    if (category === 'All') {
      this.filteredItems = [...this.galleryItems];
    } else {
      this.filteredItems = this.galleryItems.filter(item => item.category === category);
    }
  }

  openLightbox(item: GalleryItem, index: number): void {
    this.selectedItem = item;
    this.lightboxIndex = index;
  }

  closeLightbox(): void {
    this.selectedItem = null;
  }

  navigateLightbox(direction: 'prev' | 'next'): void {
    if (direction === 'prev') {
      this.lightboxIndex = this.lightboxIndex > 0 ? this.lightboxIndex - 1 : this.filteredItems.length - 1;
    } else {
      this.lightboxIndex = this.lightboxIndex < this.filteredItems.length - 1 ? this.lightboxIndex + 1 : 0;
    }
    this.selectedItem = this.filteredItems[this.lightboxIndex];
  }

  getCategoryIcon(category: string): string {
    const cat = this.categories.find(c => c.key === category);
    return cat?.icon || 'category';
  }
}
