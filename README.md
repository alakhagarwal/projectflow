# ProjectFlow 🚀

<div align="center">
  <h3>Manage Projects. Deliver Results.</h3>
  <p>A full-stack project management platform built to help teams plan, track, and ship work beautifully and efficiently.</p>
</div>

---

## 📖 Overview

ProjectFlow is a comprehensive project management system built with a modern tech stack. It provides robust tools for organizations to manage projects, assign tasks, collaborate with team members, and track progress through a beautiful, responsive user interface.

This project features a secure backend API, role-based access control, real-time asynchronous email notifications, and a highly polished React frontend utilizing Redux for state management and Mantine UI for premium design aesthetics.

## ✨ Features

- **Organization & Team Management:** Create organizations, invite members via email, and manage roles and permissions.
- **Project Tracking:** Create and monitor multiple projects with defined start/end dates, priorities, and statuses.
- **Task Management:** Assign tasks, set deadlines, and track task statuses (To Do, In Progress, Completed, etc.).
- **Dashboard Analytics:** Visualize project health, active tasks, and team performance at a glance.
- **Asynchronous Email Notifications:** Automated, non-blocking email alerts for project invitations and task assignments.
- **Secure Authentication:** JWT-based authentication with protected routes and secure API endpoints.
- **Modern UI/UX:** A stunning landing page, glassmorphism UI elements, dark mode accents, and smooth micro-animations.

## 💻 Tech Stack

### Frontend
- **Framework:** React 19 with Vite
- **State Management:** Redux Toolkit (with Custom Hooks)
- **Routing:** React Router DOM (v6)
- **Styling:** Tailwind CSS & Custom CSS Variables
- **UI Library:** Mantine UI (v8)
- **Icons:** Custom SVGs

### Backend
- **Framework:** Spring Boot (Java)
- **Database:** MySQL
- **Security:** Spring Security & JWT Token Authentication
- **Data Validation:** Jakarta Validation
- **Asynchronous Tasks:** `CompletableFuture` for Email SMTP
- **ORM:** Hibernate / Spring Data JPA

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Java JDK (17+)
- MySQL Server
- Maven

### Database Configuration (Backend)
1. Create a MySQL database named `project_management`.
2. Navigate to the `backend` folder and configure your `application.properties` (or `.env` if configured) with your database credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/project_management
spring.datasource.username=your_username
spring.datasource.password=your_password
```
3. Set your JWT Secret and SMTP Email configurations in the properties file.

### Running the Backend
1. Open a terminal in the `backend` directory.
2. Run the application:
```bash
mvn spring-boot:run
```

### Running the Frontend
1. Open a terminal in the `frontend` directory.
2. Install dependencies:
```bash
npm install
```
3. Start the Vite development server:
```bash
npm run dev
```
4. Access the application at `http://localhost:5173/`

---

## 📐 Architecture Highlights

- **Separation of Concerns:** Clear boundary between the REST API backend and the Single Page Application (SPA) frontend.
- **Custom Redux Hooks:** Abstracted Redux logic into custom hooks (`useAuth`, `useProj`, `useTask`, `useOrg`) ensuring components remain clean and focused solely on the UI.
- **Non-blocking Operations:** Utilizing Java's `CompletableFuture` to handle external API operations (like sending SMTP emails) asynchronously without blocking the main HTTP request thread.

---

## 👨‍💻 Author

Built with ❤️ by **Alakh**
