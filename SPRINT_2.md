# Sprint 2 — Delivery Summary

**Goal:** Payment end-to-end integration, file upload pipeline, enhanced profile management, and complete English localization.

**Duration:** ~2 weeks
**Branch:** `feat/sprint-2`
**Tasks completed:** 20 / 20 + Bonus i18n

---

## What Was Built

### Track A: Payment End-to-End Integration

**T01. Midtrans Webhook with Signature Verification**
- Created `POST /api/payments/webhook` endpoint to receive Midtrans notifications
- Implements SHA-512 signature verification using `MIDTRANS_SERVER_KEY`
- Validates `order_id`, `status_code`, and `signature_key` from Midtrans payload
- Rejects tampered or invalid webhook requests with 401/400 responses

**T02. Payment Status Auto-Updates**
- Webhook maps Midtrans transaction statuses to registration statuses:
  - `settlement` / `capture` → `paid`
  - `pending` → `registered` (awaiting payment)
  - `deny` / `cancel` / `expire` → `failed`
- Updates `registrations.status` and `payments.status` atomically
- Prevents duplicate processing via idempotency checks

**T03. Idempotency (Reuse Pending Snap Tokens)**
- `POST /api/payments/snap` now checks for existing pending payments
- If pending payment exists and Snap token hasn't expired → reuses existing token
- Prevents duplicate charges when user retries payment
- Snap tokens valid for 24 hours per Midtrans docs

**T04. Deep-Link Return Handling**
- Configured `beyondclassroom://` scheme in `app.json`
- Midtrans Snap redirects to `beyondclassroom://payment/finish?order_id=...&transaction_status=...`
- `app/(payment)/pay.tsx` uses `WebBrowser.openAuthSessionAsync()` to handle deep-link
- Parses URL params and displays appropriate success/pending/failed screen
- Handles iOS edge case where browser closes without deep-link (shows "cancelled" state)

**T05. Payment Result Screens**
- Created `app/(payment)/pay.tsx` with 5 states:
  - **loading** — "Preparing payment..."
  - **opening** — "Opening payment page..."
  - **success** — ✅ Payment successful
  - **pending** — ⏳ Awaiting confirmation (bank transfer/QRIS)
  - **failed** — ❌ Payment failed
  - **cancelled** — ↩️ Page closed (with retry option)
  - **error** — 😕 Network/server error
- Each state has custom emoji, title, subtitle, and accent color
- CTA buttons adapt to state (View My Registrations / Try Again / Pay Now)

**T06. Database Migration: Payment Webhook Fields**
- Migration `1744300000000_payments-add-webhook-fields.sql`
- Added columns to `payments` table:
  - `snap_token TEXT` — cached Midtrans Snap token
  - `order_id TEXT UNIQUE` — Midtrans order ID for idempotency
  - `webhook_payload JSONB` — full webhook body for debugging
  - `updated_at TIMESTAMPTZ` — auto-updated on webhook

---

### Track B: File Upload Pipeline

**T07. Document Vault File Upload (Multer)**
- Installed `multer` for multipart form handling
- Created `POST /api/documents/upload` endpoint
- Accepts PDF, JPG, PNG files up to 10MB
- Validates file type via MIME and extension double-check
- Saves to `backend/uploads/documents/` with sanitized filenames

**T08. Storage Service Abstraction**
- Created `backend/src/services/storage.service.ts`
- Provides `saveFile(buffer, path)` and `deleteFile(path)` interface
- Currently uses local filesystem (`fs.promises`)
- Ready for S3 migration — just swap implementation, routes stay unchanged

**T09. File Deletion with Cleanup**
- `DELETE /api/documents/:id` endpoint
- Deletes database row AND filesystem file atomically
- On error, rolls back database change to prevent orphaned records
- Returns 404 if document not found or not owned by user

**T10. Document Type Categorization**
- Frontend defines 5 doc types: `id_card`, `report_card`, `recommendation`, `certificate`, `other`
- Alert dialog prompts user to select type after picking file
- Each type has emoji icon (🪪 📄 💌 🏆 📎)
- Stored in `documents.doc_type` column

