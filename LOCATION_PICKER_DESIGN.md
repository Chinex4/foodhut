# Location Picker - UI/UX Flow & Design Guide

## Screen Flow

```
┌─────────────────────────────────────────┐
│           HOME SCREEN                   │
│                                         │
│  Welcome, John              📍[Check]   │ ◄─ Location Icon (Top-Right)
│  Eat Your Fav!                          │    - Orange map marker
│                                         │    - Checkmark when city selected
│  ┌────────────────────────────────────┐ │
│  │📍 Lagos      ✏️                    │ │ ◄─ Selected City Display
│  └────────────────────────────────────┘ │    (Pill-shaped badge)
│                                         │
│  🔍 Search restaurants, meals...        │
│                                         │
│  [Ads Carousel]                         │
│  [Trending Discounts]                   │
│  [Most Popular Orders]                  │
│  [Kitchen Vendors]                      │
│                                         │
│                    ┌────────────────┐   │
│                    │     🛒   [20]   │   │ ◄─ Orders Button
│                    └────────────────┘   │
└─────────────────────────────────────────┘
         ↓ (tap location icon)
         
┌─────────────────────────────────────────┐
│     TRANSPARENT OVERLAY (Fadein)        │ ◄─ Animated backdrop
│         (Tap to close)                  │    Opacity: 0 → 0.4
│                                         │
│    ┌─────────────────────────────────┐  │
│    │ Select Your City           ✕    │  │
│    │                                 │  │
│    │ 🔍 Search cities or states...   │  │
│    │ [X] 🔄                         │  │ ◄─ Search input with clear btn
│    │                                 │  │
│    │ ─────────────────────────────── │  │
│    │                                 │  │
│    │ 📍 Lagos                    ✓   │  │ ◄─ Selected city (with checkmark)
│    │    Oyo                          │  │    Blue/Orange accent
│    │                                 │  │
│    │ 📍 Ibadan                       │  │ ◄─ Other cities
│    │    Oyo                          │  │
│    │                                 │  │
│    │ 📍 Abuja                        │  │ ◄─ Scrollable list
│    │    FCT                          │  │    (max-h-96)
│    │                                 │  │
│    │ ─────────────────────────────── │  │
│    │ ℹ️  Currently in Lagos           │  │ ◄─ Footer info
│    │                                 │  │
│    └─────────────────────────────────┘  │
│              ↑ Slides up                 │    Animation:
│              (from bottom)               │    - Slide: 0 → 400ms
│              Transform Y: 0 → 1          │    - Fade: 0 → 300ms
└─────────────────────────────────────────┘
         ↓ (select city)
         
CITY SAVED TO STORAGE & DISPLAYED ON HOME SCREEN
```

---

## Component Anatomy

### Location Icon Button (Top-Right)

```
    ┌──────────────┐
    │   white bg   │ ← 56×56 circular
    │   shadow     │ ← elevation: 3 (Android)
    │     📍       │ ← Orange map marker (#ffa800)
    │    [✓]       │ ← Checkmark badge (bottom-right)
    │              │    Only shows when city selected
    └──────────────┘
     rounded-full
```

### Selected City Display Bar

```
┌────────────────────────────────────┐
│ 📍 Lagos          ✏️               │ ← Edit pencil
│                                    │
│ Pill-shaped badge:                 │
│ - White background                 │
│ - Shadow-sm                        │
│ - px-4 py-2                        │
│ - Rounded-full                     │
│ - Orange map marker                │
└────────────────────────────────────┘
```

### Modal - Header Section

```
┌─────────────────────────────────┐
│ Select Your City           ✕    │
│                                 │
│ 🔍 Search cities or states...   │ ◄─ 
│ [X] 🔄                         │    Auto-clear button
│                                 │    (only when searching)
└─────────────────────────────────┘
     ↑ Close button (circular)
     bg-neutral-100
```

### Modal - City List Item (Default)

```
┌──────────────────────────────┐
│ 📍 Lagos                      │
│    Oyo                        │
│                               │
│ Styling:                      │
│ - py-4 px-4 mb-2             │
│ - rounded-2xl                │
│ - border-2 border-neutral-100│
│ - active:bg-primary-50       │
│ - Text: neutral-900          │
│ - Subtext: neutral-500       │
└──────────────────────────────┘
```

### Modal - City List Item (Selected)

```
┌──────────────────────────────┐
│ 📍 Lagos                   ✓ │ ◄─ Checkmark circle
│    Oyo                        │    bg-primary (orange)
│                               │
│ Styling:                      │
│ - Same as default             │
│ - Text: primary color         │
│ - Icon: primary color         │
│ - Checkmark: white            │
└──────────────────────────────┘
```

### Modal - Footer Info

