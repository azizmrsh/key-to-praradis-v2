# 📓 Journal Entry System – Microservice Specification (Keys to Paradise App)

**Module Name:** `journalManager`

## 🧠 Purpose
Create a unified journaling microservice that handles journal entries across the entire app, including entries from:

- Primary/Secondary sin categories
- Goals and challenges
- Lessons and reflections
- Daily check-ins
- Standalone user notes (My Journal)

This system supports structured input, tagging, mood selection, origin tracking, and basic filtering/sorting.

---

## ✅ Features to Implement

### 1. `addJournalEntry(entryData)`
Accepts a structured object:

```ts
{
  id: string,                    // Auto-generated UUID
  content: string,               // Journal text
  emotion: string,               // Selected emotion (from list or custom)
  area: "Primary" | "Secondary" | "Misc",
  origin: "Goal" | "Challenge" | "Lesson" | "CheckIn" | "Manual",
  origin_id: string | null,     // ID of the linked item
  created_at: string,           // ISO timestamp
  updated_at: string            // ISO timestamp (for edits)
}
```

### 2. `editJournalEntry(entryId, updatedContent)`
- Edits any journal entry unless it’s linked to a **completed goal or challenge** (immutable).
- If locked: return `{ success: false, reason: "Locked" }`.

### 3. `getAllEntries(filters?: { area?: string, emotion?: string, origin?: string })`
- Returns entries filtered by area, emotion, or origin.
- Sorted by `created_at` (newest first).

### 4. `deleteJournalEntry(entryId)`
- Deletes the specified journal entry.

### 5. `getAvailableEmotions()`
- Returns fixed + user-defined emotion labels.
- Custom labels are managed in the app’s Settings page.

### 6. `lockEntriesLinkedToCompletedItems(goalId | challengeId)`
- Locks all journal entries linked to completed goals/challenges.

---

## 📁 Storage & Data Model

Store entries in encrypted local storage under:

```ts
localStorage.journal_entries = JSON.stringify([...])
```

---

## 📄 UI Expectations

### My Journal Page
- Display: content, emotion, area, origin, edit/delete buttons.
- Edit is disabled if entry is locked.

### Add Journal Entry Modal
- Input fields: Area, Emotion, Text, (optional Origin ID).

### Settings Page
- Interface to add/remove custom emotion tags.

---

## 🚫 DO NOT

- ❌ Modify how goals, challenges, check-ins, or lessons function.
- ❌ Refactor or override other microservices.
- ❌ Add server-based storage – use **local-only**.
- ❌ Add image, audio, or video – text only.
- ❌ Add sync or cloud features.

---

## 🔒 Privacy First
All journal data must stay local to the user’s device.