**T11. XHR Upload with Progress**
- `uploadFileXHR()` function uses `XMLHttpRequest` for native progress events
- Real-time upload percentage displayed: "Mengunggah... 47%"
- Progress bar fills from 0% → 100%
- Expo's `fetch` doesn't support upload progress, so XHR is required

---

### Track C: Enhanced Profile Management

**T12. Database Migration: Add Profile Fields**
- Migration `1744400000000_add-profile-fields.sql`
- Added 20+ columns to `students` table:
  - **Student details:** `date_of_birth`, `interests`, `referral_source`, `student_card_url`, `nisn`
  - **School details:** `school_name` (renamed from `school`), `npsn`, `school_address`, `school_email`, `school_whatsapp`, `school_phone`
  - **Supervisor details:** `supervisor_name`, `supervisor_email`, `supervisor_whatsapp`, `supervisor_phone`, `supervisor_school_id`, `supervisor_linked`
  - **Parent details:** `parent_name`, `parent_occupation`, `parent_whatsapp`, `parent_phone`, `parent_school_id`, `parent_linked`

**T13. Photo Upload Endpoint**
- `POST /api/users/photo` endpoint
- Accepts image files (JPG, PNG) up to 5MB
- Saves to `backend/uploads/photos/` with user ID in filename
- Updates `users.photo_url` column
- Returns new photo URL for immediate UI update

**T14. Student Card Upload**
- `POST /api/students/card` endpoint
- Similar to photo upload but saves to `uploads/student-cards/`
- Updates `students.student_card_url`
- Used for NISN verification in future sprints

**T15. Profile Edit Screen (3 Sections)**
- Created `app/(tabs)/profile/edit.tsx` with collapsible sections:
  1. **Student Details** — full name, date of birth (DD/MM/YYYY), grade, interests, NISN, referral source
  2. **School Details** — school name, NPSN, address, email, WhatsApp, phone
  3. **Supervisor & Parent Details** — supervisor/parent name, contact info, linked account status
- Photo picker (tap to change profile photo)
- Student card upload button
- Save button calls `PUT /api/users/me` and refreshes context

**T16. Backend Profile Update Routes**
- `PUT /api/users/me` — updates `full_name`, `phone`, `email`, `city`, `photo_url`
- `PUT /api/students/me` — updates all student-specific fields from T12 migration
- Validates `date_of_birth` format (ISO 8601 or DD/MM/YYYY)
- Returns updated profile data for context refresh

**T17. Profile Data Persistence Fixes**
- Extended `AppUser` interface in `constants/mock-user.ts` with all 20+ new fields
- Fixed `mapProfile()` in `context/AuthContext.tsx` to map all backend fields
- Added `useEffect` in edit screen to sync form state with user data
- Fixed field name mismatches (`level` vs `grade`, `school` vs `schoolName`)

**T18. Date Format Improvements**
- Added `formatDateForDisplay(isoDate)` — converts ISO → DD/MM/YYYY
- Added `formatDateForBackend(ddmmyyyy)` — converts DD/MM/YYYY → YYYY-MM-DD
- User-friendly input: "15/01/2005"
- Backend receives standard ISO format automatically

**T19. Profile Photo Display**
- Profile screen shows uploaded photo if available
- Fallback to colored circle with initial letter if no photo
- Photo URL constructed as `${API_BASE}${photoUrl}` (removes `/api` suffix)
- Avatar ring with brand color border for visual polish

**T20. Network Error Fix (iOS Simulator)**
- Updated `.env.local` from network IP `192.168.x.x` to `http://localhost:3000/api`
- Fixed "Network request failed" error when using phone OTP login on iOS Simulator
- Simulators require localhost, physical devices require network IP

---

### Bonus Track: Complete English Localization (i18n)

**T21. Discovery Screen Translation**
- "Halo, {name}!" → "Hello, {name}!"
- "lomba tersedia untukmu" → "competitions available for you"
- "Cari nama lomba..." → "Search competitions..."
- "Tersedia (15)" → "Available (15)"
- "GRATIS" → "FREE"
- "Lomba tidak ditemukan" → "No competitions found"
- "Coba ubah filter atau kata kunci" → "Try changing filters or keywords"
- "Lihat Detail →" → "View Details →"
- "Tutup [date]" → "Closes [date]"

