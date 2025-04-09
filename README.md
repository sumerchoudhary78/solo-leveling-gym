# Solo Leveling Gym

A gamified fitness application inspired by the Solo Leveling manhwa/anime, designed to make your fitness journey more engaging and rewarding.

## 🌟 Features

### Core Features
- **Authentication**: Secure login and registration with email/password
- **Profile Management**: View and edit user profile, upload profile photos
- **Hunter Ranking System**: Level up as you complete workouts and quests
- **Stats & Attributes**: Increase your strength, vitality, and agility as you level up
- **Quest System**: Complete workout quests to earn experience and rewards
- **Shadow Army**: Unlock and equip shadows to enhance your abilities
- **Skills**: Learn and use special skills to boost your workouts
- **Leaderboard**: Compete with other hunters on the global rankings

### Advanced Features
- **Personalized Gym Plans**: Generate custom workout plans based on your goals, fitness level, and preferences
- **Wearable Integration**: Connect with fitness wearables like Fitbit, Garmin, and Google Fit
- **Avatar Animations**: Unique avatar frames with elemental effects based on your rank
- **Real-time Chat**: Communicate with other hunters in the global chat

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/solo-leveling-gym.git
cd solo-leveling-gym
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url

# Google Generative AI (for personalized gym plans)
GOOGLE_GENAI_API_KEY=your_gemini_api_key

# Wearable Integration (optional)
NEXT_PUBLIC_FITBIT_CLIENT_ID=your_fitbit_client_id
FITBIT_CLIENT_SECRET=your_fitbit_client_secret
NEXT_PUBLIC_GARMIN_CLIENT_ID=your_garmin_client_id
GARMIN_CLIENT_SECRET=your_garmin_client_secret
NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID=your_google_fit_client_id
GOOGLE_FIT_CLIENT_SECRET=your_google_fit_client_secret
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📱 Mobile App

A Flutter-based mobile application is also available, providing the same features with a native mobile experience. The mobile app uses the same Firebase backend, ensuring data synchronization across platforms.

### Mobile App Setup

1. Navigate to the Flutter app directory:
```bash
cd flutter_app/solo_leveling_gym
```

2. Install Flutter dependencies:
```bash
flutter pub get
```

3. Run the app:
```bash
flutter run
```

## 🏋️ Personalized Gym Plan Feature

The personalized gym plan feature allows users to generate custom workout plans based on their specific needs and goals.

### How It Works

1. Users fill out a comprehensive questionnaire about their:
   - Basic information (age, sex, height, weight)
   - Fitness level (beginner, intermediate, advanced)
   - Goals (weight loss, muscle gain, strength, etc.)
   - Intensity preference (low, moderate, high)
   - Time commitment (days per week, minutes per session)
   - Available equipment (gym, limited, bodyweight only)
   - Health conditions and exercise preferences

2. The system uses Google's Gemini AI to generate a personalized workout plan tailored to the user's inputs.

3. The generated plan includes:
   - A weekly schedule
   - Specific exercises for each day
   - Sets, reps, and rest periods
   - Warm-up and cool-down routines
   - Progression guidelines
   - Nutrition tips

4. Users can view their plan, create a quest from it, and track their progress.

5. All plans are saved to the user's history for future reference.

## 🔌 Wearable Integration

Solo Leveling Gym integrates with popular fitness wearables to track your workouts and automatically update your progress.

### Supported Platforms

- **Fitbit** - All Fitbit devices with heart rate monitoring
- **Garmin** - Garmin fitness watches and trackers
- **Google Fit** - Any device that syncs with Google Fit
- **Apple Health** - Requires the Solo Leveling Gym mobile app
- **Samsung Health** - Requires the Solo Leveling Gym mobile app

### Integration Features

- Real-time workout tracking
- Automatic quest progress updates
- Experience points based on workout intensity
- Health stats synchronization

## 🧠 AI Integration

The application uses Google's Generative AI (Gemini) for several features:

- Generating personalized workout plans
- Creating dynamic quest descriptions
- Providing workout tips and advice
- Analyzing workout performance

## 🔧 Technologies Used

### Frontend
- Next.js (React)
- Tailwind CSS
- Three.js (for 3D avatar animations)

### Backend
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Realtime Database
- Next.js API Routes

### Mobile
- Flutter
- Firebase Flutter SDK

### AI & Integration
- Google Generative AI (Gemini)
- OAuth for wearable integration

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- Solo Leveling by Chugong (original concept inspiration)
- [Next.js](https://nextjs.org/) - The React Framework
- [Firebase](https://firebase.google.com/) - Backend services
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Flutter](https://flutter.dev/) - Mobile app framework
- [Google Generative AI](https://ai.google.dev/) - AI features
