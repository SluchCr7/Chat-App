/**
 * @openapi
 * tags:
 *   - name: Groups
 *     description: Group creation, membership, and channels
 */
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middelwares/verifyToken.js");
const {
    createGroup,
    getGroups,
    getGroupById,
    updateGroup,
    joinGroupByInvite,
    handleJoinRequest,
    changeMemberRole,
    kickMember,
    leaveGroup,
    createChannel,
    getChannelsByGroup,
    deleteChannel
} = require("../Controller/groupController");

/**
 * @openapi
 * /api/group:
 *   post:
 *     tags:
 *       - Groups
 *     summary: Create a new group
 *     description: Create a group and automatically generate a default general channel.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isPrivate:
 *                 type: boolean
 *             example:
 *               name: Engineering Squad
 *               description: A private group for core engineering conversations.
 *               isPrivate: true
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 group:
 *                   $ref: '#/components/schemas/GroupChat'
 *                 defaultChannel:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.route("/")
    .post(verifyToken, createGroup)
    .get(verifyToken, getGroups);

/**
 * @openapi
 * /api/group:
 *   get:
 *     tags:
 *       - Groups
 *     summary: Get groups for the authenticated user
 *     description: Return all groups where the authenticated user is a member.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Group list returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GroupChat'
 */

/**
 * @openapi
 * /api/group/{id}:
 *   get:
 *     tags:
 *       - Groups
 *     summary: Get group details
 *     description: Retrieve group metadata, membership, and channels.
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
 *         description: Group retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 group:
 *                   $ref: '#/components/schemas/GroupChat'
 *                 channels:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.route("/:id")
    .get(verifyToken, getGroupById)
    .put(verifyToken, updateGroup);

/**
 * @openapi
 * /api/group/{id}:
 *   put:
 *     tags:
 *       - Groups
 *     summary: Update group settings
 *     description: Modify group metadata such as name, description, or privacy mode.
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isPrivate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Group updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupChat'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @openapi
 * /api/group/{id}/leave:
 *   post:
 *     tags:
 *       - Groups
 *     summary: Leave a group
 *     description: Remove the authenticated user from the specified group.
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
 *         description: Left group successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.route("/:id/leave")
    .post(verifyToken, leaveGroup);

/**
 * @openapi
 * /api/group/invite/{inviteLink}:
 *   post:
 *     tags:
 *       - Groups
 *     summary: Join a group using an invite link
 *     description: Use a group invite token to join or request access for private groups.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inviteLink
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group join request processed
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.route("/invite/:inviteLink")
    .post(verifyToken, joinGroupByInvite);

/**
 * @openapi
 * /api/group/{id}/requests:
 *   post:
 *     tags:
 *       - Groups
 *     summary: Approve or reject a join request
 *     description: Group admins can accept or reject pending join requests.
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
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *               userId:
 *                 type: string
 *             example:
 *               action: approve
 *               userId: 642a1b2c3d4e5f6789012345
 *     responses:
 *       200:
 *         description: Request handled successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.route("/:id/requests")
    .post(verifyToken, handleJoinRequest);

/**
 * @openapi
 * /api/group/{id}/role:
 *   put:
 *     tags:
 *       - Groups
 *     summary: Change a member role inside a group
 *     description: Promote, demote or update a group member role.
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
 *             properties:
 *               targetUserId:
 *                 type: string
 *               newRole:
 *                 type: string
 *                 enum: [admin, moderator, member]
 *             example:
 *               targetUserId: 642a1b2c3d4e5f6789012345
 *               newRole: moderator
 *     responses:
 *       200:
 *         description: Member role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 group:
 *                   $ref: '#/components/schemas/GroupChat'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.route("/:id/role")
    .put(verifyToken, changeMemberRole);

/**
 * @openapi
 * /api/group/{id}/kick:
 *   post:
 *     tags:
 *       - Groups
 *     summary: Kick a member from a group
 *     description: Remove a member from the group by owner or admin.
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
 *             properties:
 *               targetUserId:
 *                 type: string
 *             example:
 *               targetUserId: 642a1b2c3d4e5f6789012345
 *     responses:
 *       200:
 *         description: Member kicked successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.route("/:id/kick")
    .post(verifyToken, kickMember);

/**
 * @openapi
 * /api/group/{groupId}/channels:
 *   post:
 *     tags:
 *       - Groups
 *     summary: Create a new channel inside a group
 *     description: Add a channel to a group by an owner, admin, or moderator.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [public, private, announcement]
 *             example:
 *               name: project-sync
 *               description: Channel for project-specific updates.
 *               type: public
 *     responses:
 *       201:
 *         description: Channel created successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.route("/:groupId/channels")
    .post(verifyToken, createChannel)
    .get(verifyToken, getChannelsByGroup);

/**
 * @openapi
 * /api/group/{groupId}/channels:
 *   get:
 *     tags:
 *       - Groups
 *     summary: List channels for a group
 *     description: Retrieve all channels for a given group.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Channels returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   type:
 *                     type: string
 */

/**
 * @openapi
 * /api/group/channels/{channelId}:
 *   delete:
 *     tags:
 *       - Groups
 *     summary: Delete a channel from a group
 *     description: Remove a channel and all its messages from a group.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Channel deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.route("/channels/:channelId")
    .delete(verifyToken, deleteChannel);

module.exports = router;
