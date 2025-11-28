TherapyConnect (Delhi NCR) 🌿

A two-sided marketplace connecting mental health professionals with clients in the Delhi NCR region. This platform facilitates discovery, booking, and session management with a focus on trust ("Vibe Match"), safety, and ease of use.

🚀 Features (MVP)

For Clients:

Search & Discovery: Filter therapists by specialty, price, and location (Online vs. In-Person near Metro stations).

Vibe Check: View rich profiles with bio, specialties, and session details.

Booking Engine: Interactive calendar to select slots.

Wellness Dashboard: Manage upcoming appointments, prepare for sessions (Mood/Journal check-ins), and view past history.

Secure Payment: Simulated payment gateway integration.

For Therapists:

Practice Management: Set up a professional profile, clinic address, and meeting links.

Schedule Manager: Advanced calendar to open slots manually or via "Bulk Auto-Generate" (14-day limit).

Client Dossier: View incoming client prep notes (Mood/Journal) before the session starts.

Financial Stats: Track month-to-date earnings and session counts.

🛠 Tech Stack

Frontend: Next.js 14 (App Router), React, Tailwind CSS, Framer Motion.

Backend: Appwrite (Auth, Database, Storage).

Icons: Lucide React.

Utilities: date-fns (Date logic), clsx (Class merging).

⚙️ Environment Setup

Clone the repository:

git clone [https://github.com/yourusername/therapy-connect.git](https://github.com/yourusername/therapy-connect.git)
cd therapy-connect

Install dependencies:

npm install

Appwrite Configuration:
Create a .env.local file in the root directory:

# APPWRITE CONFIG

NEXT_PUBLIC_APPWRITE_ENDPOINT="[https://cloud.appwrite.io/v1](https://cloud.appwrite.io/v1)"
NEXT_PUBLIC_APPWRITE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# SECRET KEYS (Server Side Only)

APPWRITE_API_KEY="your_server_api_key"

Database Initialization:
Instead of manually creating collections, run the provided setup scripts in order:

Step 1: Create Core Schema (Users, Bookings, Ratings)

node scripts/setup-db.js

Step 2: Add Inventory System (Slots collection)

node scripts/update-schema.js

Step 3: Fix Attribute Types (Ensure correct text sizes)

node scripts/fix-schema.js

Storage Setup:

Go to Appwrite Console > Storage.

Create a bucket named images with ID: 69272be5003c066e0366 (or update lib/constants.js with your own ID).

Permissions: Ensure Any has read access to this bucket.

🏃‍♂️ Running the Project

npm run dev

Open http://localhost:3000 with your browser.

📂 Project Structure

├── actions/ # Server Actions (Backend Logic)
│ ├── auth.js # Login/Signup/Logout
│ ├── booking.js # Transaction logic & Double booking guard
│ ├── dashboard.js # Data fetching for dashboards
│ ├── public.js # Public profile data fetching
│ ├── schedule.js # Slot creation & Bulk generator
│ ├── search.js # Search filtering logic
│ └── therapist.js # Profile settings & updates
├── app/ # Next.js App Router Pages
│ ├── book/ # Checkout Flow
│ ├── dashboard/ # Client Dashboard
│ ├── profile/ # Public Therapist Profiles
│ ├── search/ # Directory & Filters
│ ├── therapist/ # Therapist Protected Dashboard
│ └── ... # Auth pages & Landing page
├── components/ # Reusable UI Components
│ ├── BookingWidget.jsx
│ ├── TherapistCard.jsx
│ ├── PrepModal.jsx
│ └── ...
├── lib/ # Configuration & Constants
│ ├── appwrite.js # Appwrite Client Setup
│ └── constants.js # Static lists (Specialties, Metro Stations)
└── scripts/ # Database Migration Scripts

🔐 Roles & Permissions

Client: Default role upon signup. Can search, book, and view own dashboard.

Therapist: Must be manually assigned role: 'therapist' in the users database collection by an Admin. Access to /therapist/\* routes.

Admin: (Future Scope) System oversight.

🚧 Roadmap

[ ] Real Razorpay Payment Integration (Currently Simulated).

[ ] Email Notifications (SendGrid/Resend).

[ ] "For Therapists" Marketing Page.

[ ] Middleware.js for strict route protection.

[ ] Video Call Integration (Daily.co or Zoom).

© 2025 TherapyConnect India Pvt Ltd.
