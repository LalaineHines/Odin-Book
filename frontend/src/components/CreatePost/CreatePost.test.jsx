import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { userEvent } from "@testing-library/user-event";
import routes from "../../routes";

describe("Create Post component", () => {
  let user;
  beforeEach(async () => {
    user = userEvent.setup();
    localStorage.setItem("token", "123");
    localStorage.setItem("userId", "1");

    global.fetch = vi.fn(() => {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            posts: [
              {
                id: 1,
                userId: 1,
                content: "new post",
                createdAt: new Date(),
                profilePic: "default.jpg",
                username: "username",
                image: null,
                likes: 2,
              },
            ],
            users: [],
          }),
      });
    });

    render(
      <MemoryRouter initialEntries={["/create"]}>
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {});
  });

  it("renders all elements", () => {
    expect(
      screen.getByRole("heading", { name: "Create A Post" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Content:" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("creates post and naviagtes to homepage", async () => {
    await user.type(
      screen.getByRole("textbox", { name: "Content:" }),
      "new post"
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => {
      expect(screen.getByText(/Your Feed/)).toBeInTheDocument();
    });
    expect(screen.getByText("new post")).toBeInTheDocument();
  });
});