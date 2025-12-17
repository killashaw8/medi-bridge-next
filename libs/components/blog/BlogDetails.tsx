import React from "react";
import Image from "next/image";
import Moment from "react-moment";
import { Article } from "@/libs/types/article/article";
import { ArticleCategory } from "@/libs/enums/article.enum";
import { getImageUrl } from "@/libs/imageHelper";
import TViewer from "../common/TViewer";
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';

interface BlogDetailsProps {
  article?: Article;
  loading?: boolean;
}

const BlogDetails: React.FC<BlogDetailsProps> = ({ article, loading }) => {
  const coverImage = getImageUrl(article?.articleImage) || "/images/blog-details.jpg";
  const category =
    article?.articleCategory === ArticleCategory.NEWS ? "News" : "Blog";

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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetails;
