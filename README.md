# 🎵 Ski Music - Real-Time Music Control System for Ice Rinks

**Ski Music** is a real-time music playback and control system built with **React**, **Redux**, **Node.js**, **Express**, and **WebSocket**.  
It allows multiple users to remotely control a shared music player via a web interface — perfect for use cases like ice rinks, gyms, cafés, and events.

---

## ✨ Features

- 🎧 **Real-Time Playback** – Synchronizes music playback state across all clients using WebSocket
- 📱 **Remote Control Interface** – Control the music player from any device
- 📂 **Music Library Management** – Upload, delete, and browse music files
- ⏯ **Playback Controls** – Play, pause, skip next/previous tracks
- 📡 **Live State Updates** – Instantly broadcast player status to all connected users
- ☁ **Cloud Storage** – Store and retrieve music files from Supabase Storage with public URLs

---

## 🛠 Tech Stack

### Frontend
<p>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" width="50" height="50"/> &nbsp;&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg" alt="Redux" width="50" height="50"/> &nbsp;&nbsp;&nbsp;
  <img src="https://vitejs.dev/logo.svg" alt="Vite" width="50" height="50"/>
</p>
<p>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript" width="50" height="50"/> &nbsp;&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/materialui/materialui-original.svg" alt="Material UI" width="50" height="50"/> &nbsp;&nbsp;&nbsp;
 
</p>

### Backend
<p>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="Node.js" width="50" height="50"/> &nbsp;&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" alt="Express" width="50" height="50"/> &nbsp;&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" width="50" height="50"/>
</p>
<p>
  <img src="https://raw.githubusercontent.com/supabase/supabase/master/packages/common/assets/images/supabase-logo-icon.png" alt="Supabase" width="50" height="50"/> &nbsp;&nbsp;&nbsp;

  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/socketio/socketio-original.svg" alt="Socket.IO" width="50" height="50"/>
</p>



---

## 📂 Project Structure

```plaintext
ski_music/
├── client/
│   ├── dist/
│   ├── node_modules/
│   ├── src/
│   │   ├── app/
│   │   │   └── store.js
│   │   ├── assets/
│   │   │   └── undraw_happy-music_name.svg
│   │   ├── components/
│   │   │   ├── BackButton.jsx
│   │   │   ├── CurrentPlaylist.jsx
│   │   │   ├── LoginModal.jsx
│   │   │   ├── SongLibrary.jsx
│   │   │   └── UploadZone.jsx
│   │   ├── contexts/
│   │   │   └── SocketContext.jsx
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   └── authSlice.js
│   │   │   └── music/
│   │   │       ├── playerSlice.js
│   │   │       ├── playlistSlice.js
│   │   │       └── songLibrarySlice.js
│   │   ├── hooks/
│   │   │   └── usePlayerSocket.js
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── PlayerPage.jsx
│   │   │   └── RemotePage.jsx
│   │   ├── utils/
│   │   │   ├── apiClient.js
│   │   │   └── socketEvent.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── theme.js
│   ├── .env
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
│
├── server/
│   ├── node_modules/
│   ├── src/
│   │   ├── api/
│   │   │   ├── authRoutes.js
│   │   │   ├── playerRoutes.js
│   │   │   ├── playlistRoutes.js
│   │   │   └── songsRoutes.js
│   │   ├── constants/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── playerController.js
│   │   │   ├── playlistController.js
│   │   │   ├── songsController.js
│   │   │   └── uploadController.js
│   │   ├── middleware/
│   │   ├── services/
│   │   │   ├── playerStateService.js
│   │   │   ├── postgresService.js
│   │   │   ├── socketService.js
│   │   │   └── supabaseClient.js
│   │   ├── socketEvent.js
│   │   └── server.js
│   ├── temp/
│   │   └── uploads/
│   │       ├── 1754169958878_Acti.mp3
│   │       ├── 1754169958889_Adva.mp3
│   │       ├── 1754271144441_Acti.mp3
│   │       ├── 1754271181033_3_am.mp3
│   │       └── 1754271181044_A_Su.mp3
│   ├── .env
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   ├── skating_rink.db
│   └── README.md
└── README.md
