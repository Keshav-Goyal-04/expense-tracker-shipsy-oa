# Technical Documentation

## Introduction

This document provides a technical overview of the Expense Tracker application. This application is a simple expense tracker built with Next.js and Prisma.

## Getting Started

To get started with the project, you'll need to have Node.js and npm installed on your machine. You'll also need a PostgreSQL database.

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the root of the project and add the following environment variables:

    ```
    POSTGRES_URL="your-postgresql-database-url"
    JWT_SECRET="your-jwt-secret"
    ```

4.  **Run database migrations:**

    ```bash
    npx prisma migrate dev
    ```

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:3000`.

## Project Structure

```
.
├── prisma
│   ├── migrations
│   └── schema.prisma
├── public
│   ├── favicon.svg
│   └── ...
├── src
│   ├── app
│   │   ├── api
│   │   │   ├── auth
│   │   │   │   ├── login
│   │   │   │   │   └── route.js
│   │   │   │   ├── logout
│   │   │   │   │   └── route.js
│   │   │   │   └── register
│   │   │   │       └── route.js
│   │   │   ├── doc
│   │   │   │   └── page.js
│   │   │   └── expenses
│   │   │       ├── [id]
│   │   │       │   └── route.js
│   │   │       └── route.js
│   │   ├── layout.js
│   │   └── page.js
│   ├── components
│   │   ├── ExpensePieChart.js
│   │   ├── ExpenseTracker.js
│   │   ├── Modal.js
│   │   └── SwaggerUIView.js
│   ├── hooks
│   │   └── useDebounce.js
│   └── lib
│       ├── db.js
│       ├── prisma.js
│       └── swagger.js
├── .gitignore
├── next.config.mjs
├── package.json
└── ...
```

## API Documentation

The API documentation is generated using Swagger and is available at `/api/doc`.

## Functional Requirements

- **User Authentication:**
    - Users should be able to register for a new account.
    - Users should be able to log in to their account.
    - Users should be able to log out of their account.
- **Expense Management:**
    - Users should be able to create new expenses.
    - Users should be able to view a list of their expenses.
    - Users should be able to edit their expenses.
    - Users should be able to delete their expenses.
- **Filtering and Sorting:**
    - Users should be able to filter expenses by tags, date range, amount range, and type (credit/debit).
    - Users should be able to sort expenses by date and amount.
- **Data Visualization:**
    - Users should be able to see a pie chart of their expenses categorized by tags.

## Non-Functional Requirements

- **Performance:**
    - The application should load quickly.
    - API responses should be fast.
- **Security:**
    - Passwords should be hashed before being stored in the database.
    - The application should be protected against common web vulnerabilities (e.g., XSS, CSRF).
- **Usability:**
    - The user interface should be intuitive and easy to use.
    - The application should be responsive and work well on different screen sizes.
- **Scalability:**
    - The application should be able to handle a growing number of users and expenses.

## Database Schema

The database schema is defined in the `prisma/schema.prisma` file. It consists of two models: `User` and `Expense`.

### User Model

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Int` | The unique identifier for the user. |
| `email` | `String` | The user's email address. |
| `name` | `String` | The user's name. |
| `password` | `String` | The user's hashed password. |
| `expenses` | `Expense[]` | A list of the user's expenses. |

### Expense Model

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Int` | The unique identifier for the expense. |
| `title` | `String` | The title of the expense. |
| `description` | `String` | A description of the expense. |
| `amount` | `Float` | The amount of the expense. |
| `isCredit` | `Boolean` | Whether the expense is a credit or a debit. |
| `tag` | `ExpenseTag` | The tag for the expense. |
| `date` | `DateTime` | The date of the expense. |
| `author` | `User` | The user who created the expense. |
| `authorId` | `Int` | The ID of the user who created the expense. |
| `createdAt` | `DateTime` | The date and time the expense was created. |
| `updatedAt` | `DateTime` | The date and time the expense was last updated. |

### ExpenseTag Enum

| Value |
| :--- |
| `FOOD` |
| `TRAVEL` |
| `BILLS` |
| `ENTERTAINMENT` |
| `SALARY` |
| `OTHER` |

## Deployment

To deploy the application, you can use a platform like Vercel or Netlify. You will need to set up the environment variables on the deployment platform.

1.  **Push your code to a Git repository.**
2.  **Connect your Git repository to the deployment platform.**
3.  **Configure the build settings:**
    *   **Build command:** `npm run build`
    *   **Output directory:** `.next`
4.  **Add the environment variables.**
5.  **Deploy the application.**
