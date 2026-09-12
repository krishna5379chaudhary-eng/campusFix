# CampusFix

CampusFix is a web-based campus complaint management system.

Students can:

* Enter their Student ID
* Report campus problems
* Upload a photo
* View their complaints
* Track complaint status
* View the uploaded complaint photo

Admins can:

* View all complaints
* Assign a department
* Change complaint status
* Delete complaints

---

# 1. Project Structure

hack/
│
├── app.js
├── schema.js
├── package.json
├── package-lock.json
│
├── models/
│   └── complaint.js
│
├── utils/
│   ├── ExpressError.js
│   ├── wrapAsync.js
│   ├── validateComplaint.js
│   └── validateComplaintUpdate.js
│
├── public/
│   ├── style.css
│   ├── index.css
│   ├── login.css
│   ├── complaints.css
│   ├── complaintDetails.css
│   ├── editComplaint.css
│   ├── newComplaint.css
│   ├── studentDashboard.css
│   ├── adminDashboard.css
│   ├── viewimage.css
│   └── uploads/
│
└── views/
├── data/
│   ├── index.ejs
│   ├── login.ejs
│   ├── newComplaint.ejs
│   ├── studentDashboard.ejs
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

---

# 2. Packages We Used

## Express

Express is the backend framework.

It handles:

* Routes
* Requests
* Responses
* Middleware
* Server

Example:

app.get("/student", ...)

This means when the browser requests /student, Express handles that request.

---

## Mongoose

Mongoose connects our Node.js application with MongoDB.

We use it to:

* Create schemas
* Create models
* Save complaints
* Find complaints
* Update complaints
* Delete complaints

Example:

Complaint.find({})

gets complaints from MongoDB.

---

## EJS

EJS is our template engine.

It allows us to create HTML pages that contain dynamic data.

Example:

<%= complaint.title %>

The value comes from MongoDB instead of being written permanently inside HTML.

---

## Joi

Joi is used for validation.

It checks whether the data submitted by the user is valid before saving it to MongoDB.

For example, a complaint must have:

* Student ID
* Title
* Category
* Location
* Description

---

## Multer

Multer handles file uploads.

We use it to allow students to upload complaint images.

Example:

upload.single("image")

This receives one uploaded image from the form.

---

## Method-Override

HTML forms normally support GET and POST.

Method-override allows us to use methods like:

PATCH

DELETE

through a normal HTML form.

For example:

POST + _method=PATCH

becomes a PATCH request in Express.

---

## Node.js fs

fs means File System.

We use it when deleting a complaint's uploaded image from the server.

For example:

fs.unlinkSync(imagePath)

deletes the image file.

---

# 3. app.js

This is the main file of the application.

It connects everything together.

It contains:

* Express setup
* MongoDB connection
* Middleware
* Routes
* Error handling
* Server startup

---

# 4. Express Setup

We create the Express application:

const express = require("express");
const app = express();

app is our Express application.

We use app to create routes and middleware.

---

# 5. Port

We use:

const port = 8080;

Our application runs at:

localhost:8080

---

# 6. Path

Node's path module helps create safe file paths.

We use it for:

app.set("views", path.join(__dirname, "views"));

and:

express.static(path.join(__dirname, "public"))

---

# 7. Static Files

This middleware:

app.use(express.static(path.join(__dirname, "public")));

allows the browser to access files inside public.

For example:

public/index.css

can be accessed using:

/index.css

It also allows uploaded images inside:

public/uploads/

to be displayed using their URL.

---

# 8. Body Parser

We use:

app.use(express.urlencoded({ extended: true }));

This reads data submitted by HTML forms.

For example:

Student ID
Title
Category
Description

become available through:

req.body

---

# 9. JSON Parser

We use:

app.use(express.json());

This allows Express to read JSON request bodies.

---

# 10. Method Override

We use:

app.use(methodOverride(function (req) {
if (req.body && req.body._method) {
return req.body._method;
}
}));

This checks whether the form contains:

_method

For example:

_method = PATCH

Express then treats the request as PATCH.

This allowed our admin update form to work.

---

