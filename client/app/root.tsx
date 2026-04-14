import { useState, createContext, useContext } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  redirect,

} from "react-router";
import ohnoes from "~/assets/jail.jpg";
import type { Route } from "./+types/root";
import "./app.css";
import "@react95/core/GlobalStyle";
import "@react95/core/themes/win95.css";
import { auth, type User } from "./lib/auth";


export const links: Route.LinksFunction = () => [
  // { rel: "preconnect", href: "https://fonts.googleapis.com" },
];

export const clientLoader = async ({ request }: Route.ClientLoaderArgs) => {
  const url = new URL(request.url);
  const isLoginPage = url.pathname === "/login";
  const isIdkPage = url.pathname === "/idk";
  
  const user = auth.loadUser();

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

export function HydrateFallback() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#008080' 
    }}>
      <div style={{ color: 'white', fontFamily: 'monospace' }}>
        Starting ScrapWeb...
      </div>
    </div>
  );
}

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
  return (
    <Outlet />
  );
};


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
    <main >
      <h1>{message}</h1>
      <img src={ohnoes} alt="" />
      <p>{details}</p>
      {stack && (
        <pre>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
