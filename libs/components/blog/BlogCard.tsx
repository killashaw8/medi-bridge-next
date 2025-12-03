import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useReactiveVar } from "@apollo/client";
import { Article } from "@/libs/types/article/article";
import { ArticleCategory } from "@/libs/enums/article.enum";
import { getImageUrl } from "@/libs/imageHelper";
import { userVar } from "@/apollo/store";
import Moment from 'react-moment';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Stack, Typography } from "@mui/material";

interface BlogCardProps {
  article: Article;
  size?: string;
  likeArticleHandler: any;
}

const BlogDetailsContent = (props: BlogCardProps) => {
  const { article, size = 'normal', likeArticleHandler } = props;
  const router = useRouter();
  const user = useReactiveVar(userVar);
  
  // Get image URL with fallback
  const imagePath = getImageUrl(article?.articleImage) || "/images/blog/blog1.jpg";
  
  // Get category display name
  const getCategoryDisplayName = (category: ArticleCategory): string => {
    switch (category) {
      case ArticleCategory.BLOG:
        return "Blog";
      case ArticleCategory.NEWS:
        return "News";
      default:
        return "Blog";
    }
  };

  /** HANDLERS **/
  const chooseArticleHandler = (e: React.SyntheticEvent, article: Article) => {
    router.push(
      {
        pathname: '/article/[id]',
        query: { id: article?._id },
      },
      `/blog/${article?._id}`,
      { shallow: true },
    );
  };

  const goMemberPage = (id: string) => {
    if (id === user?._id) router.push('/mypage');
    else router.push(`/member?memberId=${id}`);
  };

  return (
    <div className="col-lg-12 col-md-12">
      <div className="blog-card wrap-style2">
        <div 
          className="image"
          onClick={(e: any) => chooseArticleHandler(e, article)}
          >
          <Image
            src={imagePath}
            alt={article?.articleTitle || "Article Image"}
            width={600}
            height={400}
            style={{ 
              objectFit: "cover",
              borderRadius: "20px",
              width: '600px',
              height: '400px'
            }}
          />
        </div>
        <div className="content">
          <ul className="meta">
            <li>
                {getCategoryDisplayName(article?.articleCategory)}
            </li>
            <li>
              <Moment format={'MMM DD, YYYY'}>
                {article?.createdAt}
              </Moment>
            </li>
          </ul>
          <h3>
            <Link href={`/blog/${article?._id}`}>
              {article?.articleTitle}
            </Link>
          </h3>
          
          {/* Like and View Counts */}
          <Stack 
            direction="row" 
            alignItems="center" 
            width={'600px'}
            gap={1}
            sx={{ marginTop: '15px' }}
          >
            <IconButton 
              color="default" 
              size="small"
              onClick={(e: any) => e.stopPropagation()}
              sx={{ padding: '4px' }}
            >
              <RemoveRedEyeIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ fontSize: '14px', color: '#666', minWidth: '30px' }}>
              {article?.articleViews || 0}
            </Typography>
            
            <IconButton 
              color="default"
              size="small"
              onClick={(e: any) => {
                e.stopPropagation();
                likeArticleHandler(e, user, article?._id);
              }}
              sx={{ padding: '4px' }}
            >
              {article?.meLiked && article?.meLiked[0]?.myFavorite ? (
                <FavoriteIcon color={"error"} fontSize="small" />
              ) : (
                <FavoriteBorderIcon fontSize="small" />
              )}
            </IconButton>
            <Typography variant="body2" sx={{ fontSize: '14px', color: '#666', minWidth: '30px' }}>
              {article?.articleLikes || 0}
            </Typography>
            
            {article?.memberData && (
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '14px', 
                  color: '#666',
                  marginLeft: 'auto',
                  cursor: 'pointer',
                  '&:hover': {
                    color: '#336AEA'
                  }
                }}
                onClick={(e: any) => {
                  e.stopPropagation();
                  goMemberPage(article?.memberData?._id as string);
                }}
              >
                {article?.memberData?.memberFullName || 'Anonymous'}
              </Typography>
            )}
          </Stack>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailsContent;