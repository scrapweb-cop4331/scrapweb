export type User = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  token: string;
};

const COOKIE_NAME = "user_session";

let currentUser: User | null = null;

export const auth = {
  saveUser(user: User) {
    currentUser = user;
    if (typeof document !== "undefined") {
      const userJson = JSON.stringify(user);
      const expires = new Date();
      expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      document.cookie = `${COOKIE_NAME}=${encodeURIComponent(userJson)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    }
  },

  loadUser(cookieHeader?: string | null): User | null {
    const isServer = typeof document === "undefined";
    if (isServer && !cookieHeader) return null;
    
    const name = COOKIE_NAME + "=";
    const cookieString = cookieHeader || (typeof document !== "undefined" ? document.cookie : "");
    const decodedCookie = decodeURIComponent(cookieString);
    const ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        try {
          const user = JSON.parse(c.substring(name.length, c.length));
          if (!cookieHeader) {
            currentUser = user;
          }
          return user;
        } catch (e) {
          console.error("Failed to parse user cookie", e);
          return null;
        }
      }
    }
    if (!cookieHeader) {
      currentUser = null;
    }
    return null;
  },

  logout() {
    currentUser = null;
    if (typeof document !== "undefined") {
      document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
    }
  },

  getUser(): User | null {
    return currentUser;
  },

  isAuthenticated(): boolean {
    return !!currentUser && !!currentUser.token;
  },

  getAuthHeader(): { Authorization?: string } {
    if (currentUser && currentUser.token) {
      return { Authorization: `Bearer ${currentUser.token}` };
    }
    return {};
  },
};
