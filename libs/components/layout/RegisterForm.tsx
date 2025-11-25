import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signUp } from "@/libs/auth";
import { sweetMixinErrorAlert } from "@/libs/sweetAlert";

const RegisterForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "", // Note: email is collected but signUp uses nick, so we'll use name as nick
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "0", // Default to Patient
  });
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      await sweetMixinErrorAlert("Please enter your full name");
      return;
    }

    if (!formData.email.trim()) {
      await sweetMixinErrorAlert("Please enter your email address");
      return;
    }

    if (!formData.phone.trim()) {
      await sweetMixinErrorAlert("Please enter your phone number");
      return;
    }

    if (!formData.password.trim()) {
      await sweetMixinErrorAlert("Please enter your password");
      return;
    }

    if (formData.password.length < 6) {
      await sweetMixinErrorAlert("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      await sweetMixinErrorAlert("Passwords do not match. Please try again");
      return;
    }

    if (!agree) {
      await sweetMixinErrorAlert("Please agree to the Privacy Policy to continue");
      return;
    }

    setLoading(true);

    try {
      // signUp expects: nick, password, phone, type
      // We'll use name as nick (or you can use email if preferred)
      const nick = formData.name.trim(); // Using name as nickname
      // Alternative: const nick = formData.email.trim(); // If you prefer email as nick
      
      await signUp(
        nick,
        formData.password.trim(),
        formData.phone.trim(),
        formData.userType
      );
      
      // On successful registration, redirect to home or login
      // The signUp function already handles token storage and user info update
      router.push("/"); // or router.push("/account/login") if you want to redirect to login
    } catch (error) {
      // Error handling is already done in signUp function
      // But we can add additional handling here if needed
      console.error("Registration error:", error);
      // Don't show error here - signUp already shows error alerts
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
              <h3>Create Your MediBridge Account</h3>
              <p>
                Access your dashboard, manage appointments, and connect with
                licensed doctors—securely and conveniently.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  Full Name <span>(required)</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. Emily Carter"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Email Address <span>(required)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. emily@support.com"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Phone Number <span>(required)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. 1-202-555-0147"
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
                  placeholder="Enter your password (min. 6 characters)"
                  disabled={loading}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label>
                  Confirm Password <span>(required)</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Confirm your password"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label>User Type</label>
                <select
                  className="form-control form-select"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  disabled={loading}
                  required
                >
                  <option value="0">Clinic</option>
                  <option value="1">Doctor</option>
                  <option value="2">User</option>
                </select>
              </div>

              <div className="options">
                <label>
                  <input
                    type="checkbox"
                    name="agree"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    disabled={loading}
                    required
                  />
                  I confirm that I have read and agree to the Privacy Policy.
                </label>
              </div>

              <div className="authentication-btn">
                <button
                  type="submit"
                  className="default-btn"
                  disabled={loading}
                >
                  <span className="left">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="19"
                      viewBox="0 0 19 19"
                      fill="none"
                    >
                      <path
                        d="M17.8077 0.98584H1.19231C0.810154 0.98584 0.5 1.29599 0.5 1.67815C0.5 2.0603 0.810154 2.37046 1.19231 2.37046H16.1361L0.702846 17.8041C0.4325 18.0744 0.4325 18.5126 0.702846 18.783C0.838192 18.9183 1.01508 18.9858 1.19231 18.9858C1.36954 18.9858 1.54677 18.9183 1.68177 18.783L17.1154 3.34938V18.2935C17.1154 18.6757 17.4255 18.9858 17.8077 18.9858C18.1898 18.9858 18.5 18.6757 18.5 18.2935V1.67815C18.5 1.29599 18.1898 0.98584 17.8077 0.98584Z"
                        fill="white"
                      />
                    </svg>
                  </span>
                  {loading ? "Registering..." : "Register Now"}
                  <span className="right">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="19"
                      viewBox="0 0 19 19"
                      fill="none"
                    >
                      <path
                        d="M17.8077 0.98584H1.19231C0.810154 0.98584 0.5 1.29599 0.5 1.67815C0.5 2.0603 0.810154 2.37046 1.19231 2.37046H16.1361L0.702846 17.8041C0.4325 18.0744 0.4325 18.5126 0.702846 18.783C0.838192 18.9183 1.01508 18.9858 1.19231 18.9858C1.36954 18.9858 1.54677 18.9183 1.68177 18.783L17.1154 3.34938V18.2935C17.1154 18.6757 17.4255 18.9858 17.8077 18.9858C18.1898 18.9858 18.5 18.6757 18.5 18.2935V1.67815C18.5 1.29599 18.1898 0.98584 17.8077 0.98584Z"
                        fill="white"
                      />
                    </svg>
                  </span>
                </button>
              </div>
            </form>
            
            <div className="bottom-text">
              <span>
                Already have an account? <Link href="/account/login">Login</Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterForm;
