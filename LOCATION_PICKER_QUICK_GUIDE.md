# Location Picker - Quick Start Guide

## What Was Built

A complete location/city selection feature with a modern, animated UI that allows users to:
- ✅ Select their city from a server-fetched dropdown
- ✅ Save selection to persistent async storage
- ✅ View selected city on home screen
- ✅ Update city anytime

---

## File Structure

```
📁 Created Files:
├── storage/city.ts                           # City storage operations
├── hooks/useSelectedCity.ts                  # Custom hook for city state
├── components/home/LocationPickerModal.tsx   # Modal component
└── components/home/CityBadge.tsx            # Reusable city badge

📝 Modified Files:
├── storage/keys.ts                          # Added SELECTED_CITY key
├── app/users/(tabs)/index.tsx               # Integrated location picker
```

---

## How to Use

### 1. **On Home Screen (Already Implemented)**
```typescript
import { useSelectedCity } from "@/hooks/useSelectedCity";
import LocationPickerModal from "@/components/home/LocationPickerModal";

const { selectedCity, updateCity } = useSelectedCity();
const [locationModalVisible, setLocationModalVisible] = useState(false);

// Location icon opens modal
// Selected city displays with edit option
```

### 2. **Use in Other Screens**
```typescript
import { useSelectedCity } from "@/hooks/useSelectedCity";
import CityBadge from "@/components/home/CityBadge";

export function MyComponent() {
  const { selectedCity } = useSelectedCity();
  
  return <CityBadge city={selectedCity} />;
}
```

### 3. **Get City Data**
```typescript
import { getSelectedCity } from "@/storage/city";

const city = await getSelectedCity();
console.log(city?.name); // "Lagos"
```

---

## Component API

### `useSelectedCity()` Hook
```typescript
const {
  selectedCity,      // KitchenCity | null
  isLoading,         // boolean - initial load state
  updateCity,        // (city: KitchenCity) => Promise<void>
  removeCity,        // () => Promise<void>
  loadCity,          // () => Promise<void>
} = useSelectedCity();
```

### `LocationPickerModal` Component
```typescript
<LocationPickerModal
  visible={boolean}
  onClose={() => void}
  onCitySelect={(city: KitchenCity) => void}
  selectedCity={KitchenCity | null}
/>
```

### `CityBadge` Component
```typescript
<CityBadge
  city={KitchenCity | null}
  onPress={() => void}           // Optional - for edit action
  size="sm" | "md" | "lg"        // Default: "md"
  showState={boolean}            // Show state/province. Default: true
/>
```

---

## Features Breakdown

### 🎨 **Design**
- Modern bottom sheet with rounded corners
- Smooth slide-up animation
- Fade overlay backdrop
- Material Design icons
- Orange accent color (#ffa800) matching app theme

### 🔍 **Search**
- Real-time filtering as user types
- Search by city name OR state
- Clear button to reset search
- "No results" state with helpful message

### 💾 **Storage**
- Uses AsyncStorage (already set up)
- Automatic save on selection
- Persists across app restarts
- Type-safe with TypeScript

### 🎯 **UX**
- Selection indicator with checkmark
- City info displayed on home screen
- Quick edit button for convenience
- Loading state while fetching cities
- Helpful footer with current selection

---

## Redux Integration

The feature uses existing Redux setup:

```typescript
// Fetches cities from API
dispatch(fetchKitchenCities());

// Selectors for UI
selectCities        // Array of KitchenCity[]
selectCitiesStatus  // "idle" | "loading" | "succeeded" | "failed"
```

No new Redux slices were needed - just used existing kitchen slice!

---

## How to Customize

### Change Primary Color
The component uses `bg-primary` and `text-primary` classes.
Update your tailwind config to change the orange (#ffa800).

### Adjust Modal Height
In `LocationPickerModal.tsx`, modify the `max-h-96` class:
```typescript
<ScrollView className="max-h-96">  // Change 96 to other values
```

### Change Animation Speed
Modify duration values in `LocationPickerModal.tsx`:
```typescript
Animated.timing(fadeAnim, {
  duration: 300,  // Adjust this (milliseconds)
  useNativeDriver: true,
})
```

### Add More City Info
Extend `KitchenCity` type or display additional fields:
```typescript
<Text>{city.state}</Text>          // Already shown
<Text>{city.created_at}</Text>     // Add if needed
```

---

## Testing Checklist

- [ ] Location icon appears in top-right
- [ ] Tapping icon opens modal with animation
- [ ] Cities load from API
- [ ] Search filters cities correctly
- [ ] Can select a city
- [ ] Selected city persists after app restart
- [ ] City displays on home screen
- [ ] Edit button opens modal again
- [ ] Can update to different city
- [ ] Modal closes after selection

---

## Performance Notes

✅ **Optimized:**
- Uses `useMemo` for selector functions
- Filtered cities calculated only when search changes
- Animations use native driver for smooth 60fps
- AsyncStorage operations are async (non-blocking)

---

## Troubleshooting

**Modal doesn't appear?**
- Ensure `LocationPickerModal` is within SafeAreaView
- Check that `visible` state is being set to true

**Cities not loading?**
- Verify `fetchKitchenCities` API endpoint works
- Check Redux devtools for thunk status
- Ensure kitchen slice is initialized

**City not persisting?**
- Check AsyncStorage permissions in app.json
- Verify `getSelectedCity()` is called on app startup
- Use `useSelectedCity` hook instead of manual storage access

**Search not working?**
- Ensure TextInput is properly connected to `searchQuery` state
- Check that cities data exists before filtering

---

## Next Steps (Optional Enhancements)

1. **Add city auto-detection** using geolocation
2. **Cache cities** in Redux to avoid repeated API calls
3. **Add favorite cities** for quick switching
4. **Show city-specific offers** after selection
5. **Add delivery zones** based on selected city
6. **Sync with user profile** - save city to backend

---

## Support Files

- **Docs:** `LOCATION_PICKER_FEATURE.md`
- **Examples:** This file
- **Component source:** `LocationPickerModal.tsx`, `CityBadge.tsx`
- **Hook source:** `useSelectedCity.ts`
