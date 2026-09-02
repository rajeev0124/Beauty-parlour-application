import { Service } from '../../../core/models/service.model';

export interface ServiceStep {
  step: string;
  title: string;
  desc: string;
}

export interface ServiceHighlight {
  icon: string;
  title: string;
  text: string;
}

export interface ServiceDetailInfo {
  tagline: string;
  fullOverview: string;
  steps: ServiceStep[];
  benefits: string[];
  productsUsed: string;
  suitableFor: string;
  aftercare: string[];
  highlights: ServiceHighlight[];
}

/**
 * 100% Authentic, accurate & professional detailed information
 * for all 12 beauty parlour services.
 */
export const SERVICE_DETAILS_DICTIONARY: Record<string, ServiceDetailInfo> = {
  // 1. Hair Cut – Women
  'hair cut – women': {
    tagline: 'Bespoke Couture Haircut, Texturizing & Signature Blowout',
    fullOverview:
      'Our Hair Cut – Women service is a personalized couture experience tailored specifically to your unique bone structure, facial geometry, hair density, and daily styling routine. Beginning with a comprehensive consultation and scalp assessment, our master stylists employ precision Japanese shear techniques, micro-layering, and custom texturizing to remove split ends while creating fluid, bouncy movement. Completed with a restorative botanical wash and a luxurious thermal blowout finish.',
    steps: [
      {
        step: '01',
        title: 'Face-Framing & Density Consultation',
        desc: 'We analyze your natural parting, face shape, hair density, and daily routine to determine the most flattering cut.'
      },
      {
        step: '02',
        title: 'Clarifying Botanical Wash & Scalp Massage',
        desc: 'Cleanses product residue with sulfate-free herbal cleansers while stimulating scalp microcirculation with an acupressure massage.'
      },
      {
        step: '03',
        title: 'Precision Point Cutting & Layering',
        desc: 'Custom Japanese shear tailoring to blend weightless layers, eliminate damaged split ends, and enhance natural volume.'
      },
      {
        step: '04',
        title: 'Heat-Protectant Thermal Blowout & Velvet Shine Finish',
        desc: 'Signature round-brush blowout infused with organic argan oil for a polished, salon-fresh bounce that lasts for days.'
      }
    ],
    benefits: [
      'Eliminates split ends and promotes long-term healthy hair growth',
      'Adds weightless volume, bounce, and fluid movement',
      'Enhances natural face-framing angles and cheekbone definition',
      'Significantly reduces daily morning styling and detangling time'
    ],
    productsUsed:
      'Organic Argan Oil, Sulfate-Free Botanical Shampoo, Keratin Infused Thermal Shield, Weightless Gloss Polish.',
    suitableFor:
      'All hair lengths (short, medium, long) and textures (straight, wavy, curly, coily) seeking maintenance or a complete style transformation.',
    aftercare: [
      'Use a gentle sulfate-free shampoo and hydrating conditioner.',
      'Schedule maintenance trims every 6–8 weeks to keep ends healthy and shape intact.',
      'Always apply a heat protectant spray prior to using flat irons or curling wands.'
    ],
    highlights: [
      { icon: 'content_cut', title: 'Precision Technique', text: 'Custom Japanese shear texturizing' },
      { icon: 'eco', title: 'Clean Botanicals', text: 'Sulfate & paraben-free formulas' },
      { icon: 'auto_awesome', title: 'Signature Styling', text: 'Complimentary thermal blowout included' }
    ]
  },

  // 2. Hair Coloring
  'hair coloring': {
    tagline: 'Vibrant Multi-Tonal Color, Balayage & Ammonia-Free Gloss',
    fullOverview:
      'Experience high-definition color artistry crafted to illuminate your complexion. Whether you desire seamless 100% root grey coverage, global rich chocolate and espresso tones, sun-kissed balayage, or vibrant fashion highlights, our master colorists formulate customized ammonia-free pigment blends enriched with bond-rebuilding plex elixirs. The treatment locks in deep, multidimensional tones while preserving cuticle strength and imparting glass-like shine.',
    steps: [
      {
        step: '01',
        title: 'Color Consultation & Undertone Mapping',
        desc: 'Custom swatch matching based on your skin undertone, eye color, and desired contrast.'
      },
      {
        step: '02',
        title: 'Scalp Barrier Shield Application',
        desc: 'Protecting sensitive scalp skin with soothing botanical barrier oils before color processing.'
      },
      {
        step: '03',
        title: 'Precision Sectioning & Color Application',
        desc: 'Hand-painted balayage, foil placement, or global saturation for seamless, multi-tonal depth.'
      },
      {
        step: '04',
        title: 'Color-Lock pH Balancing Wash & Deep Masque',
        desc: 'Neutralizes alkaline residues, closes cuticles, and locks in brilliant, fade-resistant color.'
      },
      {
        step: '05',
        title: 'Radiant Blowout & Color-Enhancing Serum',
        desc: 'Final thermal styling to bring out dimensional reflections and luminous mirror shine.'
      }
    ],
    benefits: [
      '100% seamless grey coverage with natural fade resistance',
      'Multi-dimensional depth and luminous mirror reflection',
      'Ammonia-free formula protects internal hair fiber bonds',
      'Long-lasting vibrancy and rich tone for 8–10 weeks'
    ],
    productsUsed:
      'Ammonia-Free Italian Micro-Pigments, Bond-Building Plex Multipliers, Antioxidant Color-Lock Mask, UV-Filter Shine Drops.',
    suitableFor:
      'Clients seeking grey coverage, dimensional highlights, balayage, ombré, or a rich seasonal global tone change.',
    aftercare: [
      'Wash with color-safe, sulfate-free shampoo in lukewarm or cool water.',
      'Avoid swimming in chlorinated pools and intense sun exposure without UV hair mists.',
      'Book a gloss toner refresh every 4–6 weeks to maintain mirror shine.'
    ],
    highlights: [
      { icon: 'palette', title: 'Bespoke Formulations', text: 'Custom pigment mixing for skin tone' },
      { icon: 'shield', title: 'Bond Rebuilder', text: 'Plex infused to protect hair strength' },
      { icon: 'flare', title: 'Fade-Resistant', text: 'Lasting brilliance and mirror gloss' }
    ]
  },

  // 3. Hair Deep Conditioning
  'hair deep conditioning': {
    tagline: 'Intensive Lipid Replenishment & Fiber Reconstruction Therapy',
    fullOverview:
      'An intensive restorative moisture spa engineered to rescue dehydrated, heat-damaged, bleached, or chemically processed hair. Combining micro-mist ultrasonic steam infusion with rich botanical butters and hydrolysed wheat proteins, this treatment penetrates deep into the hair cortex to repair broken peptide bonds, smooth frayed cuticles, and restore silky elasticity.',
    steps: [
      {
        step: '01',
        title: 'Clarifying Pre-Wash',
        desc: 'Removes environmental pollutants, hard water mineral deposits, and styling product buildup.'
      },
      {
        step: '02',
        title: 'Deep Nourishing Masque Application',
        desc: 'Section-by-section saturation of bio-lipid restorative butter from mid-lengths to ends.'
      },
      {
        step: '03',
        title: 'Warm Micro-Mist Steam Diffusion',
        desc: 'Opens the cuticle layer gently allowing botanical proteins to penetrate deep into the cortex.'
      },
      {
        step: '04',
        title: 'Cold-Water Cuticle Seal & Scalp Massage',
        desc: 'Calms tension and locks nutrients tightly inside the hair shaft with an acupressure massage.'
      },
      {
        step: '05',
        title: 'Botanical Leave-In Elixir & Smooth Styling',
        desc: 'Lightweight protective hydration sealing against future humidity and heat damage.'
      }
    ],
    benefits: [
      'Replenishes lost moisture and strengthens brittle, snapping hair',
      'Tames stubborn frizz and rough, coarse texture',
      'Enhances natural shine and prevents split ends',
      'Restores combability, softness, and touchable silkiness'
    ],
    productsUsed:
      'Pure Shea Butter, Hydrolysed Wheat & Keratin Protein, Moroccan Argan Oil, Provitamin B5 (Panthenol).',
    suitableFor:
      'Dehydrated, frizzy, heat-damaged, colored, bleached, or pollution-exposed dull hair.',
    aftercare: [
      'Refrain from shampooing for 24–48 hours to allow deep nutrients to fully bond.',
      'Apply a weekly hydrating mask at home.',
      'Minimize excessive high-heat styling tools.'
    ],
    highlights: [
      { icon: 'water_drop', title: 'Intense Hydration', text: 'Restores essential moisture & lipids' },
      { icon: 'spa', title: 'Steam Therapy', text: 'Ultrasonic micro-mist penetration' },
      { icon: 'auto_awesome', title: 'Frizz Elimination', text: 'Smooths rough, frayed cuticles' }
    ]
  },

  // 4. Keratin Treatment
  'keratin treatment': {
    tagline: 'Formaldehyde-Free Smooth Reconstructive Straightening & Anti-Frizz',
    fullOverview:
      'Our signature Keratin Reconstructive Treatment is the gold standard in smoothing therapies. Formulated with formaldehyde-free bioactive keratin proteins and amino acids, it deeply infuses porous hair strands to rebuild internal structural integrity. The treatment eliminates up to 95% of frizz, blocks external humidity, cuts blow-drying time in half, and delivers radiant, glass-like smoothness that lasts 3 to 5 months.',
    steps: [
      {
        step: '01',
        title: 'Deep Clarifying Wash (2 Cycles)',
        desc: 'Strips all impurities and opens cuticles to prepare the hair for optimal protein absorption.'
      },
      {
        step: '02',
        title: 'Precision Keratin Infusion',
        desc: 'Detailed, micro-section application of the bio-keratin complex from roots to tips.'
      },
      {
        step: '03',
        title: 'Thermal Blow-Dry Alignment',
        desc: 'Drying the treatment into the hair fibers under directional airflow.'
      },
      {
        step: '04',
        title: 'Titanium Flat-Iron Sealing',
        desc: 'Precise temperature-controlled thermal pass to crystallize keratin within the hair matrix.'
      },
      {
        step: '05',
        title: 'Nutrient Protective Seal',
        desc: 'Applying lightweight antioxidant serum with personalized post-treatment care instructions.'
      }
    ],
    benefits: [
      'Eliminates up to 95% of frizz and unruly flyaways',
      'Delivers high-gloss, sleek, mirror-like glass hair finish',
      'Cuts daily blow-drying and styling time by 50%',
      'Humidity-resistant results lasting up to 16–20 weeks'
    ],
    productsUsed:
      'Formaldehyde-Free Bio-Keratin Complex, Botanical Silk Amino Acids, Collagen Infusions, Thermal Shield Polymers.',
    suitableFor:
      'Unmanageable, wavy, curly, coarse, frizzy, or high-humidity reactive hair.',
    aftercare: [
      'Strictly do not wet, tie, clip, or tuck hair behind ears for the first 72 hours.',
      'Use exclusively sulfate-free and sodium chloride-free shampoos.',
      'Sleep on a silk or satin pillowcase to minimize surface friction.'
    ],
    highlights: [
      { icon: 'check_circle', title: 'Formaldehyde-Free', text: '100% safe, clean botanical formulation' },
      { icon: 'bolt', title: '5-Month Longevity', text: 'Long-lasting frizz resistance' },
      { icon: 'schedule', title: '50% Faster Styling', text: 'Halves daily styling routine' }
    ]
  },

  // 5. Classic Facial
  'classic facial': {
    tagline: 'Deep Pore Cleansing, Herbal Exfoliation & Cellular Hydration',
    fullOverview:
      'A foundational dermatological facial designed to detoxify, balance, and rejuvenate your skin. Utilizing double cleansing, warm herbal steam, gentle ultrasonic comedone extraction, and a relaxing lymphatic drainage face massage, this ritual unclogs congested pores, clears dead skin buildup, and infuses multi-molecular hyaluronic acid to leave your skin visibly clarified, soft, and luminous.',
    steps: [
      {
        step: '01',
        title: 'Soothing Double Cleanse',
        desc: 'Removes surface sebum, makeup, and urban impurities using botanical cleansing milk.'
      },
      {
        step: '02',
        title: 'Enzyme Exfoliation & Herbal Steam',
        desc: 'Gentle fruit-enzyme scrub paired with warm steam to soften stubborn pore debris.'
      },
      {
        step: '03',
        title: 'Gentle Extraction & T-Zone Purification',
        desc: 'Painless removal of blackheads and whiteheads with sterilized tools.'
      },
      {
        step: '04',
        title: 'Lymphatic Sculpting & Pressure Point Massage',
        desc: 'Stimulates blood circulation, drains toxins, and relieves facial muscle tension.'
      },
      {
        step: '05',
        title: 'Hydrating Botanical Masque & Sun Shield',
        desc: 'Replenishing moisture mask followed by cooling rose water and SPF 50+ sunscreen.'
      }
    ],
    benefits: [
      'Deeply decongests pores and reduces blackheads/whiteheads',
      'Restores ideal skin moisture-to-lipid barrier balance',
      'Enhances blood flow and natural collagen regeneration',
      'Leaves skin remarkably soft, clean, and radiant'
    ],
    productsUsed:
      'Organic Rosehip Cleanser, Papaya & Pineapple Enzymes, Hyaluronic Acid Gel, Soothing Aloe & Chamomile Masque.',
    suitableFor:
      'All skin types (normal, oily, combination, dry) seeking routine monthly maintenance and deep pore purification.',
    aftercare: [
      'Avoid applying heavy makeup for 12 hours post-treatment.',
      'Drink at least 2 liters of water to aid lymphatic detoxification.',
      'Apply broad-spectrum sunscreen daily and avoid direct sun tanning for 48 hours.'
    ],
    highlights: [
      { icon: 'face_retouching_natural', title: 'Pore Purification', text: 'Deep blackhead & whitehead removal' },
      { icon: 'spa', title: 'Lymphatic Massage', text: 'Releases stress & promotes natural glow' },
      { icon: 'water_drop', title: 'Deep Hydration', text: 'Multi-layer moisture infusion' }
    ]
  },

  // 6. Gold Facial
  'gold facial': {
    tagline: '24K Colloidal Gold Rejuvenation, Collagen Boost & Bridal Glow',
    fullOverview:
      'An opulent royal skin ceremony favored by brides and celebrities. Infused with 24-Karat colloidal gold nanoparticles, peptide complexes, and potent herbal antioxidants, this luxurious facial stimulates cellular regeneration, combats oxidative free radical damage, firms sagging contours, and delivers an unmatched champagne luminosity that radiates in photos and under stage lights.',
    steps: [
      {
        step: '01',
        title: 'Gold Luminous Cleanser & Micro-Buffing',
        desc: 'Prepares the dermal surface and eliminates dull epidermal micro-cells.'
      },
      {
        step: '02',
        title: '24K Bio-Gold Cellular Massage Gel',
        desc: 'Infusing micro-gold particles with uplifting Japanese massage strokes.'
      },
      {
        step: '03',
        title: 'Cryo-Globe Lymphatic Ice Sculpting',
        desc: 'Chilled globes tighten pores, reduce puffiness, and lock active gold nutrients deep.'
      },
      {
        step: '04',
        title: '24K Pure Gold Peel-Off Masque',
        desc: 'Forms a restorative thermal barrier to lift and tone facial contours.'
      },
      {
        step: '05',
        title: 'Saffron & Peptide Radiance Elixir',
        desc: 'Finishing serum that illuminates high points of the face for a bridal glow.'
      }
    ],
    benefits: [
      'Stimulates natural collagen synthesis and increases dermal firmness',
      'Brightens dark spots, sun pigmentation, and uneven skin tone',
      'Imparts an instantaneous dewy, golden, photogenic glow',
      'Smoothes fine lines and rejuvenates tired, stressed skin'
    ],
    productsUsed:
      '24K Micro-Colloidal Gold, Copper Peptides, Kashmiri Saffron Extract, Niacinamide, Pure Rose Hydrosol.',
    suitableFor:
      'Bridal prep, festive occasions, milestone celebrations, and mature skin wanting instant firming and luminous radiance.',
    aftercare: [
      'Let the active gold nutrients work on your skin overnight without harsh washing.',
      'Avoid abrasive facial scrubs, waxing, or chemical peels for 5 days.',
      'Apply hydrating moisturizer and SPF 50 daily.'
    ],
    highlights: [
      { icon: 'military_tech', title: '24K Colloidal Gold', text: 'Pure bio-gold cellular therapy' },
      { icon: 'auto_awesome', title: 'Royal Radiance', text: 'Instant bridal & festive luminosity' },
      { icon: 'health_and_safety', title: 'Collagen Activation', text: 'Firms skin & reduces fine lines' }
    ]
  },

  // 7. Cleanup
  'cleanup': {
    tagline: 'Express Pore-Clarifying Detox, T-Zone Polish & Instant Brightening',
    fullOverview:
      'Designed for individuals on-the-go who desire clean, fresh, and polished skin in just 30 minutes. Our Express Cleanup targets stubborn T-zone oiliness, blackheads, and environmental buildup with tea-tree purification, gentle micro-grain scrubbing, and a refreshing pore-refining astringent pack to restore immediate clarity and brightness.',
    steps: [
      {
        step: '01',
        title: 'Tea-Tree Clarifying Cleansing',
        desc: 'Removes excess sebum, sweat, and surface dirt without stripping natural moisture.'
      },
      {
        step: '02',
        title: 'Walnut-Apricot Micro-Exfoliation',
        desc: 'Buffs away dead skin cells and unclogs micro-pores.'
      },
      {
        step: '03',
        title: 'Targeted T-Zone Extraction',
        desc: 'Quick and gentle clearance of nose and chin blackheads and whiteheads.'
      },
      {
        step: '04',
        title: 'Calming Mint & Clay Purifying Pack',
        desc: 'Closes open pores, soothes redness, and mattifies oily zones.'
      },
      {
        step: '05',
        title: 'Hydrating Water-Gel & SPF Finish',
        desc: 'Lightweight non-comedogenic hydration for a refreshed, non-greasy look.'
      }
    ],
    benefits: [
      'Fast 30-minute treatment with zero downtime',
      'Clears clogged pores and prevents acne breakouts',
      'Leaves skin matte, clean, and noticeably refreshed',
      'Economical routine maintenance for busy schedules'
    ],
    productsUsed:
      'Tea Tree Essential Oil, Neem Leaf Extract, Witch Hazel Astringent, Kaolin Clay, Aloe Vera Hydrating Gel.',
    suitableFor:
      'Oily, acne-prone, or congested skin needing a quick bi-weekly refresh between full facials.',
    aftercare: [
      'Wash face with cool water for the rest of the day.',
      'Avoid touching face frequently with unwashed hands.',
      'Apply oil-free moisturizer and sunscreen daily.'
    ],
    highlights: [
      { icon: 'timer', title: '30-Min Express', text: 'Quick, effective lunchtime skincare' },
      { icon: 'sanitizer', title: 'Anti-Acne Herbal', text: 'Neem & Tea-Tree bacterial defense' },
      { icon: 'check_circle', title: 'Instant Brightness', text: 'Removes dullness and greasy shine' }
    ]
  },

  // 8. Manicure
  'manicure': {
    tagline: 'Aromatic Hand Soak, Cuticle Care, Sugar Polish & High-Gloss Lacquer',
    fullOverview:
      'Pamper your hands with our classic wellness manicure. Beginning with an aromatic floral warm soak and gentle nail shaping, our nail artisans expertly groom cuticles, buff the nail plate, and exfoliate hands with an organic brown sugar scrub. Followed by a relaxing acupressure hand massage and finished with your choice of premium high-shine nail lacquer.',
    steps: [
      {
        step: '01',
        title: 'Essential Oil Warm Hand Bath',
        desc: 'Softens dry cuticles and relaxes hand muscles with calming lavender oils.'
      },
      {
        step: '02',
        title: 'Nail Clipping & Geometric Filing',
        desc: 'Shaping nails into your preferred silhouette (oval, almond, square, squoval).'
      },
      {
        step: '03',
        title: 'Cuticle Care & Gentle Buffing',
        desc: 'Gentle push-back, conditioning with apricot oil, and light surface buffing.'
      },
      {
        step: '04',
        title: 'Brown Sugar Exfoliation & Acupressure Massage',
        desc: 'Restores velvety softness to hands and improves blood circulation.'
      },
      {
        step: '05',
        title: 'Base Coat, Color & Chip-Resistant Top Coat',
        desc: 'Professional 3-layer polish application with fast-drying drops.'
      }
    ],
    benefits: [
      'Prevents painful hangnails, cuticle tears, and nail splitting',
      'Smooths dry, rough hands and lightens dark knuckles',
      'Leaves nails neat, symmetrical, and elegantly polished',
      'Relieves hand and wrist tension from typing and device use'
    ],
    productsUsed:
      'Vitamin E Cuticle Oil, Organic Brown Sugar & Shea Butter Scrub, 10-Free Non-Toxic Breathable Nail Lacquers.',
    suitableFor:
      'Anyone seeking well-groomed, clean hands for professional meetings, events, or regular self-care.',
    aftercare: [
      'Allow polish 20 minutes to completely set before handling keys or bags.',
      'Massage a drop of cuticle oil onto nail beds every evening.',
      'Wear protective gloves while washing dishes or using harsh cleaning chemicals.'
    ],
    highlights: [
      { icon: 'brush', title: 'Couture Nail Artistry', text: 'Precision nail shaping & polish' },
      { icon: 'spa', title: 'Aromatic Soak', text: 'Calming essential oil hand therapy' },
      { icon: 'favorite', title: 'Cuticle Nutrition', text: 'Vitamin E & Apricot restorative oils' }
    ]
  },

  // 9. Pedicure
  'pedicure': {
    tagline: 'Therapeutic Foot Spa, Heel Callus Buffing & Reflexology Massage',
    fullOverview:
      'Relieve tension and revitalize tired, aching feet with our therapeutic pedicure. Enjoy an invigorating detoxifying Epsom salt and peppermint foot bath, thorough callus removal, gentle toenail grooming, and a deep-tissue foot and calf massage using rich botanical butters. Concludes with a professional chip-resistant polish for elegant, sandals-ready feet.',
    steps: [
      {
        step: '01',
        title: 'Warm Hydrotherapy Foot Soak',
        desc: 'Enriched with dead sea salts and peppermint oil to deodorize and soften thick calluses.'
      },
      {
        step: '02',
        title: 'Toenail Grooming & Cuticle Conditioning',
        desc: 'Trimming, shaping, and gentle cuticle cleanup with sanitized stainless steel tools.'
      },
      {
        step: '03',
        title: 'Heel Callus Rasping & Pumice Scrub',
        desc: 'Thoroughly sloughs off hardened cracked skin from heels and soles.'
      },
      {
        step: '04',
        title: 'Calming Calf & Foot Reflexology Massage',
        desc: 'Releases deep muscle aches, stimulates pressure points, and boosts venous flow.'
      },
      {
        step: '05',
        title: 'Polish Application & Quick-Dry Seal',
        desc: 'Protective base coat, rich color lacquer, and high-gloss protective top seal.'
      }
    ],
    benefits: [
      'Eliminates rough, cracked heels and dry dead skin',
      'Alleviates foot fatigue, swelling, and joint stiffness',
      'Maintains immaculate foot hygiene and prevents ingrown toenails',
      'Restores silky smooth baby-soft soles'
    ],
    productsUsed:
      'Dead Sea Mineral Salts, Peppermint Essential Oil, 20% Urea Heel Smoothing Cream, Deep Hydration Butter.',
    suitableFor:
      'Tired feet, cracked heels, runners, active professionals, and regular monthly foot hygiene.',
    aftercare: [
      'Apply heel balm or heavy moisturizer before sleeping and wear cotton socks.',
      'Avoid walking barefoot on dusty or abrasive surfaces.',
      'Re-book every 3–4 weeks for consistently soft, healthy feet.'
    ],
    highlights: [
      { icon: 'cleaning_services', title: 'Callus Removal', text: 'Restores soft, smooth baby heels' },
      { icon: 'self_improvement', title: 'Reflexology', text: 'Relieves stress & promotes foot wellness' },
      { icon: 'verified', title: 'Sterilized Tools', text: '100% medical-grade hygiene standard' }
    ]
  },

  // 10. Gel Nails
  'gel nails': {
    tagline: 'LED-Cured Chip-Proof Gel Color, Nail Art & High-Gloss Armor',
    fullOverview:
      'Say goodbye to chipped polish and dull nails. Our premium Gel Nails service delivers flawless, mirror-gloss color that stays vibrant, scratch-proof, and chip-free for up to 3 to 4 weeks. Utilizing advanced LED light curing technology and salon-grade polymer gels, your nails are 100% dry and rock-hard the moment you step out of the salon.',
    steps: [
      {
        step: '01',
        title: 'Precision Dry Manicure Prep',
        desc: 'Dehydrating and priming the nail plate to ensure maximum gel adhesion.'
      },
      {
        step: '02',
        title: 'Keratin Bonding Base Coat',
        desc: 'Protective barrier cured under LED light for 30 seconds.'
      },
      {
        step: '03',
        title: 'Two to Three High-Pigment Gel Coats',
        desc: 'Even, bubble-free application of your chosen shade or nail art designs.'
      },
      {
        step: '04',
        title: 'Diamond-Shield Gloss Top Coat',
        desc: 'Scratch-resistant sealant cured under LED for an impenetrable mirror shine.'
      },
      {
        step: '05',
        title: 'Alcohol-Free Cuticle Elixir Massage',
        desc: 'Nourishing the surrounding skin for a clean, glossy aesthetic.'
      }
    ],
    benefits: [
      'Zero drying time — completely smudge-proof instantly',
      'Ultra-durable mirror shine that will not chip or peel for 3–4 weeks',
      'Strengthens fragile natural nails against accidental breaks',
      'Unlimited possibilities for French tips, chrome, ombré, and custom nail art'
    ],
    productsUsed:
      'Salon-Grade LED Gel Polymers, Keratin Base Bonds, Diamond-Shine Top Coats, Organic Jojoba Cuticle Elixir.',
    suitableFor:
      'Brides, vacationers, working professionals, and anyone who wants gorgeous, zero-maintenance nails for a month.',
    aftercare: [
      'Never peel or pick the gel off with your fingers to avoid damaging your natural nail.',
      'Apply daily cuticle oil to keep gel flexible and cuticles hydrated.',
      'Return to the salon for gentle, non-damaging acetone wrap removal.'
    ],
    highlights: [
      { icon: 'auto_awesome', title: 'Zero Drying Time', text: 'Cured instantly under LED lights' },
      { icon: 'security', title: '4-Week Chip-Free', text: 'Rock-solid mirror finish that lasts' },
      { icon: 'palette', title: 'Custom Nail Art', text: 'Chrome, french tips, glitter & patterns' }
    ]
  },

  // 11. Bridal Makeup
  'bridal makeup': {
    tagline: 'Luxury High-Definition 16-Hour Bridal Glam, Lash Art & Draping',
    fullOverview:
      'Our flagship Signature Bridal Makeup is an unforgettable royal beauty experience crafted to ensure you look magnificent in person, under intense stage spotlights, and across 4K cinema videography. Featuring bespoke skin preparation, customized HD or Airbrush base matching, bespoke eye artistry with premium mink/silk lashes, precision facial contouring, and complete saree/lehenga draping and jewelry placement.',
    steps: [
      {
        step: '01',
        title: 'Pre-Bridal Skin Prep & Priming',
        desc: 'Depuffing eye treatment, hyaluronic hydration mist, and pore-smoothing primer.'
      },
      {
        step: '02',
        title: 'Customized HD / Airbrush Base Matching',
        desc: 'Flawless, breathable, sweat-proof foundation formulated to match neck and collarbones.'
      },
      {
        step: '03',
        title: 'Master Bridal Eye Artistry',
        desc: 'Cut-crease, smokey glitter, waterproof liner, and multi-layered luxury mink/silk lashes.'
      },
      {
        step: '04',
        title: 'Facial Sculpting, Blush & 16-Hr Lip Art',
        desc: 'Defining cheekbones, illuminated bridal glow, and transfer-proof lip styling.'
      },
      {
        step: '05',
        title: 'Saree / Lehenga Draping & Jewelry Setting',
        desc: 'Complete designer draping, dupatta pinning, and bridal jewelry placement.'
      }
    ],
    benefits: [
      '100% waterproof, sweat-resistant, and cry-proof formulation',
      '16+ hour wear with zero creasing or oxidation',
      'HD camera & 4K video friendly with zero flashback under flash photography',
      'Complete bridal assistance including dupatta draping and jewelry styling'
    ],
    productsUsed:
      'MAC Cosmetics, Huda Beauty, Charlotte Tilbury, Estée Lauder Double Wear, NARS, Urban Decay All Nighter.',
    suitableFor:
      'Brides for Muhurtham, Reception, Sangeet, Engagement, Christian Weddings, and Grand Bridal Shoots.',
    aftercare: [
      'Use a bi-phase oil-based micellar cleanser or cleansing balm for gentle makeup removal.',
      'Follow with a rich hydrating night cream and eye serum after the wedding festivities.'
    ],
    highlights: [
      { icon: 'camera_alt', title: '4K Cinema Ready', text: 'Flashback-free high-definition finish' },
      { icon: 'water_drop', title: 'Waterproof & Cry-Proof', text: '16-hour sweat & emotion resistant' },
      { icon: 'diamond', title: 'Complete Draping', text: 'Full jewelry & dupatta pinning included' }
    ]
  },

  // 12. Party Makeup
  'party makeup': {
    tagline: 'Luminous Evening Glam, Smokey Eyes & Velvet Transfer-Proof Lip Art',
    fullOverview:
      'Turn heads at any special celebration with our signature Party & Occasion Makeup. Tailored to match your outfit and personal aesthetic, this look combines luminous skin preparation, seamless complexion blending, radiant cheekbone highlighting, alluring eye makeup (soft glam, shimmer, or sultry smokey), and transfer-proof lip color to keep you glowing all evening.',
    steps: [
      {
        step: '01',
        title: 'Skin Glow Prep',
        desc: 'Gentle micellar cleanse followed by illuminating strobe cream and pore-refining primer.'
      },
      {
        step: '02',
        title: 'Luminous Long-Wear Base',
        desc: 'Lightweight medium-to-full buildable coverage for a radiant second-skin finish.'
      },
      {
        step: '03',
        title: 'Alluring Eye Artistry & Flutter Lashes',
        desc: 'Customized eyeshadow palette with shimmer accents and lightweight volume lashes.'
      },
      {
        step: '04',
        title: 'Radiant Cheek Sculpting & Champagne Glow',
        desc: 'Warm bronzer, soft rosy blush, and micro-shimmer highlighter.'
      },
      {
        step: '05',
        title: 'Velvet Lip Color & Ultra-Lock Setting Mist',
        desc: 'Transfer-resistant lip shade locked with fine-mist setting spray.'
      }
    ],
    benefits: [
      'Long-wearing 8–10 hour radiant coverage',
      'Lightweight, breathable feel that never looks cakey',
      'Perfectly color-coordinated with your outfit and jewelry',
      'Picture-perfect glow under evening and indoor lighting'
    ],
    productsUsed:
      'Fenty Beauty, Anastasia Beverly Hills, MAC, Kryolan Professional, Sephora Collection.',
    suitableFor:
      'Sangeet guests, bridesmaids, cocktail parties, birthdays, anniversaries, corporate galas, and festive events.',
    aftercare: [
      'Remove gently using a makeup remover wipe followed by warm water cleanse.',
      'Apply a soothing toner and night moisturizer.'
    ],
    highlights: [
      { icon: 'flare', title: 'Radiant Glow', text: 'Dewy champagne highlights & contour' },
      { icon: 'visibility', title: 'Alluring Eyes', text: 'Smokey, shimmer & flutter lashes' },
      { icon: 'schedule', title: '8+ Hour Wear', text: 'Smudge-proof & transfer-resistant' }
    ]
  }
};

