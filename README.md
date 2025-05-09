# LinkHub

A modern web application for creating and sharing personalized link collections. Built with Next.js, Firebase, and Tailwind CSS.

## Features

- 🔐 **Authentication**

  - Email/password signup and signin
  - Unique username system
  - Protected routes and user data

- 🔗 **Link Management**

  - Add, delete, and reorder links
  - Toggle link visibility (public/private)
  - Click counter for each link
  - Drag-and-drop reordering

- 🎨 **User Experience**
  - Clean, responsive design
  - Loading states and error handling
  - Real-time updates
  - Dark mode support

## Technical Decisions

- **Next.js 14**: Chosen for its server components, routing, and performance optimizations
- **Firebase**: Used for authentication, database, and real-time updates
- **Tailwind CSS**: Selected for rapid development and consistent styling
- **Client-side Filtering**: Implemented for public/private links to reduce database complexity

## Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/yourusername/linkhub.git
cd linkhub
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file with:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXTAUTH_SECRET=secret
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

1. Create a new Firebase project
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Set up security rules for collections:
   - `usernames`: Public read, authenticated write
   - `links`: Public read, authenticated write for own data

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
