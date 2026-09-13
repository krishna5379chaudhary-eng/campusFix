# CampusFix

CampusFix is a web-based campus complaint management system that allows students to report campus problems and track their status. Administrators can view, manage, assign, update, and resolve complaints from an admin dashboard.

The goal of CampusFix is to make campus problem reporting more organized, transparent, and trackable.

## Features

### Student

* Student login
* Student-specific dashboard
* Submit campus complaints
* Select complaint category
* Add location and description
* Upload an image with a complaint
* View previously submitted complaints
* Track complaint status
* View complaint details

### Admin

* Admin login
* Protected admin dashboard
* View all complaints
* View individual complaint details
* Assign complaints to departments
* Update complaint status
* Delete complaints
* View complaint statistics

### Authentication & Authorization

* Login using Student ID/Admin ID and password
* Passwords are stored using bcrypt hashing
* Express sessions are used to maintain login state
* Sessions are stored in MongoDB using `connect-mongo`
* Admin routes are protected using authorization middleware
* Student routes are protected from unauthorized access
* Students cannot access admin functionality

## Complaint Status

A complaint can have one of the following statuses:

* `Pending` — Complaint has been submitted but not assigned
* `Assigned` — Complaint has been assigned to a department
* `In Progress` — Work on the complaint has started
* `Resolved` — The problem has been resolved

## Technology Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Frontend

* EJS
* Bootstrap
* HTML
* CSS

### Authentication

* Express Session
* Connect Mongo
* bcrypt

### Other Packages

* Multer — image uploads
* Joi — request validation
* Method Override — PUT/PATCH/DELETE requests from forms
* ejs-mate — EJS layouts
* wrapAsync — async error handling

## Project Structure

```text
CampusFix/
│
├── app.js
├── package.json
├── package-lock.json
├── schema.js
├── README.md
│
├── middleware/
│   └── auth.js
│
├── models/
│   ├── complaint.js
│   └── user.js
│
├── routes/
│   ├── auth.js
│   ├── complaints.js
│   └── admin.js
│
├── utils/
│   ├── ExpressError.js
│   └── wrapAsync.js
│
├── public/
│   ├── uploads/
│   └── style.css
│
└── views/
    ├── data/
    │   ├── login.ejs
    │   ├── studentDashboard.ejs
    │   ├── adminDashboard.ejs
    │   ├── newComplaint.ejs
    │   ├── complaints.ejs
    │   ├── complaintDetails.ejs
    │   ├── editComplaint.ejs
    │   └── viewimage.ejs
    │
    ├── includes/
    │   ├── head.ejs
    │   ├── navbar.ejs
    │   └── footer.ejs
    │
    └── layouts/
        └── boilerplate.ejs
```

## File and Folder Explanation

### `app.js`

This is the main Express application file.

It:

* Creates the Express application
* Connects to MongoDB
* Configures EJS
* Serves static files
* Parses form and JSON data
* Configures method override
* Configures Express sessions
* Stores sessions in MongoDB
* Registers authentication routes
* Registers complaint routes
* Protects admin routes
* Handles the student dashboard
* Handles 404 errors
* Handles application errors

Main route mounting:

```js
app.use("/", authRouter);

app.use("/complaints", complaintsRouter);

app.use("/admin", requireAdmin, adminRouter);
```

The important part for authorization is:

```js
app.use("/admin", requireAdmin, adminRouter);
```

This means every route under `/admin` must pass the `requireAdmin` middleware.

---

# Middleware

## `middleware/auth.js`

Contains authentication and authorization middleware.

### `requireLogin`

Checks whether a user is logged in.

If the user is not logged in:

```text
/login
```

is returned.

### `requireAdmin`

Checks:

1. Whether the user is logged in
2. Whether the user's role is `admin`

If the user is not an admin, access is denied.

### `requireStudent`

Checks:

1. Whether the user is logged in
2. Whether the user's role is `student`

