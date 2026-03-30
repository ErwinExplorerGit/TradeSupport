import { vi, describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/button";

describe("Button", () => {
  it("renders the children text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it('applies the "primary" variant class by default', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-primary");
  });

  it('applies the "secondary" variant class', () => {
    render(<Button variant="secondary">Click</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-secondary");
  });

  it('applies the "danger" variant class', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-danger");
  });

  it("is not disabled by default", () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("is disabled when the disabled prop is true", () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when the loading prop is true", () => {
    render(<Button loading>Click</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows the spinner element when loading", () => {
    const { container } = render(<Button loading>Save</Button>);
    expect(container.querySelector(".btn-spinner")).toBeInTheDocument();
  });

  it("shows loadingText instead of children when loading and loadingText is provided", () => {
    render(
      <Button loading loadingText="Saving...">
        Save
      </Button>,
    );
    expect(screen.getByText("Saving...")).toBeInTheDocument();
    expect(screen.queryByText("Save")).not.toBeInTheDocument();
  });

  it("shows children when loading but no loadingText is given", () => {
    render(<Button loading>Save</Button>);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("calls onClick when the button is clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when the button is disabled", () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Click
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("applies a custom className alongside the variant class", () => {
    render(<Button className="extra-class">Click</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("extra-class");
    expect(btn).toHaveClass("btn-primary");
  });

  it("sets the button type attribute correctly", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it('defaults to type="button"', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});
