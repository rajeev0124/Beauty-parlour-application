import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatIconModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSnackBarModule
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  contactForm: FormGroup;

  team = [
    { 
      name: 'Priya Sharma', 
      role: 'Founder & Lead Stylist', 
      image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&q=80',
      bio: '15+ years of experience in premium hair styling and salon management.',
      social: { instagram: '#', linkedin: '#' }
    },
    { 
      name: 'Anitha Raj', 
      role: 'Senior Hair Specialist', 
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
      bio: 'Expert in color treatments and modern hair transformations.',
      social: { instagram: '#', linkedin: '#' }
    },
    { 
      name: 'Kavitha Nair', 
      role: 'Skin Care Expert', 
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
      bio: 'Certified dermatologist specializing in advanced skincare treatments.',
      social: { instagram: '#', linkedin: '#' }
    },
    { 
      name: 'Deepa Menon', 
      role: 'Bridal Makeup Artist', 
      image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&q=80',
      bio: 'Award-winning makeup artist with 500+ bridal transformations.',
      social: { instagram: '#', linkedin: '#' }
    },
  ];

  stats = [
    { value: '11+', label: 'Years of Excellence', icon: 'workspace_premium' },
    { value: '15K+', label: 'Happy Clients', icon: 'favorite' },
    { value: '50+', label: 'Expert Stylists', icon: 'groups' },
    { value: '120+', label: 'Services Offered', icon: 'spa' }
  ];

  values = [
    {
      icon: 'diamond',
      title: 'Premium Quality',
      description: 'We use only the finest products from world-renowned brands to ensure exceptional results.'
    },
    {
      icon: 'diversity_3',
      title: 'Client-Centric',
      description: 'Your satisfaction is our priority. Every service is personalized to meet your unique needs.'
    },
    {
      icon: 'eco',
      title: 'Eco-Friendly',
      description: 'Committed to sustainability with organic products and environmentally conscious practices.'
    },
    {
      icon: 'verified',
      title: 'Expert Team',
      description: 'Our certified professionals stay updated with the latest trends and techniques.'
    }
  ];

  testimonials = [
    {
      name: 'Sneha Reddy',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
      rating: 5,
      text: 'Absolutely love this place! The team is incredibly talented and made my bridal day perfect.',
      service: 'Bridal Makeup'
    },
    {
      name: 'Meera Patel',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
      rating: 5,
      text: 'Best hair transformation I\'ve ever had. The attention to detail is remarkable!',
      service: 'Hair Color & Styling'
    },
    {
      name: 'Anjali Kumar',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
      rating: 5,
      text: 'The skincare treatments here are amazing. My skin has never looked better!',
      service: 'Facial Treatment'
    }
  ];

  milestones = [
    { year: '2013', title: 'Founded', description: 'Started as a small salon with 3 passionate stylists' },
    { year: '2016', title: 'Expansion', description: 'Opened second branch and grew team to 20 members' },
    { year: '2019', title: 'Award Winner', description: 'Recognized as Best Beauty Salon in the city' },
    { year: '2022', title: 'Innovation', description: 'Launched online booking and premium product line' },
    { year: '2024', title: 'Today', description: '50+ experts serving 15,000+ happy clients' }
  ];

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  sendMessage(): void {
    if (this.contactForm.invalid) return;
    this.snackBar.open('Message sent! We\'ll get back to you soon.', 'Close', { duration: 4000 });
    this.contactForm.reset();
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
}
