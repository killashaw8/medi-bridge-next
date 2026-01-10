import React, { useMemo, useState } from "react";
import { GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import Image from "next/image";
import Moment from "react-moment";
import { useApolloClient, useMutation, useQuery, useReactiveVar } from "@apollo/client";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PageBanner from "@/libs/components/layout/PageBanner";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GET_COMMENTS, GET_MEMBER } from "@/apollo/user/query";
import { CREATE_COMMENT, LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE, UPDATE_COMMENT } from "@/apollo/user/mutation";
import { Member } from "@/libs/types/member/member";
import { Comment } from "@/libs/types/comment/comment";
import { CommentGroup, CommentStatus } from "@/libs/enums/comment.enum";
import { Direction } from "@/libs/enums/common.enum";
import { getImageUrl } from "@/libs/imageHelper";
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";
import { userVar } from "@/apollo/store";
import { canFollowMemberType } from "@/libs/utils/follow";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PersonRemoveAlt1Icon from "@mui/icons-material/PersonRemoveAlt1";

const ClinicDetails: NextPage = () => {
  const router = useRouter();
  const apolloClient = useApolloClient();
  const user = useReactiveVar(userVar);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);

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
        page: showAllComments ? commentsPage : 1,
        limit: showAllComments ? 6 : 3,
        sort: "createdAt",
        direction: "DESC",
        search: { commentRefId: clinicId },
      },
    },
    skip: !router.isReady || !clinicId,
    fetchPolicy: "cache-and-network",
  });

  const [createComment, { loading: commentSubmitting }] = useMutation(CREATE_COMMENT);
  const [updateComment, { loading: commentUpdating }] = useMutation(UPDATE_COMMENT);
  const [subscribe] = useMutation(SUBSCRIBE);
  const [unsubscribe] = useMutation(UNSUBSCRIBE);
  const [likeMember] = useMutation(LIKE_TARGET_MEMBER);

  const clinic = clinicData?.getMember as Member | undefined;
  const comments = (commentsData?.getComments?.list ?? []) as Comment[];
  const activeComments = comments.filter(
    (comment) => comment.commentStatus !== CommentStatus.DELETE
  );
  const commentsTotal = commentsData?.getComments?.metaCounter?.[0]?.total ?? 0;
  const commentsLimit = showAllComments ? 6 : 3;
  const commentsTotalPages = Math.max(1, Math.ceil(commentsTotal / commentsLimit));
  const clinicName = clinic?.memberFullName || clinic?.memberNick || "Clinic";
  const clinicImage = clinic?.memberImage
    ? getImageUrl(clinic.memberImage)
    : "/images/hospital.png";
  const clinicLocation = clinic?.location
    ? clinic.location.replace(/_/g, " ")
    : "Location unavailable";
  const clinicPhone = clinic?.memberPhone || "Phone unavailable";
  const bannerTitle = clinicName || "Clinic Details";
  const isFollowing = !!clinic?.meFollowed?.some((follow) => follow.myFollowing);
  const isLiked = !!clinic?.meLiked?.some((like) => like.myFavorite);
  const canStartFollow =
    !!user?._id &&
    !!clinic?._id &&
    user._id !== clinic._id &&
    canFollowMemberType(user?.memberType, clinic?.memberType);

  const updateClinicComments = (delta: number) => {
    if (!clinicId) return;
    const cacheId = apolloClient.cache.identify({
      __typename: "Member",
      _id: clinicId,
    });
    if (!cacheId) return;
    apolloClient.cache.modify({
      id: cacheId,
      fields: {
        memberComments(existing = 0) {
          const next = Number(existing) + delta;
          return next < 0 ? 0 : next;
        },
      },
    });
  };

  const handleFollow = async () => {
    if (!clinic?._id) return;
    if (!user?._id) {
      await sweetMixinErrorAlert("Please login to follow.");
      router.push("/login");
      return;
    }
    try {
      await subscribe({ variables: { input: clinic._id } });
      await sweetMixinSuccessAlert("Followed.");
      await refetchClinic();
    } catch (err: any) {
      const message = err?.graphQLErrors?.[0]?.message || err?.message || "Failed to follow.";
      await sweetMixinErrorAlert(message);
    }
  };

  const handleUnfollow = async () => {
    if (!clinic?._id) return;
    if (!user?._id) {
      await sweetMixinErrorAlert("Please login to unfollow.");
      router.push("/login");
      return;
    }
    try {
      await unsubscribe({ variables: { input: clinic._id } });
      await sweetMixinSuccessAlert("Unfollowed.");
      await refetchClinic();
    } catch (err: any) {
      const message = err?.graphQLErrors?.[0]?.message || err?.message || "Failed to unfollow.";
      await sweetMixinErrorAlert(message);
    }
  };

  const handleLike = async () => {
    if (!clinic?._id) return;
    if (!user?._id) {
      await sweetMixinErrorAlert("Please login to like.");
      router.push("/login");
      return;
    }
    try {
      await likeMember({ variables: { input: clinic._id } });
      await refetchClinic();
    } catch (err: any) {
      const message = err?.graphQLErrors?.[0]?.message || err?.message || "Failed to like.";
      await sweetMixinErrorAlert(message);
    }
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
    if (!clinicId) {
      await sweetMixinErrorAlert("Clinic not found.");
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
              commentRefId: clinicId,
            },
          },
        });
        updateClinicComments(1);
        await sweetMixinSuccessAlert("Review submitted.");
      }
      setCommentText("");
      setEditingCommentId(null);
      await Promise.all([refetchComments(), refetchClinic()]);
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
      updateClinicComments(-1);
      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setCommentText("");
      }
      await Promise.all([refetchComments(), refetchClinic()]);
      await sweetMixinSuccessAlert("Review deleted.");
    } catch (error: any) {
      const message =
        error?.graphQLErrors?.[0]?.message ||
        error?.message ||
        "Failed to delete review.";
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
            <p className="u-text-muted">Loading clinic...</p>
          ) : !clinic ? (
            <p className="u-text-error">Clinic not found.</p>
          ) : (
            <Stack spacing={4} sx={{ mt: 2 }}>
              <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: "1px solid #eef1f6" }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="flex-start">
                  <Stack spacing={2} sx={{ flex: "1 1 0" }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {clinicName}
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" flexWrap="wrap">
                      <IconButton
                        aria-label={isLiked ? "Unlike" : "Like"}
                        onClick={handleLike}
                        color={isLiked ? "error" : "default"}
                      >
                        {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                      {canStartFollow && !isFollowing && (
                        <IconButton
                          aria-label="Follow"
                          onClick={handleFollow}
                          color="primary"
                        >
                          <PersonAddAlt1Icon />
                        </IconButton>
                      )}
                      {isFollowing && (
                        <IconButton
                          aria-label="Unfollow"
                          onClick={handleUnfollow}
                          color="error"
                        >
                          <PersonRemoveAlt1Icon />
                        </IconButton>
                      )}
                    </Stack>

                    <Box sx={{ borderRadius: 2, overflow: "hidden", width: "100%", maxWidth: 520 }}>
                      <Image
                        src={clinicImage}
                        alt={clinicName}
                        width={520}
                        height={520}
                        className="u-img-block"
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
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Reviews ({activeComments.length})
                    </Typography>
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
                  </Stack>
                  {commentsLoading ? (
                    <Typography color="text.secondary">Loading reviews...</Typography>
                  ) : activeComments.length === 0 ? (
                    <Typography color="text.secondary">No reviews yet. Be the first to leave one.</Typography>
                  ) : (
                    <Stack spacing={2}>
                      {activeComments.map((comment) => {
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
                            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar src={reviewerImage} alt={reviewerName} />
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {reviewerName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    <Moment format="YYYY.MM.DD hh:mm A">{comment.createdAt}</Moment>
                                  </Typography>
                                </Box>
                              </Stack>
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
                            </Stack>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {comment.commentContent}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                  {showAllComments && commentsTotalPages > 1 && (
                    <Stack direction="row" justifyContent="center" sx={{ pt: 1 }}>
                      <Pagination
                        count={commentsTotalPages}
                        page={commentsPage}
                        onChange={(_, page) => setCommentsPage(page)}
                        shape="rounded"
                        variant="outlined"
                      />
                    </Stack>
                  )}
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: "1px solid #eef1f6" }}>
                <Stack spacing={2}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {editingCommentId ? "Edit your review" : "Write a review"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {editingCommentId
                      ? "Update your review for this clinic."
                      : "Share your experience with this clinic."}
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
                      <Stack direction="row" spacing={2}>
                        <Button
                          type="submit"
                          variant="contained"
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
                            type="button"
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
