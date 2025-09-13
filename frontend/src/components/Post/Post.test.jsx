import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { userEvent } from "@testing-library/user-event";
import routes from "../../routes";

describe("Post component", () => {
  let user;
  beforeEach(() => {
    user = userEvent.setup();
    localStorage.setItem("token", "123");
    localStorage.setItem("userId", "1");

    global.fetch = vi.fn(() => {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            post: {
              id: 1,
              userId: 1,
              username: "username",
              image: null,
              content: "Test post",
              comments: [{}],
              likes: 5,
              createdAt: new Date(),
            },
            success: true,
          }),
      });
    });

    render(
      <MemoryRouter initialEntries={["/post/1"]}>
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </MemoryRouter>
    );
  });

  it("renders all elements", async () => {
    await waitFor(() => {
      expect(screen.getByText("username")).toBeInTheDocument();
    });
    expect(screen.getByText("Test post")).toBeInTheDocument();

    expect(screen.getByText("Likes: 5")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Comment:" })
    ).toBeInTheDocument();
  });

  it("home button works", async () => {
    global.fetch = vi.fn(() => {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            posts: [],
            success: true,
            users: [],
          }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText("username")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("link", { name: "home" }));
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Your Feed/ })
      ).toBeInTheDocument();
    });
  });

  it("can leave comment on post", async () => {
    await waitFor(() => {
      expect(screen.getByText("username")).toBeInTheDocument();
    });
    const comment = screen.getByRole("textbox", { name: "Comment:" });
    await user.type(comment, "test comment");
    expect(comment).toHaveValue("test comment");

    global.fetch = vi.fn(() => {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            post: {
              id: 1,
              userId: 1,
              username: "username",
              image: null,
              content: "Test post",
              comments: [
                {
                  text: "test comment",
                  id: 1,
                  username: "username",
                },
              ],
              likes: 5,
              createdAt: new Date(),
            },
            success: true,
          }),
      });
    });

    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(screen.getByText(/test comment/)).toBeInTheDocument();
    });
  });

  it("can like post", async () => {
    let likes = 0;
    global.fetch = vi.fn((url) => {
      if (url.includes(`/posts/like`)) {
        likes++;
      }
    });
    await waitFor(() => {
      screen.getByText("username");
    });
    const like = screen.getByRole("button", { name: /like post/ });
    await user.click(like);
    expect(likes).toBe(1);
  });
});