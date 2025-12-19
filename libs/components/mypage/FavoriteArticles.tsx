import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
import { GET_ARTICLES } from "@/apollo/user/query";
import { LIKE_TARGET_ARTICLE } from "@/apollo/user/mutation";
import { ArticlesInquiry } from "@/libs/types/article/article.input";
import { Article } from "@/libs/types/article/article";
import { CircularProgress, Box, Typography, Grid, Stack, Pagination } from "@mui/material";
import { userVar } from "@/apollo/store";
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";
import ArticleCard from "@/libs/components/common/ArticleCard";

const FavoriteArticles: React.FC = () => {
  const user = useReactiveVar(userVar);
  const [page, setPage] = useState(1);
  const limit = 6;

  const input: ArticlesInquiry = {
    page,
    limit,
    sort: "createdAt",
    direction: "DESC",
    search: {},
  };

  // Note: This would need a GET_FAVORITE_ARTICLES query
  // For now, using GET_ARTICLES with favorite filter
  const { data, loading, error, refetch } = useQuery(GET_ARTICLES, {
    variables: { input },
    fetchPolicy: "network-only",
  });
  const [likeArticle] = useMutation(LIKE_TARGET_ARTICLE);

  // Filter articles that are favorited
  const allArticles: Article[] = data?.getArticles?.list || [];
  const favoriteArticles = allArticles.filter(
    (article) => article.meLiked?.some((like) => like.myFavorite)
  );
  const totalFavorites = favoriteArticles.length;
  const pageCount = Math.max(1, Math.ceil(totalFavorites / limit));

  const paginationHandler = (_: any, value: number) => {
    setPage(value);
  };

  const handleLike = async (articleId: string) => {
    try {
      await likeArticle({ variables: { input: articleId } });
      await refetch();
      await sweetMixinSuccessAlert("Updated favorites");
    } catch (err: any) {
      console.error("Favorite like error:", err);
      await sweetMixinErrorAlert(err.message || "Failed to update favorite");
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", padding: "40px" }}>
        <CircularProgress />
        <Typography sx={{ marginTop: 2 }}>Loading favorite articles...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", padding: "40px" }}>
        <Typography color="error">Error loading favorite articles</Typography>
      </Box>
    );
  }

  return (
    <div className="mypage-section">
      <div className="section-header">
        <h2>Favorite Articles</h2>
        <p>Your favorite articles ({favoriteArticles.length})</p>
      </div>

      {favoriteArticles.length === 0 ? (
        <div className="empty-state">
          <i className="ri-bookmark-line" style={{ fontSize: "48px", color: "#ccc" }}></i>
          <p>No favorite articles yet</p>
          <Link href="/article" className="default-btn">
            Browse Articles
          </Link>
        </div>
      ) : (
        <>
          <Grid container spacing={3} className="articles-grid">
            {favoriteArticles.map((article) => (
              <Grid item xs={12} sm={6} md={4} key={article._id}>
                <ArticleCard
                  article={article}
                  showActions="like"
                  canManage={false}
                  onLike={handleLike}
                  likeActive={article.meLiked?.some((like) => like.myFavorite)}
                />
              </Grid>
            ))}
          </Grid>
          {pageCount > 0 && (
            <Stack className="mypage-pagination">
              <Stack direction="row" justifyContent="center">
                <Pagination
                  count={pageCount}
                  page={page}
                  shape="rounded"
                  variant="outlined"
                  size="large"
                  color="primary"
                  onChange={paginationHandler}
                />
              </Stack>
            </Stack>
          )}
        </>
      )}
    </div>
  );
};

export default FavoriteArticles;
