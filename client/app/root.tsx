import { useState, useEffect, createContext, useContext } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  redirect,
  useLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

import "@react95/core/GlobalStyle";
import "@react95/core/themes/win95.css";
import { DesktopIcon } from "./components/ui/common/DesktopIcon";
import { AppWindow } from "./components/ui/common/AppWindow";
import { auth, type User } from "./lib/auth";
import { EditProvider } from "./lib/edit-context";

export const links: Route.LinksFunction = () => [
  // { rel: "preconnect", href: "https://fonts.googleapis.com" },
];

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const isLoginPage = url.pathname === "/login";
  const isIdkPage = url.pathname === "/idk";
  
  const cookieHeader = request.headers.get("Cookie");
  const user = auth.loadUser(cookieHeader);

  if (!user && !isLoginPage && !isIdkPage) {
    return redirect("/login");
  }

  // If we are logged in and try to go to login page, redirect to home
  if (user && isLoginPage) {
    return redirect("/");
  }

  return { user };
};

const AuthContext = createContext<{ user: User | null }>({ user: null });

export const useAuth = () => useContext(AuthContext);

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
  const { user } = useLoaderData<typeof loader>();
  const [isOpen, setIsOpen] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const location = useLocation();
  const renderOutletDirectly = ["/login", "/idk", '/song'].includes(location.pathname);

  // Initialize auth service on client
  useEffect(() => {
    auth.loadUser();
  }, []);

  const onClickScrapwebIcon = () => {
    if (isOpen) {
      setPosition({ x: 0, y: 0 });
    } else setIsOpen(true);
  };

  return (
    <AuthContext.Provider value={{ user }}>
      {renderOutletDirectly ? (
        <Outlet />
      ) : (
        <div className="center-div">
          <DesktopIcon onClick={onClickScrapwebIcon} />
          
          <EditProvider>
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
          </EditProvider>
        </div>
      )}
    </AuthContext.Provider>
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
