# QAi Talks - QA Automation Academy

A modern Next.js platform for QA automation education, featuring comprehensive courses, blog posts, and interactive learning materials.

## 🚀 Features

- **Course Management** - Browse and enroll in QA automation courses
- **Blog Platform** - Technical articles on test automation and engineering
- **Curriculum** - Detailed 12-week bootcamp curriculum
- **User Authentication** - NextAuth.js with support for multiple providers
- **Database** - Prisma ORM with SQLite (easily switchable to PostgreSQL)
- **Modern UI** - Tailwind CSS with custom design system

## 📋 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Prisma + SQLite
- **Auth:** NextAuth.js
- **Styling:** Tailwind CSS
- **React:** v19

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd next-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
- `DATABASE_URL` - SQLite database path
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- OAuth credentials (optional)

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

5. Seed the database with sample data:
```bash
npm run db:seed
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
next-app/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth-related pages
│   ├── about/             # About page
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth API routes
│   │   ├── blog/          # Blog API endpoints
│   │   ├── courses/       # Course API endpoints
│   │   └── enrollments/   # Enrollment endpoints
│   ├── blog/              # Blog pages
│   ├── courses/           # Courses pages
│   ├── curriculum/        # Curriculum page
│   └── dashboard/         # User dashboard
├── components/            # Reusable React components
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding script
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🗃️ Database Schema

The application uses the following main models:

- **User** - User accounts with role-based access
- **Course** - Course information and metadata
- **Lesson** - Individual lessons within courses
- **Enrollment** - User course enrollments with progress tracking
- **BlogPost** - Blog articles with authorship

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:seed` - Seed database with sample data

## 🔐 Authentication

The app uses NextAuth.js for authentication. Configure providers in `lib/auth.ts`:

- Email/Password (default)
- GitHub OAuth
- Google OAuth

## 🎨 Styling

Custom design system with Tailwind CSS:

- Navy blue brand colors (`--obsidian-navy: #001B44`)
- Teal accents (`--academy-teal: #00B4D8`)
- Amber highlights (`--ai-amber: #FFB700`)

## 📚 API Routes

### Blog
- `GET /api/blog` - List all published posts
- `GET /api/blog/[slug]` - Get specific post

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/[id]` - Get specific course

### Enrollments
- `POST /api/enrollments` - Enroll in a course

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Docker

```bash
docker build -t qai-talks .
docker run -p 3000:3000 qai-talks
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
