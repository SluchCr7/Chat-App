const { Message } = require("../modules/Message");
const { Conversation } = require("../modules/Conversation");
const { Group } = require("../modules/Group");
const { GroupMember } = require("../modules/GroupMember");

const runMigration = async () => {
    try {
        console.log("[Migration] Running lightweight startup data migration...");

        // --- 1. Migrate Direct Messages to Conversations ---
        // Find messages where group & channel don't exist and conversation is not set
        const directMessages = await Message.find({
            group: { $exists: false },
            channel: { $exists: false },
            conversation: { $exists: false }
        });

        console.log(`[Migration] Found ${directMessages.length} unassociated direct messages.`);

        let newConversationsCount = 0;
        let updatedMessagesCount = 0;

        for (const msg of directMessages) {
            if (!msg.sender || !msg.receiver) continue;

            // Find if there is an existing conversation between these two
            let conv = await Conversation.findOne({
                participants: { $all: [msg.sender, msg.receiver] }
            });

            if (!conv) {
                conv = new Conversation({
                    participants: [msg.sender, msg.receiver],
                    lastMessage: msg._id,
                    lastActivity: msg.createdAt
                });
                await conv.save();
                newConversationsCount++;
            } else {
                // If this message is newer than conversation's lastActivity, update it
                if (new Date(msg.createdAt) > new Date(conv.lastActivity)) {
                    conv.lastMessage = msg._id;
                    conv.lastActivity = msg.createdAt;
                    await conv.save();
                }
            }

            // Link message to conversation
            msg.conversation = conv._id;
            await msg.save();
            updatedMessagesCount++;
        }

        if (directMessages.length > 0) {
            console.log(`[Migration] Created ${newConversationsCount} new Conversations.`);
            console.log(`[Migration] Linked ${updatedMessagesCount} messages successfully.`);
        }

        // --- 2. Migrate Group Members to GroupMember Collection ---
        const groups = await Group.find();
        let groupMembersCreated = 0;

        for (const grp of groups) {
            for (const member of grp.members) {
                if (!member.user) continue;

                // Check if relationship exists in GroupMember
                const existing = await GroupMember.findOne({
                    group: grp._id,
                    user: member.user
                });

                if (!existing) {
                    const newGM = new GroupMember({
                        group: grp._id,
                        user: member.user,
                        role: member.role || "member",
                        joinedAt: member.joinedAt || Date.now()
                    });
                    await newGM.save();
                    groupMembersCreated++;
                }
            }
        }

        if (groupMembersCreated > 0) {
            console.log(`[Migration] Created ${groupMembersCreated} new GroupMember records.`);
        }

        console.log("[Migration] Startup data migration complete.");
    } catch (err) {
        console.error("[Migration] Error during startup data migration:", err);
    }
};

module.exports = { runMigration };