# 11. MongoDB Connection

We connect to MongoDB using Mongoose:

await mongoose.connect("mongodb://127.0.0.1:27017/campusfix");

Database name:

campusfix

MongoDB stores our complaints permanently.

---

# 12. Home Route

Route:

GET /

It renders:

index.ejs

This is the starting page of CampusFix.

The student can enter their Student ID here.

---

# 13. Student Dashboard Route

Route:

GET /student?studentId=123

The Student ID comes from the URL query.

We use:

req.query.studentId

Then MongoDB searches for complaints belonging to that Student ID.

Example:

Complaint.find({
studentId: studentId
});

This allows one student to have multiple complaints.

---

# 14. Admin Dashboard Route

Route:

GET /admin

It gets all complaints:

Complaint.find({});

Then we calculate:

* Total complaints
* Pending complaints
* In Progress complaints
* Resolved complaints

These values are sent to:

adminDashboard.ejs

---

# 15. New Complaint Route

Route:

GET /complaints/new

The Student ID is passed through the URL:

/complaints/new?studentId=123

The route receives:

req.query.studentId

and sends it to newComplaint.ejs.

This prevents the student from having to enter the ID again.

---

# 16. Create Complaint Route

Route:

POST /complaints

This is one of the most important routes.

The process is:

Student submits form
↓
Multer receives image
↓
Joi validates data
↓
Complaint object is created
↓
Complaint is saved to MongoDB
↓
Student dashboard opens

We create:

const complaint = new Complaint({
complaintId: "CF-" + Date.now(),
studentId: req.body.studentId,
title: req.body.title,
category: req.body.category,
location: req.body.location,
description: req.body.description,
image: req.file ? "/uploads/" + req.file.filename : null
});

Then:

await complaint.save();

saves it to MongoDB.

---

# 17. Complaint Details Route

Route:

GET /complaints/:id

Example:

/complaints/68abc123...

The ID comes from:

req.params.id

We find the complaint:

Complaint.findById(id)

Then send it to:

complaintDetails.ejs

---

# 18. View Photo Route

Route:

GET /complaints/:id/photo

This route finds the complaint first.

Then:

res.render("data/viewimage", { complaint });

opens:

viewimage.ejs

The image is displayed using:

<img src="<%= complaint.image %>">

The value of complaint.image comes from MongoDB.

---

# 19. Admin Complaint Edit Route

Route:

GET /admin/complaints/:id

It finds one complaint and opens:

editComplaint.ejs

The admin can change:

* Department
* Status

---

# 20. PATCH Route

Route:

PATCH /admin/complaints/:id

This updates an existing complaint.

First we get:

const { department, status } = req.body;

Then Joi validates those values.

After validation:

Complaint.findByIdAndUpdate(
id,
{
department,
status
}
);

updates MongoDB.

---

# 21. DELETE Route

Route:

DELETE /admin/complaints/:id

This deletes a complaint.

First we find the complaint.

Then, if it has an image, we delete the image file.

Finally:

Complaint.findByIdAndDelete(id);

removes the complaint from MongoDB.

---

# 22. ObjectId Validation

Before searching MongoDB, we check:

mongoose.Types.ObjectId.isValid(id)

This prevents invalid MongoDB IDs from causing errors.

If the ID is invalid:

throw new ExpressError(400, "Invalid complaint ID");

---

# 23. Complaint Model

File:

models/complaint.js

This defines the structure of a complaint in MongoDB.

The important fields are:

complaintId

Unique ID shown to the user.

Example:

CF-1757581234567

---

studentId

Stores which student created the complaint.

Multiple complaints can have the same Student ID.

Example:

Student 101
→ Complaint 1
→ Complaint 2
→ Complaint 3

---

title

Short title of the problem.

Example:

Wi-Fi not working

---

category

Problem category.

Example:

Electricity
Water
Cleanliness
Furniture
Wi-Fi
Maintenance

---

location

Where the problem occurred.

Example:

Block A, Room 204

---

description

Detailed explanation of the problem.

---

image

Stores the uploaded image path.

Example:

/uploads/abc123

---

department

Stores which department is responsible.

