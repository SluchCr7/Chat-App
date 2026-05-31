/**
 * @openapi
 * tags:
 *   - name: Authentication
 *     description: Login, registration, logout, and token flows
 *   - name: Users
 *     description: User profile and account management
 */
const express = require("express");
const route = express.Router();
const {login, logout, signup, getAllUsers , getUserById , updateUser , uploadPhoto } = require("../Controller/UserController.js");
const {verifyToken, verifyUser} = require("../middelwares/verifyToken.js");
const photoUpload = require("../middelwares/uploadPhoto.js");

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Create a new account and receive a JWT authentication token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *             example:
 *               username: johndoe
 *               email: john.doe@example.com
 *               password: StrongPassword123!
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Authentication'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 */
route.route("/register")
    .post(signup);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login with email and password
 *     description: Authenticate the user and return a JWT token stored in a secure cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *             example:
 *               email: john.doe@example.com
 *               password: StrongPassword123!
 *     responses:
 *       200:
 *         description: Authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Authentication'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
route.route("/login")
    .post(login);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout the current user
 *     description: Revoke the active auth cookie and return a logout confirmation.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
route.route("/logout")
    .post(verifyToken, logout);

/**
 * @openapi
 * /api/auth:
 *   get:
 *     tags:
 *       - Users
 *     summary: Retrieve all users
 *     description: Return a list of all registered users, excluding passwords.
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Optional search keyword for username, email, or profile name.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for result pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Page size for result pagination
 *     responses:
 *       200:
 *         description: Paginated user list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */
route.route("/")
    .get(getAllUsers);

/**
 * @openapi
 * /api/auth/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get a user by ID
 *     description: Retrieve user profile details by their user ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User UUID or MongoDB ObjectId
 *     responses:
 *       200:
 *         description: User profile returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
route.route("/:id")
    .get(getUserById)

/**
 * @openapi
 * /api/auth/profile/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user profile
 *     description: Update profile fields for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               profileName:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [online, offline, away, busy, invisible]
 *               socialLinks:
 *                 type: object
 *                 properties:
 *                   github:
 *                     type: string
 *                   twitter:
 *                     type: string
 *                   linkedin:
 *                     type: string
 *             example:
 *               profileName: John Doe
 *               description: Full stack developer and chat enthusiast.
 *               socialLinks:
 *                 github: https://github.com/johndoe
 *                 twitter: https://twitter.com/johndoe
 *                 linkedin: https://linkedin.com/in/johndoe
 *     responses:
 *       200:
 *         description: User profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
route.route("/profile/:id")
    .put(verifyUser, updateUser);

/**
 * @openapi
 * /api/auth/upload:
 *   post:
 *     tags:
 *       - Uploads
 *     summary: Upload a user profile photo
 *     description: Store a profile image for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload succeeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   format: uri
 *                 publicId:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
route.route("/upload")
    .post(verifyToken, photoUpload.single("image"), uploadPhoto);
    
module.exports = route;