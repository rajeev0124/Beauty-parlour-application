import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ServiceService } from '../../../core/services/service.service';
import { Service } from '../../../core/models/service.model';

@Component({
  selector: 'app-user-services',
  standalone: true,
  imports: [RouterLink, DecimalPipe, MatIconModule, MatButtonModule],
  templateUrl: './user-services.component.html',
  styleUrl: './user-services.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserServicesComponent implements OnInit {
  activeCategory = 'all';
  loading = true;
  errorMessage = '';

  categories = [
    { key: 'all', label: 'All Services', icon: 'apps' },
    { key: 'hair', label: 'Hair Care', icon: 'content_cut' },
    { key: 'skin', label: 'Skin Care', icon: 'face_retouching_natural' },
    { key: 'nails', label: 'Nails', icon: 'brush' },
    { key: 'massage', label: 'Massage', icon: 'self_improvement' },
    { key: 'bridal', label: 'Bridal', icon: 'favorite' },
  ];

  // Service icon mapping by category
  private serviceIcons: Record<string, string> = {
    hair: 'content_cut',
    skin: 'face_retouching_natural',
    nails: 'brush',
    massage: 'self_improvement',
    bridal: 'favorite',
    makeup: 'face',
    spa: 'spa',
    default: 'auto_awesome'
  };

  // Professional service images by category (high quality Unsplash)
  private serviceImages: Record<string, string[]> = {
    hair: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&q=80',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80'
    ],
    skin: [
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
      'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80',
      'https://images.unsplash.com/photo-1552693673-1bf958298935?w=600&q=80'
    ],
    nails: [
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80',
      'https://images.unsplash.com/photo-1610992015732-2449b0dd2b3f?w=600&q=80',
      'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&q=80',
      'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&q=80'
    ],
    massage: [
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
      'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&q=80',
      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80'
    ],
    bridal: [
      'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=600&q=80',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&q=80'
    ],
    makeup: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
      'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&q=80',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80'
    ],
    spa: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80'
    ],
    default: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80'
    ]
  };

  // Category colors for icon backgrounds
  categoryColors: Record<string, string> = {
    hair: '#F59E0B',
    skin: '#10B981',
    nails: '#EC4899',
    massage: '#3B82F6',
    bridal: '#EF4444',
    makeup: '#8B5CF6',
    spa: '#14B8A6',
    default: '#7C3AED'
  };

  // Track image load failures
  imageErrors: Set<string> = new Set();

  allServices: Service[] = [];

  constructor(
    private serviceService: ServiceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading = true;
    this.errorMessage = '';
    this.serviceService.getAll().subscribe({
      next: (services) => {
        this.allServices = services;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to load services. Please try again later.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get filteredServices(): Service[] {
    if (this.activeCategory === 'all') return this.allServices;
    return this.allServices.filter(s => s.category === this.activeCategory);
  }

  getCategoryLabel(key: string): string {
    const cat = this.categories.find(c => c.key === key);
    return cat ? cat.label : key;
  }

  getServiceIcon(category: string): string {
    return this.serviceIcons[category?.toLowerCase()] || this.serviceIcons['default'];
  }

  getServiceImage(category: string, index: number): string {
    const images = this.serviceImages[category?.toLowerCase()] || this.serviceImages['default'];
    return images[index % images.length];
  }

  getCategoryColor(category: string): string {
    return this.categoryColors[category?.toLowerCase()] || this.categoryColors['default'];
  }

  onImageError(event: Event, serviceId: string): void {
    this.imageErrors.add(serviceId);
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  hasImageError(serviceId: string): boolean {
    return this.imageErrors.has(serviceId);
  }
}
