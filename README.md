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


```
ski_music/
├── client/
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── theme.js
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── api/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── server.js
│   ├── package.json
│   └── skating_rink.db
└── README.md
```
