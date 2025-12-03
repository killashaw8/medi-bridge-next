# Chat Component Color Mapping

## Color Changes from WebSocket Chat to AI Assistant

### Old Colors (WebSocket Chat)
- Button: `#fff` (white)
- Chat Frame: `rgb(233, 243, 255)` (light blue)
- Top Header: Default (no background)
- Welcome Message: `#9fa7ac` (gray)
- AI/Other Messages: `#3c96cf` (blue)
- User Messages: `#d0ece8` (light green)
- Input Background: `#f7f7f7` (light gray)
- Send Button: `#33c1c1` (teal)

### New Colors (AI Assistant - Project Variables)
- Button: `$whiteColor` → `$primary` on hover
- Chat Frame: `$whiteColor`
- Top Header: `$primary` gradient
- Welcome Message: `$bodyTextColor` (#5A6A85)
- AI Messages: `$primary` (#336AEA)
- User Messages: `$secondaryColor` (#10B981)
- Input Background: `$white-smokeColor` (#F5F5F5)
- Input Border: `$dawn-pinkColor` (#EBEBEB)
- Send Button: `$primary` (#336AEA)

## Visual Improvements
1. **Consistent Branding**: All colors now use project variables
2. **Better Contrast**: Primary color for AI, secondary for user messages
3. **Modern Look**: Gradient header, rounded corners, shadows
4. **Accessibility**: Better color contrast ratios

