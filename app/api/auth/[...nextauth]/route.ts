import NextAuth, { type AuthOptions } from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions as AuthOptions);

export { handler as GET, handler as POST };


// Frontend code to LOGIN
// const response = await fetch('/api/auth/callback/credentials', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({
//     email: 'user@example.com',
//     password: 'password123',
//     // name: '' // Don't send name for login
//   }),
// });
// Frontend code to REGISTER
// const response = await fetch('/api/auth/callback/credentials', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({
//     email: 'newuser@example.com',
//     password: 'password123',
//     name: 'New User', // Include name for registration
//     // NextAuth will see the name and create a new user
//   }),
// });