import React, { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { logIn, logInWithGoogle } from "@/libs/auth";
import { sweetMixinErrorAlert } from "@/libs/sweetAlert";
import { Button } from "@mui/material";
import { FaGoogle } from "react-icons/fa";

declare global {
  interface Window {
    google?: any;
  }
}

const LoginForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nick: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nick.trim()) {
      await sweetMixinErrorAlert("Please enter your username/nickname");
      return;
    }

    if (!formData.password.trim()) {
      await sweetMixinErrorAlert("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      await logIn(formData.nick.trim(), formData.password);
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      return;
    }

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential?: string }) => {
          if (!response?.credential) {
            await sweetMixinErrorAlert("Google login failed. Please try again.");
            return;
          }

          setLoading(true);
          try {
            await logInWithGoogle(response.credential);
            router.push("/");
          } catch (error) {
            console.error("Google login error:", error);
          } finally {
            setLoading(false);
          }
        },
      });
      setGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [router]);

  const handleGoogleLogin = async () => {
    if (!window.google?.accounts?.id) {
      await sweetMixinErrorAlert("Google login is not ready. Please try again.");
      return;
    }
    window.google.accounts.id.prompt();
  };

  return (
    <>
      <div className="profile-authentication-area pt-140">
        <div className="container">
          <div className="profile-authentication-inner">
            <div className="content">
              <h3>Login to Your Account</h3>
              <p>
                Access your dashboard, manage appointments, and connect with
                licensed doctors—securely and conveniently.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  Username / Nickname <span>(required)</span>
                </label>
                <input
                  type="text"
                  name="nick"
                  value={formData.nick}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. john_doe"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Password <span>(required)</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your password"
                  disabled={loading}
                  required
                />
              </div>

              <div className="options">
                <label>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  Remember Me
                </label>
                <Link href="/forgot-password">Forgot password?</Link>
              </div>

              <div className="authentication-btn">
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                >
                  Login
                </Button>
              </div>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <div className="social-auth">
              <p>Sign in with:</p>
              <div className="social-auth-icons">
                <button
                  type="button"
                  className="social-auth-btn"
                  onClick={handleGoogleLogin}
                  disabled={!googleReady || loading}
                  aria-label="Sign in with Google"
                >
                  <FaGoogle />
                </button>
              </div>
            </div>

            <div className="bottom-text">
              <span>
                Don&apos;t have an account?{" "}
                <Link href="/account/register">Register Now - It&apos;s Free</Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
