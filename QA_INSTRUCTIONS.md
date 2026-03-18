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

---

## Known Issues (Reported)

### 1) Wishlist icon (heart) is not clickable on product cards
- Area: Storefront product listings (for example `/` and `/products`)
- Reproduction steps:
	1. Open the product listing page.
	2. Hover or click the heart icon on any product card.
	3. Attempt to add the product to wishlist.
- Actual result: The heart icon is not clickable and the product is not added to wishlist.
- Expected result: Clicking the heart icon should add/remove the product from wishlist and show a clear UI state update.

### 2) Product detail page has no wishlist icon
- Area: Product details page (`/products/[id]`)
- Reproduction steps:
	1. Open any product from the listing.
	2. Inspect the product detail view controls.
- Actual result: There is no wishlist (heart) control on the product detail page.
- Expected result: A wishlist control should be visible and usable on product detail pages.

### 3) User profile dropdown Dashboard/Settings show wrong content
- Area: Header profile menu (user icon dropdown)
- Reproduction steps:
	1. Sign in as a customer account.
	2. Click the user profile icon in the header.
	3. Click `Dashboard` and then `Settings` from the dropdown menu.
- Actual result: `Dashboard` and `Settings` lead to an account view that only shows `Order History` and `Wishlist` instead of dedicated dashboard/settings content.
- Expected result: `Dashboard` should show dashboard-specific content and `Settings` should show editable account settings.

### 4) Cart checkout does not allow selecting specific item(s)
- Area: Shopping cart (`/cart`) and checkout flow (`/checkout`)
- Reproduction steps:
	1. Add multiple products to cart.
	2. Open the cart page.
	3. Try to select only one or some items for checkout.
	4. Click `Proceed to Checkout`.
- Actual result: The flow does not provide item-level selection for checkout; checkout uses all cart items.
- Expected result: User should be able to choose specific item(s) in cart and proceed to checkout with only the selected item(s).

### 5) First-time logged-in user info is not properly saved for reuse
- Area: Checkout information step (`/checkout`) and account profile data handling
- Reproduction steps:
	1. Log in with a user account that has no saved profile/shipping information.
	2. Go to checkout.
	3. Fill in required personal and shipping fields.
	4. Complete the save/continue flow.
	5. Return to checkout or account settings.
- Actual result: First-time user information is not reliably saved and reused.
- Expected result: First-time logged-in users should be prompted to provide required information and have authority to save it for future checkouts and profile reuse.

### 6) Guest user can proceed to checkout without authentication
- Area: Cart to checkout transition (`/cart` -> `/checkout`)
- Reproduction steps:
	1. Ensure user is logged out.
	2. Add one or more items to cart.
	3. Open cart page.
	4. Click `Proceed to Checkout`.
- Actual result: User is allowed to proceed directly to checkout while unauthenticated.
- Expected result: Guest users may add items to cart, but clicking `Proceed to Checkout` must redirect them to sign in/sign up before continuing.
