import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "./Sidebar";


const BlogClassic = () => {
  // Create a ref for the blog area to scroll to
  const blogAreaRef = useRef<HTMLDivElement>(null);
  
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
    {
      id: 4,
      imageSrc: "/images/blog/blog4.jpg",
      category: "Preventive Care",
      date: "Mar 18, 2025",
      title: "Annual Checkups: Why They Matter More Than Ever",
      slug: "/blogs/details",
    },
    {
      id: 5,
      imageSrc: "/images/blog/blog5.jpg",
      category: "Chronic Conditions",
      date: "Mar 20, 2025",
      title: "Managing Diabetes Through Telemedicine",
      slug: "/blogs/details",
    },
    {
      id: 6,
      imageSrc: "/images/blog/blog6.jpg",
      category: "Pediatrics",
      date: "Mar 22, 2025",
      title: "Virtual Visits for Children: What Parents Need to Know",
      slug: "/blogs/details",
    },
    {
      id: 7,
      imageSrc: "/images/blog/blog7.jpg",
      category: "Nutrition",
      date: "Mar 25, 2025",
      title: "Healthy Eating Habits You Can Discuss With Your Doctor Online",
      slug: "/blogs/details",
    },
    {
      id: 8,
      imageSrc: "/images/blog/blog8.jpg",
      category: "Women's Health",
      date: "Mar 28, 2025",
      title: "How Telehealth is Changing Women's Preventive Care",
      slug: "/blogs/details",
    },
    {
      id: 9,
      imageSrc: "/images/blog/blog9.jpg",
      category: "Senior Care",
      date: "Apr 1, 2025",
      title: "Telemedicine for Seniors: Safer Care from Home",
      slug: "/blogs/details",
    },
    {
      id: 10,
      imageSrc: "/images/blog/blog10.jpg",
      category: "Technology",
      date: "Apr 3, 2025",
      title: "AI in Telemedicine: What Patients Should Know",
      slug: "/blogs/details",
    },
    {
      id: 11,
      imageSrc: "/images/blog/blog11.jpg",
      category: "Fitness & Wellness",
      date: "Apr 6, 2025",
      title: "Combining Virtual Care With Your Wellness Routine",
      slug: "/blogs/details",
    },
    {
      id: 12,
      imageSrc: "/images/blog/blog12.jpg",
      category: "Global Health",
      date: "Apr 10, 2025",
      title: "How Telehealth is Expanding Access to Care Worldwide",
      slug: "/blogs/details",
    },
  ];
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  
  // Calculate pagination values
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = blogData.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(blogData.length / postsPerPage);
  
  // Check if pagination should be shown
  const showPagination = blogData.length > postsPerPage;
  
  // Generate page numbers to display
  const pageNumbers = [];
  const maxVisiblePages = 6;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1); // Fixed: changed 'let' to 'const'
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  
  // Function to scroll to top of blog area
  const scrollToTop = () => {
    if (blogAreaRef.current) {
      blogAreaRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  // Handle page change with scroll to top
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    scrollToTop();
  };
  
  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
    scrollToTop();
  };
  
  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    scrollToTop();
  };
  
  return (
    <>
      <div ref={blogAreaRef} className="blog-area ptb-140">
        <div className="container">
          <div className="row justify-content-center g-4">
            <div className="col-xl-8 col-md-12">
              <div className="row justify-content-center g-4">
                {currentPosts.map((post) => (
                  <div key={post.id} className="col-lg-12 col-md-12">
                    <div className="blog-card wrap-style2">
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
                
                {/* Conditionally render pagination */}
                {showPagination && (
                  <div className="col-lg-12 col-md-12">
                    <div className="pagination-area">
                      <button
                        type="button"
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                        className={currentPage === 1 ? "disabled" : ""}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M13 19L7 12L13 5"
                            stroke="#63667D"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            opacity="0.5"
                            d="M17 19L11 12L17 5"
                            stroke="#63667D"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      
                      {pageNumbers.map((number) => (
                        <button
                          key={number}
                          type="button"
                          onClick={() => paginate(number)}
                          className={currentPage === number ? "active" : ""}
                        >
                          {number}
                        </button>
                      ))}
                      
                      <button
                        type="button"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className={currentPage === totalPages ? "disabled" : ""}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M11 19L17 12L11 5"
                            stroke="#63667D"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            opacity="0.5"
                            d="M7 19L13 12L7 5"
                            stroke="#63667D"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="col-xl-4 col-md-12">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogClassic;