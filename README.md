# Ganesh Mahotsav Hisab 🙏

A modern, responsive web application for managing the complete income, donation, and expense records of a Ganesh Mahotsav/Mandap.

## Features

### 📊 Dashboard
- Total Donations, Expenses, and Remaining Balance summary
- Real-time financial calculations
- Recent donations and expenses lists
- Member-wise and category-wise expense summaries
- Interactive charts (Pie charts for categories, Bar charts for members)

### 💰 Donation Management
- Complete donation tracking with donor details
- Mobile number and payment method tracking
- Search and filter by name, mobile, date, payment method
- Receipt number tracking
- CRUD operations (Create, Read, Update, Delete)

### 💳 Expense Management
- Comprehensive expense recording
- Member-wise expense tracking
- Category-based organization (Decoration, Lighting, Sound, etc.)
- Receipt/bill image upload
- Detailed expense information with descriptions
- Advanced filtering options

### 👥 Member Management
- User registration with mobile number
- Role-based access (Admin/Member)
- Active/Inactive status management
- Member expense history
- Profile management

### 📈 Reports & Analytics
- Date range filtering (Today, This Week, This Month, Custom)
- Donations vs Expenses comparison charts
- Date-wise donation and expense breakdown
- Export functionality (PDF/Excel - coming soon)
- Comprehensive financial summaries

### 🔐 Authentication & Security
- Secure login system
- JWT-based authentication
- Role-based access control
- Password encryption with bcryptjs

### 🎨 UI/UX Features
- Modern, clean interface suitable for Ganesh Mahotsav committees
- Responsive design (Mobile, Tablet, Desktop friendly)
- Dark/Light mode toggle
- Indian Rupee (₹) formatting
- Toast notifications for user feedback
- Confirmation dialogs for destructive actions
- Loading states and error handling

## Tech Stack

### Frontend
- React 18
- React Router DOM (routing)
- Axios (HTTP client)
- Recharts (charts and graphs)
- Lucide React (icons)
- React Hot Toast (notifications)
- Tailwind CSS (styling)
- Vite (build tool)

### Backend
- Node.js
- Express.js
- SQLite3 (database)
- JWT (authentication)
- Bcryptjs (password hashing)
- Multer (file uploads)
- CORS

## Deploy Live (Public Website)

This app can be deployed for free using **GitHub + Render**.

### Step 1 — Push to GitHub

1. Create a new empty repo on [GitHub](https://github.com/new) (do not add README if pushing existing code).
2. In your project folder, run:

```bash
git init -b main
git add .
git commit -m "Initial commit: Ganesh Mahotsav Hisab app"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Replace `YOUR_USERNAME/YOUR_REPO` with your actual GitHub repo path.

### Step 2 — Deploy on Render (free)

1. Go to [render.com](https://render.com) and sign up (use **Sign in with GitHub**).
2. Click **New +** → **Blueprint** (or **Web Service**).
3. Connect your GitHub repo.
4. Render will read `render.yaml` automatically, or set manually:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** add `NODE_ENV=production` and `JWT_SECRET` (any long random string)
5. Click **Deploy**. After 2–5 minutes you get a public URL like `https://your-app.onrender.com`.

### Default login (change after first login)

- **Mobile:** `9999999999`
- **Password:** `admin123`

### Important notes

- On Render's free plan, the app sleeps after inactivity (~50 sec cold start on next visit).
- SQLite data may reset on redeploy unless you add a [Render persistent disk](https://render.com/docs/disks).
- Change the default admin password after going live.
- Never commit `.env` — use Render environment variables for secrets.

## Installation (Local Development)

1. Clone the repository:
```bash
git clone <repository-url>
cd ganesh-mahotsav-hisab
```

2. Install dependencies:
```bash
npm install
```

3. Create uploads directory:
```bash
mkdir uploads
```

4. Start the application:
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend dev server (port 3000).

## Default Login Credentials

- **Mobile:** 9999999999
- **Password:** admin123
- **Role:** Admin

## Database Schema

### Users Table
- id, name, mobile, email, password, role, status, profile_photo, created_at, updated_at

### Donations Table
- id, donor_name, mobile, amount, payment_method, donation_date, receipt_number, notes, created_by, created_at, updated_at

### Expenses Table
- id, member_id, title, category, amount, expense_date, payment_method, description, receipt_image, notes, created_at, updated_at

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user

### Dashboard
- GET `/api/dashboard/summary` - Get dashboard summary
- GET `/api/dashboard/recent-donations` - Get recent donations
- GET `/api/dashboard/recent-expenses` - Get recent expenses
- GET `/api/dashboard/member-expenses` - Get member expense summary
- GET `/api/dashboard/category-expenses` - Get category-wise expenses

### Donations
- GET `/api/donations` - Get all donations (with filters)
- GET `/api/donations/:id` - Get single donation
- POST `/api/donations` - Create donation
- PUT `/api/donations/:id` - Update donation
- DELETE `/api/donations/:id` - Delete donation

### Expenses
- GET `/api/expenses` - Get all expenses (with filters)
- GET `/api/expenses/:id` - Get single expense
- POST `/api/expenses` - Create expense (with file upload)
- PUT `/api/expenses/:id` - Update expense
- DELETE `/api/expenses/:id` - Delete expense

### Members
- GET `/api/members` - Get all members
- GET `/api/members/:id` - Get single member
- GET `/api/members/:id/expenses` - Get member's expenses
- POST `/api/members` - Create member (Admin only)
- PUT `/api/members/:id` - Update member (Admin only)
- DELETE `/api/members/:id` - Delete member (Admin only)

### Reports
- GET `/api/reports` - Get comprehensive report
- GET `/api/reports/donations-by-date` - Get date-wise donations
- GET `/api/reports/expenses-by-date` - Get date-wise expenses

## Key Features Implementation

### Financial Calculations
```
Remaining Balance = Total Donations - Total Expenses
```

All calculations are performed automatically and update in real-time across the application.

### Role-Based Access
- **Admin:** Full access to all features including member management
- **Member:** Can view dashboard, add their own expenses, view their expense history

### Data Validation
- Mobile numbers must be 10 digits
- Amounts must be positive numbers
- Required fields are enforced
- Unique mobile numbers for members
- Date validations

### Search & Filtering
- Donations: Filter by donor name, mobile, date range, payment method
- Expenses: Filter by title, member, category, date range, payment method
- Members: Filter by name, mobile, status

## Future Enhancements

- PDF/Excel export functionality
- SMS notifications for donations
- Multi-language support
- Advanced analytics and insights
- Mobile app version
- Receipt printing
- Backup and restore functionality

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is created for Ganesh Mahotsav committees and is free to use and modify.
