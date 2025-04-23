import React from "react";
import { render, screen } from "@testing-library/react";

describe("Example test", () => {
  it("renders a heading", () => {
    render(<h1>Hello Jest</h1>);
    expect(screen.getByText("Hello Jest")).toBeInTheDocument();
  });
});
