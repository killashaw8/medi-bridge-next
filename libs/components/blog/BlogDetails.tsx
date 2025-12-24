import React, { useState } from "react";
import Image from "next/image";
import Moment from "react-moment";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { IconButton, Stack, TextField, Button, Pagination } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Article } from "@/libs/types/article/article";
import { ArticleCategory } from "@/libs/enums/article.enum";
import { getImageUrl } from "@/libs/imageHelper";
import TViewer from "../common/TViewer";
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
          <p style={{ color: "#5A6A85" }}>Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="blog-details-area ptb-140">
        <div className="container">
          <p style={{ color: "#D30082" }}>Article not found.</p>
        </div>
      </div>
    );
  }

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

                <div className="article-comment">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <h3 className="title">Reviews ({commentsTotal})</h3>
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
                  {commentsLoading ? (
                    <p style={{ color: "#5A6A85" }}>Loading reviews...</p>
                  ) : activeComments.length === 0 ? (
                    <p>No reviews yet. Be the first to leave one.</p>
                  ) : (
                    activeComments.map((comment) => {
                      const reviewerName =
                        comment.memberData?.memberFullName ||
                        comment.memberData?.memberNick ||
                        "Reader";
                      const reviewerImage = comment.memberData?.memberImage
                        ? getImageUrl(comment.memberData.memberImage)
                        : "/images/users/defaultUser.svg";

                      return (
                        <div className="comment-list" key={comment._id}>
                          <div className="comment-author">
                            <Image
                              src={reviewerImage}
                              alt={reviewerName}
                              width={50}
                              height={50}
                            />
                            <div style={{ flex: 1 }}>
                              <h5>{reviewerName}</h5>
                              <p>
                                <Moment format="YYYY.MM.DD hh:mm A">{comment.createdAt}</Moment>
                              </p>
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
                      );
                    })
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
                </div>

                <div className="leave-form">
                  <div className="content">
                    <h2>{editingCommentId ? "Edit your review" : "Write a review"}</h2>
                    <p>
                      {editingCommentId
                        ? "Update your review for this article."
                        : "Share your thoughts about this article."}
                    </p>
                  </div>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleSubmitComment();
                    }}
                  >
                    <div className="form-group">
                      <label htmlFor="article-review">Your review</label>
                      <TextField
                        id="article-review"
                        placeholder="Write your comment..."
                        multiline
                        rows={5}
                        fullWidth
                        value={commentText}
                        onChange={(event) => setCommentText(event.target.value)}
                      />
                    </div>
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
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetails;
