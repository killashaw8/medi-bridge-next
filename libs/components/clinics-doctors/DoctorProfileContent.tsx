"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import CalendarContent from "./CalendarContent";
import { GET_COMMENTS, GET_MEMBER } from "@/apollo/user/query";
import { CREATE_COMMENT, UPDATE_COMMENT } from "@/apollo/user/mutation";
import { Member } from "@/libs/types/member/member";
import { Comment } from "@/libs/types/comment/comment";
import { CommentGroup, CommentStatus } from "@/libs/enums/comment.enum";
import { getImageUrl } from "@/libs/imageHelper";
import { Box, Button, IconButton, Stack, TextField, Pagination } from "@mui/material";
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';
import Moment from "react-moment";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";
import { userVar } from "@/apollo/store";


const DoctorProfileContent = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const router = useRouter();
  const user = useReactiveVar(userVar);

  const doctorId = useMemo(() => {
    const rawId = router.query?.id;
    if (Array.isArray(rawId)) {
      return rawId[0] || "";
    }
    if (typeof rawId === "string" && rawId.trim() !== "") {
      return rawId;
    }

    const queryKeys = Object.keys(router.query || {});
    if (queryKeys.length === 1 && router.query[queryKeys[0]] === "") {
      return queryKeys[0];
    }

    const queryIndex = router.asPath.indexOf("?");
    if (queryIndex !== -1) {
      const rawQuery = router.asPath.slice(queryIndex + 1).split("#")[0];
      if (rawQuery && !rawQuery.includes("=")) {
        return rawQuery;
      }
    }

    return "";
  }, [router.asPath, router.query]);

  const { data: memberData, refetch: refetchDoctor } = useQuery(GET_MEMBER, {
    variables: { targetId: doctorId },
    skip: !doctorId,
    fetchPolicy: "cache-and-network",
  });

  const doctor = memberData?.getMember as Member | undefined;
  const clinicId = doctor?.clinicId;

  const { data: clinicData } = useQuery(GET_MEMBER, {
    variables: { targetId: clinicId, includeLocation: true },
    skip: !clinicId,
    fetchPolicy: "cache-and-network",
  });

  const clinic = clinicData?.getMember as Member | undefined;

  const { data: commentsData, refetch: refetchComments } = useQuery(GET_COMMENTS, {
    variables: {
      input: {
        page: showAllComments ? commentsPage : 1,
        limit: showAllComments ? 6 : 3,
        sort: "createdAt",
        direction: "DESC",
        search: {
          commentRefId: doctorId,
        },
      },
    },
    skip: !doctorId,
    fetchPolicy: "cache-and-network",
  });

  const [createComment, { loading: commentSubmitting }] = useMutation(CREATE_COMMENT);
  const [updateComment, { loading: commentUpdating }] = useMutation(UPDATE_COMMENT);

  const activeComments = useMemo(() => {
    const comments = (commentsData?.getComments?.list ?? []) as Comment[];
    return comments.filter((comment) => comment.commentStatus !== CommentStatus.DELETE);
  }, [commentsData]);
  const commentsTotal = commentsData?.getComments?.metaCounter?.[0]?.total ?? 0;
  const commentsLimit = showAllComments ? 6 : 3;
  const commentsTotalPages = Math.max(1, Math.ceil(commentsTotal / commentsLimit));

  const doctorName = doctor?.memberFullName || doctor?.memberNick || "";
  const doctorTitle = doctor?.specialization ? `MD, ${doctor.specialization}` : "";
  const doctorSpecialty = doctor?.specialization || "";
  const ratingValue = Math.min(5, Math.max(0, doctor?.memberLikes ?? 0));
  const reviewsCount = commentsTotal;
  const reviewsTotalCount = reviewsCount.toLocaleString();
  const profileImage = doctor?.memberImage
    ? getImageUrl(doctor.memberImage)
    : "/images/users/defaultUser.svg";
  const aboutParagraphs = doctor?.memberDesc ? [doctor.memberDesc] : [];
  const clinicName = clinic?.memberFullName || clinic?.memberNick || "";
  const clinicLocation = clinic?.location
    ? clinic.location.replace(/_/g, " ")
    : "";

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const handleSelectionChange = useCallback((date: string, time: string) => {
    setSelectedDate(date);
    setSelectedSlot(time);
  }, []);

  const handleBookNow = () => {
    if (!doctorId || !selectedDate || !selectedSlot) {
      return;
    }

    router.push({
      pathname: "/bookAppointment",
      query: {
        doctorId,
        date: selectedDate,
        time: selectedSlot,
      },
    });
  };

  const handleSubmitComment = async () => {
    const trimmed = commentText.trim();
    if (!user?._id) {
      await sweetMixinErrorAlert("Please log in to leave a review.");
      return;
    }
    if (!trimmed) {
      await sweetMixinErrorAlert("Please enter your review.");
      return;
    }
    if (!doctorId) {
      await sweetMixinErrorAlert("Doctor not found.");
      return;
    }

    try {
      if (editingCommentId) {
        await updateComment({
          variables: {
            input: {
              _id: editingCommentId,
              commentContent: trimmed,
            },
          },
        });
        await sweetMixinSuccessAlert("Review updated.");
      } else {
        await createComment({
          variables: {
            input: {
              commentGroup: CommentGroup.MEMBER,
              commentContent: trimmed,
              commentRefId: doctorId,
            },
          },
        });
        await sweetMixinSuccessAlert("Review submitted.");
      }
      setCommentText("");
      setEditingCommentId(null);
      await Promise.all([refetchComments(), refetchDoctor()]);
    } catch (error: any) {
      const message =
        error?.graphQLErrors?.[0]?.message ||
        error?.message ||
        "Failed to submit review.";
      await sweetMixinErrorAlert(message);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setCommentText(comment.commentContent);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const confirmed = await sweetConfirmAlert("Delete this review?");
      if (!confirmed) return;
      await updateComment({
        variables: {
          input: {
            _id: commentId,
            commentStatus: CommentStatus.DELETE,
          },
        },
      });
      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setCommentText("");
      }
      await Promise.all([refetchComments(), refetchDoctor()]);
      await sweetMixinSuccessAlert("Review deleted.");
    } catch (error: any) {
      const message =
        error?.graphQLErrors?.[0]?.message ||
        error?.message ||
        "Failed to delete review.";
      await sweetMixinErrorAlert(message);
    }
  };

  // Function to render star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    const safeRating = Math.min(5, Math.max(0, rating));
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="ri-star-fill"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="ri-star-half-fill"></i>);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="ri-star-line"></i>);
    }

    return stars;
  };

  return (
    <>
      <div className="doctor-profile-area pb-140">
        <div className="container">
          <div className="row justify-content-center g-4">
            <div className="col-lg-3 col-md-12">
              <div className="doctor-profile-image">
                  <Image
                    src={profileImage}
                    alt={doctorName || "Doctor"}
                    width={611}
                    height={917}
                  />
                  <Box
                    sx={{
                      height: '60px',
                      width: 'inherit',
                      border: '1px solid blue',
                      borderRadius: 3,
                      padding: 1,
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                      alignItems: 'center'
                    }}
                  >
                    <Link href={"https://www.facebook.com/"}>
                      <FacebookIcon />
                    </Link>
                    <Link href={"https://www.instagram.com/"}>
                      <InstagramIcon />
                    </Link>
                    <Link href={"https://www.linkedin.com/"}>
                      <LinkedInIcon />
                    </Link>
                    <Link href={"https://x.com/"}>
                      <XIcon />
                    </Link>
                  </Box>
              </div>
            </div>
            <div className="col-lg-9 col-md-12">
              <div className="doctor-profile-desc">
                <div className="profile-content">
                  <h2>{doctorName}</h2>
                  {doctorTitle && <span className="sub">{doctorTitle}</span>}
                  {doctorSpecialty && (
                    <span className="tag">{doctorSpecialty}</span>
                  )}
                  <div className="info">
                    <ul className="left">
                      <li>
                        <span className="mid">Reviews</span>
                        <div className="rating-info">
                          <div className="list">
                            {renderStars(ratingValue)}
                          </div>
                          <b>{ratingValue}</b>
                          <span className="review">
                            ({reviewsCount})
                          </span>
                        </div>
                      </li>
                      <li>
                        <span className="mid">Clinic</span>
                        <strong className="semi">{clinicName || "-"}</strong>
                      </li>
                      <li>
                        <span className="mid">Location</span>
                        <strong className="semi">{clinicLocation || "-"}</strong>
                      </li>
                    </ul>
                    <div className="right-btn">
                      <Button  
                        variant="contained"
                        size="large"
                        onClick={handleBookNow}
                        disabled={!doctorId || !selectedDate || !selectedSlot}
                        sx={{
                          borderRadius: '50px'
                        }}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="profile-tabs">
                  <ul className="nav nav-tabs" id="myTab" role="tablist">
                    <li className="nav-item">
                      <button
                        type="button"
                        onClick={() => handleTabClick(0)}
                        className={`nav-link ${
                          activeTab === 0 ? "active" : ""
                        }`}
                      >
                        Availability
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        onClick={() => handleTabClick(1)}
                        className={`nav-link ${
                          activeTab === 1 ? "active" : ""
                        }`}
                      >
                        About
                      </button>
                    </li>
                  </ul>
                  <div className="tab-content">
                    {activeTab === 0 && (
                      <div>
                        <CalendarContent
                          doctorId={doctorId}
                          onSelectionChange={handleSelectionChange}
                        />
                        <div className="availability-reviews">
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                            <h3>
                              Reviews{" "}
                              <span>
                                ⭐{" "}
                                <strong>{ratingValue}</strong> ({reviewsTotalCount}{" "}
                                patient reviews)
                              </span>
                            </h3>
                            {commentsTotal > 3 && !showAllComments && (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                  setShowAllComments(true);
                                  setCommentsPage(1);
                                }}
                              >
                                Show all
                              </Button>
                            )}
                            {showAllComments && (
                              <Button
                                variant="text"
                                size="small"
                                onClick={() => {
                                  setShowAllComments(false);
                                  setCommentsPage(1);
                                }}
                              >
                                Show less
                              </Button>
                            )}
                          </div>
                          <div className="row justify-content-center g-4">
                            {activeComments.map((comment) => {
                              const reviewerName =
                                comment.memberData?.memberFullName ||
                                comment.memberData?.memberNick ||
                                "Patient";
                              const initial = reviewerName.charAt(0).toUpperCase() || "P";

                              return (
                                <div className="col-lg-6 col-md-6" key={comment._id}>
                                  <div className="review-item">
                                    <div className="top" style={{ justifyContent: "space-between" }}>
                                      <div className="title">
                                        <h2>{initial}</h2>
                                      </div>
                                      <div className="content">
                                        <h4>{reviewerName}</h4>
                                        <p style={{ margin: 0, color: "#5A6A85", fontSize: "13px" }}>
                                          <Moment format="YYYY.MM.DD hh:mm A">{comment.createdAt}</Moment>
                                        </p>
                                        <ul className="list">
                                          {renderStars(ratingValue).map((star, i) => (
                                            <li key={i}>{star}</li>
                                          ))}
                                        </ul>
                                      </div>
                                      {user?._id && comment.memberId === user._id && (
                                        <Stack direction="row" spacing={1}>
                                          <IconButton
                                            size="small"
                                            aria-label="Edit review"
                                            onClick={() => handleEditComment(comment)}
                                          >
                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            aria-label="Delete review"
                                            onClick={() => handleDeleteComment(comment._id)}
                                          >
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        </Stack>
                                      )}
                                    </div>
                                    <p>{comment.commentContent}</p>
                                  </div>
                                </div>
                              );
                            })}
                            {activeComments.length === 0 && (
                              <div className="col-lg-12">
                                <p>No reviews available yet.</p>
                              </div>
                            )}
                          </div>
                          {showAllComments && commentsTotalPages > 1 && (
                            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
                              <Pagination
                                count={commentsTotalPages}
                                page={commentsPage}
                                onChange={(_, page) => setCommentsPage(page)}
                                shape="rounded"
                                variant="outlined"
                              />
                            </Stack>
                          )}

                          <div style={{ marginTop: "24px" }}>
                            <h4 style={{ marginBottom: "12px" }}>
                              {editingCommentId ? "Edit your review" : "Write a review"}
                            </h4>
                            <TextField
                              fullWidth
                              multiline
                              rows={4}
                              placeholder="Write your review..."
                              value={commentText}
                              onChange={(event) => setCommentText(event.target.value)}
                            />
                            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                              <Button
                                variant="contained"
                                onClick={handleSubmitComment}
                                disabled={commentSubmitting || commentUpdating}
                              >
                                {editingCommentId
                                  ? commentUpdating
                                    ? "Updating..."
                                    : "Update Review"
                                  : commentSubmitting
                                    ? "Submitting..."
                                    : "Post Review"}
                              </Button>
                              {editingCommentId && (
                                <Button
                                  variant="outlined"
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setCommentText("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              )}
                            </Stack>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeTab === 1 && (
                      <div>
                        <div className="about-tab-content">
                          <h4>{doctorName ? `About ${doctorName}` : "About"}</h4>
                          {aboutParagraphs.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                          ))}
                          {aboutParagraphs.length === 0 && (
                            <p>No description available yet.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorProfileContent;