/**
 * Intelligent helper to resolve the detailed matter for any service.
 */
export function getServiceDetailData(
  serviceName: string,
  category: string,
  description?: string
): ServiceDetailInfo {
  if (!serviceName) {
    return createGenericDetail('Signature Treatment', category, description);
  }

  const normalized = serviceName
    .toLowerCase()
    .replace(/[–—−]/g, '-')
    .trim();

  // Direct exact match
  if (SERVICE_DETAILS_DICTIONARY[normalized]) {
    return SERVICE_DETAILS_DICTIONARY[normalized];
  }

  // Also check with en-dash variant
  const enDashVariant = normalized.replace('-', '–');
  if (SERVICE_DETAILS_DICTIONARY[enDashVariant]) {
    return SERVICE_DETAILS_DICTIONARY[enDashVariant];
  }

  // Key phrase matching
  if (normalized.includes('hair cut') || normalized.includes('haircut')) {
    return SERVICE_DETAILS_DICTIONARY['hair cut – women'];
  }
  if (normalized.includes('color') || normalized.includes('colour') || normalized.includes('highlights') || normalized.includes('balayage')) {
    return SERVICE_DETAILS_DICTIONARY['hair coloring'];
  }
  if (normalized.includes('conditioning') || normalized.includes('hair spa') || normalized.includes('scalp spa')) {
    return SERVICE_DETAILS_DICTIONARY['hair deep conditioning'];
  }
  if (normalized.includes('keratin') || normalized.includes('straightening') || normalized.includes('smoothening') || normalized.includes('botox')) {
    return SERVICE_DETAILS_DICTIONARY['keratin treatment'];
  }
  if (normalized.includes('gold facial') || normalized.includes('diamond facial') || normalized.includes('radiance facial')) {
    return SERVICE_DETAILS_DICTIONARY['gold facial'];
  }
  if (normalized.includes('facial') || normalized.includes('hydra') || normalized.includes('cleanup')) {
    if (normalized.includes('cleanup')) {
      return SERVICE_DETAILS_DICTIONARY['cleanup'];
    }
    return SERVICE_DETAILS_DICTIONARY['classic facial'];
  }
  if (normalized.includes('pedicure') || normalized.includes('feet') || normalized.includes('foot spa')) {
    return SERVICE_DETAILS_DICTIONARY['pedicure'];
  }
  if (normalized.includes('gel nail') || normalized.includes('nail art') || normalized.includes('acrylic')) {
    return SERVICE_DETAILS_DICTIONARY['gel nails'];
  }
  if (normalized.includes('manicure') || normalized.includes('nail')) {
    return SERVICE_DETAILS_DICTIONARY['manicure'];
  }
  if (normalized.includes('bridal') || normalized.includes('bride') || normalized.includes('wedding')) {
    return SERVICE_DETAILS_DICTIONARY['bridal makeup'];
  }
  if (normalized.includes('party') || normalized.includes('makeup') || normalized.includes('glam') || normalized.includes('reception')) {
    return SERVICE_DETAILS_DICTIONARY['party makeup'];
  }

  return createGenericDetail(serviceName, category, description);
}

