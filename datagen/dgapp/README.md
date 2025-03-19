# DgApp

A Next.js 15.1.6 app with App Router, shadcn/ui, Tailwind CSS 3.4, Zustand, and MongoDB integration.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run MongoDB locally or set MONGODB_URI in .env:

   ```bash
   echo "MONGODB_URI=mongodb://localhost:27017" > .env
   ```

3. Install flask
   ```bash
   pip3 install flask flask-cors numpy
   ```
4. Start the Flask server (serv2.py) on port 3400:

   ```bash
   python3 serv2.py
   ```

5. Start the Next.js app:

   ```bash
   npm run dev
   ```

6. Open http://localhost:3000 in your browser.

## Features

- Generate data via RESTful API
- Display data in tables
- Save to MongoDB
- Query MongoDB collections
