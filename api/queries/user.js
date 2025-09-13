const prisma = require("../prisma");

async function signUp(username, hashedPassword, firstName, lastName, author) {
  try {
    await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName,
      },
    });
    //have them follow 3 default users
    await prisma.user.update({
      where: {
        username: username,
      },
      data: {
        following: ["1", "2", "3"],
      },
    });
  } catch (error) {
    throw error;
  }
}

async function updateProfile(
  id,
  username,
  firstName,
  lastName,
  bio,
  profilePic
) {
  try {
    await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: {
        username: username,
        firstName: firstName,
        lastName: lastName,
        bio: bio,
        profilePic: profilePic,
      },
    });
  } catch (error) {
    throw error;
  }
}

async function getNotFollowing(id) {
  try {
    id = parseInt(id);
    //get following
    const userFollowing = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    const allUsers = await prisma.user.findMany();
    const notFollowing = allUsers.filter((user) => {
      if (
        !userFollowing.following.includes(user.id.toString()) &&
        user.id !== userFollowing.id
      ) {
        return user;
      }
    });
    return notFollowing;
  } catch (error) {
    throw error;
  }
}

async function sendFollowReq(followId, senderId) {
  try {
    followId = parseInt(followId);

    const user = await prisma.user.findUnique({
      where: {
        id: followId,
      },
      select: {
        followRequests: true,
      },
    });

    if (user.followRequests.includes(senderId)) {
      return false;
    }

    await prisma.user.update({
      where: {
        id: followId,
      },
      data: {
        followRequests: [...user.followRequests, senderId.toString()],
      },
    });
    return true;
  } catch (error) {
    throw error;
  }
}

async function getReqs(id) {
  try {
    id = parseInt(id);
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        followRequests: true,
      },
    });
    //then get the usernames for each one
    const usernameList = await Promise.all(
      user.followRequests.map(async (id) => {
        const username = await prisma.user.findUnique({
          where: {
            id: parseInt(id),
          },
          select: {
            username: true,
          },
        });
        if (username) {
          return username.username;
        }
      })
    );
    return usernameList;
  } catch (error) {
    throw error;
  }
}

async function acceptReq(username, userId) {
  try {
    //add user to following
    const reqUser = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    await prisma.user.update({
      where: {
        username: username,
      },
      data: {
        following: [...reqUser.following, userId.toString()],
      },
    });
    //then remove them from followReqs
    userId = parseInt(userId);
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    const removedUsername = user.followRequests.filter((id) => {
      return parseInt(id) !== reqUser.id;
    });
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        followRequests: removedUsername,
      },
    });
  } catch (error) {
    throw error;
  }
}

async function declineReq(reqUser, userId) {
  try {
    userId = parseInt(userId);
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    const removedUsername = user.followRequests.filter((id) => {
      id !== reqUser.id;
    });
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        followRequests: removedUsername,
      },
    });
  } catch (error) {
    throw error;
  }
}

async function getUser(id) {
  try {
    return await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        posts: true,
      },
    });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  signUp,
  updateProfile,
  getNotFollowing,
  sendFollowReq,
  getReqs,
  acceptReq,
  declineReq,
  getUser,
};