function createGenericDetail(name: string, category: string, description?: string): ServiceDetailInfo {
  return {
    tagline: `Artisan ${name} — Curated Luxury & Clinical Excellence`,
    fullOverview:
      description ||
      `Experience our signature ${name}. Performed by certified master cosmetologists using premium international formulations to deliver bespoke results tailored to your lifestyle.`,
    steps: [
      { step: '01', title: 'Personalized Consultation', desc: 'Detailed assessment and customized treatment plan tailored to your profile.' },
      { step: '02', title: 'Preparation & Clarifying Prep', desc: 'Gentle cleansing and skin/hair preparation with bio-botanical elixirs.' },
      { step: '03', title: 'Signature Treatment Application', desc: `Master execution of ${name} with high-potency active ingredients.` },
      { step: '04', title: 'Finishing Touch & Nutrient Seal', desc: 'Locking in active hydration with protective serums and radiant styling.' }
    ],
    benefits: [
      'Performed by internationally certified specialists',
      'Premium dermatologically tested professional formulations',
      'Immediate visible radiance and long-lasting results',
      'Personalized tips for effortless home maintenance'
    ],
    productsUsed: 'Premium clean botanical formulations, dermatologically certified professional salon lines.',
    suitableFor: 'All clients seeking specialized care and professional salon expertise.',
    aftercare: [
      'Follow your specialist’s specific post-care guidance.',
      'Maintain regular home care with recommended products.',
      'Book regular maintenance sessions to sustain peak results.'
    ],
    highlights: [
      { icon: 'verified', title: 'Certified Experts', text: 'Conducted by master specialists' },
      { icon: 'eco', title: 'Premium Products', text: 'Clean, skin-friendly active formulas' },
      { icon: 'auto_awesome', title: 'Flawless Finish', text: 'Immediate visible transformation' }
    ]
  };
}