This prevents users with another role from accessing student-only functionality.

---

# Models

## `models/user.js`

Defines the User schema.

A user contains:

```text
studentId
password
role
```

The role can be:

```text
student
admin
```

Passwords are stored as bcrypt hashes instead of plain text passwords.

---

## `models/complaint.js`

Defines the Complaint schema.

A complaint contains:

```text
complaintId
studentId
title
category
location
description
image
department
status
createdAt
```

### Complaint ID

Every complaint receives a unique ID such as:

```text
CF-XXXXXXXX
```

### Department

The department initially has:

```text
Not Assigned
```

### Status

The status can be:

```text
Pending
Assigned
In Progress
Resolved
```

---

# Routes

## `routes/auth.js`

Handles authentication.

### GET `/login`

Displays the login page.

### POST `/login`

Authenticates the user.

The process is:

```text
Student/Admin enters ID and password
              ↓
        Find user in MongoDB
              ↓
       Compare password using bcrypt
              ↓
       Create session information
              ↓
      Check user's role
         ↙          ↘
    Student        Admin
       ↓              ↓
 /student          /admin
```

### GET `/logout`

Destroys the current session and redirects the user to the login page.

---

## `routes/complaints.js`

Handles student complaint functionality.

### GET `/complaints`

Gets complaints from MongoDB and displays them.

### GET `/complaints/new`

Displays the complaint submission form.

### POST `/complaints`

Creates a new complaint.

The request is validated using Joi before the complaint is saved.

If an image is uploaded, Multer stores it in:

```text
public/uploads/
```

The image path is then stored with the complaint.

### GET `/complaints/:id`

Displays a specific complaint.

The MongoDB ObjectId is checked before querying the database.

### GET `/complaints/:id/photo`

Displays the uploaded complaint image.

---

## `routes/admin.js`

Handles admin functionality.

### GET `/admin`

Displays the admin dashboard.

The dashboard calculates:

* Total complaints
* Pending complaints
* In-progress complaints
* Resolved complaints

### GET `/admin/complaints/:id`

Displays the page for editing a complaint.

### PATCH `/admin/complaints/:id`

Allows an administrator to update:

* Department
* Complaint status

The update is validated using Joi.

### DELETE `/admin/complaints/:id`

Deletes a complaint.

If the complaint has an uploaded image, the image file is also removed.

---

# Validation

## `schema.js`

Contains Joi validation for complaint creation.

The following fields are required:

```text
title
category
location
description
```

Invalid data is rejected before it is stored in MongoDB.

Admin complaint updates also validate:

```text
department
status
```

---

# Error Handling

## `utils/ExpressError.js`

Provides a custom error class for application errors.

It allows errors to contain:

```text
statusCode
message
```

For example:

```text
400 - Bad Request
401 - Unauthorized
403 - Access Denied
404 - Not Found
```

## `utils/wrapAsync.js`

Used around asynchronous Express route handlers.

It prevents repetitive `try/catch` blocks and forwards asynchronous errors to the Express error-handling middleware.

---

# Views

The EJS templates are located inside:

```text
views/
```

## `views/data/login.ejs`

Login page for students and administrators.

The same login form is used for both roles.

After authentication, the server checks the user's role and redirects accordingly.

---

## `views/data/studentDashboard.ejs`

Student dashboard.

It displays complaints belonging to the logged-in student.

---

## `views/data/adminDashboard.ejs`

Admin dashboard.

It displays all complaints and complaint statistics.

---

## `views/data/newComplaint.ejs`

Form used by students to create a new complaint.

Students can provide:

* Title
* Category
* Location
* Description
* Image

---

## `views/data/complaints.ejs`

Displays complaint records.

---

## `views/data/complaintDetails.ejs`

Displays complete information about a complaint.

---

## `views/data/editComplaint.ejs`

Admin page used to update:

* Department
* Status

---

## `views/data/viewimage.ejs`

Displays the uploaded complaint image.

---

