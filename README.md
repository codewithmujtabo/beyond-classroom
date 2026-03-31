# Beyond Classroom 🎓

A mobile application built with Expo and React Native that helps students discover, register for, and manage academic competitions and educational opportunities.

## 📋 Project Overview

**Beyond Classroom** is a competition management platform that connects students with various academic competitions and events. The app provides a user-friendly interface to browse competitions, register, manage payments, and stay updated with announcements.

### Key Features:

- 🏆 **Browse Competitions** - Discover various academic competitions across different categories
- 📝 **Easy Registration** - Quick registration process for competitions
- 💳 **Payment Tracking** - Track payment status and manage fees
- 📰 **News & Updates** - Stay informed with latest announcements
- 👤 **User Profile** - Manage personal information and registrations
- 📱 **Cross-Platform** - Works on iOS, Android, and Web

---

## 🛠️ Tech Stack

| Technology            | Version  | Purpose                              |
| --------------------- | -------- | ------------------------------------ |
| **Expo**              | ~54.0.33 | Cross-platform development framework |
| **React Native**      | 0.81.5   | Mobile UI components                 |
| **React**             | 19.1.0   | Core framework                       |
| **TypeScript**        | ~5.9.2   | Type-safe development                |
| **Expo Router**       | ~6.0.23  | File-based routing (like Next.js)    |
| **React Navigation**  | Latest   | Bottom tabs & native navigation      |
| **Safe Area Context** | ~5.6.0   | Safe area handling                   |

---

## 📁 Project Structure

```
beyond-classroom/
├── app/                          # Expo Router file-based app routing
│   ├── (tabs)/                   # Bottom tab navigation group
│   │   ├── _layout.tsx          # Tab layout with 5 main screens
│   │   ├── index.tsx            # Home screen - banners, categories, recommendations
│   │   ├── competitions.tsx      # Browse all competitions
│   │   ├── competitions/
│   │   │   └── [id].tsx         # Competition detail page (dynamic route)
│   │   ├── my-competitions.tsx   # Track registered competitions
│   │   ├── news.tsx             # News & announcements feed
│   │   └── profile.tsx          # User profile & settings
│   ├── (auth)/                   # Authentication screens (placeholder)
│   ├── (onboarding)/            # Onboarding screens (placeholder)
│   ├── index.tsx                # Root app layout
│   └── _layout.tsx              # App-level layout wrapper
│
├── components/                   # Reusable UI components
│   ├── ui/                       # Design system components
│   │   ├── icon-symbol.tsx      # Unified icon component
│   │   └── collapsible.tsx      # Collapsible component
│   ├── common/                   # App-specific common components
│   ├── onboarding/              # Onboarding UI components
│   ├── haptic-tab.tsx           # Tab with haptic feedback
│   ├── themed-text.tsx          # Typography wrapper
│   └── themed-view.tsx          # Container wrapper
│
├── constants/                    # App configuration & mock data
│   ├── theme.ts                 # Design tokens, colors, spacing
│   ├── competitions.ts          # Mock competition data (6 competitions)
│   └── mock-user.ts             # Mock user data for development
│
├── context/                      # React Context for state management
│   └── UserContext.tsx          # User auth & registration state
│
├── hooks/                        # Custom React hooks
│   ├── use-color-scheme.ts      # Light/dark mode hook
│   └── use-theme-color.ts       # Theme color hook
│
├── assets/                       # Static assets
│   └── images/                   # App icons, splash screens, logos
│
├── scripts/                      # Utility scripts
│   └── reset-project.js         # Clean project setup script
│
├── app.json                      # Expo app configuration
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── eslint.config.js             # Code linting rules
└── README.md                     # This file
```

---

## 🎨 Design System

### Color Palette

- **Primary**: `#6366F1` (Indigo) - Main brand color
- **Background**: `#F8FAFC` (Slate light)
- **Text Dark**: `#0F172A` (Slate dark)
- **Text Gray**: `#64748B` (Slate medium)
- **Text Light**: `#94A3B8` (Slate light)
- **Divider**: `#E2E8F0` (Slate lighter)
- **Border**: `#EEF2FF` (Indigo light)

### News Categories Color Coding

