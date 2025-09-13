const prisma = require("./prisma");
const bcrypt = require("bcryptjs");

async function makePost(content, userId, image) {
    const existingPost = await prisma.post.findFirst({
        where: { content, userId },
    });

    if (existingPost) {
        await prisma.post.update({
            where: { id: existingPost.id },
            data: { content, image },
        });
    } else {
        await prisma.post.create({
            data: { content, userId, image },
        });
    }
}

async function addIntialUsersAndPosts() {
    const users = [
        {
            username: "GrantRoots",
            password: await bcrypt.hash("password", 10),
            firstName: "Grant",
            lastName: "Roots",
        },
        {
            username: "notGrantRoots",
            password: await bcrypt.hash("password", 10),
            firstName: "Awesome",
            lastName: "Guy",
        },
        {
            username: "definitelyNotGrantRoots",
            password: await bcrypt.hash("password", 10),
            firstName: "Cool",
            lastName: "Dude",
        },
        {
            username: "FakeUser1",
            password: await bcrypt.hash("password", 10),
            firstName: "Follow",
            lastName: "Request",
        },
        {
            username: "FakeUser2",
            password: await bcrypt.hash("password", 10),
            firstName: "Another",
            lastName: "User",
        },
        {
            username: "FakeUser3",
            password: await bcrypt.hash("password", 10),
            firstName: "Third",
            lastName: "User",
        },
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { username: user.username },
            update: {},
            create: {
                username: user.username,
                password: user.password,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    }

    await prisma.user.update({
        where: { id: 1 },
        data: {
            profilePic: "uploads/grant.jpg",
        },
    });
    await prisma.user.update({
        where: { id: 2},
        data: {
            profilePic: "uploads/smile.png",
        },
    });

    await makePost("This is the first post ever!", 1, null);
    await makePost("Yes I did write these backwards lol", 2, null);
    await makePost("He's so funny too!", 3, null);
    await makePost("Wow that Grant guy is so talented", 2, null);
    await makePost("Hello Welcome to Odinstagram!!", 1, "uploads/welcome.jpg");
}

addIntialUsersAndPosts();