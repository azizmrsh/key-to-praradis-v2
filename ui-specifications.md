# Keys to Paradise - UI Specifications Document

## Table of Contents
1. [Design System](#design-system)
2. [Component Specifications](#component-specifications)
3. [Page Layouts](#page-layouts)
4. [Interactive Elements](#interactive-elements)
5. [Data Visualization](#data-visualization)
6. [Mobile Responsiveness](#mobile-responsiveness)
7. [Arabic/RTL Support](#arabic-rtl-support)
8. [Performance Requirements](#performance-requirements)

---

## Design System

### Color Palette
```scss
// Primary Colors
$primary-green: #22c55e;
$primary-blue: #3b82f6;
$primary-purple: #8b5cf6;

// Secondary Colors
$secondary-gold: #f59e0b;
$secondary-red: #ef4444;
$secondary-gray: #6b7280;

// Background Colors
$bg-primary: #ffffff;
$bg-secondary: #f8fafc;
$bg-tertiary: #f1f5f9;
$bg-dark: #1e293b;

// Text Colors
$text-primary: #1e293b;
$text-secondary: #475569;
$text-muted: #64748b;
$text-light: #94a3b8;

// Status Colors
$success: #10b981;
$warning: #f59e0b;
$error: #ef4444;
$info: #3b82f6;

// Islamic Theme Colors
$islamic-green: #2d5a27;
$islamic-gold: #d4af37;
$islamic-cream: #faf8f3;
```

### Typography
```scss
// Font Families
$font-primary: 'Inter', sans-serif;
$font-arabic: 'Sakkal', 'Amiri', serif;
$font-heading: 'Poppins', sans-serif;

// Font Weights
$font-light: 300;
$font-regular: 400;
$font-medium: 500;
$font-semibold: 600;
$font-bold: 700;

// Font Sizes
$text-xs: 0.75rem;    // 12px
$text-sm: 0.875rem;   // 14px
$text-base: 1rem;     // 16px
$text-lg: 1.125rem;   // 18px
$text-xl: 1.25rem;    // 20px
$text-2xl: 1.5rem;    // 24px
$text-3xl: 1.875rem;  // 30px
$text-4xl: 2.25rem;   // 36px
```

### Spacing System
```scss
// Spacing Scale (rem)
$space-1: 0.25rem;    // 4px
$space-2: 0.5rem;     // 8px
$space-3: 0.75rem;    // 12px
$space-4: 1rem;       // 16px
$space-5: 1.25rem;    // 20px
$space-6: 1.5rem;     // 24px
$space-8: 2rem;       // 32px
$space-10: 2.5rem;    // 40px
$space-12: 3rem;      // 48px
$space-16: 4rem;      // 64px
$space-20: 5rem;      // 80px
```

### Border Radius
```scss
$radius-sm: 0.125rem;  // 2px
$radius-md: 0.375rem;  // 6px
$radius-lg: 0.5rem;    // 8px
$radius-xl: 0.75rem;   // 12px
$radius-2xl: 1rem;     // 16px
$radius-full: 9999px;  // Full circle
```

---

## Component Specifications

### 1. Assessment Header Component
```typescript
interface AssessmentHeaderProps {
  title: string;
  subtitle?: string;
  progress?: number; // 0-100
  showLogo?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  variant?: 'default' | 'compact';
}
```

**Visual Requirements:**
- Full-width colored header with gradient background
- Logo positioned on the left (if enabled)
- Title: font-semibold, text-xl
- Subtitle: font-regular, text-sm, opacity-70
- Progress bar: thin line at bottom, animated
- Back button: left-aligned, icon + text
- Right action: right-aligned, flexible content

### 2. Goal Card Component
```typescript
interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    description: string;
    category: SinCategory;
    duration: number;
    progress: number;
    isActive: boolean;
    completionDates: string[];
    streak: number;
  };
  onStart: (goalId: string, duration: number) => void;
  onComplete: (goalId: string) => void;
  onView: (goalId: string) => void;
  variant?: 'default' | 'compact' | 'featured';
}
```

**Visual Requirements:**
- Card shadow: subtle, elevation-2
- Category indicator: colored left border (4px width)
- Progress visualization: circular progress or linear bar
- Action buttons: primary action prominent, secondary subtle
- Islamic guidance: expandable section with green background
- Streak indicator: fire icon with count
- Completion status: checkmark or trophy icon

### 3. Progress Chart Component
```typescript
interface ProgressChartProps {
  data: Array<{
    date: string;
    score: number;
    category: SinCategory;
  }>;
  type: 'line' | 'bar' | 'area';
  timeRange: 'week' | 'month' | 'quarter';
  categories?: SinCategory[];
  showTrend?: boolean;
  height?: number;
}
```

**Visual Requirements:**
- Responsive design: adapts to container width
- Color coding: each category has distinct color
- Grid lines: subtle, non-intrusive
- Tooltips: detailed information on hover/touch
- Trend lines: dotted lines for trend direction
- Legend: toggleable category visibility
- Animation: smooth transitions and loading states

### 4. Achievement Badge Component
```typescript
interface AchievementBadgeProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    tier: 'bronze' | 'silver' | 'gold' | 'sincere';
    progress: number;
    isUnlocked: boolean;
    unlockedAt?: Date;
  };
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  onClick?: () => void;
}
```

**Visual Requirements:**
- Tier-based styling: bronze, silver, gold, sincere (purple)
- Unlock animation: celebratory effect when unlocked
- Progress indicator: circular progress around badge
- Grayscale when locked, full color when unlocked
- Size variants: 40px, 60px, 80px
- Hover effects: subtle scale and shadow changes

### 5. Daily Challenge Card Component
```typescript
interface DailyChallengeProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    dailyAction: string;
    isCompleted: boolean;
    completionDate?: Date;
    streak: number;
    category: SinCategory;
  };
  onComplete: (challengeId: string, note?: string) => void;
  onAddNote: (challengeId: string, note: string) => void;
}
```

**Visual Requirements:**
- Card layout: clean, modern design
- Completion state: visual feedback (checkmark, green border)
- Action button: prominent, changes based on completion
- Note input: expandable text area
- Streak visualization: flame icon with count
- Category badge: small, colored indicator
- Islamic guidance: collapsible section

---

## Page Layouts

### 1. Dashboard Layout
```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  headerTitle?: string;
  showNavigation?: boolean;
  backgroundColor?: string;
}
```

**Layout Structure:**
```
┌─────────────────────────────────────┐
│           Header (60px)             │
├─────────────────────────────────────┤
│                                     │
│         Main Content Area           │
│         (scroll container)          │
│                                     │
│                                     │
├─────────────────────────────────────┤
│      Bottom Navigation (80px)       │
└─────────────────────────────────────┘
```

### 2. Assessment Layout
```typescript
interface AssessmentLayoutProps {
  children: React.ReactNode;
  currentQuestion: number;
  totalQuestions: number;
  onBack?: () => void;
  onNext?: () => void;
  canProceed?: boolean;
}
```

**Layout Structure:**
```
┌─────────────────────────────────────┐
│      Assessment Header (80px)       │
│      [Progress Bar]                 │
├─────────────────────────────────────┤
│                                     │
│        Question Content             │
│        (centered, max-width)        │
│                                     │
├─────────────────────────────────────┤
│     Navigation Controls (60px)      │
│     [Back]           [Next]         │
└─────────────────────────────────────┘
```

### 3. Goal Management Layout
```typescript
interface GoalLayoutProps {
  children: React.ReactNode;
  activeGoals: Goal[];
  completedGoals: Goal[];
  showFilters?: boolean;
  showSearch?: boolean;
}
```

**Layout Structure:**
```
┌─────────────────────────────────────┐
│        Header + Search (60px)       │
├─────────────────────────────────────┤
│        Filter Tabs (40px)           │
├─────────────────────────────────────┤
│                                     │
│          Goal Cards Grid            │
│          (responsive)               │
│                                     │
├─────────────────────────────────────┤
│      Bottom Navigation (80px)       │
└─────────────────────────────────────┘
```

---

## Interactive Elements

### 1. Button Specifications
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}
```

**Visual Requirements:**
- Primary: solid color, white text, subtle shadow
- Secondary: lighter background, darker text
- Outline: transparent background, colored border
- Ghost: transparent background, colored text
- Loading state: spinner animation, disabled appearance
- Hover effects: subtle color and shadow changes
- Focus states: clear outline for accessibility

### 2. Input Field Specifications
```typescript
interface InputFieldProps {
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  rtl?: boolean;
}
```

**Visual Requirements:**
- Label: positioned above input, font-medium
- Input: rounded corners, subtle border, focus ring
- Error state: red border, error message below
- Icon: positioned left (or right for RTL)
- Placeholder: light gray text
- Disabled state: reduced opacity, cursor-not-allowed

### 3. Modal Specifications
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  showCloseButton?: boolean;
  preventClose?: boolean;
}
```

**Visual Requirements:**
- Overlay: semi-transparent dark background
- Modal: centered, rounded corners, shadow
- Animation: fade in/out, slide up from bottom on mobile
- Close button: top-right corner, accessible
- Responsive: full-screen on mobile, centered on desktop
- Scrollable: content area scrolls if needed

---

## Data Visualization

### 1. Progress Ring Chart
```typescript
interface ProgressRingProps {
  value: number; // 0-100
  size: number; // diameter in pixels
  strokeWidth: number;
  color: string;
  backgroundColor?: string;
  showValue?: boolean;
  animated?: boolean;
}
```

**Visual Requirements:**
- Circular SVG-based progress indicator
- Smooth animation when value changes
- Customizable colors and sizes
- Optional value display in center
- Accessibility: proper ARIA labels

### 2. Category Comparison Chart
```typescript
interface CategoryChartProps {
  data: Array<{
    category: SinCategory;
    score: number;
    improvement: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  type: 'radar' | 'bar' | 'horizontal-bar';
  height?: number;
  showLegend?: boolean;
}
```

**Visual Requirements:**
- Responsive design: adapts to container
- Category color coding: consistent across app
- Trend indicators: arrows or symbols
- Interactive elements: hover states, tooltips
- Animation: smooth transitions between data updates

### 3. Streak Visualization
```typescript
interface StreakVisualizationProps {
  streakData: Array<{
    date: string;
    completed: boolean;
    category: SinCategory;
  }>;
  period: 'week' | 'month' | 'year';
  showTooltips?: boolean;
}
```

**Visual Requirements:**
- Calendar-style grid layout
- Color coding: completed vs missed days
- Hover tooltips: detailed information
- Responsive: adapts to screen size
- Current day highlight: special styling

---

## Mobile Responsiveness

### Breakpoint System
```scss
// Mobile-first approach
$mobile: 320px;
$tablet: 768px;
$desktop: 1024px;
$large: 1200px;
$xl: 1440px;
```

### Mobile-Specific Requirements

#### 1. Touch Targets
- Minimum size: 44px x 44px
- Spacing: 8px minimum between interactive elements
- Gesture support: swipe, pinch, tap, long press

#### 2. Navigation
- Bottom navigation: fixed position, 80px height
- Tab bar: minimum 48px height for each tab
- Burger menu: collapsible side drawer

#### 3. Content Adaptation
- Single column layout on mobile
- Larger text sizes: minimum 16px for body text
- Reduced padding: 16px margins instead of 24px
- Sticky headers: remain visible during scroll

#### 4. Performance
- Image optimization: responsive images, lazy loading
- Animation performance: 60fps, hardware acceleration
- Bundle size: code splitting, dynamic imports

---

## Arabic/RTL Support

### 1. Layout Direction
```scss
// RTL support
.rtl {
  direction: rtl;
  text-align: right;
  
  // Flip margins and padding
  margin-left: auto;
  margin-right: 0;
  
  // Flip positioning
  left: auto;
  right: 0;
}
```

### 2. Arabic Typography
```scss
// Arabic font styling
.arabic-text {
  font-family: 'Sakkal', 'Amiri', serif;
  line-height: 1.8;
  letter-spacing: 0.02em;
  
  // Different font weights
  &.light { font-weight: 300; }
  &.regular { font-weight: 400; }
  &.medium { font-weight: 500; }
  &.semibold { font-weight: 600; }
  &.bold { font-weight: 700; }
}
```

### 3. Bilingual Components
```typescript
interface BilingualTextProps {
  englishText: string;
  arabicText: string;
  currentLanguage: 'en' | 'ar' | 'fr';
  showBoth?: boolean;
  arabicFirst?: boolean;
}
```

**Visual Requirements:**
- Proper text direction for each language
- Appropriate fonts for each script
- Consistent spacing and alignment
- Smooth language switching animations

---

## Performance Requirements

### 1. Loading Performance
- Initial page load: < 2 seconds
- Route transitions: < 500ms
- Image loading: progressive, optimized formats
- Bundle size: < 1MB initial, < 500KB per route

### 2. Runtime Performance
- Animations: 60fps, hardware-accelerated
- Scroll performance: smooth, no jank
- Memory usage: efficient cleanup, no leaks
- Database queries: optimized, indexed

### 3. Offline Functionality
- Service worker: cache critical resources
- Data persistence: local storage, IndexedDB
- Offline indicators: clear user feedback
- Sync capabilities: background sync when online

### 4. Accessibility
- WCAG 2.1 AA compliance
- Screen reader support: proper ARIA labels
- Keyboard navigation: full functionality
- Color contrast: minimum 4.5:1 ratio
- Focus indicators: clear, visible

---

## Implementation Notes

### 1. Component Library
- Use shadcn/ui as base component system
- Extend with custom Islamic-themed components
- Consistent prop interfaces across components
- Proper TypeScript typing for all props

### 2. State Management
- Zustand for global state management
- React Query for server state
- Local storage for persistence
- Optimistic updates for better UX

### 3. Testing Strategy
- Unit tests: Jest + React Testing Library
- Integration tests: Cypress or Playwright
- Visual regression tests: Chromatic
- Performance tests: Lighthouse CI

### 4. Deployment Considerations
- Progressive Web App (PWA) capabilities
- Service worker for offline functionality
- CDN optimization for static assets
- Performance monitoring and error tracking

---

## Developer Integration Guide

### 1. Setup Instructions
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

### 2. Code Organization
```
src/
├── components/
│   ├── ui/           # Base UI components
│   ├── assessment/   # Assessment-specific components
│   ├── goals/        # Goal management components
│   ├── charts/       # Data visualization components
│   └── layout/       # Layout components
├── pages/            # Page components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and services
├── contexts/         # React contexts
├── types/            # TypeScript type definitions
└── assets/           # Static assets
```

### 3. Styling Guidelines
- Use Tailwind CSS for utility classes
- Create custom CSS for complex components
- Follow BEM methodology for class naming
- Use CSS variables for theme customization

### 4. Best Practices
- Component composition over inheritance
- Proper error boundaries and error handling
- Consistent naming conventions
- Performance optimization strategies
- Accessibility best practices

---

This UI specification document provides comprehensive guidelines for implementing the Keys to Paradise application interface. All components should follow these specifications to ensure consistency, accessibility, and optimal user experience across all devices and languages.