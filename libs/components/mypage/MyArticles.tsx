import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
import { GET_ARTICLES } from "@/apollo/user/query";
import { UPDATE_ARTICLE } from "@/apollo/user/mutation";
import { userVar } from "@/apollo/store";
import { ArticlesInquiry } from "@/libs/types/article/article.input";
import { Article } from "@/libs/types/article/article";
import { ArticleStatus } from "@/libs/enums/article.enum";
import { Box, Typography, Grid, Pagination, Stack } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import { sweetMixinSuccessAlert, sweetMixinErrorAlert } from "@/libs/sweetAlert";
import ArticleCard from "@/libs/components/common/ArticleCard";

interface MyArticlesProps {
  onEdit?: (articleId: string) => void;
}

const MyArticles: React.FC<MyArticlesProps> = ({ onEdit }) => {
  const user = useReactiveVar(userVar);
  const [page, setPage] = useState(1);
  const limit = 6;
  const [updateArticle] = useMutation(UPDATE_ARTICLE);

  const input: ArticlesInquiry = {
    page,
    limit,
    sort: "createdAt",
    direction: "DESC",
    search: {
      memberId: user?._id,
    },
  };

  const { data, loading, error, refetch } = useQuery(GET_ARTICLES, {
    variables: { input },
    skip: !user?._id,
    fetchPolicy: "cache-and-network",
  });

  const articles: Article[] = data?.getArticles?.list || [];
  const total = data?.getArticles?.metaCounter?.[0]?.total || 0;
  const pageCount = Math.ceil(total / limit);

  const paginationHandler = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  if (loading) {
    return (
      <div className="mypage-section">
        <div className="section-header">
          <Skeleton variant="text" height={32} width="30%" />
          <Skeleton variant="text" width="40%" />
        </div>
        <Grid container spacing={3} className="articles-grid">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Grid item xs={12} sm={6} md={4} key={`article-skeleton-${index}`}>
              <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #eef1f6" }}>
                <Skeleton variant="rectangular" height={180} />
                <Box sx={{ p: 2 }}>
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </div>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", padding: "40px" }}>
        <Typography color="error">Error loading articles</Typography>
      </Box>
    );
  }

  const handleDelete = async (articleId: string) => {
    try {
      await updateArticle({
        variables: { input: { _id: articleId, articleStatus: ArticleStatus.DELETE } },
      });
      await sweetMixinSuccessAlert("Article deleted");
      refetch();
    } catch (err: any) {
      console.error("Delete article error:", err);
      await sweetMixinErrorAlert(err.message || "Failed to delete article");
    }
  };

  return (
    <div className="mypage-section">
      <div className="section-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2>My Articles</h2>
            <p>Your published articles ({total})</p>
          </div>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="empty-state">
          <i className="ri-article-line u-icon-48"></i>
          <p>You haven't written any articles yet</p>
          <Link href="/mypage?section=write-article" className="default-btn">
            Write Your First Article
          </Link>
        </div>
      ) : (
        <>
          <Grid container spacing={3} className="articles-grid">
            {articles.map((article) => (
              <Grid item xs={12} sm={6} md={4} key={article._id}>
                <ArticleCard
                  article={article}
                  showActions="manage"
                  canManage
                  onEdit={onEdit}
                  onDelete={handleDelete}
                />
              </Grid>
            ))}
          </Grid>
          {pageCount > 0 && (
            <Stack className="mypage-pagination">
              <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
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

export default MyArticles;
