import React from "react";
import Image from "next/image";
import Link from "next/link";

const OurBlog = () => {
  // Dynamic blog data
  const blogData = [
    {
      id: 1,
      imageSrc: "/images/blog/blog1.jpg",
      category: "Telehealth Tips",
      date: "Mar 12, 2025",
      title: "5 Signs You Should See a Doctor Virtually",
      slug: "/blogs/details",
    },
    {
      id: 2,
      imageSrc: "/images/blog/blog2.jpg",
      category: "Mental Health",
      date: "Mar 15, 2025",
      title: "Managing Anxiety: How Online Therapy Can Help",
      slug: "/blogs/details",
    },
    {
      id: 3,
      imageSrc: "/images/blog/blog3.jpg",
      category: "Internal Medicine",
      date: "Mar 15, 2025",
      title: "What to Expect During Your First Telehealth Visit",
      slug: "/blogs/details",
    },
  ];

  return (
    <>
      <div className="blog-area ptb-140">
        <div className="container">
          <div className="section-title">
            <div className="row justify-content-center align-items-center g-4">
              <div className="col-lg-7 col-md-12">
                <div className="left">
                  <span className="sub">Our Blog</span>
                  <h2>
                    Health Insights, Tips & Resources from Medical Experts
                  </h2>
                </div>
              </div>
              <div className="col-lg-5 col-md-12">
                <div className="right">
                  <p>
                    Explore trusted articles, wellness tips, and expert advice
                    to help you stay informed, make smarter health decisions
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="row justify-content-center g-4">
            {blogData.map((post) => (
              <div key={post.id} className="col-lg-4 col-md-6">
                <div className="blog-card">
                  <div className="image">
                    <Link href={post.slug}>
                      <Image
                        src={post.imageSrc}
                        alt={post.title}
                        width={832}
                        height={832}
                      />
                    </Link>
                  </div>
                  <div className="content">
                    <ul className="meta">
                      <li>
                        <Link href={post.slug}>{post.category}</Link>
                      </li>
                      <li>{post.date}</li>
                    </ul>
                    <h3>
                      <Link href={post.slug}>{post.title}</Link>
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default OurBlog;
