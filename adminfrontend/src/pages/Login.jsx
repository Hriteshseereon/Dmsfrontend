import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedInUser = await login(username, password);
      if (loggedInUser?.is_admin || loggedInUser?.is_super_admin || loggedInUser?.role === "admin") {
        navigate("/organizations");
      } else {
        navigate("/dms");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
      <div className="w-full max-w-md bg-white border border-amber-200 rounded-2xl shadow-xl p-8">
        {/* Circle logo */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-sm">
            <div className="w-6 h-6 bg-white rounded-full"></div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-amber-900">
          Aum Agro Associates Portal
        </h2>
        <p className="text-center text-amber-700 mb-6 text-sm">
          Enter your credentials to access your workspace
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-1 text-amber-900">
              Username / Email
            </label>
            <input
              type="text"
              placeholder="e.g. ramesh@aumagro.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-amber-300 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 text-amber-900">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-amber-300 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-700 hover:text-amber-900 text-sm font-bold"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl transition duration-200 shadow-sm cursor-pointer mt-2"
          >
            {loading ? "Signing in..." : "Login to Workspace"}
          </button>
        </form>
      </div>
    </div>
  );
}
