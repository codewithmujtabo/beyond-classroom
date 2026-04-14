# Sprint 2 — Delivery Plan

**Branch:** `feat/sprint-2`
**Goal:** Payment end-to-end, file upload pipeline, enhanced profile management

---

## Sprint 2 Changes (In Progress)

### ✅ **Completed** (from previous session)

#### Track A: Payment End-to-End
- [x] Midtrans webhook with signature verification
- [x] Payment status auto-updates (settlement/pending/failed)
- [x] Idempotency (reuse pending Snap tokens)
- [x] Deep-link return handling (`beyondclassroom://` scheme)
- [x] Payment result screens (success/pending/failed/cancelled/error)
- [x] Database migration: `snap_token`, `order_id` columns

#### Track B: File Upload Pipeline
- [x] Document vault file upload (multer + local filesystem)
- [x] Storage service abstraction (ready for S3 migration)
- [x] 10MB limit, PDF/JPG/PNG only
- [x] File deletion with cleanup

---

### 🚧 **Current Sprint Tasks** (this session)

#### Track C: Enhanced Profile Management

**T15. Fix OTP login network error**
- Debug phone OTP login flow
- Ensure backend `/api/auth/phone/send-otp` and `/api/auth/phone/verify-otp` work correctly
- Handle edge cases (no account, invalid OTP, etc.)

**T16. Database migration: Add profile fields**
- Add to `students` table:
  - `date_of_birth DATE`
  - `interests TEXT` (comma-separated or JSON array)
  - `referral_source TEXT`
  - `student_card_url TEXT` (replaces generic documents for now)

- Add to `students` table (School Details):
  - `school_name TEXT` (rename from `school`)
  - `npsn TEXT` (National School Principal Number)
  - `school_address TEXT`
  - `school_email TEXT`
  - `school_whatsapp TEXT`
  - `school_phone TEXT`

- Add to `students` table (Supervisor Details):
  - `supervisor_name TEXT`
  - `supervisor_email TEXT`
  - `supervisor_whatsapp TEXT`
  - `supervisor_phone TEXT`
  - `supervisor_school_id TEXT`
  - `supervisor_linked BOOLEAN DEFAULT false`

- Add to `students` table (Parent Details):
  - `parent_name TEXT`
  - `parent_occupation TEXT`
  - `parent_whatsapp TEXT`
  - `parent_phone TEXT`
  - `parent_school_id TEXT`
  - `parent_linked BOOLEAN DEFAULT false`

**T17. Add photo upload endpoint**
- `POST /api/users/photo` — upload profile photo (same multer setup as documents)
- Update `users.photo_url` column
- Return new photo URL

**T18. Add student card upload to profile**
- `POST /api/students/card` — upload student card
- Save to `students.student_card_url`
- Return URL

**T19. Build profile edit screen**
- 3 sections: Student Details / School Details / Supervisor & Parent Details
- All fields editable
- Profile photo picker (tap to change)
- Student card upload button
- Save changes via `PUT /api/users/me` and `PUT /api/students/me`

**T20. Update backend user/student routes**
- `PUT /api/users/me` — update user fields (full_name, phone, email, city)
- `PUT /api/students/me` — update student-specific fields (all new fields from T16)
- Return updated profile data

---

### 📋 **Deferred to Later** (Sprint 2 scope originally but postponed)

- Receipt PDF generation (will do after payment flow is tested end-to-end)
- Data retention policy / encryption-at-rest (Sprint 2 tail or Sprint 3)
- Organizer portal (parallel workstream, separate repo/branch)

---

## New Database Columns Summary

| Table | Column | Type | Purpose |
|-------|--------|------|---------|
| `users` | `photo_url` | TEXT | Profile photo (already exists) |
| `students` | `date_of_birth` | DATE | Student birthdate |
| `students` | `interests` | TEXT | Student interests (e.g., "Math, Science, Arts") |
| `students` | `referral_source` | TEXT | How they heard about us |
| `students` | `student_card_url` | TEXT | Student ID card image |
| `students` | `npsn` | TEXT | National School Number |
| `students` | `school_address` | TEXT | School address |
| `students` | `school_email` | TEXT | School email |
| `students` | `school_whatsapp` | TEXT | School WhatsApp |
| `students` | `school_phone` | TEXT | School phone |
| `students` | `supervisor_name` | TEXT | Supervisor name |
| `students` | `supervisor_email` | TEXT | Supervisor email |
| `students` | `supervisor_whatsapp` | TEXT | Supervisor WhatsApp |
| `students` | `supervisor_phone` | TEXT | Supervisor phone |
| `students` | `supervisor_school_id` | TEXT | Supervisor's school ID |
| `students` | `supervisor_linked` | BOOLEAN | Whether supervisor account is linked |
| `students` | `parent_name` | TEXT | Parent name |
| `students` | `parent_occupation` | TEXT | Parent occupation |
| `students` | `parent_whatsapp` | TEXT | Parent WhatsApp |
| `students` | `parent_phone` | TEXT | Parent phone |
| `students` | `parent_school_id` | TEXT | Parent's school ID |
| `students` | `parent_linked` | BOOLEAN | Whether parent account is linked |

---

## Files Modified/Created (This Session)

### Backend
- `backend/migrations/1744400000000_add-profile-fields.sql` — New migration
- `backend/src/routes/auth.routes.ts` — Fix phone OTP
- `backend/src/routes/users.routes.ts` — Add photo upload, update profile
- `backend/src/routes/students.routes.ts` — NEW: student-specific profile updates + card upload
- `backend/src/services/twilio.service.ts` — Debug/fix OTP flow

### Frontend
- `app/(tabs)/profile/index.tsx` — Full rebuild with editable fields
- `app/(tabs)/profile/edit.tsx` — NEW: dedicated edit screen (if needed)
- `services/users.service.ts` — NEW: user profile update service
- `services/students.service.ts` — NEW: student profile update service

---

## Sprint 2 Verification Checklist

After all tasks:

1. ✅ Phone OTP login works without "Network request failed"
2. ✅ User can tap profile photo and upload a new one
3. ✅ User can upload student card from profile screen
4. ✅ User can edit all profile fields and save changes
5. ✅ Changes persist after app restart
6. ✅ Payment flow works end-to-end (register → pay → webhook updates status)
7. ✅ Document vault shows uploaded student card
8. ✅ All new fields appear in profile UI

---

## Next: Sprint 3 Preview

- Receipt PDF generation
- Push notifications (Expo Push + FCM)
- In-app notification center
- WhatsApp Meta template submission
- Data retention policy (UU PDP compliance)

