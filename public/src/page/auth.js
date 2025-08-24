"use client";

import { useState } from "react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`${isLogin ? "Login" : "Signup"} with ${email}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">{isLogin ? "Login" : "Signup"}</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 rounded bg-gray-700"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 rounded bg-gray-700"
            required
          />
          <button type="submit" className="bg-blue-600 p-2 rounded hover:bg-blue-700 transition">
            {isLogin ? "Login" : "Signup"}
          </button>
        </form>

        <div className="my-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 underline"
          >
            {isLogin ? "Create an account" : "Already have an account?"}
          </button>
        </div>

        {/* Social Logins */}
        <div className="flex gap-4 justify-center mt-4">
          <button className="bg-red-600 px-4 py-2 rounded">Google</button>
          <button className="bg-blue-800 px-4 py-2 rounded">Facebook</button>
        </div>
      </div>
    </div>
  );
}
