import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Moment from "react-moment";
import { getImageUrl } from "@/libs/imageHelper";
import { Article } from "@/libs/types/article/article";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import IconButton from "@mui/material/IconButton";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import FavoriteIcon from "@mui/icons-material/Favorite";

interface ArticleCardProps {
  article: Article;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onLike?: (id: string) => void;
  canManage?: boolean;
  likeActive?: boolean;
  showActions?: "manage" | "like";
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onEdit,
  onDelete,
  onLike,
  canManage,
  likeActive,
  showActions = "like",
}) => {
  const fallbackImage = "/images/blog/blog-fallback.webp";
  const imageSrc = article.articleImage ? getImageUrl(article.articleImage) : fallbackImage;
  const plainText = article.articleContent?.replace(/<[^>]+>/g, "") || "";

  return (
    <Card className="mypage-article-card" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardMedia
        image={imageSrc}
        title={article.articleTitle}
        sx={{
          pt: "100%", // 1:1 aspect ratio
          position: "relative",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Chip label={article.articleCategory} size="small" />
          <Typography variant="caption" color="text.secondary">
            <Moment format="MMM DD, YYYY">{article.createdAt}</Moment>
          </Typography>
        </Stack>
        <Typography gutterBottom variant="h6" component="div">
          {article.articleTitle}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }} noWrap>
          {plainText || "No content preview"}
        </Typography>
        {showActions === "like" && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ color: "text.secondary" }}>
            <RemoveRedEyeIcon fontSize="small" />
            <Typography variant="body2" sx={{ fontSize: "14px", minWidth: "28px" }}>
              {article?.articleViews || 0}
            </Typography>
            <IconButton
              color="default"
              size="small"
              onClick={(e: any) => {
                e.stopPropagation?.();
                onLike?.(article._id);
              }}
              sx={{ padding: "4px" }}
            >
              {likeActive ? (
                <FavoriteIcon color={"error"} fontSize="small" />
              ) : (
                <FavoriteBorderIcon fontSize="small" />
              )}
            </IconButton>
            <Typography variant="body2" sx={{ fontSize: "14px", minWidth: "28px" }}>
              {article?.articleLikes || 0}
            </Typography>
          </Stack>
        )}
      </CardContent>
      {showActions === "manage" && canManage && (
        <CardActions>
          <Button startIcon={<EditIcon />} onClick={() => onEdit?.(article._id)}>
            Edit
          </Button>
          <Button endIcon={<DeleteIcon />} color="error" onClick={() => onDelete?.(article._id)}>
            Delete
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default ArticleCard;
