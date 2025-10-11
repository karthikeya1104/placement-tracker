# 📌 Placement Tracker App

**Placement Tracker** is a personal mobile app for students to organize and monitor placement drives, registration status, rounds, and messages. It helps students stay on top of their placement journey by converting unstructured messages from placement groups into structured data.

---

## 🚀 Overview

Placement Tracker allows students to:

- Quickly view **upcoming drives** for which they are registered.
- Track **registered vs unregistered drives**.
- Access **detailed drive information** including rounds, selection status, and raw messages.
- Get **personal placement analytics** to monitor progress.
- Paste raw placement messages and let the app intelligently extract and update drive details.

> Designed for **personal use**; tracks only the individual student's registrations.

---

## 🛠 Features

- **Home Tab:**  
  View all upcoming drives for which you are registered, with quick access to drive details.

- **Registered Tab:**  
  See a list of all drives you have registered for, including both ongoing and finished drives.

- **All Drives Tab:**  
  Browse every drive in the database, regardless of registration status.

- **Analytics Tab:**  
  Visualize your placement journey with charts showing drive status distribution and a timeline of registered/finished drives.

- **Add Message Tab:**  
  - Paste raw placement messages to automatically parse and store drive information.  
  - Update existing drives by selecting a drive and adding a new message; the app intelligently updates rounds and drive details.  
  - Handles missing API keys and parsing/network errors gracefully, storing messages locally for later processing.

- **Drive Details Screen:**  
  - View and edit all details of a drive, including company, role, CTC, location, and notes.  
  - See all rounds for the drive, add new rounds, or edit/delete existing ones.  
  - View all raw messages associated with the drive.

- **Rounds Management:**  
  - Add, edit, or delete rounds for each drive.  
  - Track round number, name, date, status (upcoming/finished), and result (shortlisted/rejected/not conducted).

- **Raw Messages:**  
  - View all original messages for a drive.  
  - Copy messages to clipboard with one tap.

- **Settings:**  
  - Manage your Gemini API key for AI-powered parsing.  
  - Toggle dark/light mode.  
  - Export or import your database as CSV files.  
  - Reset the entire database (with confirmation).

- **Offline & Fallback Handling:**  
  - If parsing fails or the network is unavailable, raw messages are stored locally and retried later.  
  - Ensures no data loss and smooth offline usage.

---

## 💻 Tech Stack

- **Framework:** React Native with Expo  
- **Database:** SQLite (local storage)  
- **Navigation:** React Navigation (Bottom Tabs + Stack)  
- **UI:** React Native components + custom styles  
- **Icons:** Ionicons  

---

## ⚡ Installation

1. **Clone the repository:**
    ```sh
    git clone https://github.com/karthikeya1104/placement-tracker
    cd PlacementTracker
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Start the app:**
    ```sh
    npx expo start
    ```

---

## 📝 Usage

1. Open the app.
2. Navigate between tabs to explore **Home**, **Registered**, **All Drives**, and **Analytics**.
3. Add raw messages in the **Add Message** tab; the app will parse and store them.
4. Tap **View Details** on a drive to see rounds, notes, and raw messages.
5. Edit selection status or other details from the **Drive Details** screen.
6. Manage your API key and settings from the **Settings** screen.

---

## 👨‍💻 Author

**Karthikeya Goud Nagelli**