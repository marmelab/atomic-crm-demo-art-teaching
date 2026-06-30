import { render } from "vitest-browser-react";

import {
  DesktopEmpty,
  DesktopSuccess,
  DesktopLoading,
  DesktopError,
} from "./ContactList.stories";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ContactList", () => {
  it("renders an invite to create the first student when the app is empty", async () => {
    const screen = await render(<DesktopEmpty />);
    await expect
      .element(screen.getByRole("heading", { name: "No students found" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("It seems your student list is empty."))
      .toBeVisible();
  });

  it("renders contacts in a list", async () => {
    const screen = await render(<DesktopSuccess />);

    await expect.element(screen.getByText("Ada Lovelace")).toBeVisible();
    await expect.element(screen.getByText("Grace Hopper")).toBeVisible();
    await expect
      .element(screen.getByRole("heading", { name: "No students found" }))
      .not.toBeInTheDocument();
  });

  /**
   * The desktop version doesn't show a skeleton yet
   */
  it.skip("renders a skeleton while loading", async () => {
    const screen = await render(<DesktopLoading />);

    await expect
      .poll(() => screen.container.querySelector('[data-slot="skeleton"]'))
      .not.toBeNull();
  });

  it("renders an error notification when loading contacts fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const screen = await render(<DesktopError />);

    await expect
      .element(screen.getByText("Error loading students"))
      .toBeVisible();
  });

});
