import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { userEvent } from "@testing-library/user-event";
import routes from "../../routes";

describe("Customize component", () => {
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
            user: {
              username: "username",
              profilePic: "default.jpg",
              firstName: "firstname",
              lastName: "lastname",
              bio: "bio",
            },
          }),
      });
    });

    render(
      <MemoryRouter initialEntries={["/customize"]}>
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
      screen.getByRole("heading", { name: "Customize Profile" })
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Username:" }))
      .toBeInTheDocument()
      .toHaveValue("username");
    expect(screen.getByRole("textbox", { name: "First Name:" }))
      .toBeInTheDocument()
      .toHaveValue("firstname");
  });
  it("updates data and navigates to home page", async () => {
    await user.type(
      screen.getByRole("textbox", { name: "Username:" }),
      "newusername"
    );
    global.fetch = vi.fn(() => {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: {
              username: "newusername",
              profilePic: "default.jpg",
              firstName: "firstname",
              lastName: "lastname",
              bio: "bio",
            },
            success: true,
            posts: [],
            users: [],
          }),
      });
    });
    await user.click(screen.getByRole("button", { name: "Update" }));
    await waitFor(() => {
      expect(screen.getByText("newusername")).toBeInTheDocument();
    });
    expect(screen.getByText(/Your Feed/)).toBeInTheDocument();
  });
});