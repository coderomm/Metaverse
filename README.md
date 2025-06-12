
# 🏙️ Towny

Towny is a real-time collaborative web app — similar to platforms like [gather.town](https://gather.town) or [zep.us](https://zep.us) — built with:

- ⚛️ React (Vite) frontend  
- 🚀 Express backend with integrated WebSocket server  
- 🛡️ Prisma + PostgreSQL for database  
- 🌐 Real-time communication

---

## 📁 Folder Structure

```
towny/
├── backend/    # Express + WebSocket + Prisma
├── frontend/   # React + Vite

````

---

## ⚙️ Getting Started (Local Setup)

### 1. Clone the repository

```bash
git clone https://github.com/coderomm/Towny.git
cd towny
````

---

### 2. Start the Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npm run dev
```

> Backend & WebSocket: [http://localhost:3000](http://localhost:3000)

---

### 3. Start the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

> Frontend: [http://localhost:5173](http://localhost:5173)

---

## 🔁 Optional: Run Both Together

Install `concurrently` and add this to the root `package.json`:

```bash
npm install --save-dev concurrently
```

```json
"scripts": {
  "dev": "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\""
}
```

Then run:

```bash
npm run dev
```

---

## 🔧 Proxy Setup

To avoid CORS issues, ensure `vite.config.ts` has:

```ts
server: {
  proxy: {
    '/api': 'http://localhost:3000'
  }
}
```

---

## ✅ Done!

You're now all set to explore or contribute to **Towny** 🎉
