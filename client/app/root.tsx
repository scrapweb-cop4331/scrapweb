import { useState } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

import "@react95/core/GlobalStyle";
import "@react95/core/themes/win95.css";
import { DesktopIcon } from "./components/ui/common/DesktopIcon";
import { AppWindow } from "./components/ui/common/AppWindow";

export const links: Route.LinksFunction = () => [
  // { rel: "preconnect", href: "https://fonts.googleapis.com" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const onClickScrapwebIcon = () => {
    if (isOpen) {
      setPosition({ x: 0, y: 0 });
    } else setIsOpen(true);
  };

  if (isLoginPage) {
    return <Outlet />;
  }

  return (
    <div className="center-div">
      <DesktopIcon onClick={onClickScrapwebIcon} />
      <AppWindow
        dragOptions={{
          position,
          onDrag: ({ offsetX, offsetY }) =>
            setPosition({ x: offsetX, y: offsetY }),
        }}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      >
        <Outlet />
      </AppWindow>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
