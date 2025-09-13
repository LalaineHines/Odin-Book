const request = require("supertest");
const app = require("../app");
const prisma = require("../prisma");
const path = require("path");
const fs = require("fs");

let token;

async function signup(username) {
  return request(app)
    .post("/user/signup")
    .send({
      username: username,
      password: "password",
      confirmPassword: "password",
      firstName: "firstname",
      lastName: "lastname",
    })
    .expect(201)
    .then(async () => {
      const user = await prisma.user.findUnique({
        where: {
          username: username,
        },
      });
      if (!user) throw new Error("Sign up failed");
      return user;
    });
}

async function login(username) {
  return request(app)
    .post("/user/login")
    .send({
      username: username,
      password: "password",
    })
    .expect("Content-Type", /json/)
    .expect((res) => {
      if (!res.body.token) throw new Error("Missing token");
      if (!res.body.userId) throw new Error("Missing userId");
      if (res.body.username !== username) throw new Error("Username mismatch");
      token = res.body.token;
    })
    .expect(200);
}

async function signupAndLogin(username) {
  const user = await signup(username);
  await login(username);
  return user;
}

async function createPost(content, user) {
  return request(app)
    .post("/posts")
    .set("Authorization", `Bearer ${token}`)
    .field("userId", user.id)
    .field("content", content)
    .attach("image", path.join(__dirname, "testfile.png"))
    .expect("Content-Type", /json/)
    .expect((res) => {
      if (!res.body.success) throw new Error("Failed");
    })
    .expect(200)
    .then(async () => {
      const post = await prisma.post.findFirst({
        where: {
          content: content,
        },
      });
      if (!post) throw new Error("Post failed to find");
      return post;
    });
}

async function createComment(comment, user, post) {
  return request(app)
    .post("/posts/comments")
    .set("Authorization", `Bearer ${token}`)
    .send({
      comment: comment,
      postId: post.id,
      userId: user.id,
    })
    .expect("Content-Type", /json/)
    .expect((res) => {
      if (!res.body.success) throw new Error("Failed");
    })
    .expect(200)
    .then(async () => {
      const postWithComment = await prisma.post.findFirst({
        where: {
          content: post.content,
        },
        select: {
          comments: true,
        },
      });
      if (postWithComment.comments.length < 1)
        throw new Error("Failed To add comment to post");
    });
}

beforeEach(async () => {
  token = null;
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
});

afterEach(() => {
  const uploadDir = path.join(__dirname, "uploads");
  fs.readdirSync(uploadDir).forEach((file) => {
    fs.unlinkSync(path.join(uploadDir, file));
  });
});

test("Post /posts creates a post", async () => {
  const user = await signupAndLogin("user");

  await createPost("post content", user);
});

test("Post /posts/like likes a post", async () => {
  const user = await signupAndLogin("user");
  const post = await createPost("post content", user);

  await request(app)
    .post("/posts/like")
    .set("Authorization", `Bearer ${token}`)
    .send({
      postId: post.id,
    })
    .expect("Content-Type", /json/)
    .expect((res) => {
      if (!res.body.success) throw new Error("Failed");
    })
    .expect(200)
    .then(async () => {
      const postWithLike = await prisma.post.findFirst({
        where: {
          content: "post content",
        },
        select: {
          likes: true,
        },
      });
      if (postWithLike.likes !== 1) throw new Error("Failed to like post");
    });
});

test("Post /posts/comments puts a comment on a post", async () => {
  const user = await signupAndLogin("user");
  const post = await createPost("post content", user);

  await createComment("comment", user, post);
});

test("Post /posts/:postid gets a specific post", async () => {
  const user = await signupAndLogin("user");
  const post = await createPost("post content", user);

  await createComment("comment", user, post);

  await request(app)
    .get(`/posts/${post.id}`)
    .set("Authorization", `Bearer ${token}`)
    .expect("Content-Type", /json/)
    .expect((res) => {
      if (!res.body.success) throw new Error("Failed");
      if (!res.body.post) throw new Error("Failed to get post");
      if (res.body.post.username !== user.username)
        throw new Error("Didnt get username");
      if (!res.body.post.comments) throw new Error("Didnt get comments");
      if (!res.body.post.comments[0].username)
        throw new Error("Didnt get username with comment");
    })
    .expect(200);
});

test("GET /posts gets the users feed", async () => {
  const user = await signupAndLogin("user");
  const secondUser = await signup("seconduser");
  const secondUserPost = await createPost("second user post", secondUser);
  //make user follow second user
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      following: [...user.following, secondUser.id.toString()],
    },
  });
  const post = await createPost("post content", user);

  await request(app)
    .get(`/posts?id=${user.id}`)
    .set("Authorization", `Bearer ${token}`)
    // .expect("Content-Type", /json/)
    .expect((res) => {
      if (!res.body.success) throw new Error("Failed");
      if (!res.body.posts) throw new Error("Failed to get posts");
      if (res.body.posts[0].content !== post.content)
        throw new Error("Didnt get main users post");
      if (res.body.posts[1].content !== secondUserPost.content)
        throw new Error("Didnt get second users post");
    })
    .expect(200);
});