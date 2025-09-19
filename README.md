# React Job Candidate Management App

A modern, full-featured job candidate management application built with Next.js 15, React, and TypeScript. This application provides a comprehensive solution for managing job postings, candidates, and assessments with a beautiful, responsive UI.

## 🚀 Features

### Job Management
- **Create and Edit Jobs**: Full CRUD operations for job postings
- **Job Status Management**: Active/Archived status tracking
- **Tag System**: Organize jobs with custom tags
- **Drag & Drop Ordering**: Reorder jobs with intuitive drag-and-drop interface

### Candidate Management
- **Candidate Profiles**: Comprehensive candidate information management
- **Kanban Board**: Visual candidate pipeline with drag-and-drop functionality
- **Timeline Tracking**: Track candidate progress through different stages
- **Application Status**: Monitor candidate application status

### Assessment System
- **Dynamic Assessments**: Create custom assessments for different job positions
- **Multiple Question Types**: Support for single choice, multiple choice, text, and number questions
- **Section-based Organization**: Organize questions into logical sections
- **Real-time Validation**: Form validation with Zod schema

### Modern UI/UX
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Dark/Light Mode**: Theme switching capability
- **Modern Components**: Built with Radix UI and Tailwind CSS
- **Loading States**: Smooth loading indicators and skeleton screens
- **Error Handling**: Comprehensive error boundaries and user feedback

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - UI library with hooks and modern patterns
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

### State Management & Data
- **TanStack Query (React Query)** - Server state management
- **Dexie.js** - IndexedDB wrapper for client-side storage
- **Zod** - Schema validation
- **React Hook Form** - Form state management

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **MSW (Mock Service Worker)** - API mocking for development

### UI Components
- **@dnd-kit** - Drag and drop functionality
- **class-variance-authority** - Component variant management
- **clsx** - Conditional className utility

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd react-job-candidate-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── assessments/        # Assessment management pages
│   ├── candidates/         # Candidate management pages
│   │   └── board/          # Kanban board for candidates
│   ├── jobs/               # Job management pages
│   └── layout.tsx          # Root layout
├── components/             # Reusable UI components
│   ├── providers/          # Context providers
│   └── ui/                 # Base UI components
├── features/               # Feature-specific modules
│   ├── assessments/        # Assessment-related logic
│   ├── candidates/         # Candidate-related logic
│   └── jobs/               # Job-related logic
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
│   ├── api.ts             # API client configuration
│   ├── db.ts              # Database schema and setup
│   ├── seed.ts            # Database seeding
│   └── utils.ts           # Utility functions
├── mocks/                  # MSW mock handlers
└── visual-edits/          # Visual editing components
```

## 🎯 Key Features Explained

### Database Schema
The application uses IndexedDB through Dexie.js with the following main entities:
- **Jobs**: Job postings with title, status, tags, and ordering
- **Candidates**: Candidate profiles with personal information and status
- **CandidateTimeline**: Timeline events for candidate progress tracking
- **Assessments**: Dynamic assessments with questions and sections

### API Layer
- RESTful API design with proper error handling
- Retry logic for failed requests
- Type-safe API calls with TypeScript
- Mock API using MSW for development

### State Management
- Server state managed with TanStack Query
- Optimistic updates for better UX
- Automatic background refetching
- Error and loading state management

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎨 Styling

The application uses a modern design system with:
- **Tailwind CSS** for utility-first styling
- **CSS Variables** for theme customization
- **Responsive Design** with mobile-first approach
- **Consistent Spacing** using Tailwind's spacing scale
- **Accessible Colors** with proper contrast ratios

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for environment-specific configuration:
```env
# Add your environment variables here
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Database Seeding
The application includes a seeding function to populate the database with sample data:
```bash
# The seed function runs automatically on first load
# Or manually trigger it through the debug page
```

## 🧪 Testing

The application includes:
- **Type Safety** with TypeScript
- **Runtime Validation** with Zod schemas
- **Error Boundaries** for graceful error handling
- **Mock API** for consistent development experience

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first** design approach
- **Tablet** optimized layouts
- **Desktop** enhanced experiences
- **Touch-friendly** interactions

## 🔒 Security

- **Input Validation** with Zod schemas
- **XSS Protection** through React's built-in protections
- **Type Safety** preventing runtime errors
- **Error Boundaries** preventing application crashes

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify
```bash
# Build the application
npm run build

# Deploy the out folder
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for hosting and deployment platform
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first CSS framework
- **TanStack** for the excellent Query library

---

Built with ❤️ using Next.js and React