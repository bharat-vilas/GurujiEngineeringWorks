import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { api } from "../../utils/api";
import { authUtils } from "../../utils/auth";

type Mode = "login" | "register" | "reset";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (authUtils.isAuthenticated()) navigate("/app");
  }, [navigate]);

  useEffect(() => {
    setEmail("");
    setPassword("");
    setNewPassword("");
    setConfirm("");
    setErrors({});
    setShowPassword(false);
    setShowConfirm(false);
  }, [mode]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";

    if (mode === "reset") {
      if (!newPassword) errs.newPassword = "Password is required";
      else if (newPassword.length < 6) errs.newPassword = "At least 6 characters";
      if (!confirm) errs.confirm = "Please confirm your password";
      else if (confirm !== newPassword) errs.confirm = "Passwords do not match";
    } else {
      if (!password) errs.password = "Password is required";
      else if (mode === "register" && password.length < 6) errs.password = "At least 6 characters";
      if (mode === "register") {
        if (!confirm) errs.confirm = "Please confirm your password";
        else if (confirm !== password) errs.confirm = "Passwords do not match";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === "login") {
        const response = await api.post("/api/auth/login", { email, password });
        if (!response.ok) {
          const d = await response.json();
          toast.error(d.message || "Invalid email or password.");
          return;
        }
        const data = await response.json();
        authUtils.setTokens(data.accessToken, data.refreshToken, data.user);
        toast.success("Welcome back!");
        navigate("/app");
      } else if (mode === "register") {
        const response = await api.post("/api/auth/register", { email, password });
        const data = await response.json();
        if (!response.ok) { toast.error(data.message || "Registration failed."); return; }
        toast.success("Account created! You can now log in.");
        setMode("login");
      } else {
        const response = await api.post("/api/auth/reset-password", { email, newPassword });
        const data = await response.json();
        if (!response.ok) { toast.error(data.message || "Reset failed."); return; }
        toast.success("Password reset! Please log in.");
        setMode("login");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<Mode, string> = {
    login: "Sign in to your account",
    register: "Create a new account",
    reset: "Reset your password",
  };

  const btnLabels: Record<Mode, string> = {
    login: "Sign In",
    register: "Create Account",
    reset: "Reset Password",
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        backgroundImage: `url("/lathe_workshop_login_background_v2_centered_4K.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      <Card className="relative w-full max-w-md shadow-2xl border-0 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-emerald-500 to-primary" />

        <CardContent className="p-8">
          {/* Logo & Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4 p-3 rounded-2xl bg-primary/10 ring-2 ring-primary/20">
              <img
                src="/GEWlogo2.png"
                alt="Guruji Engineering Works Logo"
                className="h-14 w-auto object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-primary">Guruji Engineering Works</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Document Management System</p>
            <div className="mt-4 w-full">
              <h2 className="text-center text-lg font-semibold text-foreground">{titles[mode]}</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            {/* Password fields */}
            {mode === "reset" ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className={errors.newPassword ? "border-destructive pr-10" : "pr-10"}
                    />
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat new password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      className={errors.confirm ? "border-destructive pr-10" : "pr-10"}
                    />
                    <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={mode === "register" ? "Min. 6 characters" : "Enter your password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={errors.password ? "border-destructive pr-10" : "pr-10"}
                    />
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
                {mode === "register" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Repeat your password"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        className={errors.confirm ? "border-destructive pr-10" : "pr-10"}
                      />
                      <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
                  </div>
                )}
              </>
            )}

            <Button type="submit" className="w-full h-11 text-base mt-2" loading={loading}>
              {!loading && btnLabels[mode]}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-5 flex items-center justify-center gap-4 flex-wrap">
            {mode !== "login" ? (
              <button onClick={() => setMode("login")} className="text-sm text-primary hover:underline font-medium transition-colors">
                ← Back to Sign In
              </button>
            ) : (
              <>
                <button onClick={() => setMode("register")} className="text-sm text-primary hover:underline font-medium transition-colors">
                  Create Account
                </button>
                <span className="text-muted-foreground">·</span>
                <button onClick={() => setMode("reset")} className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors">
                  Forgot Password?
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