# EJS Includes

## `views/includes/head.ejs`

Contains common HTML head information and required styles/scripts.

## `views/includes/navbar.ejs`

Contains the common navigation bar.

## `views/includes/footer.ejs`

Contains the common footer.

## `views/layouts/boilerplate.ejs`

Provides the common EJS page layout.

---

# Public Folder

## `public/`

Contains static files that can be directly served by Express.

### `public/uploads/`

Stores complaint images uploaded through the application.

### CSS files

Contains the styling used by the CampusFix pages.

---

# Authentication Flow

The login system works using sessions.

```text
User opens /login
        ↓
Enters ID + password
        ↓
POST /login
        ↓
Find user in MongoDB
        ↓
bcrypt checks password
        ↓
Create session
        ↓
Save userId
Save studentId
Save role
        ↓
Check role
   ↙          ↘
student       admin
   ↓             ↓
/student       /admin
```

---

# Authorization Flow

Authentication answers:

> "Is this user logged in?"

Authorization answers:

> "Is this user allowed to access this resource?"

For example, an administrator route is protected with:

```js
app.use("/admin", requireAdmin, adminRouter);
```

If a student directly tries to access:

```text
/admin
```

the `requireAdmin` middleware checks the role and rejects the request.

This prevents users from bypassing the UI by directly sending requests to admin routes.

---

# Database

CampusFix uses MongoDB.

Default local database:

```text
mongodb://127.0.0.1:27017/campusfix
```

Main collections:

```text
users
complaints
```

### Users

Stores authentication information and roles.

### Complaints

Stores campus problems reported by students.

---

# Installation

Clone the repository:

```bash
git clone <your-repository-url>
```

Move into the project:

```bash
cd CampusFix
```

Install dependencies:

```bash
npm install
```

Start the application:

```bash
node app.js
```

The application runs on:

```text
http://localhost:8080
```

Make sure MongoDB is running locally before starting the application.

---

# Required Packages

The main dependencies include:

```text
express
mongoose
ejs
ejs-mate
method-override
multer
joi
bcrypt
express-session
connect-mongo
```

---

# Application Workflow

## Student Workflow

```text
Login
  ↓
Student Dashboard
  ↓
Create Complaint
  ↓
Complaint Saved in MongoDB
  ↓
Admin Reviews Complaint
  ↓
Admin Assigns Department
  ↓
Admin Updates Status
  ↓
Student Tracks Status
  ↓
Complaint Resolved
```

## Admin Workflow

```text
Login
  ↓
Admin Dashboard
  ↓
View All Complaints
  ↓
Open Complaint
  ↓
Assign Department
  ↓
Update Status
  ↓
Resolve Complaint
```

---

# Security

The current application includes:

* Password hashing with bcrypt
* Session-based authentication
* MongoDB session storage
* Role-based authorization
* Protected admin routes
* Joi request validation
* ObjectId validation
* Restricted student/admin access

For production deployment, additional security should be added, including:

* Environment variables for secrets
* Secure session cookies
* HTTPS
* CSRF protection
* Rate limiting
* Stronger password policies
* Proper production MongoDB credentials
* Better file-upload validation

---

# Future Improvements

Possible future features include:

* College email authentication
* Better role management
* Complaint priority levels
* Department-specific dashboards
* Email notifications
* Complaint comments
* Student feedback after resolution
* Complaint analytics
* Search and filtering
* Pagination
* Emergency complaint button
* Campus announcements
* Cloud image storage
* Production deployment
* Mobile-friendly improvements

---

# Project Goal

CampusFix is designed to provide a simple and transparent system for handling campus problems.

Instead of complaints being reported informally and becoming difficult to track, CampusFix provides a complete workflow:

```text
Report → Assign → Track → Resolve
```

This allows students to know the current status of their complaints while administrators get a centralized system for managing campus issues.

---

# Author

**Krishna Chaudhary**

CampusFix — Campus Complaint Management System
