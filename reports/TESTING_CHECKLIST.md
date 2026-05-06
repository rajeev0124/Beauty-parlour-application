# Beauty Parlour - Complete Testing Checklist
## Real-Time Testing After Deployment

**Date:** May 6, 2026
**Frontend URL:** https://beauty-parlour-0124.web.app
**Backend URL:** https://beauty-parlour-application.onrender.com
**Test User:** r12@gmail.com / rajeev@12

---

## 🔧 SETUP PHASE

### 1. Install & Configure Postman
- [ ] Download Postman from https://www.postman.com/downloads/
- [ ] Install and launch Postman
- [ ] Click **Import** button
- [ ] Select `Beauty-Parlour-Collection.json` from this project
- [ ] Create environment variable:
  - Name: `base_url` = `https://beauty-parlour-application.onrender.com/api`
  - Name: `token` = (leave empty, will populate after login)
  - Name: `frontend_url` = `https://beauty-parlour-0124.web.app`

### 2. Verify Backend Health
- [ ] Open Postman
- [ ] Send: `GET https://beauty-parlour-application.onrender.com/health`
- [ ] Expected: Status 200 with database and service status
- [ ] **If fails:** Backend may need restart on Render dashboard

---

## 🔐 PHASE 1: AUTHENTICATION TESTING

### 1.1 Login Flow
- [ ] In Postman, click "1. AUTHENTICATION" → "Login"
- [ ] Body should have:
  ```json
  {
    "email": "r12@gmail.com",
    "password": "rajeev@12"
  }
  ```
- [ ] Send request
- [ ] **Expected Response:**
  - Status: `200 OK`
  - Response includes: `token`, `user object with id/email/firstName`
- [ ] Copy the `token` value from response
- [ ] Paste it in Postman → Environment → `token` variable
- [ ] **TEST PASSED** if token is saved ✅

### 1.2 Token Verification
- [ ] Click "Verify Token" request
- [ ] Ensure Authorization header has: `Bearer {{token}}`
- [ ] Send request
- [ ] **Expected:** Status 200, returns current user info
- [ ] **TEST PASSED** ✅

### 1.3 Register New User (Optional)
- [ ] Click "Register New User"
- [ ] Change email to: `testuser.{timestamp}@gmail.com`
- [ ] Send request
- [ ] **Expected:** Status 201, new user created with token
- [ ] **TEST PASSED** ✅

---

## 📊 PHASE 2: SERVICES TESTING

### 2.1 Get All Services
- [ ] Click "2. SERVICES" → "Get All Services"
- [ ] Send request (no auth required)
- [ ] **Expected:** Status 200, returns array of services like:
  ```json
  {
    "data": [
      {
        "_id": "...",
        "name": "Haircut",
        "price": 500,
        "duration": 30,
        "description": "..."
      }
    ]
  }
  ```
- [ ] **Note:** Copy one service `_id` for appointment booking
- [ ] **TEST PASSED** ✅

### 2.2 Get Service Details
- [ ] Click "Get Service by ID"
- [ ] Replace `SERVICE_ID_HERE` with an actual service ID from above
- [ ] Send request
- [ ] **Expected:** Status 200, single service details
- [ ] **TEST PASSED** ✅

### 2.3 Create Service (Admin Only)
- [ ] Click "Create Service (Admin)"
- [ ] Ensure `{{token}}` is in Authorization header
- [ ] Modify the service details in body (change name/price)
- [ ] Send request
- [ ] **Expected:** Status 201, new service created with ID
- [ ] **TEST PASSED** ✅ (or 403 if not admin)

---

## 📅 PHASE 3: APPOINTMENTS TESTING

### 3.1 Create Appointment
- [ ] Click "3. APPOINTMENTS" → "Create Appointment"
- [ ] Replace `SERVICE_ID_HERE` with actual service ID from Phase 2
- [ ] Change date to future date: `2026-05-25T14:00:00Z`
- [ ] Ensure `{{token}}` header present
- [ ] Send request
- [ ] **Expected:** Status 201, appointment created with ID
- [ ] **CRITICAL:** Copy the appointment `_id` for next tests
- [ ] **TEST PASSED** ✅

### 3.2 Get My Appointments
- [ ] Click "Get My Appointments"
- [ ] Send request
- [ ] **Expected:** Status 200, returns array with the appointment you just created
- [ ] Verify appointment shows:
  - Service name
  - Appointment date
  - Status = "pending"
  - Your user ID
