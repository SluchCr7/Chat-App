/**
 * @openapi
 * tags:
 *   - name: Admin
 *     description: Administrative insight and user controls
 */
const express = require("express");
const router = express.Router();
const { verifyAdmain } = require("../middelwares/verifyToken.js");
const {
    getAdminStats,
    getAdminUsers,
    toggleUserAdmin,
    toggleUserVerification,
    deleteUserByAdmin
} = require("../Controller/adminController");

/**
 * @openapi
 * /api/admin/stats:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Retrieve admin system statistics
 *     description: Get platform-wide usage metrics and environment system information.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Admin stats returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.route("/stats")
    .get(verifyAdmain, getAdminStats);

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List users for administration
 *     description: Return a paginated list of users for admin review.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated user list returned
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.route("/users")
    .get(verifyAdmain, getAdminUsers);

/**
 * @openapi
 * /api/admin/users/{id}/admin:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Toggle a user's admin privileges
 *     description: Promote or demote a user to/from admin status.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User admin status toggled successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.route("/users/:id/admin")
    .put(verifyAdmain, toggleUserAdmin);

/**
 * @openapi
 * /api/admin/users/{id}/verify:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Toggle user verification status
 *     description: Mark a user account as verified or unverified.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User verification status toggled successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.route("/users/:id/verify")
    .put(verifyAdmain, toggleUserVerification);

/**
 * @openapi
 * /api/admin/users/{id}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete a user account
 *     description: Remove a user and their associated conversations from the platform.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.route("/users/:id")
    .delete(verifyAdmain, deleteUserByAdmin);

module.exports = router;