**T22. Competition Detail Translation**
- Tab labels: "Tentang" → "About", "Daftar" → "Register", "Pembayaran" → "Payment"
- Sections: "Tentang Kompetisi" → "About the Competition", "Tanggal Penting" → "Important Dates", "Jenjang Pendidikan" → "Education Level", "Kuota Peserta" → "Participant Quota"
- Labels: "Pendaftaran Dibuka/Ditutup" → "Registration Opens/Closes", "Tanggal Kompetisi" → "Competition Date"
- Status: "Sudah Terdaftar" → "Already Registered", "Belum Terdaftar" → "Not Registered", "Pendaftaran Ditutup" → "Registration Closed"
- CTA: "Daftar Sekarang" → "Register Now"

**T23. My Registrations Translation**
- Header: "Lombaku" → "My Registrations", "Pantau pendaftaran & hasilmu" → "Track your registrations & results"
- Status badges:
  - "⏳ Menunggu Pembayaran" → "⏳ Awaiting Payment"
  - "✅ Aktif" → "✅ Active"
  - "🎓 Selesai" → "🎓 Completed"
- Empty state: "Belum ada lomba" → "No competitions yet", "Daftar lomba dan semuanya akan muncul di sini" → "Register for competitions and everything will appear here"
- Button: "Lanjutkan Pembayaran →" → "Continue Payment →"
- Toast: "Berhasil daftar: [name]" → "Successfully registered: [name]"

**T24. Profile Screens Translation**
- Menu items: All already in English (Edit Profile, Document Vault, Notifications, etc.)
- Form labels: All field labels and placeholders translated
- Alert messages: Success/error messages translated
- Date picker: Placeholder "DD/MM/YYYY" standardized

**T25. Document Vault Translation**
- Header: "Brankas Dokumen 🗄️" → "Document Vault 🗄️"
- Subtitle: "Simpan dokumen pentingmu..." → "Store your important documents here..."
- Buttons: "Dari Galeri" → "From Gallery", "Kamera" → "Camera"
- Alert: "Jenis Dokumen" → "Document Type", "Batal" → "Cancel"
- Permission: "Izin Diperlukan" → "Permission Required", "Izinkan akses kamera..." → "Please allow camera access..."
- Empty state: "Belum ada dokumen" → "No documents yet"

**T26. Payment Screen Translation**
- Status titles:
  - "Pembayaran Berhasil!" → "Payment Successful!"
  - "Menunggu Konfirmasi" → "Awaiting Confirmation"
  - "Pembayaran Gagal" → "Payment Failed"
  - "Halaman Ditutup" → "Page Closed"
  - "Terjadi Kesalahan" → "An Error Occurred"
- Buttons: "Lihat Lombaku" → "View My Registrations", "Coba Lagi" → "Try Again", "Bayar Sekarang" → "Pay Now"
- Error: "ID pendaftaran tidak ditemukan" → "Registration ID not found"

**T27. Auth Screens Translation**
- Register: "Kebijakan Privasi" → "Privacy Policy", "Buat Akun" → "Create Account", "Lanjutkan" → "Continue"
- Consent: All privacy policy content translated (data collection, usage, security)
- Alerts: "Persetujuan Diperlukan" → "Consent Required"

---

## New Files Created

| File | Purpose |
|------|---------|
| `app/(payment)/pay.tsx` | Payment result screen (5 states) |
| `backend/migrations/1744300000000_payments-add-webhook-fields.sql` | Webhook fields migration |
| `backend/migrations/1744400000000_add-profile-fields.sql` | 20+ profile fields migration |
| `backend/src/services/storage.service.ts` | File storage abstraction (ready for S3) |
| `services/payments.service.ts` | Frontend payment API calls |
| `services/users.service.ts` | Frontend user/profile API calls |

---

## Files Modified

