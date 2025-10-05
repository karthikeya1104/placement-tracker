# 📌 Placement Tracker App

**Placement Tracker** is a personal mobile app for students to organize and monitor placement drives, registration status, rounds, and messages. It helps students stay on top of their placement journey by converting unstructured messages from placement groups into structured data.

---

## 🚀 Overview

Placement Tracker allows students to:

- Quickly view **upcoming drives** for which they are registered.
- Track **registered vs unregistered drives**.
- Access **detailed drive information** including rounds, selection status, and raw messages.
- Get **personal placement analytics** to monitor progress.

> Designed for **personal use**; tracks only the individual student's registrations.

---

## 🛠 Features

- **Home:** Shows upcoming drives for which the student has registered.  
- **Registered:** Lists all registered drives (upcoming or finished).  
- **All Drives:** Displays all drives (registered and unregistered).  
- **Analytics:** Summary statistics: total drives, registered drives, upcoming rounds, selections.  
- **Add Message:**  
  - Paste raw messages to parse and store drive information.  
  - You can select an **existing drive** and provide a new message; the app will automatically **add new rounds** or **update drive details**.  
- **Drive Details:**  
  - Detailed view with rounds, notes, and raw messages.  
  - You can **manually add rounds** and update selection status or other details.  
- **Fallback & Offline Handling:**  
  - If network issues or AI parsing errors occur, raw messages are stored locally in SQLite.  
  - Once the network is restored or parsing is successful, the data is automatically updated.  
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
```bash
git clone https://github.com/karthikeya1104/placement-tracker
cd PlacementTracker
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the app:**
```bash
npx expo start
```

---

## 📝 Usage

1. Open the app.
2. Navigate between tabs to explore **Home**, **Registered**, **All Drives**, and **Analytics**.
3. Add raw messages in the **Add Message** tab; the app will parse and store them.
4. Tap **View Details** on a drive to see rounds, notes, and raw messages.
5. Edit selection status or other details from the **Drive Details** screen.

---

## 👨‍💻 Author

**Karthikeya Goud Nagelli**