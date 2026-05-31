/**
 * @openapi
 * tags:
 *   - name: Notifications
 *     description: Notification management and delivery
 */
const { addNewNotify, getAllNotify, deleteNotify , getAllNotificationsByUser } = require("../Controller/notificationController")
const { verifyToken } = require("../middelwares/verifyToken.js");
const route = require("express").Router();

/**
 * @openapi
 * /api/notify:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Retrieve all notifications
 *     description: Return all notifications stored in the system.
 *     responses:
 *       200:
 *         description: Notifications returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 */
route.route("/")
    .get(getAllNotify)

/**
 * @openapi
 * /api/notify/{id}:
 *   delete:
 *     tags:
 *       - Notifications
 *     summary: Delete a notification
 *     description: Remove a notification by ID.
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
 *         description: Notification deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
route.route("/:id")
    .delete(verifyToken, deleteNotify)

/**
 * @openapi
 * /api/notify/send/{id}:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Send a new notification
 *     description: Create a notification for a target receiver.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 example: You have been invited to a group.
 *     responses:
 *       200:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
route.route("/send/:id")
    .post(verifyToken, addNewNotify)

/**
 * @openapi
 * /api/notify/user:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Retrieve notifications for the authenticated user
 *     description: Return notifications addressed to the current user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User notifications returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
route.route("/user")
    .get(verifyToken, getAllNotificationsByUser)

module.exports = route