import React, { useState, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";
import { Button } from "@mui/material";

const ContactForm = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    number: "",
    text: "",
    agree: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      agree: e.target.checked,
    }));
  };

  // Handle opening chat window instead of navigating
  const handleOpenChat = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Dispatch custom event to open chat
    window.dispatchEvent(new CustomEvent('openChat'));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!formData.name.trim()) {
        await sweetMixinErrorAlert("Please enter your name");
        setLoading(false);
        return;
      }

      if (!formData.email.trim()) {
        await sweetMixinErrorAlert("Please enter your email");
        setLoading(false);
        return;
      }

      if (!formData.subject.trim()) {
        await sweetMixinErrorAlert("Please enter a subject");
        setLoading(false);
        return;
      }

      if (!formData.number.trim()) {
        await sweetMixinErrorAlert("Please enter your phone number");
        setLoading(false);
        return;
      }

      if (!formData.text.trim()) {
        await sweetMixinErrorAlert("Please enter your message");
        setLoading(false);
        return;
      }

      if (!formData.agree) {
        await sweetMixinErrorAlert("Please agree to the Privacy Policy");
        setLoading(false);
        return;
      }

      // Send email via API (include userId if logged in for rate limiting)
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: user?._id || null, // Include user ID if logged in
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Handle rate limit error (429 status)
        if (response.status === 429) {
          await sweetMixinErrorAlert(data.message || "You have reached the daily email limit. Please try again tomorrow.");
        } else {
          throw new Error(data.message || "Failed to send message");
        }
        setLoading(false);
        return;
      }

      // Show success message
      await sweetMixinSuccessAlert("Your message has been sent successfully!");

      // Redirect to thank-you page
      router.push("/contact/thank-you");
    } catch (error: any) {
      console.error("Contact form error:", error);
      await sweetMixinErrorAlert(
        error.message || "Failed to send message. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="contact-us-area pb-140">
        <div className="container">
          <div className="row justify-content-center g-4">
            <div className="col-lg-6 col-md-12">
              <div
                className="contact-us-image"
              >
                <div className="wrap-content">
                  <div className="left">
                    <div className="icon">
                      <Image
                        src="/images/live.svg"
                        alt="live"
                        width={63}
                        height={63}
                      />
                    </div>
                    <div className="title">
                      <h3>Prefer to Chat Live?</h3>
                      <p>
                        Our support team is available 24/7 to assist you in
                        real-time.
                      </p>
                    </div>
                  </div>
                  <div className="right">
                    <a 
                      href="#" 
                      className="link-btn"
                      onClick={handleOpenChat}
                    >
                      Start Live Chat
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="none"
                      >
                        <path
                          d="M12.5 0H0.5C0.224 0 0 0.224 0 0.5C0 0.776 0.224 1 0.5 1H11.2928L0.1465 12.1465C-0.04875 12.3417 -0.04875 12.6583 0.1465 12.8535C0.24425 12.9513 0.372 13 0.5 13C0.628 13 0.756 12.9513 0.8535 12.8535L12 1.707V12.5C12 12.776 12.224 13 12.5 13C12.776 13 13 12.776 13 12.5V0.5C13 0.224 12.776 0 12.5 0Z"
                          fill="white"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6 col-md-12">
              <div className="contact-us-form">
                <div className="content">
                  <h2>Get In Touch</h2>
                  <p>
                    Have a question or need assistance? Send us a message and
                    our support team will respond as soon as possible.
                  </p>
                  <p className="contact-us-note">
                    <strong>Note:</strong> You can send up to 1 email per day.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="e.g. Lara Croft"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="e.g. lara@support.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Subject</label>
                    <input
                      type="text"
                      name="subject"
                      className="form-control"
                      placeholder="e.g. Enter your subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      name="number"
                      className="form-control"
                      placeholder="e.g. 010-1234-5678"
                      value={formData.number}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Message</label>
                    <textarea
                      name="text"
                      cols={30}
                      rows={6}
                      className="form-control"
                      placeholder="e.g. I have a question about..."
                      value={formData.text}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="agree"
                        checked={formData.agree}
                        onChange={handleCheckboxChange}
                        id="checkDefault"
                        disabled={loading}
                        required
                      />
                      <label
                        className="form-check-label"
                        htmlFor="checkDefault"
                      >
                        I confirm that I have read and agree to the{" "}
                        <a href="/privacy-policy">Privacy Policy.</a>
                      </label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    Submit Now
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactForm;
