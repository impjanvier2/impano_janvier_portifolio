
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { LockKeyhole, Mail, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Authenticate with Supabase
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) throw loginError;

      const user = data.user;

      // 2. Verify that this user is an admin
      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError) {
        throw new Error(
          "Ntibyashobotse kugenzura uburenganzira bwa admin. Reba Supabase policies."
        );
      }

      if (!admin) {
        await supabase.auth.signOut();
        throw new Error(
          "Iyi account ntabwo yemerewe kwinjira muri Admin Dashboard."
        );
      }

      // 3. Go to the dashboard
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Kwinjira byanze. Ongera ugerageze.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-8 inline-block text-sm text-slate-400 hover:text-white"
        >
          ← Garuka kuri Portfolio
        </Link>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7 shadow-2xl sm:p-9">
          <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600">
            <LockKeyhole size={27} />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Admin Login
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Injira kugira ngo ucunge portfolio yawe.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-3">
                <Mail size={18} className="text-slate-400" />

                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-transparent py-3 outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-3">
                <LockKeyhole size={18} className="text-slate-400" />

                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Andika password yawe"
                  className="w-full bg-transparent py-3 outline-none placeholder:text-slate-600"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hisha password" : "Erekana password"
                  }
                  className="text-slate-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Turimo kugenzura..." : "Injira muri Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
