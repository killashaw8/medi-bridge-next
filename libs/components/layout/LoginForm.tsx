import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { logIn } from "@/libs/auth";
import { sweetMixinErrorAlert } from "@/libs/sweetAlert";
import { Button } from "@mui/material";

const LoginForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nick: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
