import React, { useMemo, useState } from "react";
import { GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import Image from "next/image";
import Moment from "react-moment";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PageBanner from "@/libs/components/layout/PageBanner";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GET_COMMENTS, GET_MEMBER } from "@/apollo/user/query";
import { CREATE_COMMENT } from "@/apollo/user/mutation";
import { Member } from "@/libs/types/member/member";
import { Comment } from "@/libs/types/comment/comment";
import { CommentGroup } from "@/libs/enums/comment.enum";
import { Direction } from "@/libs/enums/common.enum";
import { getImageUrl } from "@/libs/imageHelper";
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";
import { userVar } from "@/apollo/store";

const ClinicDetails: NextPage = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [commentText, setCommentText] = useState("");

  const clinicId = useMemo(() => {
    const rawId = router.query?.id || router.query?.clinicId;
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

  const {
    data: clinicData,
    loading: clinicLoading,
    refetch: refetchClinic,
  } = useQuery(GET_MEMBER, {
    variables: { targetId: clinicId, includeLocation: true },
    skip: !router.isReady || !clinicId,
    fetchPolicy: "cache-and-network",
  });

  const {
    data: commentsData,
    loading: commentsLoading,
    refetch: refetchComments,
  } = useQuery(GET_COMMENTS, {
    variables: {
      input: {
        page: 1,
        limit: 12,
        sort: "createdAt",
        direction: "DESC",
        search: { commentRefId: clinicId },
      },
    },
    skip: !router.isReady || !clinicId,
    fetchPolicy: "cache-and-network",
  });

  const [createComment, { loading: commentSubmitting }] = useMutation(CREATE_COMMENT);

  const clinic = clinicData?.getMember as Member | undefined;
  const comments = (commentsData?.getComments?.list ?? []) as Comment[];
  const clinicName = clinic?.memberFullName || clinic?.memberNick || "Clinic";
  const clinicImage = clinic?.memberImage
    ? getImageUrl(clinic.memberImage)
    : "/images/hospital.png";
  const clinicLocation = clinic?.location
    ? clinic.location.replace(/_/g, " ")
    : "Location unavailable";
  const clinicPhone = clinic?.memberPhone || "Phone unavailable";
  const bannerTitle = clinicName || "Clinic Details";

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
    if (!clinicId) {
      await sweetMixinErrorAlert("Clinic not found.");
      return;
    }

    try {
      await createComment({
        variables: {
          input: {
            commentGroup: CommentGroup.MEMBER,
            commentContent: trimmed,
            commentRefId: clinicId,
          },
        },
      });
      setCommentText("");
      await Promise.all([refetchComments(), refetchClinic()]);
      await sweetMixinSuccessAlert("Review submitted.");
    } catch (error: any) {
      const message =
        error?.graphQLErrors?.[0]?.message ||
        error?.message ||
        "Failed to submit review.";
      await sweetMixinErrorAlert(message);
    }
  };

  return (
    <>
      <PageBanner
        pageTitle={bannerTitle}
        shortText="Clinic details and reviews"
        homePageUrl="/"
        homePageText="Home"
        activePageText="Clinic Details"
        image="/images/page-banner.png"
      />

      <div className="blog-details-area ptb-140">
        <div className="container">
          {!router.isReady || clinicLoading ? (
            <p style={{ color: "#5A6A85" }}>Loading clinic...</p>
          ) : !clinic ? (
            <p style={{ color: "#D30082" }}>Clinic not found.</p>
          ) : (
            <Stack spacing={4} sx={{ mt: 2 }}>
              <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: "1px solid #eef1f6" }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="flex-start">
                  <Stack spacing={2} sx={{ flex: "1 1 0" }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {clinicName}
                    </Typography>

                    <Box sx={{ borderRadius: 2, overflow: "hidden", width: "100%", maxWidth: 520 }}>
                      <Image
                        src={clinicImage}
                        alt={clinicName}
                        width={520}
                        height={520}
                        style={{ width: "100%", height: "auto", display: "block" }}
                      />
                    </Box>

                    <Chip
                      label={clinicLocation}
                      variant="outlined"
                      sx={{ alignSelf: "flex-start" }}
                    />

                    <Typography variant="body2" color="text.primary" sx={{fontSize: 20}}>
                      {clinicPhone}
                    </Typography>

                  </Stack>

                  <Box sx={{ flex: "1 1 0", width: "100%" }}>
                    <Divider sx={{ display: { xs: "none", md: "block" }, mb: 2 }} />
                    <Box
                      sx={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                        p: { xs: 2, md: 2.5 },
                        bgcolor: "#fff",
                      }}
                    >
                      <Typography variant="body1" sx={{ color: "text.primary" }}>
                        {clinic.memberDesc || "No description available."}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: "1px solid #eef1f6" }}>
                <Stack spacing={2}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Reviews ({clinic.memberComments ?? comments.length})
                  </Typography>
                  {commentsLoading ? (
                    <Typography color="text.secondary">Loading reviews...</Typography>
                  ) : comments.length === 0 ? (
                    <Typography color="text.secondary">No reviews yet. Be the first to leave one.</Typography>
                  ) : (
                    <Stack spacing={2}>
                      {comments.map((comment) => {
                        const reviewerName =
                          comment.memberData?.memberFullName ||
                          comment.memberData?.memberNick ||
                          "Patient";
                        const reviewerImage = comment.memberData?.memberImage
                          ? getImageUrl(comment.memberData.memberImage)
                          : "/images/users/defaultUser.svg";

                        return (
                          <Box
                            key={comment._id}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: "1px solid #eee",
                              backgroundColor: "#fff",
                            }}
                          >
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar src={reviewerImage} alt={reviewerName} />
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {reviewerName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  <Moment format="MMM DD, YYYY">{comment.createdAt}</Moment>
                                </Typography>
                              </Box>
                            </Stack>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {comment.commentContent}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: "1px solid #eef1f6" }}>
                <Stack spacing={2}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Write a review
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Share your experience with this clinic.
                  </Typography>
                  <Box
                    component="form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleSubmitComment();
                    }}
                  >
                    <Stack spacing={2}>
                      <TextField
                        id="clinic-review"
                        label="Your review"
                        placeholder="Write your comment..."
                        multiline
                        rows={5}
                        value={commentText}
                        onChange={(event) => setCommentText(event.target.value)}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={commentSubmitting}
                        sx={{ alignSelf: "flex-start" }}
                      >
                        {commentSubmitting ? "Submitting..." : "Post Review"}
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          )}
        </div>
      </div>
    </>
  );
};

export default withLayoutBasic(ClinicDetails);

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common"])),
    },
  };
};
