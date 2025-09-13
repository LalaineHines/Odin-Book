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

async function sendFollowReq(sender, following) {
  return request(app)
    .post(`/user/follow`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      followId: following.id,
      senderId: sender.id,
    })
    .expect({ success: true })
    .expect(200)
    .then(async () => {
      const followReqs = await prisma.user.findUnique({
        where: {
          username: following.username,
        },
        select: {
          followRequests: true,
        },
      });
      if (followReqs.followRequests[3] !== sender.id.toString())
        throw new Error("Failed To Send Request");
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

test("POST /user/signup creates a new user", async () => {
  await signup("user");
});

test("POST /user/login authenticates valid user", async () => {
  await signupAndLogin("user");
});

test("POST /user/follow sends a follow request", async () => {
  const user = await signupAndLogin("user");
  const secondUser = await signup("seconduser");
  await sendFollowReq(user, secondUser);
});

test("GET /user/requests returns follow requests", async () => {
  const user = await signupAndLogin("user");
  const secondUser = await signup("seconduser");
  await sendFollowReq(user, secondUser);

  await request(app)
    .get(`/user/requests?id=${secondUser.id}`)
    .set("Authorization", `Bearer ${token}`)
    .expect("Content-Type", /json/)
    .expect((res) => {
      if (!res.body.success) throw new Error("Failed");
      if (!res.body.reqs.includes(user.username))
        throw new Error("No follow requests found");
    })
    .expect(200);
});

test("POST /user/requests/accept accepts a follow request", async () => {
  const user = await signupAndLogin("user");
  const secondUser = await signup("seconduser");
  await sendFollowReq(user, secondUser);
  await login("seconduser");

  await request(app)
    .post(`/user/requests/accept`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      username: user.username,
      userId: secondUser.id,
    })
    .expect("Content-Type", /json/)
    .expect((res) => {
      if (!res.body.success) throw new Error("Failed");
    })
    .expect(200)
    .then(async () => {
      const userFollowing = await prisma.user.findUnique({
        where: {
          username: user.username,
        },
        select: {
          following: true,
        },
      });
      if (!userFollowing.following.includes(secondUser.id.toString()))
        throw new Error("Failed to accept request");
    });
});

test("POST /user/requests/decline declines a follow request", async () => {
  const user = await signupAndLogin("user");
  const secondUser = await signup("seconduser");
  await sendFollowReq(user, secondUser);
  await login("seconduser");

  await request(app)
    .post(`/user/requests/decline`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      username: user.username,
      userId: secondUser.id,
    })
    .expect("Content-Type", /json/)
    .expect((res) => {
      if (!res.body.success) throw new Error("Failed");
    })
    .expect(200)
    .then(async () => {
      const followReqs = await prisma.user.findUnique({
        where: {
          username: secondUser.username,
        },
        select: {
          followRequests: true,
        },
      });
      if (followReqs.followRequests.length > 3)
        throw new Error("Failed to remove request from array");
      const userFollowing = await prisma.user.findUnique({
        where: {
          username: user.username,
        },
        select: {
          following: true,
        },
      });
      if (userFollowing.following.length > 3)
        throw new Error("Added user to following should be declining");
    });
});

test("PUT /user updates user profile and uploads profilePic", async () => {
  const user = await signupAndLogin("user");

  await request(app)
    .put(`/user/`)
    .set("Authorization", `Bearer ${token}`)
    .field("userId", user.id)
    .field("username", "newusername")
    .field("firstName", "newfirstname")
    .field("lastName", "newlastname")
    .field("bio", "newbio")
    .attach("profilePic", path.join(__dirname, "testfile.png"))
    .expect("Content-Type", /json/)
    .expect((res) => {
      if (!res.body.success) throw new Error("Failed");
      if (res.body.message !== "Updated Profile")
        throw new Error("Failed to update");
    })
    .expect(200)
    .then(async () => {
      const updatedUser = await prisma.user.findUnique({
        where: {
          username: "newusername",
        },
      });
      if (updatedUser.username !== "newusername")
        throw new Error("Username was not updated correctly");
      if (updatedUser.firstName !== "newfirstname")
        throw new Error("First name was not updated correctly");
      if (updatedUser.lastName !== "newlastname")
        throw new Error("Last name was not updated correctly");
      if (updatedUser.bio !== "newbio")
        throw new Error("Bio was not updated correctly");
      if (updatedUser.profilePic === "uploads/default.jpg")
        throw new Error("Profile pic didnt update");
    });
});

test("GET /user returns users not followed by current user", async () => {
  const user = await signupAndLogin("user");
  const notFollowing = await signup("notfollowing");

  await request(app)
    .get(`/user/?id=${user.id}`)
    .set("Authorization", `Bearer ${token}`)
    .expect("Content-Type", /json/)
    .expect((res) => {
      if (!res.body.success) throw new Error("Failed");
      if (res.body.users[0].username !== "notfollowing")
        throw new Error("Failed to get users");
    })
    .expect(200);
});

test("GET /user returns all user data and posts", async () => {
  const user = await signupAndLogin("user");

  await request(app)
    .get(`/user/${user.id}`)
    .set("Authorization", `Bearer ${token}`)
    .expect("Content-Type", /json/)
    .expect((res) => {
      if (!res.body.success) throw new Error("Failed");
      if (!res.body.user) throw new Error("Failed to get user");
      if (res.body.user.username !== user.username)
        throw new Error("Got the wrong user");
      if (!res.body.user.posts) throw new Error("Failed to get user posts");
    })
    .expect(200);
});