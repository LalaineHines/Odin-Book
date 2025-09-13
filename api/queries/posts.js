const prisma = require("../prisma");

async function getFeed(id) {
  id = parseInt(id);
  try {
    //get all users posts
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      include: {
        posts: {
          include: {
            comments: true,
          },
        },
      },
    });
    const userPostsWithUsername = user.posts.map((post) => {
      return { ...post, username: user.username, profilePic: user.profilePic };
    });

    //find following posts
    const followingPosts = await Promise.all(
      user.following.map(async (follow) => {
        const followData = await prisma.user.findUnique({
          where: {
            id: parseInt(follow),
          },
          include: {
            posts: {
              include: {
                comments: true,
              },
            },
          },
        });
        if (followData) {
          const followingPostsWithUsername = followData.posts.map((post) => {
            return {
              ...post,
              username: followData.username,
              profilePic: followData.profilePic,
            };
          });
          return followingPostsWithUsername;
        }
      })
    );

    //combine both and sort by date/time
    const allPosts = [...followingPosts.flat(), ...userPostsWithUsername];
    const sortedPosts = allPosts.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return sortedPosts;
  } catch (error) {
    throw error;
  }
}

async function createPost(content, id, image) {
  id = parseInt(id);
  try {
    await prisma.post.create({
      data: {
        content: content,
        userId: id,
        image: image,
      },
    });
  } catch (error) {
    throw error;
  }
}

async function likePost(id) {
  id = parseInt(id);
  try {
    await prisma.post.update({
      where: {
        id: id,
      },
      data: {
        likes: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    throw error;
  }
}

async function getPost(id) {
  id = parseInt(id);
  try {
    const post = await prisma.post.findUnique({
      where: {
        id: id,
      },
      include: {
        comments: true,
      },
    });

    //get username
    const user = await prisma.user.findUnique({
      where: {
        id: post.userId,
      },
    });
    const postWithUsername = { ...post, username: user.username };

    //and get username for every comment
    const commentsWithUsernames = await Promise.all(
      postWithUsername.comments.map(async (comment) => {
        const commentUser = await prisma.user.findUnique({
          where: {
            id: comment.userId,
          },
        });
        return { ...comment, username: commentUser.username };
      })
    );
    postWithUsername.comments = commentsWithUsernames;
    return postWithUsername;
  } catch (error) {
    throw error;
  }
}

async function postComment(comment, postId, userId) {
  postId = parseInt(postId);
  userId = parseInt(userId);
  try {
    await prisma.comment.create({
      data: {
        text: comment,
        userId: userId,
        postId: postId,
      },
    });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getFeed,
  createPost,
  likePost,
  getPost,
  postComment,
};