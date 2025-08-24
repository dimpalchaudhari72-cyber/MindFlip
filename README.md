# MindFlip

MindFlip is a web application that uses AI to help users create flashcards from images or text.

## Features

*   **User Authentication:** Secure user registration and login system.
*   **AI-Powered Flashcard Generation:**
    *   Extract text from images using Tesseract.js.
    *   Generate flashcards from the extracted text using OpenAI.
*   **Flashcard Management:** Create, view, update, and delete flashcards.
*   **Profile Management:** Users can view and manage their profile information.

## Tech Stack

*   **Frontend:**
    *   React
    *   Vite
    *   TypeScript
    *   Tailwind CSS
*   **Backend:**
    *   Node.js
    *   Express.js
*   **Database:**
    *   SQLite
*   **Authentication:**
    *   JSON Web Tokens (JWT)
*   **AI:**
    *   Tesseract.js
    *   OpenAI

## File Structure

```
project
├── backend
│   ├── middleware
│   │   └── auth.cjs
│   ├── models
│   │   └── database.cjs
│   └── routes
│       ├── ai.cjs
│       ├── auth.cjs
│       ├── flashcards.cjs
│       └── profile.cjs
├── src
│   ├── components
│   ├── contexts
│   ├── hooks
│   └── pages
├── uploads
├── .gitignore
├── eng.traineddata
├── eslint.config.js
├── index.html
├── mindflip.db
├── package.json
├── postcss.config.js
├── README.md
├── server.cjs
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

*   Node.js and npm
*   An OpenAI API key

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/mindflip.git
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory and add your OpenAI API key:
    ```
    OPENAI_API_KEY=your-api-key
    ```

### Running the Application

1.  Start the backend server:
    ```bash
    node server.cjs
    ```
2.  Start the frontend development server:
    ```bash
    npm run dev
    ```

## API Endpoints

| Method | Endpoint           | Description                     |
| ------ | ------------------ | ------------------------------- |
| POST   | /api/auth/register | Register a new user             |
| POST   | /api/auth/login    | Login a user                    |
| GET    | /api/flashcards    | Get all flashcards for a user   |
| POST   | /api/flashcards    | Create a new flashcard          |
| PUT    | /api/flashcards/:id| Update a flashcard              |
| DELETE | /api/flashcards/:id| Delete a flashcard              |
| GET    | /api/profile       | Get user profile information    |
| PUT    | /api/profile       | Update user profile information |
| POST   | /api/ai/extract    | Extract text from an image      |
| POST   | /api/ai/generate   | Generate flashcards from text   |

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

This project is licensed under the MIT License.
