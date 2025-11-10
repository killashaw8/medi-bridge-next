import React from "react";
import Image from "next/image";

// Step data structure
interface WorkStep {
  id: number;
  icon: string;
  title: string;
  description: string;
  vectorImage?: string;
  vectorWidth?: number;
  vectorHeight?: number;
}

const HowItWorks = () => {
  // Steps data - this could come from an API or CMS
  const workSteps: WorkStep[] = [
    {
      id: 1,
      icon: "/images/icons/work1.svg",
      title: "Create Account",
      description: "Sign up and complete your profile in minutes.",
      vectorImage: "/images/vector1.png",
      vectorWidth: 42,
      vectorHeight: 88,
    },
    {
      id: 2,
      icon: "/images/icons/work2.svg",
      title: "Choose a Service",
      description: "Select from general care & mental health.",
      vectorImage: "/images/vector2.png",
      vectorWidth: 30,
      vectorHeight: 91,
    },
    {
      id: 3,
      icon: "/images/icons/work3.svg",
      title: "Start Consultation",
      description: "Video chat with a licensed doctor anytime.",
    },
  ];

  return (
    <>
      <div className="work-area ptb-140">
        <div className="container">
          <div className="section-title">
            <div className="row justify-content-center align-items-center g-4">
              <div className="col-lg-7 col-md-12">
                <div className="left">
                  <span className="sub">How It Works</span>
                  <h2>
                    How MediBridge Works—Signup to Consultation in Just Minutes
                  </h2>
                </div>
              </div>
              <div className="col-lg-5 col-md-12">
                <div className="right">
                  <p>
                    Skip the waiting room and take control of your health in
                    three simple steps. With MediBridge, getting expert care is
                    fast, secure, and effortless
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="row justify-content-center align-items-center g-5">
            <div className="col-lg-6 col-md-12">
              <div className="work-image">
                <Image
                  src="/images/work.jpg"
                  alt="How MediBridge works"
                  width={1052}
                  height={1254}
                />
              </div>
            </div>

            <div className="col-lg-6 col-md-12">
              <div className="work-items">
                {workSteps.map((step) => (
                  <div key={step.id} className="item">
                    <div className="icon">
                      <Image
                        src={step.icon}
                        alt={`${step.title} icon`}
                        width={44}
                        height={44}
                      />
                    </div>
                    <div className="content">
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </div>
                    {step.vectorImage && (
                      <div className="vector">
                        <Image
                          src={step.vectorImage}
                          alt="decoration vector"
                          width={step.vectorWidth || 42}
                          height={step.vectorHeight || 88}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HowItWorks;