- [ ] **TEST PASSED** ✅

### 3.3 Get Appointment Detail
- [ ] Click "Get Appointment by ID"
- [ ] Replace `APPOINTMENT_ID_HERE` with ID from 3.1
- [ ] Send request
- [ ] **Expected:** Status 200, full appointment details
- [ ] **TEST PASSED** ✅

### 3.4 Update Appointment
- [ ] Click "Update Appointment"
- [ ] Replace ID with your appointment ID
- [ ] Change status to "confirmed"
- [ ] Send request
- [ ] **Expected:** Status 200, appointment updated
- [ ] Verify the status changed to "confirmed"
- [ ] **TEST PASSED** ✅

### 3.5 Cancel Appointment
- [ ] Click "Cancel Appointment"
- [ ] Replace ID with appointment ID
- [ ] Send request
- [ ] **Expected:** Status 200 with success message
- [ ] Verify in "Get My Appointments" that it's removed or marked cancelled
- [ ] **TEST PASSED** ✅

---

## 👤 PHASE 4: USER PROFILE TESTING

### 4.1 Get My Profile
- [ ] Click "4. USERS/PROFILE" → "Get My Profile"
- [ ] Send request
- [ ] **Expected:** Status 200, returns:
  ```json
  {
    "data": {
      "_id": "...",
      "email": "r12@gmail.com",
      "firstName": "...",
      "lastName": "...",
      "phone": "...",
      "role": "customer"
    }
  }
  ```
- [ ] **Note:** Copy your `_id` for update test
- [ ] **TEST PASSED** ✅

### 4.2 Update Profile
- [ ] Click "Update Profile"
- [ ] Replace `USER_ID_HERE` with your user ID from above
- [ ] Update name and phone:
  ```json
  {
    "firstName": "Rajeev",
    "lastName": "Kumar",
    "phone": "9876543210"
  }
  ```
- [ ] Send request
- [ ] **Expected:** Status 200, profile updated
- [ ] Send "Get My Profile" again to verify changes
- [ ] **TEST PASSED** ✅

---

## 🛍️ PHASE 5: PRODUCTS & ORDERS TESTING

### 5.1 Get All Products
- [ ] Click "5. PRODUCTS" → "Get All Products"
- [ ] Send request
- [ ] **Expected:** Status 200, returns product list
- [ ] If no products, skip to 5.3
- [ ] **Note:** Copy a product `_id` for ordering
- [ ] **TEST PASSED** ✅

### 5.2 Get Product Detail
- [ ] Click "Get Product by ID"
- [ ] Use an actual product ID
- [ ] Send request
- [ ] **Expected:** Status 200, single product details
- [ ] **TEST PASSED** ✅

### 5.3 Create Order
- [ ] Click "6. ORDERS" → "Create Order"
- [ ] If you have a product ID, update it:
  ```json
  {
    "items": [
      {
        "productId": "ACTUAL_ID_HERE",
        "quantity": 2
      }
    ]
  }
  ```
- [ ] Send request
- [ ] **Expected:** Status 201, order created with ID
- [ ] **Note:** Copy order ID for verification
- [ ] **TEST PASSED** ✅

### 5.4 Get My Orders
- [ ] Click "Get My Orders"
- [ ] Send request
- [ ] **Expected:** Status 200, returns your orders
- [ ] Verify the order appears in the list
- [ ] **TEST PASSED** ✅

---

## 💳 PHASE 6: PAYMENTS & REVIEWS

### 6.1 Get Payment History
- [ ] Click "7. PAYMENTS" → "Get Payment History"
- [ ] Send request
- [ ] **Expected:** Status 200, payment list (may be empty)
- [ ] **TEST PASSED** ✅

### 6.2 Create Review
- [ ] Click "8. REVIEWS" → "Create Review"
- [ ] Use actual service ID from Phase 2:
  ```json
  {
    "serviceId": "ACTUAL_SERVICE_ID",
    "rating": 5,
    "comment": "Excellent service!"
  }
  ```
- [ ] Send request
- [ ] **Expected:** Status 201, review created
- [ ] **TEST PASSED** ✅