```
┌────────────────────────────────┐
│ ℹ️ Currently in Lagos           │
│                                │
│ - bg-primary-50 (light orange) │
│ - Border-top: border-neutral-200
│ - px-6 py-4                    │
│ - flex-row items-center        │
│ - Info icon: primary color     │
│ - Text: neutral-700            │
└────────────────────────────────┘
```

### Modal - Empty State

```
┌────────────────────────────┐
│        py-12               │
│   🗺️ (map search icon)     │
│   No cities found          │
│   Try different keywords   │
│                            │
│ Icon color: neutral-300    │
│ Text: neutral-500          │
│ Subtext: neutral-400       │
└────────────────────────────┘
```

### Modal - Loading State

```
┌────────────────────────────┐
│        py-12               │
│        ⟲ (spinner)        │ ◄─ primary color
│                            │
│    Loading cities...       │
│                            │
│ ActivityIndicator size:lg  │
│ Color: primary (#ffa800)   │
│ Text: neutral-500          │
└────────────────────────────┘
```

---

## Color Palette

```
Primary Colors:
  🟠 Primary: #ffa800         (Orange - main accent)
  🟤 Primary-50: #fffaef      (Light orange - backgrounds)
  ⚪ White: #ffffff           (Backgrounds)

Neutral Grays:
  900: #1F2937  (Darkest - primary text)
  700: #374151  (Dark - secondary text)
  500: #6B7280  (Medium - tertiary text)
  400: #9CA3AF  (Light - placeholders)
  200: #E5E7EB  (Border color)
  100: #F3F4F6  (Light backgrounds, inputs)
  50:  #F9FAFB  (Lightest backgrounds)

States:
  🟢 Success: (using primary for selection)
  🔴 Error/Failed: #DC2626 (if needed)
  ⚪ Inactive: neutral-300 - neutral-500
```

---

## Typography

```
Font Family: Satoshi (custom)

Headings:
  - "Select Your City" → satoshiBold, text-2xl
  - City name → satoshiMedium, text-lg
  - Section titles → satoshiBold

Body Text:
  - State/info → satoshi, text-sm
  - Footer text → satoshi
  - Input placeholder → satoshiMedium (secondary color)
```

---

## Spacing & Sizing

```
Modal Dimensions:
  - Width: Full screen (100%)
  - Height: ~60% of screen (max-h-96 = 384px max)
  - Rounded corners: rounded-t-3xl (top only)

Internal Padding:
  - Header: pt-6 px-6 pb-4
  - List items: py-4 px-4 mb-2
  - Footer: px-6 py-4
  - Icon sizes: 20-28px for icons
  - Button: w-10 h-10 for close button

Gaps:
  - Between elements: mb-2 to mb-4
  - Search input: px-4 py-3
  - Text inside inputs: ml-3
```

---

## Animations

### Modal Entrance
```
Duration: 400ms
Easing: Default (ease)
Effect: Slide up + fade in

slideAnim:
  inputRange: [0, 1]
  outputRange: [screenHeight, 0]   ← Moves from bottom to top

fadeAnim:
  inputRange: [0, 1]
  outputRange: [0, 1]              ← Fades in
  Duration: 300ms (faster than slide)
```

### Modal Exit
```
Duration: 300ms
Effect: Slide down + fade out
```

### Interactive Pressable States
```
Default:
  - bg-white
  - border-2 border-neutral-100
  - Rounded-2xl

Active (pressed):
  - bg-primary-50
  - Subtle background highlight
  - No scale transform (keeps size consistent)
```

---

## Responsive Behavior

### Mobile (Default)
- Full width modal
- Full height scroll area
- Touch-friendly sizes (min 44px tap targets)

### Landscape
- Same layout (modal still bottom sheet style)
- Scroll may need manual control

### Accessibility
- Proper contrast ratios (WCAG AA)
- Touch target sizes ≥ 44x44px
- Semantic color meaning (checkmark = selected)
- Clear visual feedback on interactions

---

## States Reference

### Location Icon States

```
Default (No city selected):
┌────┐
│ 📍 │  Orange icon
│    │  No checkmark
└────┘

Selected (City chosen):
┌────┐
│ 📍 │  Orange icon
│[✓] │  White checkmark
└────┘

Loading:
┌────┐
│ ⟲  │  Spinner
│    │  Or full modal
└────┘
```

### Modal States

```
Loading:        Show spinner + "Loading cities..."
Empty Results:  Show icon + "No cities found"
With Results:   Show list with filters applied
No Search:      Show all cities
Selected:       Show checkmark on selected city
```

---

## Design System Integration

The Location Picker follows your app's design system:

✅ Uses Satoshi font (already configured)
✅ Uses NativeWind/Tailwind classes (already set up)
✅ Orange primary color (#ffa800) matches app
✅ Neutral color palette matches design
✅ Shadow system consistent
✅ Border radius follows 2xl, 3xl pattern
✅ Icon library (MaterialCommunityIcons) matches app
✅ Spacing scale (4px units) is consistent

This makes it feel native to your app! 🎨
