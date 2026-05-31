/**
 * @openapi
 * tags:
 *   - name: Chats
 *     description: Chat conversation retrieval and overview
 *   - name: Messages
 *     description: Send, edit, delete, and react to messages
 */
const {
    getUsersInSideBar,
    getMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    togglePinMessage,
    toggleStarMessage,
    getStarredMessages
} = require("../Controller/messageController");
const { verifyToken } = require("../middelwares/verifyToken.js");
const photoUpload = require("../middelwares/uploadPhoto.js");
const route = require("express").Router();

/**
 * @openapi
 * /api/message/users:
 *   get:
 *     tags:
 *       - Chats
 *     summary: Retrieve active chat sidebar users
 *     description: Return user summaries for sidebar conversation selection.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Sidebar users returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
route.route("/users")
    .get(verifyToken, getUsersInSideBar);

/**
 * @openapi
 * /api/message/starred:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Get starred messages
 *     description: Retrieve all messages starred by the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Starred messages retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
route.route("/starred")
    .get(verifyToken, getStarredMessages);

/**
 * @openapi
 * /api/message/{id}:
 *   get:
 *     tags:
 *       - Chats
 *     summary: Get direct or group messages
 *     description: Returns a conversation between the authenticated user and a target user, group, or channel.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [direct, group, channel]
 *         description: Conversation type
 *     responses:
 *       200:
 *         description: Messages returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
route.route("/:id")
    .get(verifyToken, getMessages);

/**
 * @openapi
 * /api/message/send/{id}:
 *   post:
 *     tags:
 *       - Messages
 *       - Uploads
 *     summary: Send a new message
 *     description: Create a direct, group, or channel message with optional file attachments.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [direct, group, channel]
 *         description: The conversation type for this message
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: Hello from the backend
 *               replyTo:
 *                 type: string
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *           examples:
 *             sample:
 *               value:
 *                 text: Hello, this is a sample message with attachments.
 *     responses:
 *       201:
 *         description: Message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
route.route("/send/:id")
    .post(verifyToken, photoUpload.fields([{ name: 'image', maxCount: 8 }]), sendMessage);

/**
 * @openapi
 * /api/message/edit/{messageId}:
 *   put:
 *     tags:
 *       - Messages
 *     summary: Edit an existing message
 *     description: Update the text content of a message created by the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: Updated message text
 *     responses:
 *       200:
 *         description: Message updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
route.route("/edit/:messageId")
    .put(verifyToken, editMessage);

/**
 * @openapi
 * /api/message/delete/{messageId}:
 *   delete:
 *     tags:
 *       - Messages
 *     summary: Delete a message
 *     description: Remove a message from the database and broadcast the deletion.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 messageId:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
route.route("/delete/:messageId")
    .delete(verifyToken, deleteMessage);

/**
 * @openapi
 * /api/message/react/{messageId}:
 *   post:
 *     tags:
 *       - Messages
 *     summary: React to a message
 *     description: Add or update an emoji reaction for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emoji:
 *                 type: string
 *                 example: 👍
 *     responses:
 *       200:
 *         description: Reaction applied successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
route.route("/react/:messageId")
    .post(verifyToken, addReaction);

/**
 * @openapi
 * /api/message/pin/{messageId}:
 *   put:
 *     tags:
 *       - Messages
 *     summary: Toggle message pin
 *     description: Pin or unpin a message in the conversation.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message pinned/unpinned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
route.route("/pin/:messageId")
    .put(verifyToken, togglePinMessage);

/**
 * @openapi
 * /api/message/star/{messageId}:
 *   put:
 *     tags:
 *       - Messages
 *     summary: Star or unstar a message
 *     description: Mark a message as starred for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message star toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 starred:
 *                   type: boolean
 *                 message:
 *                   $ref: '#/components/schemas/Message'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
route.route("/star/:messageId")
    .put(verifyToken, toggleStarMessage);

module.exports = route;