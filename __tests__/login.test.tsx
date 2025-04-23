import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/[locale]/login/page";

// Mock the next-intl translations
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: { [key: string]: string } = {
      welcome: "Welcome back",
      enterCredentials: "Please enter your credentials to continue",
      login: "Log in",
      loginDescription: "Enter your email and password to access your account",
      email: "Email",
      emailPlaceholder: "Enter your email",
      password: "Password",
      forgotPassword: "Forgot password?",
      signIn: "Sign in",
      signingIn: "Signing in...",
      noAccount: "Don't have an account?",
      signUp: "Sign up",
      terms: "By logging in, you agree to our",
      termsOfService: "Terms of Service",
      and: "and",
      privacyPolicy: "Privacy Policy",
      invalidEmail: "Invalid email address",
      passwordTooShort: "Password must be at least 6 characters",
    };
    return translations[key] || key;
  },
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return <img {...props} />;
  },
}));

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// Mock setTimeout for async operations
jest.useFakeTimers();

describe("LoginPage", () => {
  beforeEach(() => {
    // Clear all mocks between tests
    jest.clearAllMocks();
  });

  it("renders the login form", () => {
    render(<LoginPage />);

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  //   it("validates email input", async () => {
  //     const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  //     render(<LoginPage />);

  //     const emailInput = screen.getByLabelText("Email");
  //     const submitButton = screen.getByTestId("login-button");

  //     // Type invalid email
  //     await user.type(emailInput, "invalid-email");

  //     // Submit form
  //     await user.click(submitButton);

  //     // Wait for validation error to appear
  //     await waitFor(
  //       () => {
  //         const errorMessage = screen.getByRole("alert");
  //         expect(errorMessage).toBeInTheDocument();
  //         expect(errorMessage).toHaveTextContent("Invalid email address");
  //       },
  //       { timeout: 3000 }
  //     );

  //     // Clear and type valid email
  //     await user.clear(emailInput);
  //     await user.type(emailInput, "test@example.com");

  //     // Submit again
  //     await user.click(submitButton);

  //     // Email error should be gone
  //     await waitFor(
  //       () => {
  //         const alertElements = screen.queryAllByRole("alert");
  //         const emailError = alertElements.find(
  //           (el) => el.textContent === "Invalid email address"
  //         );
  //         expect(emailError).toBeUndefined();
  //       },
  //       { timeout: 3000 }
  //     );
  //   });

  it("validates password input", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<LoginPage />);

    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByTestId("login-button");

    // Too short password
    await user.type(passwordInput, "12345");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 6 characters")
      ).toBeInTheDocument();
    });

    // Valid password
    await user.clear(passwordInput);
    await user.type(passwordInput, "123456");

    // Submit again
    await user.click(submitButton);

    // Password error should be gone
    await waitFor(() => {
      expect(
        screen.queryByText("Password must be at least 6 characters")
      ).not.toBeInTheDocument();
    });
  });

  it("submits the form with valid data", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByTestId("login-button");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    await user.click(submitButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Login data:",
        expect.objectContaining({
          email: "test@example.com",
          password: "password123",
        })
      );
    });

    // Button should show loading state
    expect(submitButton).toBeDisabled();

    // Fast-forward timer to complete the simulated API call
    jest.advanceTimersByTime(1000);

    // After API call, button should no longer be disabled
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    consoleSpy.mockRestore();
  });

  it("handles form submission errors", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByTestId("login-button");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    await user.click(submitButton);

    // Fast-forward timer to complete the simulated API call
    jest.advanceTimersByTime(1000);

    // After API call, button should no longer be disabled
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    consoleErrorSpy.mockRestore();
  });

  afterAll(() => {
    jest.useRealTimers();
  });
});
