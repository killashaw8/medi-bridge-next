import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { GET_ARTICLES } from "@/apollo/user/query";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { ArticlesInquiry } from "@/libs/types/article/article.input";
import { Article } from "@/libs/types/article/article";
import { getImageUrl } from "@/libs/imageHelper";
import { CircularProgress, Box, Typography } from "@mui/material";
import Moment from "react-moment";
import { sweetMixinSuccessAlert, sweetMixinErrorAlert } from "@/libs/sweetAlert";

interface MyArticlesProps {
  onEdit?: (articleId: string) => void;
}

const MyArticles: React.FC<MyArticlesProps> = ({ onEdit }) => {
  const user = useReactiveVar(userVar);
  const [page, setPage] = useState(1);
  const limit = 12;

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

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", padding: "40px" }}>
        <CircularProgress />
        <Typography sx={{ marginTop: 2 }}>Loading your articles...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", padding: "40px" }}>
        <Typography color="error">Error loading articles</Typography>
      </Box>
    );
  }

  return (
    <div className="mypage-section">
      <div className="section-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2>My Articles</h2>
            <p>Your published articles ({total})</p>
          </div>
          <Link href="/mypage?section=write-article" className="default-btn">
            <i className="ri-add-line"></i> Write New Article
          </Link>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="empty-state">
          <i className="ri-article-line" style={{ fontSize: "48px", color: "#ccc" }}></i>
          <p>You haven't written any articles yet</p>
          <Link href="/mypage?section=write-article" className="default-btn">
            Write Your First Article
          </Link>
        </div>
      ) : (
        <div className="articles-list">
          {articles.map((article) => (
            <div key={article._id} className="article-item">
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
                <div className="col-md-7">
                  <div className="article-content">
                    <Link href={`/article/${article._id}`}>
                      <h3>{article.articleTitle}</h3>
                    </Link>
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
                      <span className="badge">{article.articleCategory}</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="article-actions">
                    {onEdit && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => onEdit(article._id)}
                      >
                        <i className="ri-edit-line"></i> Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyArticles;

