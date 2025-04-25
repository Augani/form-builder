import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/[locale]/login/page";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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

// Mock next-auth
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("LoginPage", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    // Clear all mocks between tests
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
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

  it("submits the form with valid data and successful login", async () => {
    const user = userEvent.setup();
    (signIn as jest.Mock).mockResolvedValueOnce({ ok: true });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByTestId("login-button");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    await user.click(submitButton);

    // Button should show loading state
    expect(submitButton).toBeDisabled();
    expect(screen.getByText("Signing in...")).toBeInTheDocument();

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "test@example.com",
        password: "password123",
        redirect: false,
      });
    });

    // After successful login, should redirect to dashboard
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("handles login failure", async () => {
    const user = userEvent.setup();
    (signIn as jest.Mock).mockResolvedValueOnce({
      error: "Invalid credentials",
    });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByTestId("login-button");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "wrongpassword");

    await user.click(submitButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "test@example.com",
        password: "wrongpassword",
        redirect: false,
      });
    });

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });

    // Should not redirect
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  afterAll(() => {
    jest.useRealTimers();
  });
});
