# Talk Route Server

## Live Site: [https://talk-route.web.app/](https://talk-route.web.app/)

### Server Repository: [https://github.com/kaziabulhasib/talkroute-server](https://github.com/kaziabulhasib/talkroute-server)

---

### Overview:

The **Talk Route Server** is the backend for the Talk Route community forum website. It provides APIs for user authentication, post management, comments, announcements, and payment processing. The server is built with Node.js and Express, and it uses MongoDB as the database. It also integrates with Stripe for payment functionality.

---

### Technology Stack:

- **Node.js**: Server-side runtime environment.
- **Express.js**: Web framework for building APIs.
- **MongoDB**: NoSQL database for storing data.
- **JWT**: For secure user authentication.
- **Stripe**: For payment processing.
- **dotenv**: For managing environment variables.
- **Vercel**: For server deployment.

---

### Features:

- **User Authentication**: Secure login and registration using JWT.
- **Role-Based Access Control**: Admin and user roles with restricted access.
- **Post Management**: Create, read, update, and delete posts.
- **Comment System**: Add and retrieve comments for posts.
- **Upvote/Downvote**: Community-driven content curation.
- **Announcements**: Admin can post announcements.
- **Payment Integration**: Stripe for subscription-based premium features.

---

## Project Setup

To set up the server locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/kaziabulhasib/talkroute-server.git

2. Navigate to the project directory:
   ```bash
   cd talkroute-server
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```


4. Create a `.env` file in the root directory and add the following environment variables:

   ```env
   PORT=5000
   DB_USER=your_mongodb_username
   DB_PASS=your_mongodb_password
   ACCESS_TOKEN_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```
5. Start the Server
   ```bash
   npm run dev
   ```
6.  The Server will run on http://localhost:5000.

---

## API Endpoints

### Authentication:
- **POST** `/jwt`: Generate a JWT token.

### Users:
- **GET** `/users`: Get all users (Admin only).
- **POST** `/users`: Add a new user.
- **PATCH** `/users/admin/:id`: Make a user an admin (Admin only).

### Posts:
- **GET** `/posts`: Get all posts (with optional tag filter).
- **POST** `/posts`: Add a new post.
- **GET** `/posts/:id`: Get a post by ID.
- **DELETE** `/posts/:id`: Delete a post by ID.
- **POST** `/posts/:id/upvote`: Upvote a post.
- **POST** `/posts/:id/downvote`: Downvote a post.

### Comments:
- **GET** `/comments`: Get all comments.
- **POST** `/comments`: Add a new comment.

### Announcements:
- **GET** `/announcements`: Get all announcements.
- **POST** `/announcements`: Add a new announcement (Admin only).

### Payments:
- **POST** `/create-payment-intent`: Create a payment intent for Stripe.

---

## Deployment

The server is deployed on **Vercel**. The deployment configuration is managed using the `vercel.json` file.

---

### Note:

For the client-side application, refer to the [Talk Route Client Repository](https://github.com/kaziabulhasib/talkroute-client).