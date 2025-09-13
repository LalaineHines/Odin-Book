import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { userEvent } from "@testing-library/user-event";
import routes from "./routes";
import App from "./App";

describe("App component when not logged in", () => {
  let user;
  beforeEach(() => {
    user = userEvent.setup();
    render(
      <MemoryRouter>
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </MemoryRouter>
    );
  });

  it("renders properly when not logged in", () => {
    expect(
      screen.getByRole("heading", { name: "Odinstagram" })
    ).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Sign Up" }))
      .toBeInTheDocument()
      .toHaveTextContent("Sign Up")
      .toHaveAttribute("href", "/signup");

    expect(screen.getByRole("link", { name: "Log In" }))
      .toBeInTheDocument()
      .toHaveTextContent("Log In")
      .toHaveAttribute("href", "/login");

    expect(screen.getByText("Welcome To Odinstagram!")).toBeInTheDocument();
    expect(screen.getByText("Sign Up To Get Started")).toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: "Create Post" })
    ).not.toBeInTheDocument();
  });

  it("navigates to signup page", async () => {
    await user.click(screen.getByRole("link", { name: "Sign Up" }));
    expect(screen.getByText("Username:")).toBeInTheDocument();
    expect(screen.getByText("Password:")).toBeInTheDocument();
    expect(screen.getByText("Confirm Password:")).toBeInTheDocument();
    expect(screen.getByText("First Name:")).toBeInTheDocument();
    expect(screen.getByText("Last Name:")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: "Login" })
    ).not.toBeInTheDocument();
  });

  it("navigates to login page", async () => {
    await user.click(screen.getByRole("link", { name: "Log In" }));
    expect(screen.getByText("Username:")).toBeInTheDocument();
    expect(screen.getByText("Password:")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: "Sign Up" })
    ).not.toBeInTheDocument();
  });
});

describe("App component when logged in", () => {
  let user;
  beforeEach(() => {
    user = userEvent.setup();
    localStorage.setItem("token", "123");
    localStorage.setItem("userId", "1");

    global.fetch = vi.fn((url) => {
      if (url.includes(`/user/1`)) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              user: {
                id: 1,
                username: "username",
                profilePic: "default.jpg",
              },
            }),
        });
      }
      if (url.includes(`/posts?id=1`)) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              posts: [
                {
                  id: 1,
                  userId: 1,
                  username: "postusername",
                  profilePic: "profile.jpg",
                  content: "Hello world!",
                  likes: 5,
                  createdAt: new Date().toISOString(),
                },
              ],
            }),
        });
      }
      if (url.includes(`/user?id=1`)) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              users: [
                { id: 2, username: "user2" },
                { id: 3, username: "user3" },
              ],
            }),
        });
      }
    });

    render(
      <MemoryRouter>
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </MemoryRouter>
    );
  });

  it("renders all elements", async () => {
    expect(screen.getByText(/No posts yet/)).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: "Customize Profile" })
      ).toBeInTheDocument();
    });
    //After data loads
    expect(screen.getByText("postusername")).toBeInTheDocument();
    expect(screen.getByText("Hello world!")).toBeInTheDocument();
    expect(screen.getByText("People To Follow")).toBeInTheDocument();
    expect(screen.getByText("user2")).toBeInTheDocument();
    expect(screen.getByText("user3")).toBeInTheDocument();
  });

  it("handles sending follow request", async () => {
    const followMock = vi
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ message: "Already Sent Follow Request" }),
        })
      );

    global.fetch = vi.fn((url) => {
      if (url.includes(`/user/follow`)) {
        return followMock();
      }
    });

    await waitFor(() => {
      expect(screen.getByText("People To Follow")).toBeInTheDocument();
    });
    expect(screen.getByText("People To Follow")).toBeInTheDocument();
    expect(screen.getByText("user2")).toBeInTheDocument();
    const followButtons = screen.getAllByText("Follow");
    await user.click(followButtons[0]);
    await user.click(followButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Already Sent Follow Request"));
    });
  });

  it("handles liking post", async () => {
    let likes = 0;
    global.fetch = vi.fn((url) => {
      if (url.includes(`/posts/like`)) {
        likes++;
      }
    });
    await waitFor(() => {
      screen.getByText("postusername");
    });
    const like = screen.getByRole("button", { name: /5/ });
    await user.click(like);
    expect(likes).toBe(1);
  });

  it("navigates to post", async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes(`/posts/1`)) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              post: {
                id: 0,
                username: "username",
                profilePic: "default.jpg",
                content: "Test post",
                comments: [],
              },
              success: true,
            }),
        });
      }
    });

    let viewPost;
    await waitFor(() => {
      viewPost = screen.getByRole("link", { name: /view post/i });
    });
    await user.click(viewPost);
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Comments/ })
      ).toBeInTheDocument();
    });
  });

  it("navigates to profile", async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes(`/user/1`)) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              user: {
                id: 1,
                username: "username",
                profilePic: "default.jpg",
                posts: [],
                bio: "bio",
                firstName: "firstname",
                lastName: "lastname",
              },
              success: true,
            }),
        });
      }
    });

    let linkToProfile;
    await waitFor(() => {
      linkToProfile = screen.getByRole("link", { name: /postusername/ });
    });
    await user.click(linkToProfile);
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Posts/ })
      ).toBeInTheDocument();
    });
  });

  it("navigates to customize profile", async () => {
    await waitFor(async () => {
      await user.click(screen.getByRole("link", { name: /Customize Profile/ }));
    });
    expect(
      screen.getByRole("heading", { name: /Customize Profile/ })
    ).toBeInTheDocument();
    expect(screen.getByText(/Bio/)).toBeInTheDocument();
  });

  it("navigates to follow requests", async () => {
    await waitFor(async () => {
      await user.click(screen.getByRole("link", { name: /Follow Requests/ }));
    });
    expect(
      screen.getByRole("heading", { name: /Follow Requests/ })
    ).toBeInTheDocument();
    expect(screen.getByText("No requests")).toBeInTheDocument();
  });

  it("navigates to create post", async () => {
    await waitFor(async () => {
      await user.click(screen.getByRole("link", { name: /Create Post/ }));
    });
    expect(
      screen.getByRole("heading", { name: /Create A Post/ })
    ).toBeInTheDocument();
  });

  it("logs out user", async () => {
    localStorage.clear();
    render(
      <MemoryRouter>
        <App></App>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Sign Up" }));
    });
  });
});