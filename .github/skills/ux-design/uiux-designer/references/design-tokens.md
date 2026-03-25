# Design Token Reference

Standard scales to use as defaults unless the product has its own design system.

## Spacing Scale (4px base)
```
space-1:  4px
space-2:  8px
space-3:  12px
space-4:  16px
space-5:  20px
space-6:  24px
space-8:  32px
space-10: 40px
space-12: 48px
space-16: 64px
space-20: 80px
space-24: 96px
```

## Type Scale (16px base, 1.25 ratio)
```
text-xs:   12px / line-height 1.4
text-sm:   14px / line-height 1.4
text-base: 16px / line-height 1.5
text-lg:   20px / line-height 1.4
text-xl:   25px / line-height 1.3
text-2xl:  31px / line-height 1.2
text-3xl:  39px / line-height 1.1
text-4xl:  49px / line-height 1.05
```

## Font Weights
```
regular:   400
medium:    500
semibold:  600
bold:      700
```

## Border Radius
```
radius-sm:   4px   (inputs, tags)
radius-md:   8px   (cards, buttons)
radius-lg:   12px  (modals, panels)
radius-xl:   16px  (large cards)
radius-full: 9999px (pills, avatars)
```

## Shadows
```
shadow-sm:  0 1px 2px rgba(0,0,0,0.05)
shadow-md:  0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)
shadow-lg:  0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)
shadow-xl:  0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)
```

## Neutral Palette
```
gray-50:  #F9FAFB
gray-100: #F3F4F6
gray-200: #E5E7EB
gray-300: #D1D5DB
gray-400: #9CA3AF
gray-500: #6B7280
gray-600: #4B5563
gray-700: #374151
gray-800: #1F2937
gray-900: #111827
```

## Semantic Color Roles
```
color-primary:        Brand action color
color-primary-hover:  Darkened by 10%
color-secondary:      Supporting actions
color-success:        #16A34A (green-600)
color-warning:        #D97706 (amber-600)
color-error:          #DC2626 (red-600)
color-info:           #2563EB (blue-600)
color-surface:        Page/card background
color-surface-raised: Slightly elevated surface
color-border:         gray-200
color-text:           gray-900
color-text-secondary: gray-500
color-text-disabled:  gray-400
```

## Motion
```
duration-fast:   100ms
duration-normal: 200ms
duration-slow:   300ms
duration-slower: 500ms

easing-default: cubic-bezier(0.4, 0, 0.2, 1)   /* ease-in-out */
easing-enter:   cubic-bezier(0, 0, 0.2, 1)       /* ease-out */
easing-exit:    cubic-bezier(0.4, 0, 1, 1)        /* ease-in */
easing-spring:  cubic-bezier(0.34, 1.56, 0.64, 1) /* overshoot */
```

## Breakpoints
```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

## Z-Index Scale
```
z-base:    0
z-raised:  10
z-dropdown: 100
z-sticky:  200
z-overlay: 300
z-modal:   400
z-toast:   500
z-tooltip: 600
```
