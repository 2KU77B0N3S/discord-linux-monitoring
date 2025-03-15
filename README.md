# Discord Linux Monitoring  

A Discord bot that monitors system performance on **Linux systems**. It collects real-time CPU, RAM, Swap, and Network usage statistics and updates a Discord channel using rich embeds.

---

## 🚀 Features  

- 📊 **Live CPU Monitoring** – Displays total CPU load and per-core usage as a graphical bar.  
- 🎟 **RAM & Swap Usage** – Shows used, free, and total memory, including a usage bar.  
- 🌐 **Network Stats** – Monitors download/upload speed in Mbit/s.  
- 🔄 **Automatic Updates** – Refreshes system stats every 15 seconds in Discord.  

⚠ **This bot is designed exclusively for Linux systems**. It will not function on Windows or macOS.

---

## 🛠 Requirements  

- A **Linux-based server** (Ubuntu, Debian, CentOS, etc.)  
- **Node.js** (v18+) & **npm**  
- **Docker & Docker Compose** (for containerized deployment)  
- A **Discord bot token**  

---

## 📦 Installation  

### 1️⃣  Clone the Repository  
```sh
git clone https://github.com/2KU77B0N3S/discord-linux-monitoring.git
cd discord-linux-monitoring```

### 2️⃣  Install Dependencies
```npm install```

### 3️⃣  Configure Environment Variables
Create a .env file in the root directory and add your credentials:

```DISCORD_TOKEN=your-bot-token
DISCORD_CHANNEL_ID=your-channel-id```

### ▶ Running the Bot
🔧 Start Manually (Node.js)
```node main.mjs```
🐳 Start with Docker (Build & Run in Docker)
```docker-compose up --build -d```
Stop the Bot:
```docker-compose down```

## 📜 License
This project is licensed under the MIT License.

## ❓ Troubleshooting

- **The bot does not respond in Discord**  
  - Ensure the bot is added to the server and has `Send Messages` permission.  
  - Verify your `.env` file contains the correct token and channel ID.  

- **Docker container keeps restarting**  
  - Run `docker logs discord-linux-monitoring` to check for errors.  
  - Make sure Node.js and all dependencies are installed.