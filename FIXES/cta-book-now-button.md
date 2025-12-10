# CTA Component - Conditional Button Based on Login Status

## Changes Made

Updated the CTA component to show different buttons based on user login status:
- **Logged In**: Shows "Book Now" button that navigates to `/bookAppointment`
- **Not Logged In**: Shows "Register Now" button that navigates to `/register`

## Implementation Details

### 1. Added User Authentication Check
```typescript
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";

const user = useReactiveVar(userVar);
const isLoggedIn = user?._id && user._id !== '';
```

### 2. Conditional Rendering
- Uses `isLoggedIn` to determine which button to show
- If logged in: Shows "Book Now" button with link to `/bookAppointment`
- If not logged in: Shows "Register Now" button with link to `/register`

### 3. Button Text Changes
- **Logged In**: "Book Now - Schedule Your Appointment"
- **Not Logged In**: "Register Now - It's Free" (original text)

## Files to Update

Replace the content of `/libs/components/homepage/cta.tsx` with the code from `FIXES/cta-book-now-button.tsx`

## Features

- ✅ Checks user login status using `userVar` reactive variable
- ✅ Conditionally renders appropriate button
- ✅ Maintains same styling and SVG icons
- ✅ Proper navigation to booking page for logged-in users
- ✅ Maintains registration flow for non-logged-in users

## Testing

1. **Not Logged In**: Should see "Register Now - It's Free" button
2. **Logged In**: Should see "Book Now - Schedule Your Appointment" button
3. Clicking "Book Now" should navigate to `/bookAppointment` page
4. Clicking "Register Now" should navigate to `/register` page

