# QA Setup and Testing Guide

Here is a comprehensive step-by-step guide to clone, set up, and test the e-commerce application.

---

### **Prerequisites**
Before starting, ensure you have the following installed on your machine:
*   [Git](https://git-scm.com/downloads)
*   [Node.js](https://nodejs.org/) (v18 or newer recommended)
*   A free PostgreSQL database. You'll need a connection string (e.g. from a free provider like [Neon](https://neon.tech/) or [Supabase](https://supabase.com/)).

---

### **Step 1: Clone the Repository**
Open your terminal or command prompt and run the following command to securely clone the project repository to your local machine:
```bash
git clone https://github.com/Melow04/ecomeunos.git
```

Next, navigate into the project directory:
```bash
cd ecomeunos
# or the directory name if it's different, e.g., cd ecommerce
```

### **Step 2: Install Dependencies**
The project uses `npm` as its package manager. Run this command to install all necessary packages and libraries:
```bash
npm install
```

### **Step 3: Configure Environment Variables**
The application requires certain credentials to communicate with the database and handle user authentication. 
Create a new file in the root directory named `.env.local` and add the following keys.

```env
# Your connection string to your PostgreSQL DB (example format below)
DATABASE_URL="postgresql://username:password@hostname/dbname"

# Secret used to encrypt user sessions. 
# You can generate a random string by running `npx auth secret` in your terminal
AUTH_SECRET="your-random-secure-string"
```

### **Step 4: Initialize the Database**
To set up the database schema (tables, columns, etc.) and populate it with initial mock data so you can test right away, run the following commands in sequence:

1. **Push the schema to your database:**
```bash
npm run db:push
```
2. **Seed the database with initial products, admin users, etc.:**
```bash
npm run seed
```

### **Step 5: Run the Development Server**
Start up the local Next.js server so you can interact with the app in your browser:

```bash
npm run dev
```

### **Step 6: Access and Test the Application**
Once the server is running, open your web browser and go to: **[http://localhost:3000](http://localhost:3000)**

**Testing Checklist for QA Flow:**
*   **Public Storefront (`/` , `/products`)**: Verify that product listings load properly and the layout displays correctly. Make sure you can view individual product pages (`/products/[id]`).
*   **Cart & Checkout (`/cart`, `/checkout`)**: Test adding items to the cart, modifying quantities, and proceeding to the checkout flow.
*   **Authentication (`/auth/login`, `/auth/register`)**: Test creating a new customer account, logging out, and logging back in.
*   **Admin Dashboard (`/admin`)**: Log in with an admin-level account (which should be generated safely by the `npm run seed` command) to test accessing the protected admin routes (e.g., managing orders, products, customers, and analytics).

--- 
*If you run into any errors or crashes with dependencies, try deleting the `node_modules` folder and `.next` folder, and re-running `npm install` and `npm run dev`.*
