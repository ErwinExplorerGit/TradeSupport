import { vi, describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Dropdown, type DropdownOption } from "@/components/dropdown";

const options: DropdownOption[] = [
  { label: "Option A", value: "a" },
  { label: "Option B", value: "b" },
  { label: "Option C", value: "c" },
];

describe("Dropdown", () => {
  it("renders all provided options", () => {
    render(<Dropdown value="a" options={options} onChange={() => {}} />);
    expect(
      screen.getByRole("option", { name: "Option A" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Option B" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Option C" }),
    ).toBeInTheDocument();
  });

  it("renders a label when the label prop is provided", () => {
    render(
      <Dropdown
        label="Choose an item"
        value="a"
        options={options}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText("Choose an item")).toBeInTheDocument();
  });

  it("does not render a label element when no label prop is provided", () => {
    const { container } = render(
      <Dropdown value="a" options={options} onChange={() => {}} />,
    );
    expect(container.querySelector(".dropdown-label")).not.toBeInTheDocument();
  });

  it("renders a disabled placeholder option when placeholder is provided", () => {
    render(
      <Dropdown
        value=""
        options={options}
        onChange={() => {}}
        placeholder="Select one"
      />,
    );
    const placeholder = screen.getByRole("option", { name: "Select one" });
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toBeDisabled();
  });

  it("reflects the currently selected value", () => {
    render(<Dropdown value="b" options={options} onChange={() => {}} />);
    expect(screen.getByRole("combobox")).toHaveValue("b");
  });

  it("calls onChange with the selected value when the selection changes", () => {
    const handleChange = vi.fn();
    render(<Dropdown value="a" options={options} onChange={handleChange} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "c" } });
    expect(handleChange).toHaveBeenCalledWith("c");
  });

  it("is disabled when the disabled prop is true", () => {
    render(
      <Dropdown value="a" options={options} onChange={() => {}} disabled />,
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("is not disabled by default", () => {
    render(<Dropdown value="a" options={options} onChange={() => {}} />);
    expect(screen.getByRole("combobox")).not.toBeDisabled();
  });

  it("applies a custom className to the wrapper element", () => {
    const { container } = render(
      <Dropdown
        value="a"
        options={options}
        onChange={() => {}}
        className="my-custom"
      />,
    );
    expect(container.firstChild).toHaveClass("my-custom");
    expect(container.firstChild).toHaveClass("dropdown-section");
  });

  it("renders with an empty options array without errors", () => {
    render(<Dropdown value="" options={[]} onChange={() => {}} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });
});
