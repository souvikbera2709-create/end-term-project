# Gym-Companion Development Plan

This project is broken down into 5 manageable phases for the 2029 Batch End-Term Project.

## Phase 1: Foundation & Scaffolding
- Initialize React project (Vite).
- Install Tailwind CSS, Firebase, React Router, and Lucide React.
- Scaffold folder structure (`/src/components`, `/src/pages`, `/src/hooks`, `/src/context`, `/src/services`).
- Configure Tailwind CSS.

## Phase 2: Authentication & Core State
- Set up Firebase configuration in `/src/services/firebase.js`.
- Implement Authentication via Firebase Auth.
- Create Context API (`AuthContext`, `UserProgressContext`).
- Set up React Router and Protected Routes.

## Phase 3: Dynamic Dashboard & AI Coach
- Build Dynamic Dashboard with top motivational quote banner.
- Build the AI Coach chat component for fitness advice.
- Apply premium "bento-box" style, rounded corners, and shadows.

## Phase 4: Strength Tracker
- Implement CRUD-based logging system for sets, weights, and reps.
- Use `useMemo` and `useCallback` for performance optimization.
- Add responsive tables and premium UI components.

## Phase 5: Nutrition System & Exercise Library
- Build Nutrition System (caloric goals: Gain, Loss, Maintain).
- Build Exercise Library sorted by muscle groups (Chest, Back, etc.).
- Final responsive design and mobile-friendly checks.