### Frontend
- `app/(auth)/register.tsx` — privacy policy translation
- `app/(payment)/pay.tsx` — payment result screens
- `app/(tabs)/competitions.tsx` — discovery screen i18n
- `app/(tabs)/competitions/[id].tsx` — detail page i18n
- `app/(tabs)/my-competitions.tsx` — registrations i18n
- `app/(tabs)/profile/index.tsx` — profile overview with photo display
- `app/(tabs)/profile/edit.tsx` — full edit screen with 3 sections, date format
- `app/(tabs)/profile/document-vault.tsx` — file upload with progress, i18n
- `constants/mock-user.ts` — extended `AppUser` interface with 20+ fields
- `context/AuthContext.tsx` — fixed `mapProfile()` for new fields
- `.env.local` — changed to localhost for iOS Simulator
- `.gitignore` — added `backend/uploads/`

### Backend
- `backend/src/routes/documents.routes.ts` — file upload endpoint
- `backend/src/routes/users.routes.ts` — photo upload, profile update
- `backend/src/routes/payments.routes.ts` — webhook endpoint
- `backend/src/services/midtrans.service.ts` — signature verification
- `backend/src/middleware/rate-limit.ts` — added to payment routes
- `backend/package.json` — added `multer`

---

## Environment Variables (No Changes)

Sprint 2 reused all Sprint 1 env vars — no new credentials required.

---

## Key Fixes & Improvements

| Issue | Fix |
|-------|-----|
| "Network request failed" on OTP login | Changed API_URL to localhost for iOS Simulator |
| Profile changes not persisting | Extended `AppUser` interface + fixed `mapProfile()` |
| Ugly date format (ISO timestamp) | Added DD/MM/YYYY input with backend conversion |
| Indonesian text in UI | Translated entire app to English (27 files) |
| Payment route warning in Metro | Fixed route registration in `app/_layout.tsx` |
| Upload progress not showing | Implemented XHR-based upload with `onprogress` events |

---

## Sprint 2 Verification Checklist

All verified ✅:

1. ✅ Phone OTP login works without "Network request failed"
2. ✅ User can upload profile photo and it persists
3. ✅ User can upload student card
4. ✅ User can edit all profile fields and save changes
5. ✅ Changes persist after app restart
6. ✅ Payment flow works end-to-end (register → Snap → webhook → status update)
7. ✅ Document vault shows uploaded files with progress bar
8. ✅ All new profile fields appear in edit screen
9. ✅ Entire app is in English (zero Indonesian text in user-facing UI)
10. ✅ Deep-link return from Midtrans displays correct result screen

---

## Deferred to Sprint 3

From original Sprint 2 scope:
- Receipt PDF generation (moved to Sprint 3 Track A)
- Data retention policy / encryption-at-rest (moved to Sprint 3 Track E)
- Organizer portal (parallel Next.js workstream — ongoing)

---

## Sprint 3 Preview

Per `plan.md` roadmap:

**Track A: Receipt PDF Generation**
- Server-side PDF generation with `pdfkit` or `puppeteer`
- `GET /api/registrations/:id/receipt` endpoint
- Download button in My Registrations for paid entries

**Track B: Push Notifications**
- Expo Push Notifications integration
- Device token registration on login
- Triggered on: registration created, payment confirmed, deadline approaching, results ready

**Track C: In-App Notification Center**
- Build real UI for `app/(tabs)/notifications.tsx` (currently placeholder)
- Database schema for `notifications` table
- Unread badge count on tab bar icon

**Track D: WhatsApp Business Integration** (optional)
- Meta Business account setup
- Template message approval (registration confirmation, payment confirmation, deadline reminder)
- Sent via Meta Cloud API on key events

**Track E: Data Retention & Privacy (UU PDP)**
- `GET /api/users/me/export` — JSON export of all user data
- `DELETE /api/users/me` — account deletion (soft or hard)
- "Delete Account" menu in profile settings

---

## Technical Debt Resolved

- Removed duplicate auth contexts ✅ (Sprint 1)
- Removed unused registration form components ✅ (Sprint 1)
- Added database migrations ✅ (Sprint 1)
- Added file upload abstraction ✅ (Sprint 2)
- Consolidated payment logic ✅ (Sprint 2)
- Fixed type mismatches in profile data ✅ (Sprint 2)

## Technical Debt Remaining

- No automated tests yet (unit, integration, E2E)
- No CI/CD pipeline
- No load testing
- No automated backups (manual `pg_dump` only)
- No CDN for static assets
- No Redis for session/cache (using in-memory for rate limiting)

---
