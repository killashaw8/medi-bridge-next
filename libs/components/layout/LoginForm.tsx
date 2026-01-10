import React, { useEffect, useRef, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { logIn, logInWithGoogleAccessToken, logInWithKakao, logInWithTelegram } from "@/libs/auth";
import { sweetMixinErrorAlert } from "@/libs/sweetAlert";
import { Button } from "@mui/material";
import { FaGoogle, FaTelegramPlane } from "react-icons/fa";
import TelegramLoginButton, { TelegramUser } from "@/libs/components/common/TelegramLoginButton";

declare global {
  interface Window {
    google?: any;
    Kakao?: any;
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
  const googleTokenClientRef = useRef<any>(null);
  const telegramBotName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME;
  const kakaoJsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

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
      if (!window.google?.accounts?.oauth2) return;

      googleTokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: async (response: { access_token?: string }) => {
          if (!response?.access_token) {
            await sweetMixinErrorAlert("Google login failed. Please try again.");
            return;
          }

          setLoading(true);
          try {
            await logInWithGoogleAccessToken(response.access_token);
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

    if (window.google?.accounts?.oauth2) {
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!kakaoJsKey) {
      console.warn("Missing NEXT_PUBLIC_KAKAO_JS_KEY");
      return;
    }

    const initializeKakao = () => {
      if (!window.Kakao) return;
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(kakaoJsKey);
      }
    };

    if (window.Kakao) {
      initializeKakao();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.min.js";
    script.async = true;
    script.defer = true;
    script.onload = initializeKakao;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [kakaoJsKey]);

  const handleGoogleLogin = async () => {
    if (!googleReady) {
      await sweetMixinErrorAlert("Google login is not ready. Please try again.");
      return;
    }
    googleTokenClientRef.current?.requestAccessToken({ prompt: "consent" });
  };

  const handleTelegramAuth = async (user: TelegramUser) => {
    setLoading(true);
    try {
      await logInWithTelegram({
        id: user.id,
        hash: user.hash,
        auth_date: user.auth_date,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url,
      });
      router.push("/");
    } catch (error) {
      console.error("Telegram login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    if (!window.Kakao || !window.Kakao.isInitialized?.()) {
      await sweetMixinErrorAlert("Kakao login is not ready. Please try again.");
      return;
    }

    setLoading(true);
    window.Kakao.Auth.login({
      scope: "profile_nickname,profile_image",
      success: async (authObj: { access_token?: string }) => {
        try {
          if (!authObj?.access_token) {
            await sweetMixinErrorAlert("Kakao login failed. Please try again.");
            return;
          }
          await logInWithKakao(authObj.access_token);
          router.push("/");
        } catch (error) {
          console.error("Kakao login error:", error);
        } finally {
          setLoading(false);
        }
      },
      fail: (err: any) => {
        console.error("Kakao login failed:", err);
        setLoading(false);
      },
    });
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
                <div className="social-auth-icon">
                  <button
                    type="button"
                    className="social-auth-btn"
                    onClick={handleGoogleLogin}
                    disabled={!googleReady || loading}
                    aria-label="Sign in with Google"
                    title="Google"
                  >
                    <FaGoogle />
                  </button>
                </div>
                {kakaoJsKey ? (
                  <div className="social-auth-icon">
                    <button
                      type="button"
                      className="social-auth-btn"
                      onClick={handleKakaoLogin}
                      disabled={loading}
                      aria-label="Sign in with Kakao"
                      title="Kakao"
                    >
                      <img src="/images/icons/kakao.svg" alt="Kakao" className="kakao-icon" />
                    </button>
                  </div>
                ) : null}
                {telegramBotName ? (
                  <div className="telegram-auth social-auth-icon">
                    <button
                      type="button"
                      className="social-auth-btn"
                      aria-label="Sign in with Telegram"
                      disabled={loading}
                      title="Telegram"
                    >
                      <FaTelegramPlane />
                    </button>
                    <TelegramLoginButton
                      botName={telegramBotName}
                      onAuth={handleTelegramAuth}
                      size="large"
                      cornerRadius={12}
                      usePic={false}
                      className="telegram-login-overlay"
                    />
                  </div>
                ) : null}
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
