# AI Assistant Chat Integration Guide

## Overview
This guide explains how to integrate the AI Assistant functionality into the existing Chat.tsx component, replacing WebSocket-based chat with GraphQL AI Assistant API.

## Changes Summary

### 1. **Removed WebSocket Functionality**
- Removed `socketVar` dependency
- Removed WebSocket message handlers
- Removed `onlineUsers` state (not needed for AI)

### 2. **Added GraphQL AI Integration**
- Added `useMutation` hook for `ASK_AI`
- Added message state management for AI conversations
- Added user context extraction (userId, role, lang, etc.)

### 3. **Updated Message Structure**
- Changed from `MessagePayload` (WebSocket) to `Message` (AI)
- Simplified to `{ id, text, isUser, timestamp }`
- Removed `memberData` dependency

### 4. **Updated Colors**
- Changed to use project color variables
- Primary color: `$primary` (#336AEA)
- Secondary color: `$secondaryColor` (#10B981)
- Background: `$whiteColor`, `$white-smokeColor`
- Text: `$blackColor`, `$bodyTextColor`

## Implementation Steps

### Step 1: Update Chat.tsx Component
**File:** `libs/components/Chat.tsx`

Replace the entire file with the code from `FIXES/Chat-AI-Integration.tsx`

**Key Changes:**
- Import `useMutation` and `ASK_AI` mutation
- Import `AskAiInput`, `AskAiResponse` types
- Remove WebSocket-related imports and code
- Update message handling to use GraphQL mutation
- Add loading states for AI responses
- Update UI to show AI avatar with SmartToyIcon

### Step 2: Update CSS Colors
**File:** `styles/style.scss`

Replace the `.chatting` section (lines 6325-6452) with the CSS from `FIXES/chat-ai-colors-scss.scss`

**Key Color Updates:**
- Button: Uses `$primary` color
- Chat frame: `$whiteColor` background
- Top header: Gradient with `$primary`
- User messages: `$secondaryColor` background
- AI messages: `$primary` background
- Input: `$white-smokeColor` background
- Send button: `$primary` background

### Step 3: Create TypeScript Types (if not exists)
**File:** `libs/types/ai-assistant/ai-assistant.input.ts`

```typescript
export interface AskAiContextInput {
  userId?: string;
  role?: 'USER' | 'DOCTOR' | 'CLINIC' | 'ADMIN';
  lang?: 'en' | 'ko' | 'ru' | 'uz';
  clientId?: string;
  clinicId?: string;
  doctorId?: string;
  appointmentId?: string;
}

export interface AskAiInput {
  message: string;
  context?: AskAiContextInput;
}

export interface AskAiResponse {
  reply: string;
}
```

## Color Mapping

### Old Colors → New Colors (Project Variables)

| Element | Old Color | New Color Variable | Hex Value |
|---------|-----------|-------------------|-----------|
| Button | `#fff` | `$whiteColor` | `#ffffff` |
| Button Hover | `#fff` | `$primary` | `#336AEA` |
| Chat Frame | `rgb(233, 243, 255)` | `$whiteColor` | `#ffffff` |
| Top Header | Default | `$primary` gradient | `#336AEA` |
| Welcome Message | `#9fa7ac` | `$bodyTextColor` | `#5A6A85` |
| AI Messages | `#3c96cf` | `$primary` | `#336AEA` |
| User Messages | `#d0ece8` | `$secondaryColor` | `#10B981` |
| Input Background | `#f7f7f7` | `$white-smokeColor` | `#F5F5F5` |
| Input Border | Default | `$dawn-pinkColor` | `#EBEBEB` |
| Send Button | `#33c1c1` | `$primary` | `#336AEA` |

## Features

### ✅ Implemented
- GraphQL AI Assistant integration
- User context extraction (role, language, etc.)
- Loading states during AI processing
- Error handling with user-friendly messages
- Daily limit error handling
- Responsive design
- Project color scheme integration

### 🎨 UI Improvements
- AI avatar with SmartToyIcon
- Gradient header with primary color
- Consistent message bubbles
- Smooth transitions
- Disabled states for input/button during loading
- Loading spinner in AI messages

## Testing Checklist

- [ ] AI Assistant opens/closes correctly
- [ ] Messages send and receive properly
- [ ] Loading state shows during AI processing
- [ ] Error messages display correctly
- [ ] Daily limit error handled gracefully
- [ ] User context is passed correctly
- [ ] Colors match project theme
- [ ] Responsive design works on mobile
- [ ] Input disabled during loading
- [ ] Enter key submits message

## Troubleshooting

### Issue: "Daily AI limit reached" error
**Solution:** User has exceeded 5 requests per day. Error message is shown automatically.

### Issue: AI responses not appearing
**Check:**
1. GraphQL mutation is working
2. Backend API is responding
3. Console for errors
4. Network tab for GraphQL requests

### Issue: Colors not updating
**Solution:** Ensure CSS is updated in `style.scss` and variables are imported correctly.

### Issue: Types not found
**Solution:** Create `libs/types/ai-assistant/ai-assistant.input.ts` with the types provided above.

## Files Modified

1. `libs/components/Chat.tsx` - Complete rewrite with AI integration
2. `styles/style.scss` - Updated `.chatting` section with new colors
3. `libs/types/ai-assistant/ai-assistant.input.ts` - Type definitions (if needed)

## Notes

- The component name remains `Ask_AI` for backward compatibility
- WebSocket functionality is completely removed
- All colors now use project variables for consistency
- The component is fully responsive and works on mobile devices

