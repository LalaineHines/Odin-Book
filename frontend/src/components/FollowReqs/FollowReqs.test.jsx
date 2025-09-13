import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { userEvent } from "@testing-library/user-event";
import routes from "../../routes";

describe("Follow Req component", () => {
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
            reqs: ["username"],
          }),
      });
    });

    render(
      <MemoryRouter initialEntries={["/requests"]}>
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {});
  });

  it("renders all elements", async () => {
    expect(screen.getByText(/Follow Requests/)).toBeInTheDocument();
    expect(screen.getByText(/username/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument();
  });

  it("accept follow request", async () => {
    global.fetch = vi.fn(() => {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            reqs: [],
          }),
      });
    });
    await user.click(screen.getByRole("button", { name: "Accept" }));
    await waitFor(() => {
      expect(screen.queryByText(/username/)).toBeNull();
    });
    expect(screen.getByText(/No requests/)).toBeInTheDocument();
  });
  it("decline follow request", async () => {
    global.fetch = vi.fn(() => {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            reqs: [],
          }),
      });
    });
    await user.click(screen.getByRole("button", { name: "Decline" }));
    await waitFor(() => {
      expect(screen.queryByText(/username/)).toBeNull();
    });
    expect(screen.getByText(/No requests/)).toBeInTheDocument();
  });
});