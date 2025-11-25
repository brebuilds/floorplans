# Quick Fixes & Improvements

## 🚨 Critical Fixes (Do These First)

### 1. Remove Page Reloads
**File**: `components/BackgroundImageUpload.tsx`
**Issue**: Uses `window.location.reload()` which loses user state
**Fix**: Update canvas state directly instead

```typescript
// Instead of:
window.location.reload();

// Do:
// Trigger canvas refresh through state update
// Or use a callback to reload canvas
```

### 2. Add Dark Mode Toggle
**Files**: 
- `components/ThemeToggle.tsx` (new)
- `app/layout.tsx` (update)
- `app/globals.css` (update)

**Implementation**: Add theme context and toggle button

### 3. Fix Furniture Prop Naming
**File**: `components/DrawingCanvas.tsx`
**Issue**: `onFurnitureSelect` is misleading (receives object, not callback)
**Fix**: Rename to `selectedFurniture` or `furnitureToPlace`

## ⚡ Quick Wins (High Impact, Low Effort)

### 1. Add Room Area Calculation
**File**: `components/MetadataPanel.tsx`
**Effort**: 2-3 hours
**Impact**: High - Users want to see room sizes

### 2. Add Project Export/Import
**Files**: 
- `components/ProjectSelector.tsx` (add buttons)
- `lib/utils/projectExport.ts` (new)
**Effort**: 3-4 hours
**Impact**: High - Backup/restore functionality

### 3. Add Loading Skeletons
**Files**: Multiple components
**Effort**: 2-3 hours
**Impact**: Medium - Better perceived performance

### 4. Add Dark Mode Toggle
**Effort**: 2-3 hours
**Impact**: High - Many users prefer dark mode

### 5. Improve Empty States
**Files**: `ProjectSelector.tsx`, `BuildingView.tsx`
**Effort**: 1-2 hours
**Impact**: Medium - Better first-time experience

## 🎨 Design Improvements

### 1. Add Focus Indicators
**Files**: All button components
**Effort**: 1 hour
**Impact**: Medium - Better accessibility

### 2. Add Hover States
**Files**: All interactive elements
**Effort**: 1-2 hours
**Impact**: Low - Polish

### 3. Improve Color Contrast
**Files**: `app/globals.css`, components
**Effort**: 2 hours
**Impact**: Medium - Accessibility compliance

## 📱 Mobile Improvements

### 1. Responsive Toolbar
**File**: `components/FloorplanEditor.tsx`
**Effort**: 3-4 hours
**Impact**: High - Mobile usability

### 2. Touch-Friendly Tools
**File**: `components/DrawingCanvas.tsx`
**Effort**: 4-6 hours
**Impact**: High - Mobile drawing

### 3. Mobile Navigation
**File**: All components
**Effort**: 2-3 hours
**Impact**: Medium - Better mobile UX

## 🔧 Technical Improvements

### 1. Add Error Boundaries
**Files**: 
- `components/ErrorBoundary.tsx` (new)
- Wrap major components
**Effort**: 2-3 hours
**Impact**: High - Better error handling

### 2. Optimize Re-renders
**Files**: `store/useStore.ts`, components
**Effort**: 3-4 hours
**Impact**: Medium - Performance

### 3. Add TypeScript Strict Mode
**Files**: `tsconfig.json`
**Effort**: 4-6 hours
**Impact**: Medium - Code quality

## 📋 Feature Additions

### 1. Manual Building Tracing
**Effort**: 6-8 hours
**Impact**: High - Core feature from spec

### 2. Print Preview
**Effort**: 4-6 hours
**Impact**: Medium - Better export UX

### 3. Version History UI
**Effort**: 6-8 hours
**Impact**: Medium - Useful feature

### 4. Room Templates
**Effort**: 8-10 hours
**Impact**: Low - Nice to have

## 🎯 Recommended Order

1. **Week 1**: Critical fixes (reloads, dark mode, prop naming)
2. **Week 2**: Quick wins (room area, export/import, skeletons)
3. **Week 3**: Mobile improvements
4. **Week 4**: Feature additions (tracing, print preview)

## 💡 Implementation Tips

- Start with critical fixes - they affect all users
- Do quick wins in parallel - they're independent
- Test mobile improvements on real devices
- Get user feedback before major feature additions

