# 🚀 React + TypeScript + Vite Starter

A modern development stack using **React**, **TypeScript**, and **Vite** — optimized for speed and developer experience.
test deployment
---

## Setup

### 1. Install dependencies

```bash
npm install
```

## 2. Start the development server
```bash
npm run dev
```
The app will be available locally at http://localhost:5173 (or the port specified by Vite).

## Connecting to Notion (Local Development Setup)
To fetch and display data from Notion in the application, follow these steps to set up the local development environment:

1. Prepare Environment
Create a .env file in your server directory. (normally there is already an exsting one in the server folder that contains the already in use variables)
This file should contain:
Your Notion integration token.
The database ID of the Notion table you're accessing.

2. Set Up the Server
The server folder contains an Express application that handles API requests to Notion.

3. Run Locally
Start the Express server:
Then, start the frontend application as usual.
The server will be available at:
http://localhost:3000

4. Available API Endpoints
Fetch notes:
http://localhost:3000/api/getNotes
Fetch partners:
http://localhost:3000/getPartners

5. Modifying Notion Data or Adding Tables
Any modifications or additions to the Notion database must be approved and set up by an admin.
Once granted access, follow these steps:

6. Adding a New Notion Page/Table
Get the integration token for the new page from the Notion integrations page.
Get the database ID from the page URL.
For example, in the URL:
https://www.notion.so/tum-ai/2137306bfd6280118d75ff4ee064f0e9?v=2137306bfd6280b9912b000c0dce9e60
The ID is:
2137306bfd6280118d75ff4ee064f0e9
(The string after /tum-ai/ and ending before the ?)
Add the token and database ID to the .env file.

7. Add Fetching Logic
You can copy and adapt the existing fetching logic (e.g., from getPartners or getEvents) for the new table.

8. Deployment (e.g., Vercel)
When deploying, make sure the updated .env variables are added to Vercel.
Vercel will handle the serverless backend and environment variables in production.
