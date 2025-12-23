import React, { useMemo, useState } from "react";
import { NextPage } from "next";
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
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PageBanner from "@/libs/components/layout/PageBanner";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import { GET_COMMENTS, GET_PRODUCT } from "@/apollo/user/query";
import { CREATE_COMMENT } from "@/apollo/user/mutation";
import { Product } from "@/libs/types/product/product";
import { Comment } from "@/libs/types/comment/comment";
import { CommentGroup } from "@/libs/enums/comment.enum";
import { getImageUrl } from "@/libs/imageHelper";
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";
import { userVar } from "@/apollo/store";

const ProductDetails: NextPage = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [commentText, setCommentText] = useState("");
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const productId = useMemo(() => {
    const rawId = router.query?.id || router.query?.productId;
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
    data: productData,
    loading: productLoading,
    refetch: refetchProduct,
  } = useQuery(GET_PRODUCT, {
    variables: { productId },
    skip: !router.isReady || !productId,
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
        limit: 3,
        sort: "createdAt",
        direction: "DESC",
        search: { commentRefId: productId },
      },
    },
    skip: !router.isReady || !productId,
    fetchPolicy: "cache-and-network",
  });

  const [createComment, { loading: commentSubmitting }] = useMutation(CREATE_COMMENT);

  const product = productData?.getProduct as Product | undefined;
  const comments = (commentsData?.getComments?.list ?? []) as Comment[];
  const sellerName =
    product?.memberData?.memberFullName ||
    product?.memberData?.memberNick ||
    "Seller";
  const sellerImage = product?.memberData?.memberImage
    ? getImageUrl(product.memberData.memberImage)
    : "/images/users/defaultUser.svg";
  const bannerTitle = product?.productTitle || "Product Details";

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
    if (!productId) {
      await sweetMixinErrorAlert("Product not found.");
      return;
    }

    try {
      await createComment({
        variables: {
          input: {
            commentGroup: CommentGroup.PRODUCT,
            commentContent: trimmed,
            commentRefId: productId,
          },
        },
      });
      setCommentText("");
      await Promise.all([refetchComments(), refetchProduct()]);
      await sweetMixinSuccessAlert("Review submitted.");
    } catch (error: any) {
      const message =
        error?.graphQLErrors?.[0]?.message ||
        error?.message ||
        "Failed to submit review.";
      await sweetMixinErrorAlert(message);
    }
  };

  const productImages = product?.productImages ?? [];
  const dialogImage = activeImage ? getImageUrl(activeImage) : "";

  return (
    <>
      <PageBanner
        pageTitle={bannerTitle}
        shortText="Explore product details"
        homePageUrl="/"
        homePageText="Home"
        activePageText="Product Details"
        image="/images/page-banner.png"
      />

      <div className="blog-details-area ptb-140">
        <div className="container">
          {!router.isReady || productLoading ? (
            <p style={{ color: "#5A6A85" }}>Loading product...</p>
          ) : !product ? (
            <p style={{ color: "#D30082" }}>Product not found.</p>
          ) : (
            <Stack spacing={4} sx={{ mt: 2 }}>
              <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: "1px solid #eef1f6" }}>
                <Stack spacing={2}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {product.productTitle}
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip label={product.productType} variant="outlined" />
                    <Chip
                      label={product.productCollection?.replace(/_/g, " ")}
                      variant="outlined"
                    />
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                      overflowX: "auto",
                      pb: 1,
                    }}
                  >
                    {productImages.length > 0 ? (
                      productImages.map((image, index) => (
                        <Box
                          key={`${image}-${index}`}
                          sx={{
                            minWidth: { xs: 200, sm: 260, md: 300 },
                            borderRadius: 2,
                            overflow: "hidden",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                          onClick={() => setActiveImage(image)}
                        >
                          <Box
                            sx={{
                              aspectRatio: "1 / 1",
                              position: "relative",
                              width: "100%",
                            }}
                          >
                            <Image
                              src={getImageUrl(image)}
                              alt={`${product.productTitle} ${index + 1}`}
                              fill
                              sizes="(max-width: 600px) 200px, (max-width: 900px) 260px, 300px"
                              style={{ objectFit: "cover" }}
                            />
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Box
                        sx={{
                          minWidth: { xs: 280, sm: 320, md: 360 },
                          borderRadius: 2,
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        <Box
                          sx={{
                            aspectRatio: "1 / 1",
                            position: "relative",
                            width: "100%",
                          }}
                        >
                          <Image
                            src="/images/blog-details.jpg"
                            alt="Product"
                            fill
                            sizes="(max-width: 600px) 280px, (max-width: 900px) 320px, 360px"
                            style={{ objectFit: "cover" }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Stack>

                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      ${product.productPrice?.toLocaleString() ?? 0}
                    </Typography>
                    <Chip
                      label={product.productCount > 0 ? "In Stock" : "Out of Stock"}
                      color={product.productCount > 0 ? "success" : "error"}
                      variant="outlined"
                    />
                  </Stack>

                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={sellerImage} alt={sellerName} sx={{ width: 56, height: 56 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Seller: {sellerName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.memberData?.memberDesc || "Trusted seller"}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" sx={{ color: "text.primary" }}>
                    {product.productDesc || "No description available."}
                  </Typography>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: "1px solid #eef1f6" }}>
                <Stack spacing={2}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Reviews ({product.productComments ?? comments.length})
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
                          "Customer";
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
                    Share your experience with this product.
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
                        id="product-review"
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

      <Dialog
        open={Boolean(activeImage)}
        onClose={() => setActiveImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ position: "relative", p: 0 }}>
          <IconButton
            aria-label="Close"
            onClick={() => setActiveImage(null)}
            sx={{ position: "absolute", top: 8, right: 8, zIndex: 1, bgcolor: "rgba(255,255,255,0.8)" }}
          >
            <CloseIcon />
          </IconButton>
          {activeImage && (
            <Box sx={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
              <Image
                src={dialogImage}
                alt={product?.productTitle || "Product image"}
                fill
                sizes="(max-width: 900px) 100vw, 720px"
                style={{ objectFit: "contain", background: "#111" }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default withLayoutBasic(ProductDetails);