Default:

Not Assigned

---

status

Stores complaint progress.

Possible values:

Pending
Assigned
In Progress
Resolved

---

createdAt

Automatically stores when the complaint was created.

---

# 24. ExpressError.js

File:

utils/ExpressError.js

This creates our custom error class.

It allows us to store:

statusCode

and:

message

Example:

throw new ExpressError(404, "Complaint not found");

Instead of writing error handling repeatedly, we pass the error to our error middleware.

---

# 25. wrapAsync.js

File:

utils/wrapAsync.js

Express does not automatically handle rejected promises in all versions/setups.

Our routes contain async operations such as:

await Complaint.find()

wrapAsync catches errors from async routes.

Conceptually:

Route
↓
Async function
↓
Error?
↓
next(error)
↓
Error middleware

This keeps our routes cleaner.

---

# 26. validateComplaint.js

This file contains Joi validation for creating complaints.

It checks:

studentId
title
category
location
description

For example, if the student submits an empty title, Joi detects the error before the complaint is saved.

---

# 27. validateComplaintUpdate.js

This validates admin updates.

It checks:

department

and:

status

Status is restricted to:

Pending
Assigned
In Progress
Resolved

This prevents invalid status values from being stored.

---

# 28. Express Error Middleware

At the bottom of app.js we have error handling.

It receives:

err

Then gets:

statusCode

and:

message

Finally it sends the error response.

For example:

404 → Page not found

400 → Invalid complaint ID

500 → Something went wrong

---

# 29. 404 Route

We also have a catch-all route.

If no previous route matches the request, it creates:

404 Page not found

This is why we saw Page not found when a route was incorrect.

---

# 30. index.ejs

This is the home page.

It allows the student to enter their Student ID.

The form sends:

GET /student?studentId=...

This opens the student's dashboard.

It also provides access to the Admin Dashboard.

---

# 31. studentDashboard.ejs

This displays complaints belonging to the entered Student ID.

It receives:

complaints

and:

studentId

It shows:

* Student ID
* Report a Problem
* My Complaints
* Complaint title
* Location
* Status
* View Details
* View Photo

The View Photo button only appears if:

complaint.image

exists.

---

# 32. newComplaint.ejs

This contains the complaint form.

The student enters:

* Student ID
* Problem title
* Category
* Location
* Description
* Image

The Student ID is automatically received from the dashboard:

<%= studentId %>

and is readonly.

The form sends data to:

POST /complaints

---

# 33. complaints.ejs

This displays complaints from the database.

The route:

GET /complaints

gets all complaints.

Each complaint displays:

* Title
* Complaint ID
* Category
* Location
* Status
* View
* View Photo

The complaint data is dynamic and comes from MongoDB.

---

# 34. complaintDetails.ejs

This displays complete information about one complaint.

It receives one complaint using:

complaint._id

It can display:

* Complaint ID
* Student ID
* Title
* Category
* Location
* Description
* Department
* Status
* Image information

---

# 35. editComplaint.ejs

This is the admin update page.

The admin can select:

Department

and:

Status

The form uses:

_method=PATCH

so that Express handles it as a PATCH request.

There is also a delete form using:

_method=DELETE

---

# 36. viewimage.ejs

This is our separate image page.

It receives:

complaint

Then checks:

if (complaint.image)

If an image exists:

<img src="<%= complaint.image %>">

is displayed.

If no image exists:

No photo uploaded for this complaint.

is displayed.

---

# 37. login.ejs

This is currently a login page/UI file.

Authentication has not been fully implemented yet.

Later we can connect it to proper admin authentication.

---

# 38. head.ejs

This is a reusable EJS include.

Instead of writing the same HTML head section on every page, we keep it in one place.

It contains things such as:

* HTML setup
* Bootstrap
* Common CSS/metadata

Then pages use:

include("../includes/head.ejs")

---

# 39. navbar.ejs

This contains the navigation bar.

Because it is an include, we don't need to copy the navbar into every page manually.

---

# 40. footer.ejs

This contains the common footer section.

Again, we include it in different pages instead of duplicating the same HTML.

