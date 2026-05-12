---
name: Industrial Zen
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dcdddd'
  on-secondary-container: '#5f6161'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#2f1500'
  on-tertiary-container: '#c76c00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: 0.02em
  display-lg-mobile:
    fontFamily: Sora
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  headline-xl:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  headline-xl-mobile:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  section-gap: 120px
---

## Brand & Style

This design system embodies the intersection of rugged industrial utility and the refined restraint of Japanese minimalism. It is designed for a premium hardware brand that values precision, longevity, and tactile quality over temporary trends. 

The aesthetic is characterized by an "Editorial Hardware" approach: treating tools as gallery objects rather than shelf-clutter. The visual language uses expansive whitespace to create a sense of calm and focus, allowing the technical details of the products to emerge. The emotional response is one of confidence, quiet strength, and methodical clarity. 

Key principles include:
- **Ma (Negative Space):** Intentional emptiness to emphasize the structural beauty of the hardware.
- **Precision Engineering:** Sharp execution of layout and typography that mirrors the high-tolerance manufacturing of the tools themselves.
- **Soft Industrialism:** Utilizing warm grays and matte finishes to soften the coldness of traditional metal-focused brands.

## Colors

The palette is rooted in monochromatic sophistication, punctuated by a single high-visibility accent. 

- **Matte Black (#1A1A1A):** Used for primary text, structural elements, and primary buttons. It represents the weight and durability of heavy-duty hardware.
- **Warm Gray (#F5F5F5, #E5E5E5):** These shades provide the "Industrial Zen" backdrop, creating soft tonal shifts that mimic architectural concrete or brushed aluminum without the harshness of pure cold gray.
- **Crisp White (#FFFFFF):** The primary canvas color, ensuring the layout feels spacious and breathable.
- **Burnt Orange (#D97706):** A refined take on safety orange. It is used sparingly for critical calls to action, high-priority status indicators, or to highlight technical specifications. It should never overwhelm a screen.

## Typography

Typography functions as the primary architectural element of the design system. 

**Sora** is utilized for headlines to provide a high-contrast, geometric feel with a distinctive modern edge. Large displays utilize generous tracking to evoke a premium, editorial aesthetic. 

**Inter** serves as the workhorse for body text, chosen for its supreme legibility and neutral character, ensuring that technical specifications are easily parsed. 

**Geist** is reserved for labels, captions, and technical data points. Its monospaced-leaning proportions reinforce the industrial, engineered feel of the brand. All labels should utilize uppercase styling with increased letter spacing for a refined, "catalog" appearance.

## Layout & Spacing

This design system employs a **Fixed Grid** model for desktop to maintain strict control over whitespace and alignment, ensuring an editorial feel. 

- **The Grid:** A 12-column grid is used for desktop. Components often occupy the central 8 columns to create wide, luxurious margins.
- **Rhythm:** An 8px base unit drives all spacing. For large editorial sections, a "Section Gap" of 120px is used to clearly delineate product stories and technical deep-dives.
- **Mobile Reflow:** On mobile, the 12-column grid collapses to a 4-column layout. Section gaps are reduced to 64px to maintain momentum while preserving the sense of openness.
- **Visual Breathing Room:** Content should never feel "packed." If in doubt, increase padding. Use asymmetrical layouts (e.g., text in columns 1-5, image in columns 7-12) to create dynamic visual interest.

## Elevation & Depth

Depth is achieved through subtle tonal layering and soft ambient shadows rather than heavy borders or high-contrast shifts.

- **Surface Tiers:** Backgrounds are primarily White (#FFFFFF). Surface elements (cards, containers) use Warm Gray (#F5F5F5) to create a gentle distinction.
- **Ambient Shadows:** Shadows are extremely diffused (e.g., `0px 4px 20px rgba(0,0,0,0.04)`). They should suggest that the UI element is hovering just millimeters above the surface, like a tool placed on a workbench.
- **Interaction Depth:** Upon hover, a subtle increase in shadow spread and a slight upward translation (2-4px) provides tactile feedback.
- **Glass Effects:** For navigation overlays, a high-density background blur (20px) with 80% opacity White is used to maintain a clean, Japanese-inspired lightness.

## Shapes

The shape language balances the "hard" nature of hardware with the "soft" touch of premium design. 

A base radius of **8px to 12px** is applied to all interactive elements and containers. This "softened square" approach avoids the clinical feel of sharp corners while remaining more structured and professional than fully pill-shaped components. 

- **Small elements (Inputs, Buttons):** 8px radius.
- **Large elements (Product Cards, Image Containers):** 12px radius.
- **Iconography:** Use a consistent 1.5pt or 2pt stroke weight with slightly rounded terminals to match the component radius.

## Components

### Buttons
Primary buttons are Matte Black with White text. Secondary buttons use a Warm Gray (#E5E5E5) fill with Black text. The "Action" button for conversion uses Burnt Orange. All buttons feature a subtle 8px radius and generous horizontal padding (at least 24px).

### Input Fields
Inputs are styled with a subtle Warm Gray background (#F5F5F5) and no border, using a 1px Matte Black bottom-border only when focused. This creates a clean, architectural look. Labels always sit above the input in the Geist font (Label-sm).

### Cards
Cards do not use visible borders. Instead, they use a soft tonal shift (#F5F5F5) and the defined ambient shadow. Imagery within cards should be high-resolution with "studio-style" lighting—products should have soft shadows on a neutral background.

### Chips/Tags
Used for technical specs (e.g., "STAINLESS STEEL", "12V"). These are small, ghost-styled elements with a 1px light gray border and Geist Label-sm typography.

### Progress & Detail
Use Burnt Orange for progress bars or to highlight specific technical breakthroughs in a diagram. Keep lines thin (1px to 2px) to maintain the precision aesthetic.

### Navigation
The header should be spacious with 32px vertical padding. Use "Display-lg" for the brand mark and "Label-sm" for navigation links, ensuring they are spaced widely across the top or hidden in a minimalist full-screen menu.