### 6.3 Get All Reviews
- [ ] Click "Get All Reviews"
- [ ] Send request
- [ ] **Expected:** Status 200, includes your review
- [ ] **TEST PASSED** ✅

---

## 🌐 PHASE 7: FRONTEND UI TESTING

### 7.1 Load Frontend
- [ ] Open browser → https://beauty-parlour-0124.web.app
- [ ] **Expected:** Page loads without errors
- [ ] Open DevTools (F12) → Console
- [ ] **Expected:** No red error messages
- [ ] **TEST PASSED** ✅

### 7.2 Home Page
- [ ] Check page fully loads
- [ ] [ ] Hero image/banner displays
- [ ] [ ] Services carousel visible
- [ ] [ ] Product showcase visible
- [ ] [ ] Navigation menu works
- [ ] [ ] Footer visible at bottom
- [ ] [ ] All buttons clickable
- [ ] **TEST PASSED** ✅

### 7.3 Browse Services Page
- [ ] Click "Services" in navbar
- [ ] **Expected:** Services page loads with grid of service cards
- [ ] [ ] Each card shows: image, name, price, description
- [ ] [ ] "Book Now" button visible on each card
- [ ] [ ] Clicking card shows service details
- [ ] [ ] "Book Now" redirects to booking page
- [ ] **TEST PASSED** ✅

### 7.4 Browse Products Page
- [ ] Click "Products" in navbar
- [ ] **Expected:** Products page loads
- [ ] [ ] Product cards display with images
- [ ] [ ] Prices and stock info visible
- [ ] [ ] Add to cart button functional
- [ ] **TEST PASSED** ✅

### 7.5 User Registration
- [ ] Click "Sign Up" button
- [ ] **Expected:** Registration form appears
- [ ] [ ] Fill in: Email, Password, First Name, Last Name, Phone
- [ ] [ ] Test validation:
  - [ ] Invalid email → error message
  - [ ] Password < 8 chars → error message
  - [ ] Missing phone → error message
- [ ] [ ] Enter valid data and click "Register"
- [ ] **Expected:** New account created, redirect to login or dashboard
- [ ] **TEST PASSED** ✅

### 7.6 User Login
- [ ] Navigate to login page
- [ ] Enter test user credentials:
  ```
  Email: r12@gmail.com
  Password: rajeev@12
  ```
- [ ] Click "Login"
- [ ] **Expected:** Login successful, redirect to dashboard
- [ ] [ ] Token saved in localStorage (check DevTools → Application)
- [ ] [ ] Navigation bar shows user name and logout option
- [ ] **TEST PASSED** ✅

### 7.7 Book Appointment
- [ ] Click "Book Appointment" or go to /book
- [ ] **Expected:** Appointment form loads
- [ ] [ ] Service dropdown populated with services
- [ ] [ ] Date/time picker functional
- [ ] [ ] Notes field present
- [ ] [ ] Select a service, pick future date/time
- [ ] [ ] Click "Book"
- [ ] **Expected:** Confirmation message, redirected to my-appointments
- [ ] **TEST PASSED** ✅

### 7.8 View My Appointments
- [ ] Navigate to "My Appointments"
- [ ] **Expected:** List of your bookings appears
- [ ] [ ] Each shows: service name, date, time, status
- [ ] [ ] "Cancel" button visible
- [ ] [ ] Clicking appointment shows details
- [ ] [ ] Cancel button works (appointment removed)
- [ ] **TEST PASSED** ✅

### 7.9 Edit Profile
- [ ] Navigate to "Profile" page
- [ ] **Expected:** Profile form loads with current data
- [ ] [ ] Can edit name, phone, address
- [ ] [ ] Click "Save"
- [ ] **Expected:** Success message, changes saved
- [ ] Refresh page, verify changes persisted
- [ ] **TEST PASSED** ✅

### 7.10 Responsive Design
- [ ] In DevTools, toggle device toolbar
- [ ] Test on mobile (375px):
  - [ ] Menu collapses to hamburger
  - [ ] All buttons accessible
  - [ ] Forms readable
  - [ ] Images load properly
- [ ] Test on tablet (768px):
  - [ ] Layout adjusts
  - [ ] Navigation readable
- [ ] Test on desktop (1920px):
  - [ ] Full layout visible
  - [ ] No horizontal scrolling
- [ ] **TEST PASSED** ✅

