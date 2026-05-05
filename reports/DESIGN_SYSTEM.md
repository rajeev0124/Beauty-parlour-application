# 🎨 The Beauty Journal Design System

You already have a **beautiful, high-end luxury design system** established for your application! 

All of these foundational colors and CSS rules are currently stored in `frontend/src/styles.scss`. This file acts as your single source of truth for the app's branding.

Below is a reference guide to the colors, typography, and utility classes you currently have, along with some suggestions for how you can use them and expand upon them.

---

## 🌈 The Luxury Feminine Palette (Current Colors)

These are the CSS variables available in your `:root` selector. You can use them anywhere in your app using `var(--color-name)`.

### Primary Brand Colors
*   **Primary (Deep Pink):** `#9d174d` (`var(--clr-primary)`) - Used for primary actions and strong highlights.
*   **Primary Bright (Vibrant Pink):** `#db2777` (`var(--clr-primary-bright)`) - Used for hover states or gradients.
*   **Accent (Rose/Coral):** `#f43f5e` (`var(--clr-accent)`) - Used for notifications, badges, or special highlights.
*   **Gold (Luxury Gold):** `#c5a059` (`var(--clr-gold)`) - Used for luxury accents, borders, and premium indicators.

### Neutrals (Backgrounds & Text)
*   **Ink (Dark Blue/Gray):** `#0f172a` (`var(--clr-ink)`) - Main text color (softer and more premium than pure black).
*   **Paper (Off-White):** `#f8f8f8` (`var(--clr-paper)`) - Main body background color.
*   **Surface (Pure White):** `#ffffff` (`var(--clr-surface)`) - Card and modal backgrounds.
*   **Muted (Slate):** `#64748b` (`var(--clr-muted)`) - Secondary text, subtitles, and icons.

### Subtle Highlights & Borders
*   **Border:** `#e2e8f0` (`var(--clr-border)`)
*   **Border Light:** `#f1f5f9` (`var(--clr-border-light)`)
*   **Primary Light (Soft Pink):** `#fce7f3` (`var(--clr-primary-light)`) - Great for soft backgrounds behind primary text.

---

## ✨ Premium CSS Components

You have several pre-built CSS classes in `styles.scss` that you can apply directly to your HTML elements.

*   **`.btn-primary`**: A beautiful gradient button with a hover bounce effect and soft shadow.
*   **`.btn-secondary`**: An outlined button that fills with your primary color on hover.
*   **`.card-premium`**: Use this on `<div>` elements to get a white card with smooth, rounded corners (`16px`) and a subtle shadow that lifts beautifully when hovered.
*   **`.gradient-text`**: Makes text look like a magical pink/rose gradient. Great for `<h1>` headers.
*   **`.gold-divider`**: A thin, elegant gold line to separate sections.
*   **`.float-element`**: Add this to images or icons to give them a constant, smooth up-and-down floating animation.
*   **`.reveal`**: Add to elements to make them elegantly fade up when loaded.

---

## 💡 Suggestions for New Colors & CSS (You Can Add These!)

If you want to add more to your CSS, here are a few suggestions that fit perfectly with your luxury theme. You can copy/paste these into `frontend/src/styles.scss`.

### 1. A New "Success" Color (Mint/Sage Green)
To show successful appointment bookings or payments without breaking the luxury vibe, avoid bright neon green. Instead, use a soft, premium sage green:
```css
--clr-success: #10b981;
--clr-success-light: #d1fae5;
```

### 2. A "Glassmorphism" Card Effect
For elements that float over images (like a hero section banner), a frosted-glass effect looks incredibly modern and premium:
```css
.card-glass {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: var(--radius-base);
    box-shadow: var(--shadow-md);
    padding: 2rem;
}
```

### 3. A Hover Stroke Effect for Links
Instead of a standard underline, you can add this class to your `<a>` tags in the navbar:
```css
.nav-link {
    position: relative;
    text-decoration: none;
    color: var(--clr-ink);
    font-weight: 500;
}

.nav-link::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -4px;
    left: 0;
    background-color: var(--clr-primary);
    transition: width 0.3s var(--ease-smooth);
}

.nav-link:hover::after {
    width: 100%;
}
```
