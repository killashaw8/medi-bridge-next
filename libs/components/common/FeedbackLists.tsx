"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

// Define the type for a feedback item
type FeedbackItem = {
  id: number;
  name: string;
  service: string;
  comment: string;
  rating: number;
  image: string;
};

const FeedbackLists = () => {
  // State for feedback data
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Show 6 items per page

  const topRef = useRef<HTMLDivElement>(null);

  // Initialize with mock data
  useEffect(() => {
    // In a real app, you would fetch this data from an API
    const mockData: FeedbackItem[] = [
      {
        id: 1,
        name: "John Doe",
        service: "General Checkup",
        comment:
          "The service was excellent, and the staff was very friendly. I felt well taken care of during my visit.",
        rating: 5,
        image: "/images/users/user1.png",
      },
      {
        id: 2,
        name: "Jane Smith",
        service: "Dental Treatment",
        comment:
          "Great experience overall. The doctor explained everything clearly, and the environment was very comfortable.",
        rating: 5,
        image: "/images/users/user2.png",
      },
      {
        id: 3,
        name: "Michael Brown",
        service: "Eye Consultation",
        comment:
          "Fantastic service! The consultation was quick and thorough. I highly recommend this clinic to others.",
        rating: 5,
        image: "/images/users/user3.png",
      },
      {
        id: 4,
        name: "Sarah Lee",
        service: "Physiotherapy Session",
        comment:
          "My recovery was much faster than expected thanks to the professional care. The therapist was kind and knowledgeable.",
        rating: 5,
        image: "/images/users/user4.png",
      },
      {
        id: 5,
        name: "David Wilson",
        service: "Cardiology Checkup",
        comment:
          "Very satisfied with the cardiology team. They explained the test results clearly. Waiting time could be shorter though.",
        rating: 5,
        image: "/images/users/user5.png",
      },
      {
        id: 6,
        name: "Emily Carter",
        service: "Maternity Care",
        comment:
          "The maternity team was exceptional! They supported me throughout my pregnancy and delivery with great care.",
        rating: 5,
        image: "/images/users/user6.png",
      },
      {
        id: 7,
        name: "Chris Evans",
        service: "Orthopedic Consultation",
        comment:
          "The orthopedic doctor was very knowledgeable and helped me understand my condition clearly. Great experience overall.",
        rating: 5,
        image: "/images/users/user7.png",
      },
      {
        id: 8,
        name: "Olivia Johnson",
        service: "Pediatric Checkup",
        comment:
          "The pediatrician was so gentle and patient with my child. I truly appreciated the caring approach of the staff.",
        rating: 5,
        image: "/images/users/user8.png",
      },
      {
        id: 9,
        name: "William Harris",
        service: "Dermatology Consultation",
        comment:
          "The dermatologist gave helpful advice and treatment options. The waiting time was a bit long, but the care was worth it.",
        rating: 5,
        image: "/images/users/user9.png",
      },
      {
        id: 10,
        name: "David Wilson",
        service: "Cardiology Checkup",
        comment:
          "Very satisfied with the cardiology team. They explained the test results clearly. Waiting time could be shorter though.",
        rating: 5,
        image: "/images/users/user5.png",
      },
      {
        id: 11,
        name: "Sarah Lee",
        service: "Physiotherapy Session",
        comment:
          "My recovery was much faster than expected thanks to the professional care. The therapist was kind and knowledgeable.",
        rating: 5,
        image: "/images/users/user4.png",
      },
      {
        id: 12,
        name: "Emily Carter",
        service: "Maternity Care",
        comment:
          "The maternity team was exceptional! They supported me throughout my pregnancy and delivery with great care.",
        rating: 5,
        image: "/images/users/user6.png",
      },
    ];

    setFeedbackData(mockData);
  }, []);

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = feedbackData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(feedbackData.length / itemsPerPage);

  // Function to render star ratings
  const renderRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <li key={i}>
        <i className={`ri-star${i < rating ? "-fill" : "-line"}`}></i>
      </li>
    ));
  };

  // Handle page change with scroll to top
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    setTimeout(() => {
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <>
      <div className="review-area ptb-140" ref={topRef}>
        <div className="container">
          <div className="row justify-content-center g-4">
            {currentItems.map((item) => (
              <div key={item.id} className="col-lg-4 col-md-6">
                <div className="review-card">
                  <ul className="rating">{renderRating(item.rating)}</ul>
                  <p>{item.comment}</p>
                  <div className="info">
                    <div className="image">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={40}
                        height={40}
                      />
                    </div>
                    <div className="title">
                      <h3>{item.name}</h3>
                      <span>{item.service}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* pagination - only show if more than 6 items */}
            {feedbackData.length > itemsPerPage && (
              <div className="col-lg-12 col-md-12">
                <Stack className="mypage-pagination">
                  <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      shape="rounded"
                      variant="outlined"
                      size="large"
                      color="primary"
                      onChange={handlePageChange}
                      sx={{ "& .MuiPaginationItem-root": { marginX: "6px" } }}
                    />
                  </Stack>
                </Stack>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedbackLists;
