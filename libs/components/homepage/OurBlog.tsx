import React from "react";
import Image from "next/image";
import Link from "next/link";
import Moment from "react-moment";
import Skeleton from "@mui/material/Skeleton";
import { useQuery } from "@apollo/client";
import { GET_ARTICLES } from "@/apollo/user/query";
import { ArticleCategory } from "@/libs/enums/article.enum";
import { ArticlesInquiry } from "@/libs/types/article/article.input";
import { Article } from "@/libs/types/article/article";
import { getImageUrl } from "@/libs/imageHelper";

const OurBlog = () => {
  const topArticlesInput: ArticlesInquiry = {
    page: 1,
    limit: 3,
    sort: "articleViews",
    direction: "DESC",
    search: {
      articleCategory: ArticleCategory.BLOG,
    },
  };

  const { data, loading } = useQuery(GET_ARTICLES, {
    variables: { input: topArticlesInput },
    fetchPolicy: "cache-and-network",
  });

  const articles: Article[] = data?.getArticles?.list || [];

  const getCategoryDisplayName = (category?: ArticleCategory) => {
    if (category === ArticleCategory.NEWS) return "News";
    return "Blog";
  };

  return (
    <>
      <div className="blog-area ptb-140">
        <div className="container">
          <div className="section-title">
            <div className="row justify-content-center align-items-center g-4">
              <div className="col-lg-7 col-md-12">
                <div className="left">
                  <span className="sub">Our Blog</span>
                  <h2>
                    Health Insights, Tips & Resources from Medical Experts
                  </h2>
                </div>
              </div>
              <div className="col-lg-5 col-md-12">
                <div className="right">
                  <p>
                    Explore trusted articles, wellness tips, and expert advice
                    to help you stay informed, make smarter health decisions
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="row justify-content-center g-4">
            {loading && (
              [0, 1, 2].map((index) => (
                <div key={`blog-skeleton-${index}`} className="col-lg-4 col-md-6">
                  <div className="blog-card">
                    <div className="image">
                      <Skeleton variant="rectangular" height={320} />
                    </div>
                    <div className="content">
                      <ul className="meta">
                        <li>
                          <Skeleton variant="rounded" width={110} height={30} sx={{ borderRadius: 50 }} />
                        </li>
                        <li>
                          <Skeleton variant="rounded" width={110} height={30} sx={{ borderRadius: 50 }} />
                        </li>
                      </ul>
                      <Skeleton variant="text" height={28} />
                      <Skeleton variant="text" height={28} width="85%" />
                    </div>
                  </div>
                </div>
              ))
            )}
            {!loading && articles.length === 0 && (
              <div className="col-12 text-center">
                <p>No articles available yet.</p>
              </div>
            )}
            {articles.map((article) => {
              const articleLink = {
                pathname: "/article/details",
                query: { articleId: article._id },
              };
              return (
                <div key={article._id} className="col-lg-4 col-md-6">
                  <div className="blog-card">
                    <div className="image">
                      <Link href={articleLink}>
                        <Image
                          src={getImageUrl(article.articleImage) || "/images/blog/blog1.jpg"}
                          alt={article.articleTitle}
                          width={832}
                          height={832}
                        />
                      </Link>
                    </div>
                    <div className="content">
                      <ul className="meta">
                        <li>
                          <Link href={articleLink}>
                            {getCategoryDisplayName(article.articleCategory)}
                          </Link>
                        </li>
                        <li>
                          <Moment format="MMM DD, YYYY">
                            {article.createdAt}
                          </Moment>
                        </li>
                      </ul>
                      <h3>
                        <Link href={articleLink}>{article.articleTitle}</Link>
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default OurBlog;