- 🔧 **System**: Orange (#F59E0B) - System maintenance
- 🏆 **Competition**: Green (#10B981) - New competitions
- 💡 **Tips**: Blue (#3B82F6) - Helpful tips
- ⚡ **Updates**: Purple (#8B5CF6) - Platform updates

---

## 📱 Screen Details

### 1. **Home Screen** (`index.tsx`)

**Purpose**: Main entry point with quick access to competitions

- Banner carousel (featured competitions)
- Category filter/navigation
- Recommended competitions section
- Quick stats or achievements (placeholder for future)

### 2. **Competitions Screen** (`competitions.tsx`)

**Purpose**: Browse and search all available competitions

- Searchable list of all competitions
- Filter by category, grade, price, deadline
- Competition cards showing:
  - Title, organizer, category
  - Grade levels, deadline
  - Registration fee
  - Visual emoji icon

**Navigation**: Tap competition → Competition Detail page

### 3. **Competition Detail Screen** (`competitions/[id].tsx`)

**Purpose**: Full information about a specific competition

- **Three Tabs**:
  1. **Halaman Utama** (Overview) - Description, timeline, prize info
  2. **Pendaftaran** (Registration) - Registration requirements & form
  3. **Pembayaran** (Payment) - Payment details & status
- Smart back button that returns to origin (Home or Competitions tab)
- Register button at footer
- Tab state resets when opening different competitions

### 4. **My Competitions Screen** (`my-competitions.tsx`)

**Purpose**: Track user's registered competitions

- List of competitions user registered for
- Registration status badges:
  - 🟡 "Registered" (default)
  - 🟢 "Paid" (payment confirmed)
- "Mark as Paid" button to update payment status
- Action buttons to manage registrations

### 5. **News & Announcements Screen** (`news.tsx`)

**Purpose**: Stay updated with platform and competition news

- **4 Sample Announcements** with categories:
  - Maintenance notifications (🔧)
  - New competitions (🏆)
  - Tips & guides (💡)
  - Platform updates (⚡)
- **Features**:
  - Color-coded category badges
  - Preview text for quick scan
  - **"View More" Button** - Opens expandable modal with full text
  - Beautiful detail modal with:
    - Large category icon
    - Full announcement text
    - Scrollable content for long announcements
    - Back button to close

### 6. **Profile Screen** (`profile.tsx`)

**Purpose**: User account & settings management

- Placeholder for user information display
- Settings options (ready for expansion)

---

## 🔄 State Management

### UserContext (`context/UserContext.tsx`)

Central state management for user data and registrations.

**Features**:

- Manages current logged-in user
- Tracks competition registrations with status
- Payment status tracking
- Mock user for development

**Key Functions**:

```typescript
registerCompetition(compId: string)    // Register for a competition
markRegistrationPaid(id: string)       // Update payment status
removeRegistration(id: string)         // Cancel registration
```

**Status Types**:

- `registered` - Initial registration status
- `paid` - Payment confirmed
- `completed` - Competition finished

---

## 📊 Mock Data

### Competitions (`constants/competitions.ts`)

- **6 Sample Competitions** with full details:
  1. English Math Championship (Free)
  2. ISPO Science Olympiad (Rp 75,000)
  3. OSEBI Economics (Rp 100,000)
  4. National English Debate (Rp 50,000)
  5. Robotics Challenge 2026 (Rp 125,000)
  6. Programming Competition (Rp 75,000)

Each competition includes:

- Title, organizer, category
- Grade levels, registration deadline
- Price, timeline, age range
- Description, event steps
- Prize information

### User (`constants/mock-user.ts`)

- Mock user profile data
- Pre-loaded registrations for testing

### News (`app/(tabs)/news.tsx`)

- **4 Sample Announcements**:
  1. Maintenance Window
  2. New Competition: City Math Cup
  3. Tips for Online Competitions
  4. Platform Update v2.1

---

## ⚙️ Setup & Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (optional, will use npx)

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/beyond-classroom.git
cd beyond-classroom
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all packages listed in `package.json`:

- Expo framework & tools
- React Native components
- Navigation libraries
- Type definitions

### Step 3: Start Development Server

```bash
npm start
# or
npx expo start
```

**Output** will show options to run the app:

```
Press 'a' to open Android emulator
Press 'i' to open iOS simulator
Press 'w' to open web
Press 's' to send the app URL to your phone
Press 'j' to open Expo DevTools
Press 'r' to reload the app
Press 'q' to quit
```

---

## 🚀 Running the App

### Option 1: iOS Simulator

```bash
npm start
# Then press 'i' in the terminal
```

**Requirements**: macOS with Xcode & iOS Simulator installed

### Option 2: Android Emulator

```bash
npm start
# Then press 'a' in the terminal
```

**Requirements**: Android Studio & Android Emulator installed

### Option 3: Physical Device (Recommended for Testing)

1. Install **Expo Go** app from App Store / Play Store
2. Run:
   ```bash
   npm start
   # or
   npx expo start
   ```
3. Scan the QR code with Expo Go (iOS) or the camera app (Android)
4. App opens in Expo Go

### Option 4: Web Browser

```bash
npm start
# Then press 'w' in the terminal
```

Opens at `http://localhost:19006`

---

## 🧪 Development Workflow

### Code Structure

- **File-based Routing**: Add screens by creating files in `app/` directory
- **TypeScript**: Type-safe development with full IDE support
- **Hot Reload**: Changes apply instantly without restarting

### Key Commands

| Command                 | Purpose                            |
| ----------------------- | ---------------------------------- |
| `npm start`             | Start development server           |
| `npm run android`       | Run on Android emulator            |
| `npm run ios`           | Run on iOS simulator               |
| `npm run web`           | Run in web browser                 |
| `npm run lint`          | Check code quality                 |
| `npm run reset-project` | Reset app directory to blank state |

### Code Linting

```bash
npm run lint
```

Uses ESLint configured for Expo projects.

---

## 🔄 Routing Architecture

This app uses **Expo Router** (file-based routing, similar to Next.js):

```
app/
  (tabs)/              # Group - Bottom tab navigation
    _layout.tsx        # Defines the 5 tab screens
    index.tsx          # Home tab
    competitions.tsx   # Competitions tab
    competitions/[id].tsx  # Dynamic route - shows specific competition
    my-competitions.tsx    # My Comps tab
    news.tsx           # News tab
    profile.tsx        # Profile tab
```

**Navigation Pattern**:

- **Tab Navigation**: Switch between Home, Competitions, My Comps, News, Profile
- **Stack Navigation**: Competitions list → Competition detail → Back to list
- **Dynamic Routes**: `competitions/[id]` loads different competitions based on ID
- **Route Parameters**: `from: "competitions"` tracks navigation origin for smart back button

---

## 🎯 Navigation Flow

```
App Start
├── Home Screen
│   ├── Banners
│   ├── Categories
│   └── Recommended → [Tap] → Competition Detail (from: "home")
│
├── Competitions Screen
│   ├── All competitions list
│   └── [Tap competition] → Competition Detail (from: "competitions")
│       ├── Overview tab
│       ├── Registration tab
│       ├── Payment tab
│       └── Back → Returns to Competitions
│
├── My Competitions Screen
│   ├── Registered competitions
│   ├── Mark as Paid button
│   └── Remove registration
│
├── News & Announcements
│   ├── 4 announcements with categories
│   └── [Tap "View More"] → Opens modal with full text
│
└── Profile Screen
    └── User information & settings
```

---

## 🔐 Authentication (Ready for Integration)

Currently using **mock user** for development. To integrate real authentication:

1. Update `context/UserContext.tsx`:
   - Replace `MOCK_USER` with real API call
   - Add login/logout functions
   - Connect to your auth backend

2. Create auth screens in `app/(auth)/`:
   - Login screen
   - Sign-up screen
   - Password reset

3. Update `app/_layout.tsx` to redirect to auth if not logged in

---

## 📦 Deployment

### Build for Production

```bash
# Create production build
eas build --platform ios --auto-submit
eas build --platform android --auto-submit
```

_Note: Requires EAS account setup. See [Expo EAS docs](https://docs.expo.dev/build/introduction/)_

### Submit to App Stores

```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

---

## 🐛 Troubleshooting

### "Module not found" errors

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start -- --clear
```

### Build fails on iOS Simulator

```bash
# Ensure iOS Simulator is running
open -a Simulator

# Then run
npm run ios
```

### App won't reload after changes

```bash
# Press 's' in terminal to send QR code again
# Or restart the dev server:
npm start
```

### Port already in use

```bash
# If port 8081 is in use, specify a different one
npx expo start --port 8082
```

---

## 📚 Learning Resources

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **Expo Router Guide**: https://docs.expo.dev/router/introduction/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---

## 🤝 Contributing

This is a development project. To contribute:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add feature description"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

---

## 📝 Development Notes

### Current Implementation Status ✅

- ✅ Home screen with banners & recommendations
- ✅ Competitions list & browsing
- ✅ Competition detail page with 3 tabs
- ✅ Registration system (in-memory)
- ✅ Payment status tracking
- ✅ My competitions management
- ✅ News & announcements with expandable detail modal
- ✅ Profile screen placeholder
- ✅ Smart navigation with origin tracking
- ✅ Color-coded UI with consistent design system

### Future Enhancements 🚀

- Backend API integration
- Real authentication system
- AsyncStorage for offline data
- Payment gateway integration
- Push notifications
- Chat/messaging feature
- Leaderboards & achievements

---

## 📄 License

This project is proprietary and created for Eduversal Internship.

---

## 👨‍💻 Developer

**Project Created**: March 2026  
**Current Version**: 1.0.0  
**Status**: Active Development

---

## 📧 Support

For issues, questions, or suggestions, please open an GitHub issue or contact the development team.

---

**Happy Coding! 🚀**
