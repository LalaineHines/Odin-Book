import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { userEvent } from "@testing-library/user-event";
import routes from "../../routes";

describe("Profile component", () => {
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
            user: {
              username: "username",
              profilePic: "default.jpg",
              firstName: "firstname",
              lastName: "lastname",
              bio: "bio",
              content: "Test post",
              posts: [
                {
                  id: 1,
                  image: null,
                  content: "post content",
                  createdAt: new Date(),
                  likes: 5,
                },
              ],
            },
            success: true,
          }),
      });
    });

    render(
      <MemoryRouter initialEntries={["/1"]}>
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
      expect(screen.getByText(/Profile/)).toBeInTheDocument();
    });
    expect(screen.getByAltText("Profile Picture")).toBeInTheDocument();
    expect(screen.getByText(/firstname/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Posts" })).toBeInTheDocument();
    expect(screen.getByText("post content")).toBeInTheDocument();
  });
  it("can view post", async () => {
    await waitFor(() => {
      expect(screen.getByText(/Profile/)).toBeInTheDocument();
    });
    await user.click(screen.getByRole("link", { name: /View Post/ }));
    await waitFor(() => {
      expect(screen.getByRole("heading", "Comments")).toBeInTheDocument();
    });
  });
});