---

# 41. boilerplate.ejs

This is the layout file.

It can be used as a common page structure for EJS pages.

Our current pages mainly use the head/navbar/footer includes directly.

---

# 42. CSS Files

Each page has its own CSS file.

For example:

index.css
→ Home page styling

studentDashboard.css
→ Student dashboard styling

adminDashboard.css
→ Admin dashboard styling

newComplaint.css
→ Complaint form styling

complaints.css
→ Complaint list styling

complaintDetails.css
→ Complaint details styling

editComplaint.css
→ Admin edit page styling

viewimage.css
→ Image page styling

style.css
→ General/common styling

login.css
→ Login page styling

This keeps page-specific styling separated.

---

# 43. public/uploads

This folder stores uploaded complaint images.

Multer saves the uploaded file here.

For example:

public/uploads/abc123

MongoDB does not store the actual image in our current implementation.

MongoDB stores the path:

/uploads/abc123

The browser then requests that path from Express.

Flow:

Student uploads image
↓
Multer
↓
public/uploads/
↓
MongoDB stores image path
↓
EJS reads complaint.image
↓ <img src="...">
↓
Browser displays image

---

# 44. package.json

This contains project information and dependencies.

It tells Node which packages our project uses.

Important dependencies include:

express
mongoose
ejs
joi
multer
method-override

---

# 45. package-lock.json

This records the exact dependency versions installed by npm.

We commit this file to GitHub.

When another developer runs:

npm install

npm can use package-lock.json to install the appropriate versions.

---

# 46. schema.js

This is an older/supporting schema file in the current project.

Our main complaint database schema is now inside:

models/complaint.js

So schema.js is not the main file responsible for our Complaint model.

---

# 47. Complete Application Flow

## Student creates complaint

Student opens:

/

↓

Enters Student ID

↓

/student?studentId=123

↓

Clicks Report a Problem

↓

/complaints/new?studentId=123

↓

Fills complaint form

↓

Uploads image

↓

POST /complaints

↓

Multer handles image

↓

Joi validates form

↓

Complaint object created

↓

MongoDB saves complaint

↓

Redirect to:

/student?studentId=123

↓

Student sees the complaint.

---

# 48. Student Views Photo

Student clicks:

View Photo

↓

/complaints/:id/photo

↓

MongoDB finds complaint

↓

viewimage.ejs opens

↓

EJS reads:

complaint.image

↓

Browser displays image.

---

# 49. Admin Updates Complaint

Admin opens:

/admin

↓

Sees all complaints

↓

Opens one complaint

↓

/admin/complaints/:id

↓

Changes department/status

↓

Form sends POST + _method=PATCH

↓

method-override converts it to PATCH

↓

Joi validates update

↓

MongoDB updates complaint

↓

Admin dashboard opens again.

---

# 50. Admin Deletes Complaint

Admin clicks Delete

↓

Form sends POST + _method=DELETE

↓

method-override converts it to DELETE

↓

Complaint is found

↓

Uploaded image is deleted if present

↓

Complaint is deleted from MongoDB

↓

Admin dashboard opens again.

---

# 51. Main Technologies

Frontend:

HTML
EJS
CSS
Bootstrap

Backend:

Node.js
Express.js

Database:

MongoDB
Mongoose

Validation:

Joi

File Upload:

Multer

HTTP Method Support:

Method-Override

Error Handling:

ExpressError
wrapAsync

---

# 52. What We Learned From This Project

This project covers the important basics of a MERN-style backend application:

1. Express server
2. Routing
3. Middleware
4. MongoDB connection
5. Mongoose schemas/models
6. CRUD operations
7. EJS dynamic pages
8. Form handling
9. Query parameters
10. Route parameters
11. File uploads
12. Validation
13. Custom errors
14. Async error handling
15. PATCH requests
16. DELETE requests
17. Static files
18. MVC-style project organization

The most important concept is that the application is **database-driven**.

The EJS pages don't permanently contain complaint data.

The flow is:

Browser
→ Express route
→ MongoDB
→ Express
→ EJS
→ Browser

That is the main backend pattern you should remember.
