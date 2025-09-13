import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Signup } from "./Signup";
import userEvent from "@testing-library/user-event";

describe("Signup Component", () => {
  let user;
  beforeEach(() => {
    user = userEvent.setup();
    render(
      <MemoryRouter>
        <Signup></Signup>
      </MemoryRouter>
    );
  });
  it("renders all elements", () => {
    expect(
      screen.getByRole("heading", { name: "Sign Up" })
    ).toBeInTheDocument();
    expect(screen.getByText("Username:")).toBeInTheDocument();
    expect(screen.getByText("Password:")).toBeInTheDocument();
    expect(screen.getByText("Confirm Password:")).toBeInTheDocument();
    expect(screen.getByText("First Name:")).toBeInTheDocument();
    expect(screen.getByText("Last Name:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    expect(screen.getByRole("link"))
      .toBeInTheDocument()
      .toHaveAttribute("href", "/");
  });
  it("allows user to type", async () => {
    const usernameInput = screen.getByRole("textbox", { name: "Username:" });
    const firstNameInput = screen.getByRole("textbox", { name: "First Name:" });
    const lastNameInput = screen.getByRole("textbox", { name: "Last Name:" });
    const passwordInput = screen.getByLabelText("Password:");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password:");

    await user.type(usernameInput, "test");
    await user.type(firstNameInput, "first");
    await user.type(lastNameInput, "last");
    await user.type(passwordInput, "123");
    await user.type(confirmPasswordInput, "123");

    expect(usernameInput).toHaveValue("test");
    expect(firstNameInput).toHaveValue("first");
    expect(lastNameInput).toHaveValue("last");
    expect(passwordInput).toHaveValue("123");
    expect(confirmPasswordInput).toHaveValue("123");
  });
  it("sends the data to api", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
    await user.type(screen.getByLabelText("Username:"), "newuser");
    await user.type(screen.getByLabelText("Password:"), "123");
    await user.type(screen.getByLabelText("Confirm Password:"), "123");
    await user.type(screen.getByLabelText("First Name:"), "first");
    await user.type(screen.getByLabelText("Last Name:"), "last");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/signup"),
      expect.objectContaining({
        method: "POST",
        body: expect.any(String),
      })
    );
  });
  it("shows error if passwords do not match", async () => {
    await user.type(screen.getByLabelText("Username:"), "newuser");
    await user.type(screen.getByLabelText("Password:"), "123");
    await user.type(screen.getByLabelText("Confirm Password:"), "1234");
    await user.type(screen.getByLabelText("First Name:"), "first");
    await user.type(screen.getByLabelText("Last Name:"), "last");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(
      await screen.findByText("Passwords do not match")
    ).toBeInTheDocument();
  });
});