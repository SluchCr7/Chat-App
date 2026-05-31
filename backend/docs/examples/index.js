module.exports = {
  RegisterExample: {
    value: {
      username: 'johndoe',
      email: 'john.doe@example.com',
      password: 'StrongPassword123!',
    },
  },
  LoginExample: {
    value: {
      email: 'john.doe@example.com',
      password: 'StrongPassword123!',
    },
  },
  UpdateProfileExample: {
    value: {
      profileName: 'John Doe',
      description: 'Full stack developer and chat enthusiast.',
      socialLinks: {
        github: 'https://github.com/johndoe',
        twitter: 'https://twitter.com/johndoe',
        linkedin: 'https://linkedin.com/in/johndoe',
      },
    },
  },
  CreateGroupExample: {
    value: {
      name: 'Engineering Squad',
      description: 'A private channel for core engineering discussions.',
      isPrivate: true,
    },
  },
  SendMessageExample: {
    value: {
      text: 'Hello, this is a sample message with file attachments.',
      replyTo: null,
      scheduledAt: null,
    },
  },
  AddReactionExample: {
    value: {
      emoji: '👍',
    },
  },
  ChangeMemberRoleExample: {
    value: {
      targetUserId: '642a1b2c3d4e5f6789012345',
      newRole: 'moderator',
    },
  },
  JoinRequestActionExample: {
    value: {
      action: 'approve',
      userId: '642a1b2c3d4e5f6789012345',
    },
  },
};
