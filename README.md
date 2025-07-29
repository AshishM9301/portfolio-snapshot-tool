# Portfolio Snapshot Tool 🚀

A web-based tool that allows developers to create beautiful, shareable portfolio snapshots for their projects. Generate branded cards with project details, tech stack, and images that can be easily shared on social media platforms.

## 🎯 Project Overview

The Portfolio Snapshot Tool is designed to help developers showcase their projects in a visually appealing way. Users can input project details, upload images, and generate branded cards that can be exported as images and shared across social media platforms.

### Core Features (MVP)
- 📝 Manual project input form
- 🖼️ Image upload functionality  
- 🎨 Dynamic snapshot card preview
- 🤖 AI-powered website snapshot generation
- 📸 Automatic website screenshot capture
- 🎯 Multiple AI-generated portfolio variations
- 📤 Export/share capabilities (PNG/JPG)
- 📱 Fully responsive design
- 🐦 Social media sharing (Twitter/X)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Backend**: tRPC for type-safe APIs
- **Database**: Prisma + SQLite
- **Authentication**: Firebase Auth
- **AI Integration**: OpenRouter API (Claude 3.5 Sonnet, GPT-4 Vision)
- **Screenshot**: Puppeteer for website capture
- **Deployment**: Vercel
- **Package Manager**: Bun
- **Linting**: Biome
- **Loading**: react-top-loading-bar

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai/keys))

### Environment Setup
Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="file:./db.sqlite"

# OpenRouter API Key (Required for AI features)
OPENROUTER_API_KEY="your_openrouter_api_key_here"

# App URL (optional)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Installation & Development
```bash
# Install dependencies
bun install

# Set up database
bun run db:generate

# Start development server
bun run dev
```

## 📁 Project Structure

```
portfolio-snapshot-tool/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── _components/     # Page-specific components
│   │   ├── api/            # API routes
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # Reusable UI components
│   ├── lib/               # Utility functions
│   │   ├── openrouter.ts  # AI integration
│   │   └── screenshot.ts  # Screenshot utilities
│   ├── server/            # Server-side logic
│   │   └── api/           # tRPC routers
│   │       └── snapshot.ts # AI snapshot generation
│   ├── styles/            # Global styles
│   └── trpc/              # tRPC configuration
├── prisma/                # Database schema
└── public/                # Static assets
```

## 📅 15-Day MVP Development Plan

### ✅ Day 1-2: Project Kickoff & Feature Planning
- [x] **MVP feature set defined**: Manual input, image upload, snapshot card, export/share
- [x] **Initial wireframes/mockups**: Landing page, input form, preview, export
- [x] **Code repository setup**: GitHub repository created
- [x] **Deployment platform**: Vercel ready

### ✅ Day 3: Tech Stack & Boilerplate  
- [x] **Next.js + Tailwind CSS**: Project initialized
- [x] **Base folder structure**: Established with proper organization
- [x] **Routing setup**: App Router configured
- [x] **Deployment**: Ready for "coming soon" landing page

### 🔄 Day 4: Input Form UI (In Progress)
- [ ] Build form for project details (title, description, tech stack)
- [ ] Add input for project link (GitHub, personal site, etc.)
- [ ] Add image upload functionality
- [ ] Form validation and error handling

### 📋 Day 5: Basic Snapshot Card Preview
- [ ] Create branded card template
- [ ] Dynamic rendering with inputted project info
- [ ] Live real-time card preview
- [ ] Responsive card design

### 📋 Day 6-7: Card Export/Sharing
- [ ] Integrate html2canvas for PNG/JPG export
- [ ] Download functionality
- [ ] Tweet sharing with prepopulated text
- [ ] Cross-platform export testing

### 📋 Day 8: Responsive UI & Polish
- [ ] Mobile-responsive design
- [ ] Layout, fonts, spacing optimization
- [ ] Button states and hover effects
- [ ] Accessibility improvements

### 📋 Day 9: Error Handling & Edge Cases
- [ ] Missing input validation
- [ ] URL validation
- [ ] Upload error handling
- [ ] Placeholder images and required field checks

### 📋 Day 10: Deploy & Share Early Preview
- [ ] Deploy MVP to Vercel
- [ ] Social media announcement
- [ ] Early tester feedback collection
- [ ] Bug tracking and documentation

### 📋 Day 11-12: Rapid Feedback Iteration
- [ ] UX/UI bug fixes
- [ ] Card output refinements
- [ ] Copy and tooltip improvements
- [ ] User adoption tracking

### 📋 Day 13: Micro-Copy & Final Polish
- [ ] Clear CTAs and onboarding
- [ ] "How it works" documentation
- [ ] Footer and credits
- [ ] Optional feedback form

### 📋 Day 14: Final Testing and QA
- [ ] Cross-browser testing
- [ ] Mobile/desktop export verification
- [ ] Final user testing
- [ ] Performance optimization

### 📋 Day 15: Official Soft Launch
- [ ] Demo video/GIF creation
- [ ] Social media launch campaign
- [ ] User testimonials collection
- [ ] Future iteration planning

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/portfolio-snapshot-tool.git
   cd portfolio-snapshot-tool
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your environment variables
   ```

4. **Set up the database**
   ```bash
   bun run db:push
   ```

5. **Run the development server**
   ```bash
   bun run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Development Commands

```bash
# Development
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server

# Database
bun run db:push      # Push schema to database
bun run db:studio    # Open Prisma Studio

# Linting & Formatting
bun run lint         # Run Biome linter
bun run format       # Format code with Biome
```

## 📝 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# Next Auth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Firebase (for authentication)
FIREBASE_API_KEY="your-api-key"
FIREBASE_AUTH_DOMAIN="your-domain.firebaseapp.com"
FIREBASE_PROJECT_ID="your-project-id"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/AshishM9301/portfolio-snapshot-tool/issues)
- **Discussions**: [GitHub Discussions](https://github.com/AshishM9301/portfolio-snapshot-tool/discussions)
- **Email**: ashishkmahto98@gmail.com

---

**Built with ❤️ using the T3 Stack**
