import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { GET_ARTICLES } from "@/apollo/user/query";
import { ArticlesInquiry } from "@/libs/types/article/article.input";
import { Article } from "@/libs/types/article/article";
import { getImageUrl } from "@/libs/imageHelper";
import { CircularProgress, Box, Typography } from "@mui/material";
import Moment from "react-moment";

const FavoriteArticles: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 12;

  const input: ArticlesInquiry = {
    page,
    limit,
    sort: "createdAt",
    direction: "DESC",
    search: {},
  };

  // Note: This would need a GET_FAVORITE_ARTICLES query
  // For now, using GET_ARTICLES with favorite filter
  const { data, loading, error } = useQuery(GET_ARTICLES, {
    variables: { input },
    fetchPolicy: "cache-and-network",
  });

  // Filter articles that are favorited
  const allArticles: Article[] = data?.getArticles?.list || [];
  const favoriteArticles = allArticles.filter(
    (article) => article.meLiked?.some((like) => like.myFavorite)
  );

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
        <div className="articles-list">
          {favoriteArticles.map((article) => (
            <div key={article._id} className="article-item">
              <Link href={`/article/${article._id}`}>
                <div className="row align-items-center">
                  <div className="col-md-3">
                    <div className="article-image">
                      <Image
                        src={
                          article.articleImage
                            ? getImageUrl(article.articleImage)
                            : "/images/blog/blog1.jpg"
                        }
                        alt={article.articleTitle}
                        width={300}
                        height={200}
                        style={{ objectFit: "cover", borderRadius: "8px" }}
                      />
                    </div>
                  </div>
                  <div className="col-md-9">
                    <div className="article-content">
                      <h3>{article.articleTitle}</h3>
                      <div className="article-meta">
                        <span>
                          <i className="ri-calendar-line"></i>
                          <Moment format="MMM DD, YYYY">{article.createdAt}</Moment>
                        </span>
                        <span>
                          <i className="ri-eye-line"></i>
                          {article.articleViews} views
                        </span>
                        <span>
                          <i className="ri-heart-line"></i>
                          {article.articleLikes} likes
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteArticles;

