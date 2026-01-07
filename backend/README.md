# Khalafiati Backend API

Backend server for Khalafiati - Image Management Platform

## Features

- RESTful API architecture
- JWT authentication
- Role-based access control (User, Admin)
- Image upload with Multer
- MongoDB database
- File validation and processing
- Comprehensive error handling
- CORS enabled

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Password Hashing**: bcryptjs
- **Environment Variables**: dotenv

## Project Structure

```
backend/
├── config/           # Configuration files
├── controllers/      # Route controllers
│   ├── authController.js
│   ├── userController.js
│   ├── categoryController.js
│   ├── imageController.js
│   └── dashboardController.js
├── middleware/       # Custom middleware
│   ├── auth.js      # Authentication & Authorization
│   └── upload.js    # File upload handling
├── models/          # Mongoose models
│   ├── User.js
│   ├── Category.js
│   └── Image.js
├── routes/          # API routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── categoryRoutes.js
│   ├── imageRoutes.js
│   └── dashboardRoutes.js
├── uploads/         # Uploaded files storage
├── .env            # Environment variables
├── .gitignore      # Git ignore file
├── package.json    # Dependencies
└── server.js       # Application entry point
```

## Installation

1. Clone the repository
2. Navigate to backend directory
3. Install dependencies:

```bash
npm install
```

4. Create `.env` file (see Environment Variables section)

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/khalafiati

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_super_secret_key_change_this_in_production

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Running the Server

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user (Protected)
- `PUT /me` - Update profile (Protected)
- `PUT /change-password` - Change password (Protected)
- `POST /logout` - Logout user (Protected)
- `GET /verify` - Verify token (Protected)

### Users (`/api/users`)
- `GET /profile/:username` - Get user profile (Public)
- `GET /` - Get all users (Admin)
- `GET /:id` - Get user by ID (Admin)
- `GET /:id/stats` - Get user statistics (Admin)
- `PUT /:id` - Update user (Admin)
- `PATCH /:id/ban` - Ban/Unban user (Admin)
- `DELETE /:id` - Delete user (Admin)

### Categories (`/api/categories`)
- `GET /` - Get all categories (Public)
- `GET /active` - Get active categories (Public)
- `GET /slug/:slug` - Get category by slug (Public)
- `GET /:id` - Get category by ID (Public)
- `POST /` - Create category (Admin)
- `PUT /:id` - Update category (Admin)
- `DELETE /:id` - Delete category (Admin)
- `PATCH /:id/toggle` - Toggle category status (Admin)
- `GET /:id/stats` - Get category statistics (Admin)

### Images (`/api/images`)
- `GET /` - Get all images (Public)
- `GET /featured` - Get featured images (Public)
- `GET /popular` - Get popular images (Public)
- `GET /search/tags` - Search by tags (Public)
- `GET /:id` - Get image by ID (Public)
- `GET /:id/download` - Download image (Public)
- `POST /` - Upload image (Protected)
- `PUT /:id` - Update image (Protected)
- `DELETE /:id` - Delete image (Protected)
- `PATCH /:id/move` - Move to category (Admin)
- `PATCH /:id/feature` - Toggle featured (Admin)

### Dashboard (`/api/dashboard`)
All routes require Admin authentication:
- `GET /stats` - Get dashboard statistics
- `GET /user-growth` - Get user growth data
- `GET /upload-trends` - Get upload trends
- `GET /category-distribution` - Get category distribution
- `GET /top-contributors` - Get top contributors
- `GET /recent-activities` - Get recent activities
- `GET /popular-content` - Get popular content
- `GET /system-health` - Get system health

## Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Get a token by registering or logging in.

## File Upload

### Supported Formats
- JPEG, JPG, PNG, GIF, WEBP

### Maximum File Sizes
- Images: 10MB
- Category Thumbnails: 5MB
- Avatars: 2MB

### Upload Directories
```
uploads/
├── images/       # User uploaded images
├── categories/   # Category thumbnails
├── avatars/      # User avatars
└── thumbnails/   # Generated thumbnails
```

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": ["validation error 1", "validation error 2"]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Database Models

### User Model
- username (unique)
- email (unique)
- password (hashed)
- fullName
- role (user/admin)
- status (active/banned)
- avatar
- bio
- uploadCount
- lastLogin

### Category Model
- name (unique)
- slug (auto-generated)
- description
- thumbnail
- imageCount
- order
- isActive

### Image Model
- title
- description
- filename
- originalName
- path
- size
- mimetype
- category (ref)
- uploadedBy (ref)
- tags
- views
- downloads
- isActive
- isFeatured

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control
- File type validation
- File size limits
- CORS protection
- Input validation
- SQL injection prevention (NoSQL)

## Development

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Testing
Currently in development. Test suite coming soon.

### Code Style
- ES6+ JavaScript
- Async/Await for asynchronous operations
- Modular architecture
- RESTful conventions

## Deployment

### Production Checklist
1. Set `NODE_ENV=production`
2. Change `JWT_SECRET` to a strong secret
3. Update `MONGODB_URI` to production database
4. Update `FRONTEND_URL` to production domain
5. Enable HTTPS
6. Set up proper logging
7. Configure reverse proxy (nginx)
8. Set up process manager (PM2)

### Recommended PM2 Configuration

```bash
pm2 start server.js --name khalafiati-api
pm2 save
pm2 startup
```

## License

ISC

## Support

For issues and questions, please open an issue in the repository.