/**
 * Default fallback list of all 12 services in case the database is offline.
 */
export const DEFAULT_SERVICES_LIST: Service[] = [
  {
    _id: 'svc-1',
    name: 'Hair Cut – Women',
    category: 'hair',
    duration: 45,
    price: 500,
    description: 'Professional haircut tailored to your face shape with precision styling and blow dry finish.',
    popular: true,
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: 'svc-2',
    name: 'Hair Coloring',
    category: 'hair',
    duration: 90,
    price: 2500,
    description: 'Ammonia-free full color, balayage, ombre, and multidimensional highlights with bond rebuilder.',
    popular: true,
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: 'svc-3',
    name: 'Hair Deep Conditioning',
    category: 'hair',
    duration: 60,
    price: 1200,
    description: 'Intensive restorative moisture spa with ultrasonic micro-mist steam for silky, frizz-free locks.',
    popular: false,
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: 'svc-4',
    name: 'Keratin Treatment',
    category: 'hair',
    duration: 120,
    price: 5000,
    description: 'Formaldehyde-free smoothing and reconstructive straightening for mirror-shine, 5-month anti-frizz.',
    popular: true,
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: 'svc-5',
    name: 'Classic Facial',
    category: 'skin',
    duration: 45,
    price: 800,
    description: 'Deep pore cleansing, herbal steam, gentle extraction, and cellular hydration with lymphatic massage.',
    popular: true,
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: 'svc-6',
    name: 'Gold Facial',
    category: 'skin',
    duration: 60,
    price: 1500,
    description: 'Luxury 24K colloidal gold-infused royal treatment boosting collagen and imparting an illuminated glow.',
    popular: true,
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: 'svc-7',
    name: 'Cleanup',
    category: 'skin',
    duration: 30,
    price: 500,
    description: 'Express 30-minute pore-purifying refresh with tea-tree wash, gentle scrub, and T-zone blackhead clearance.',
    popular: false,
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: 'svc-8',
    name: 'Manicure',
    category: 'nails',
    duration: 30,
    price: 400,
    description: 'Classic aromatherapy hand bath, geometric nail shaping, brown sugar exfoliation, and high-gloss polish.',
    popular: false,
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: 'svc-9',
    name: 'Pedicure',
    category: 'nails',
    duration: 45,
    price: 500,
    description: 'Therapeutic dead sea salt foot spa, heel callus buffing, toenail grooming, and reflexology massage.',
    popular: false,
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: 'svc-10',
    name: 'Gel Nails',
    category: 'nails',
    duration: 60,
    price: 1200,
    description: 'Instant-dry LED cured salon gel polish delivering ultra-glossy, chip-resistant nails for 3–4 weeks.',
    popular: true,
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: 'svc-11',
    name: 'Bridal Makeup',
    category: 'bridal',
    duration: 120,
    price: 15000,
    description: 'High-definition 16-hour waterproof bridal glam with silk mink lashes, contouring, and saree/lehenga draping.',
    popular: true,
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: 'svc-12',
    name: 'Party Makeup',
    category: 'bridal',
    duration: 60,
    price: 3000,
    description: 'Glamorous evening and occasion makeup with luminous base, smokey/shimmer eyes, and transfer-proof lip art.',
    popular: false,
    isActive: true,
    createdAt: new Date()
  }
];
