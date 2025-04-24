# AI-Powered Notes App

A modern notes application with AI summarization capabilities built with Next.js, TypeScript, TailwindCSS, and Supabase.
Loom video link - > https://www.loom.com/share/2ad18da124ed4210ad128dcec9f3d52a?sid=845ff608-36e4-451d-a3b3-2c846d19f554
## Features

- **User Authentication**: Sign up and login with email/password or Google OAuth
- **Note Management**: Create, read, update, and delete notes
- **AI Summarization**: Automatically generate summaries for your notes using DeepSeek AI
- **Responsive Design**: Beautiful UI with Shadcn components that works across devices
- **Real-time Updates**: Efficient state management with React Query

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript and App Router
- **Styling**: TailwindCSS and Shadcn UI
- **Backend**: Supabase for authentication and database
- **State Management**: React Query for data fetching and caching
- **AI Integration**: Groq API for text summarization
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- A Supabase account
- A DeepSeek API key

### Environment Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/notes-app.git
cd notes-app
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following content:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

Replace the placeholder values with your actual credentials.

### Database Setup

1. Log in to your Supabase dashboard
2. Create a new project
3. Set up the database schema by running the SQL from the project setup instructions

### Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

This application is configured for deployment on Vercel:

1. Push your code to a GitHub repository
2. Import the project into Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy!

## Project Structure

- `/app`: Next.js App Router pages and layouts
- `/components`: UI components
- `/contexts`: React context providers
- `/lib`: Utility functions and libraries
- `/services`: API service functions
- `/providers`: React Query and other providers
- `/public`: Static assets

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Shadcn UI for the beautiful component library
- Supabase for the authentication and database services
- DeepSeek for the AI summarization capabilities
