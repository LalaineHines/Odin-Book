import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { userEvent } from "@testing-library/user-event";
import routes from "../../routes";

describe("Header component", () => {
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
            posts: [],
            users: [],
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
    expect(
      screen.getByRole("heading", { name: "Odinstagram" })
    ).toBeInTheDocument();
  });

  it("navigates to home page", async () => {
    await waitFor(() => {
      expect(screen.getByText(/Profile/)).toBeInTheDocument();
    });
    await user.click(screen.getByRole("link", { name: "Odinstagram" }));
    expect(screen.getByText(/Your Feed/)).toBeInTheDocument();
  });
});