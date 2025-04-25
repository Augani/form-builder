// jest.setup.ts
import "@testing-library/jest-dom";
import React from "react";

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter: () => ({
    route: "/",
    pathname: "",
    query: {},
    asPath: "",
    push: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
    },
    beforePopState: jest.fn(() => null),
    prefetch: jest.fn(() => null),
  }),
}));

// Mock Next.js image component
jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (
    props: React.DetailedHTMLProps<
      React.ImgHTMLAttributes<HTMLImageElement>,
      HTMLImageElement
    >
  ) => {
    // Create an img element without using JSX
    return React.createElement("img", {
      ...props,
      alt: props.alt || "",
    });
  },
}));

// Setup environment variables if needed
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

// Configure global fetch mock
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    ok: true,
    status: 200,
    statusText: "OK",
  } as Response)
);

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Clean up after tests
afterEach(() => {
  jest.restoreAllMocks();
});

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  // Add other functions you use from next-intl
  createTranslator: () => (key: string) => key,
  useLocale: () => "en",
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "",
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock next-auth
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
      },
    },
    status: "authenticated",
  })),
}));

// This is needed for the file transformer
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Increase the timeout for tests
jest.setTimeout(30000);
