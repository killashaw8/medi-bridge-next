import React, { useState } from "react";
import Image from "next/image";
import Moment from "react-moment";
import { useApolloClient, useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { Avatar, Box, IconButton, Stack, TextField, Button, Pagination, Paper, Typography } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Article } from "@/libs/types/article/article";
import { ArticleCategory } from "@/libs/enums/article.enum";
import { getImageUrl } from "@/libs/imageHelper";
import TViewer from "../common/TViewer";
import Link from "next/link";
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import { GET_COMMENTS } from "@/apollo/user/query";
import { CREATE_COMMENT, UPDATE_COMMENT } from "@/apollo/user/mutation";
import { Comment } from "@/libs/types/comment/comment";
import { CommentGroup, CommentStatus } from "@/libs/enums/comment.enum";
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";
import { userVar } from "@/apollo/store";

interface BlogDetailsProps {
  article?: Article;
  loading?: boolean;
}

const BlogDetails: React.FC<BlogDetailsProps> = ({ article, loading }) => {
  const coverImage = getImageUrl(article?.articleImage) || "/images/blog-details.jpg";
  const category =
    article?.articleCategory === ArticleCategory.NEWS ? "News" : "Blog";
  const publisherName =
    article?.memberData?.memberFullName ||
    article?.memberData?.memberNick ||
    "Anonymous";
  const publisherId = article?.memberData?._id;
  const apolloClient = useApolloClient();
  const user = useReactiveVar(userVar);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const articleId = article?._id || "";

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
        search: { commentRefId: articleId },
      },
    },
    skip: !articleId,
    fetchPolicy: "cache-and-network",
  });

  const [createComment, { loading: commentSubmitting }] = useMutation(CREATE_COMMENT);
  const [updateComment, { loading: commentUpdating }] = useMutation(UPDATE_COMMENT);
  const comments = (commentsData?.getComments?.list ?? []) as Comment[];
  const activeComments = comments.filter(
    (comment) => comment.commentStatus !== CommentStatus.DELETE
  );
  const commentsTotal = commentsData?.getComments?.metaCounter?.[0]?.total ?? 0;
  const commentsLimit = showAllComments ? 6 : 3;
  const commentsTotalPages = Math.max(1, Math.ceil(commentsTotal / commentsLimit));

  if (loading) {
    return (
      <div className="blog-details-area ptb-140">
        <div className="container">
          <Box sx={{ maxWidth: 960, mx: "auto" }}>
            <Skeleton variant="text" height={40} width="70%" />
            <Skeleton variant="text" height={24} width="35%" />
            <Skeleton variant="rectangular" height={420} sx={{ mt: 3, borderRadius: 2 }} />
            <Skeleton variant="text" height={22} sx={{ mt: 3 }} />
            <Skeleton variant="text" height={22} />
            <Skeleton variant="text" height={22} width="85%" />
          </Box>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="blog-details-area ptb-140">
        <div className="container">
        <p className="u-text-error">Article not found.</p>
        </div>
      </div>
    );
  }

  const updateArticleComments = (delta: number) => {
    if (!articleId) return;
    const cacheId = apolloClient.cache.identify({
      __typename: "Article",
      _id: articleId,
    });
    if (!cacheId) return;
    apolloClient.cache.modify({
      id: cacheId,
      fields: {
        articleComments(existing = 0) {
          const next = Number(existing) + delta;
          return next < 0 ? 0 : next;
        },
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
    if (!articleId) {
      await sweetMixinErrorAlert("Article not found.");
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
              commentGroup: CommentGroup.ARTICLE,
              commentContent: trimmed,
              commentRefId: articleId,
            },
          },
        });
        updateArticleComments(1);
        await sweetMixinSuccessAlert("Review submitted.");
      }
      setCommentText("");
      setEditingCommentId(null);
      await refetchComments();
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
      updateArticleComments(-1);
      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setCommentText("");
      }
      await refetchComments();
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
      <div className="blog-details-area ptb-140">
        <div className="container">
          <div className="row justify-content-center g-4">
            <div className="col-xl-8 col-md-12">
              <div className="blog-details-desc">
                <div className="blog-details-header">
                  <h1>{article?.articleTitle}</h1>
                  <ul className="meta">
                    <li>{category}</li>
                    <li>
                      <Moment format="MMM DD, YYYY">{article?.createdAt}</Moment>
                    </li>
                    <li>
                      {publisherId ? (
                        <Link href={`/member?memberId=${publisherId}`}>
                          {publisherName}
                        </Link>
                      ) : (
                        publisherName
                      )}
                    </li>
                  </ul>
                </div>
                <div className="blog-details-content">
                  <TViewer content={article?.articleContent || "<p>No content available.</p>"} />
                </div>

                <div className="article-footer">
                  <div className="col-lg-7 col-md-7">
                    <ul className="social">
                      <li>
                        <span>Share:</span>
                      </li>
                      <li>
                        <a href="https://www.facebook.com/" target="_blank">
                          <FacebookIcon />
                        </a>
                      </li>
                      <li>
                        <a href="https://www.linkedin.com/" target="_blank">
                          <LinkedInIcon />
                        </a>
                      </li>
                      <li>
                        <a href="https://www.instagram.com/" target="_blank">
                          <InstagramIcon />
                        </a>
                      </li>
                      <li>
                        <a href="https://x.com/" target="_blank">
                          <XIcon />
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: "1px solid #eef1f6", mt: 4 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Reviews ({activeComments.length})
                      </Typography>
                      <Stack direction="row" spacing={1}>
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
                    </Stack>
                    {commentsLoading ? (
                      <Stack spacing={2}>
                        {[0, 1, 2].map((index) => (
                          <Box
                            key={`comment-skeleton-${index}`}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: "1px solid #eee",
                              backgroundColor: "#fff",
                            }}
                          >
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Skeleton variant="circular" width={40} height={40} />
                              <Box sx={{ flex: 1 }}>
                                <Skeleton variant="text" width="40%" />
                                <Skeleton variant="text" width="25%" />
                              </Box>
                            </Stack>
                            <Skeleton variant="text" sx={{ mt: 1 }} />
                            <Skeleton variant="text" width="85%" />
                          </Box>
                        ))}
                      </Stack>
                    ) : activeComments.length === 0 ? (
                      <Typography color="text.secondary">No reviews yet. Be the first to leave one.</Typography>
                    ) : (
                      <Stack spacing={2}>
                        {activeComments.map((comment) => {
                          const reviewerName =
                            comment.memberData?.memberFullName ||
                            comment.memberData?.memberNick ||
                            "Reader";
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

                <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: "1px solid #eef1f6", mt: 3 }}>
                  <Stack spacing={2}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {editingCommentId ? "Edit your review" : "Write a review"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {editingCommentId
                        ? "Update your review for this article."
                        : "Share your thoughts about this article."}
                    </Typography>
                    <Box
                      component="form"
                      onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        handleSubmitComment();
                      }}
                    >
                      <Stack spacing={2}>
                        <TextField
                          id="article-review"
                          label="Your review"
                          placeholder="Write your comment..."
                          multiline
                          rows={5}
                          fullWidth
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetails;
