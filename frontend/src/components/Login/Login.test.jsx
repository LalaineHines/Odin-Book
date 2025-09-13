import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import routes from "../../routes";

describe("Login Component", () => {
  let user;
  beforeEach(() => {
    localStorage.clear();
    user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </MemoryRouter>
    );
  });
  it("renders all elements", () => {
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByText("Username:")).toBeInTheDocument();
    expect(screen.getByText("Password:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    expect(screen.getByRole("link"))
      .toBeInTheDocument()
      .toHaveAttribute("href", "/");
  });
  it("allows user to type", async () => {
    const usernameInput = screen.getByRole("textbox", { name: "Username:" });
    const passwordInput = screen.getByLabelText("Password:");

    await user.type(usernameInput, "test");
    await user.type(passwordInput, "123");

    expect(usernameInput).toHaveValue("test");
    expect(passwordInput).toHaveValue("123");
  });
  it("submit button sends data to api and changes the page", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: "123" }),
      })
    );
    await user.type(screen.getByLabelText("Username:"), "test");
    await user.type(screen.getByLabelText("Password:"), "123");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/login"),
      expect.objectContaining({
        method: "POST",
        body: expect.any(String),
      })
    );

    expect(localStorage.getItem("token")).toBe("123");
    expect(
      screen.queryByRole("textbox", { name: "Username:" })
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Password:")).not.toBeInTheDocument();
  });
});