import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface GalleryInstagramItem {
  id: number;
  shortcode: string;
  title: string;
  category: 'Bridal' | 'Hair' | 'Makeup' | 'Skincare';
  tag: string;
  description: string;
  service: string;
  stylist: string;
  instagramUrl: string;
  embedUrl: SafeResourceUrl;
  featured?: boolean;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit {
  instagramAccountUrl = 'https://www.instagram.com/sindhura_makeovers/?hl=en';
  isBrowser = false;

  categories = [
    { key: 'All', label: 'All Masterpieces (10)', icon: 'auto_awesome' },
    { key: 'Bridal', label: 'Royal Muhurtham & Bridal', icon: 'favorite' },
    { key: 'Makeup', label: 'Sangeet & Evening Glam', icon: 'face_retouching_natural' },
    { key: 'Hair', label: 'Hair Artistry & Couture', icon: 'content_cut' },
    { key: 'Skincare', label: 'Clinical Glow & Skin Prep', icon: 'spa' }
  ];

  selectedCategory = 'All';
  selectedPost: GalleryInstagramItem | null = null;
  lightboxIndex = 0;

  stats = [
    { value: '850+', label: 'Brides Styled', icon: 'favorite' },
    { value: '100%', label: 'Real Client Reels', icon: 'videocam' },
    { value: '1,200+', label: 'Verified Reviews', icon: 'star' },
    { value: '11+', label: 'Years of Artistry', icon: 'verified' }
  ];

  rawPosts = [
    {
      id: 1,
      shortcode: 'DXe7_G5EXQT',
      title: 'Royal Muhurtham Bridal Artistry',
      category: 'Bridal' as const,
      tag: '👑 Signature Muhurtham',
      description: 'Traditional royal bridal transformation featuring lightweight HD airbrush artistry, precise temple jewelry alignment, and an enduring dewy radiance.',
      service: 'Royal Bridal Package',
      stylist: 'Sindhura Makeovers',
      featured: true
    },
    {
      id: 2,
      shortcode: 'DXFE3hvE3Q9',
      title: 'Bespoke Bridal Elegance & Radiance',
      category: 'Bridal' as const,
      tag: '✨ Couture Bride',
      description: 'Bespoke bridal styling with soft cut-crease eye sculpting, petal velvet blush, and a 14-hour humidity-resistant finish.',
      service: 'Bridal Package Deluxe',
      stylist: 'Sindhura Makeovers',
      featured: true
    },
    {
      id: 3,
      shortcode: 'DVykVB1E1kL',
      title: 'Sangeet & Reception Glamour',
      category: 'Makeup' as const,
      tag: '💄 Sunset Glam',
      description: 'High-impact cocktail and sangeet night glamour featuring soft gilded bronze lids and sculpted cheekbones.',
      service: 'Engagement & Party Glam',
      stylist: 'Sindhura Makeovers'
    },
    {
      id: 4,
      shortcode: 'DKmY1Iws1ns',
      title: 'Couture Bridal Hair Styling & Florals',
      category: 'Hair' as const,
      tag: '🌸 Floral Braid Art',
      description: 'Handcrafted fresh jasmine and baby’s breath braid adornments woven seamlessly with traditional South Indian temple accessories.',
      service: 'Bridal Hair Styling',
      stylist: 'Sindhura Makeovers',
      featured: true
    },
    {
      id: 5,
      shortcode: 'DI1nbm4T4Et',
      title: 'Traditional South Indian Bride',
      category: 'Bridal' as const,
      tag: '👑 Temple Heritage',
      description: 'Flawless Kanjeevaram silk saree pleating and drape architecture paired with secure matha patti placement and satin skin finish.',
      service: 'Royal Bridal Package',
      stylist: 'Sindhura Makeovers'
    },
    {
      id: 6,
      shortcode: 'C3b1kkWyMmq',
      title: 'Dewy Engagement & Cocktail Glamour',
      category: 'Makeup' as const,
      tag: '✨ HD Glow Makeover',
      description: 'Soft romantic engagement makeover featuring modern dimensional Hollywood waves and signature glazed lips.',
      service: 'Engagement & Party Glam',
      stylist: 'Sindhura Makeovers'
    },
    {
      id: 7,
      shortcode: 'Cy2QpU8y1aP',
      title: 'Silk Hair Spa & Balayage Transformation',
      category: 'Hair' as const,
      tag: '💇‍♀️ Silk Botoplex',
      description: 'Intensive bio-protein Botoplex therapy that deeply restructures stressed cuticles into high-gloss, frizz-free cascades.',
      service: 'Balayage & Botoplex Spa',
      stylist: 'Sindhura Makeovers'
    },
    {
      id: 8,
      shortcode: 'CvP7soYvj_8',
      title: 'Glass Skin & Bridal Prep Facial Ritual',
      category: 'Skincare' as const,
      tag: '🌟 Hydra-Glow Facial',
      description: 'Ultrasonic clinical deep-pore hydration and active bio-ceramide infusion for translucent, lit-from-within wedding skin.',
      service: 'Advanced Hydra-Glow Facial',
      stylist: 'Sindhura Makeovers'
    },
    {
      id: 9,
      shortcode: 'Cs0tGy0suqF',
      title: 'Haldi & Mehendi Day Glow Styling',
      category: 'Bridal' as const,
      tag: '🌸 Haldi Sunshine',
      description: 'Fresh, sun-kissed Haldi and Mehendi day styling with sheer watercolor cheek tints and bespoke fresh floral jewellery.',
      service: 'Mehendi & Haldi Package',
      stylist: 'Sindhura Makeovers'
    },
    {
      id: 10,
      shortcode: 'Cs0tU-WysXN',
      title: 'Grand Wedding Reception Masterpiece',
      category: 'Bridal' as const,
      tag: '👑 Grand Reception',
      description: 'Stately evening reception transformation sculpted to radiate under multi-directional stage lighting with zero flashbacks.',
      service: 'Signature Deluxe Bridal',
      stylist: 'Sindhura Makeovers',
      featured: true
    }
  ];

  galleryItems: GalleryInstagramItem[] = [];
  filteredPosts: GalleryInstagramItem[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Generate safe embed URLs for each Instagram post
    this.galleryItems = this.rawPosts.map(p => ({
      ...p,
      instagramUrl: `https://www.instagram.com/p/${p.shortcode}/?hl=en`,
      embedUrl: this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.instagram.com/p/${p.shortcode}/embed/`)
    }));

    this.filterPosts('All');
  }

  filterPosts(category: string): void {
    this.selectedCategory = category;
    if (category === 'All') {
      this.filteredPosts = [...this.galleryItems];
    } else {
      this.filteredPosts = this.galleryItems.filter(p => p.category === category);
    }
  }

  openPostLightbox(post: GalleryInstagramItem, index: number): void {
    this.selectedPost = post;
    this.lightboxIndex = index;
  }

  closeLightbox(): void {
    this.selectedPost = null;
  }

  navigateLightbox(direction: 'prev' | 'next'): void {
    if (direction === 'prev') {
      this.lightboxIndex = this.lightboxIndex > 0 ? this.lightboxIndex - 1 : this.filteredPosts.length - 1;
    } else {
      this.lightboxIndex = this.lightboxIndex < this.filteredPosts.length - 1 ? this.lightboxIndex + 1 : 0;
    }
    this.selectedPost = this.filteredPosts[this.lightboxIndex];
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.selectedPost) return;
    if (event.key === 'Escape') {
      this.closeLightbox();
    } else if (event.key === 'ArrowRight') {
      this.navigateLightbox('next');
    } else if (event.key === 'ArrowLeft') {
      this.navigateLightbox('prev');
    }
  }
}


