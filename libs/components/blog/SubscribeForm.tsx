import React from "react";
import Image from "next/image"; 
import { redirect } from "next/navigation";

async function handleSubscribe(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "").trim();
  // TODO: Wire up to email marketing service
  console.log("[Subscribe]", { email });
  redirect("/thank-you");
}

const SubscribeForm = () => {
  return (
    <>
      <div className="subscribe-area ptb-140">
        <div className="container">
          <div className="subscribe-content">
            <h2>Subscribe to Our Newsletter</h2>
            <p>
              Get expert health tips, product updates, and exclusive
              telemedicine insights delivered straight to your inbox—no spam,
              ever.
            </p>
          </div>

          <form className="subscribe-form" action={handleSubscribe}>
            <input
              type="text"
              name="email"
              className="form-control"
              placeholder="Enter your email address"
            />

            <button type="submit" className="default-btn">
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
              Subscribe Now
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
          </form>

          <ul className="subscribe-list">
            <li>
              <i className="ri-check-line"></i>
              <span>No spam, unsubscribe anytime</span>
            </li>
            <li>
              <i className="ri-check-line"></i>
              <span>Monthly insights from real doctors</span>
            </li>
            <li>
              <i className="ri-check-line"></i>
              <span>Includes early access to new features or offers</span>
            </li>
          </ul>
        </div>

        <div className="subscribe-shape">
          <Image src="/images/shape.png" alt="image" width={260} height={202} />
        </div>
      </div>
    </>
  );
};

export default SubscribeForm;
