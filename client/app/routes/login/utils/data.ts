export type UserDTO = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
};

export type LoginResponseDTO = {
  token: string;
  user: UserDTO;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  token: string;
};

export function mapResponseToUser(dto: LoginResponseDTO): User {
  return {
    id: dto.user.id,
    firstName: dto.user.first_name,
    lastName: dto.user.last_name,
    username: dto.user.username,
    email: dto.user.email,
    token: dto.token,
  };
}

const COOKIE_NAME = "user_session";

export function saveUserToCookie(user: User) {
  const userJson = JSON.stringify(user);
  const expires = new Date();
  expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(userJson)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export function getUserFromCookie(): User | null {
  if (typeof document === "undefined") return null;
  const name = COOKIE_NAME + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      try {
        return JSON.parse(c.substring(name.length, c.length));
      } catch (e) {
        console.error("Failed to parse user cookie", e);
        return null;
      }
    }
  }
  return null;
}

export function clearUserCookie() {
  document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
}
