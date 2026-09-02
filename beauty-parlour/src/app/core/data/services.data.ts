import { Service } from '../models/service.model';

/**
 * 100% Complete & Authentic Services Catalog for Sindhura Makeovers
 * Owner can update prices, descriptions, and items here directly or via Google Sheets!
 */
export const PARLOUR_SERVICES: Service[] = [
  {
    _id: 's1',
    name: 'Hair Cut – Women',
    category: 'hair',
    duration: 45,
    price: 500,
    description: 'Bespoke couture haircut tailored to face geometry with precision styling and blowout finish.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    popular: true,
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    _id: 's2',
    name: 'Hair Coloring',
    category: 'hair',
    duration: 90,
    price: 2500,
    description: 'Ammonia-free full color, balayage, ombre, and multidimensional highlights with bond rebuilder.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    popular: true,
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    _id: 's3',
    name: 'Hair Deep Conditioning',
    category: 'hair',
    duration: 60,
    price: 1200,
    description: 'Intensive restorative moisture spa with ultrasonic micro-mist steam for silky, frizz-free locks.',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
    popular: false,
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    _id: 's4',
    name: 'Keratin Treatment',
    category: 'hair',
    duration: 120,
    price: 5000,
    description: 'Formaldehyde-free smoothing and reconstructive straightening for mirror-shine, 5-month anti-frizz.',
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
    popular: true,
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    _id: 's5',
    name: 'Classic Facial',
    category: 'skin',
    duration: 45,
    price: 800,
    description: 'Deep pore cleansing, herbal steam, gentle extraction, and cellular hydration with lymphatic massage.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    popular: true,
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    _id: 's6',
    name: 'Gold Facial',
    category: 'skin',
    duration: 60,
    price: 1500,
    description: 'Luxury 24K colloidal gold-infused royal treatment boosting collagen and imparting an illuminated glow.',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80',
    popular: true,
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    _id: 's7',
    name: 'Cleanup',
    category: 'skin',
    duration: 30,
    price: 500,
    description: 'Express 30-minute pore-purifying refresh with tea-tree wash, gentle scrub, and T-zone blackhead clearance.',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80',
    popular: false,
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    _id: 's8',
    name: 'Chemical Peel',
    category: 'skin',
    duration: 45,
    price: 2000,
    description: 'Dermatological AHA/BHA exfoliation treatment for skin resurfacing, hyperpigmentation, and radiant glow.',
    image: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80',
    popular: false,
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    _id: 's9',
    name: 'Manicure',
    category: 'nails',
    duration: 30,
    price: 400,
    description: 'Classic aromatherapy hand bath, geometric nail shaping, brown sugar exfoliation, and high-gloss polish.',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    popular: false,
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    _id: 's10',
    name: 'Pedicure',
    category: 'nails',
    duration: 45,
    price: 500,
    description: 'Therapeutic dead sea salt foot spa, heel callus buffing, toenail grooming, and reflexology massage.',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80',
    popular: false,
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    _id: 's11',
    name: 'Gel Nails',
    category: 'nails',
    duration: 60,
    price: 1200,
    description: 'Instant-dry LED cured salon gel polish delivering ultra-glossy, chip-resistant nails for 3–4 weeks.',
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
    popular: true,
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    _id: 's12',
    name: 'Nail Extensions',
    category: 'nails',
    duration: 90,
    price: 2500,
    description: 'Custom acrylic or sculpted gel extensions with bespoke nail artistry, ombré or chrome finish.',
    image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=80',
    popular: false,
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    _id: 's13',
    name: 'Bridal Makeup',
    category: 'bridal',
    duration: 120,
    price: 15000,
    description: 'High-definition 16-hour waterproof bridal glam with silk mink lashes, contouring, and saree/lehenga draping.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    popular: true,
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    _id: 's14',
    name: 'Pre-Bridal Package',
    category: 'bridal',
    duration: 180,
    price: 8000,
    description: 'Complete beauty rejuvenation: Gold facial, full body polish, Brazilian waxing, and deluxe mani-pedi combo.',
    image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
    popular: false,
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    _id: 's15',
    name: 'Party Makeup',
    category: 'bridal',
    duration: 60,
    price: 3000,
    description: 'Glamorous evening and occasion makeup with luminous base, smokey/shimmer eyes, and transfer-proof lip art.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    popular: false,
    isActive: true,
    createdAt: new Date('2025-01-01')
  }
];