### 7.11 Performance
- [ ] In DevTools, open Network tab
- [ ] Refresh page
- [ ] [ ] Page loads in < 3 seconds
- [ ] [ ] No failed requests (red status codes)
- [ ] [ ] Images load properly
- [ ] [ ] No console errors (red X marks)
- [ ] Check Lighthouse:
  - [ ] Performance > 80
  - [ ] Accessibility > 80
  - [ ] Best Practices > 80
- [ ] **TEST PASSED** ✅

---

## 🔄 PHASE 8: INTEGRATION TESTING

### 8.1 Complete Flow: Login → Book → Review
- [ ] **Step 1:** Login with test user
- [ ] **Step 2:** Browse services (frontend)
- [ ] **Step 3:** Click "Book Now"
- [ ] **Step 4:** Select date/time and book (Postman verify with GET /appointments/my-appointments)
- [ ] **Step 5:** Leave review (Postman POST /reviews)
- [ ] **Step 6:** View profile (frontend My Account)
- [ ] **TEST PASSED** ✅

### 8.2 Complete Flow: Purchase Product
- [ ] Browse products page
- [ ] Add product to cart
- [ ] Click "Checkout"
- [ ] **Expected:** Order created (verify in Postman: GET /orders/my-orders)
- [ ] **TEST PASSED** ✅

### 8.3 Admin Testing (if admin access available)
- [ ] Login with admin credentials (or switch to admin)
- [ ] Navigate to `/admin`
- [ ] [ ] Admin dashboard visible
- [ ] [ ] Can view all customers
- [ ] [ ] Can view all appointments
- [ ] [ ] Can manage services
- [ ] [ ] Can manage products
- [ ] **TEST PASSED** ✅

---

## ⚠️ ERROR HANDLING TESTS

### Test 1: Invalid Login
- [ ] Postman: Login with wrong password
- [ ] **Expected:** Status 401, message "Invalid credentials"
- [ ] **TEST PASSED** ✅

### Test 2: Expired Token
- [ ] Set token to invalid value in Postman
- [ ] Try any authenticated request
- [ ] **Expected:** Status 401 "Unauthorized"
- [ ] **TEST PASSED** ✅

### Test 3: Missing Required Fields
- [ ] POST /appointments with missing serviceId
- [ ] **Expected:** Status 400 "Validation failed"
- [ ] **TEST PASSED** ✅

### Test 4: Appointment in Past
- [ ] Try booking appointment with date in past
- [ ] **Expected:** Status 400 "Date must be in future"
- [ ] **TEST PASSED** ✅

### Test 5: Frontend CORS Test
- [ ] DevTools → Network tab
- [ ] Load any page requiring API call
- [ ] **Expected:** No CORS error messages
- [ ] **TEST PASSED** ✅

---

## 📱 BROWSER COMPATIBILITY

Test on different browsers:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (if Mac available)

For each browser:
- [ ] Login works
- [ ] Forms submit properly
- [ ] No console errors
- [ ] Styling displays correctly

---

## 🎯 FINAL VALIDATION

### Backend Status ✅
- [ ] Health check passes
- [ ] All API endpoints respond
- [ ] Database connected
- [ ] Authentication working
- [ ] CORS enabled

### Frontend Status ✅
- [ ] Loads without errors
- [ ] All pages accessible
- [ ] Forms functional
- [ ] API calls working
- [ ] Token management working

### Database Status ✅
- [ ] Can create records (appointments, orders, reviews)
- [ ] Can read records
- [ ] Can update records
- [ ] Can retrieve user data

### Overall Status ✅
- [ ] Complete user flow works (login → book → review)
- [ ] Admin functions available
- [ ] Error handling appropriate
- [ ] Performance acceptable
- [ ] **APPLICATION IS PRODUCTION-READY** 🚀

---

## 📝 Notes & Issues Found

| Issue | Status | Notes |
|-------|--------|-------|
| | | |
| | | |
| | | |

---

## ✅ Sign-Off

**Tested By:** [Your Name]
**Date:** [Date]
**Overall Status:** PASSED ✅

**Next Steps:**
1. Share URL with users
2. Set up monitoring/logging
3. Plan regular performance checks
4. Gather user feedback

---

**For Support:**
- Backend API Docs: https://beauty-parlour-application.onrender.com/api/docs
- Report issues on GitHub
- Contact development team for urgent issues
