import { vi, describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/input";

describe("Input", () => {
  it("renders the input with a label", () => {
    render(<Input id="email" label="Email" value="" onChange={() => {}} />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("does not render a label element when none is provided", () => {
    const { container } = render(<Input value="" onChange={() => {}} />);
    expect(container.querySelector(".input-label")).not.toBeInTheDocument();
  });

  it("displays the provided value", () => {
    render(<Input id="name" label="Name" value="John" onChange={() => {}} />);
    expect(screen.getByRole("textbox")).toHaveValue("John");
  });

  it("calls onChange with the new value when the user types", async () => {
    const handleChange = vi.fn();
    render(<Input id="name" label="Name" value="" onChange={handleChange} />);
    await userEvent.type(screen.getByRole("textbox"), "a");
    expect(handleChange).toHaveBeenCalledWith("a");
  });

  it("displays the error message when error prop is provided", () => {
    render(
      <Input
        id="email"
        label="Email"
        value=""
        onChange={() => {}}
        error="Email is required."
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Email is required.");
  });

  it("marks the input as aria-invalid when error is present", () => {
    render(
      <Input
        id="email"
        label="Email"
        value=""
        onChange={() => {}}
        error="Required"
      />,
    );
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("does not mark the input as aria-invalid when there is no error", () => {
    render(<Input id="email" label="Email" value="" onChange={() => {}} />);
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "aria-invalid",
      "false",
    );
  });

  it("displays the hint text when hint prop is provided and there is no error", () => {
    render(
      <Input
        id="email"
        label="Email"
        value=""
        onChange={() => {}}
        hint="Enter your work email"
      />,
    );
    expect(screen.getByText("Enter your work email")).toBeInTheDocument();
  });

  it("does not display the hint when an error is present", () => {
    render(
      <Input
        id="email"
        label="Email"
        value=""
        onChange={() => {}}
        error="Required"
        hint="Enter your work email"
      />,
    );
    expect(screen.queryByText("Enter your work email")).not.toBeInTheDocument();
  });

  it("is disabled when the disabled prop is true", () => {
    render(
      <Input id="email" label="Email" value="" onChange={() => {}} disabled />,
    );
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("renders a toggle button for password inputs", () => {
    render(
      <Input
        id="pwd"
        label="Password"
        type="password"
        value=""
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Show password" }),
    ).toBeInTheDocument();
  });

  it("toggles password visibility when the toggle button is clicked", async () => {
    render(
      <Input
        id="pwd"
        label="Password"
        type="password"
        value="secret"
        onChange={() => {}}
      />,
    );
    const input = screen.getByDisplayValue("secret");
    expect(input).toHaveAttribute("type", "password");

    await userEvent.click(
      screen.getByRole("button", { name: "Show password" }),
    );
    expect(input).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "Hide password" }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Hide password" }),
    );
    expect(input).toHaveAttribute("type", "password");
  });

  it("renders the suffix slot for non-password inputs", () => {
    render(
      <Input
        id="search"
        label="Search"
        value=""
        onChange={() => {}}
        suffix={<span data-testid="search-icon">icon</span>}
      />,
    );
    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
  });

  it("does not render the suffix slot for password inputs (uses toggle instead)", () => {
    const { container } = render(
      <Input
        id="pwd"
        label="Password"
        type="password"
        value=""
        onChange={() => {}}
        suffix={<span data-testid="custom-suffix">X</span>}
      />,
    );
    // password type uses its own toggle, not the generic suffix span
    expect(
      container.querySelector(".input-suffix:not(.input-suffix--toggle)"),
    ).not.toBeInTheDocument();
  });

  it("applies a custom className to the input control", () => {
    const { container } = render(
      <Input id="name" value="" onChange={() => {}} className="custom-input" />,
    );
    expect(container.querySelector(".custom-input")).toBeInTheDocument();
  });

  it("sets the placeholder attribute", () => {
    render(
      <Input
        id="name"
        label="Name"
        value=""
        onChange={() => {}}
        placeholder="Enter your name"
      />,
    );
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "placeholder",
      "Enter your name",
    );
  });
});
