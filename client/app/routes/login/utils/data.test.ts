import { test, expect } from "vitest";
import { mapResponseToUser } from "./data";
import type { User, LoginResponseDTO } from "./data";

export type TestSchema = {
  description: string;
  input: LoginResponseDTO;
  output: User;
};

const testCases: Array<TestSchema> = [
  {
    description: "maps a valid login response to a user object",
    input: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDk2YjE2YjhhNTkwZWVkMzBiMmI5MyIsImlhdCI6MTc3NjA0Nzg5OSwiZXhwIjoxNzc2MTM0Mjk5fQ.yQONrhL0iuQ5yCO4mlcs35SLswc5oZ-dMsfJEeRW85I",
      user: {
        id: "69d96b16b8a590eed30b2b93",
        first_name: "ty",
        last_name: "s",
        username: "kight",
        email: "gtkchwdvesihbbxtbb@enotj.com"
      }
    },
    output: {
      id: "69d96b16b8a590eed30b2b93",
      firstName: "ty",
      lastName: "s",
      username: "kight",
      email: "gtkchwdvesihbbxtbb@enotj.com",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDk2YjE2YjhhNTkwZWVkMzBiMmI5MyIsImlhdCI6MTc3NjA0Nzg5OSwiZXhwIjoxNzc2MTM0Mjk5fQ.yQONrhL0iuQ5yCO4mlcs35SLswc5oZ-dMsfJEeRW85I"
    }
  }
];

for (const dummy of testCases) {
  test(dummy.description, () => {
    expect(mapResponseToUser(dummy.input)).toEqual(dummy.output);
  });
}
