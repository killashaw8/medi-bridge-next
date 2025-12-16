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
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/Delete';

interface ArticleCardProps {
  article: Article;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onEdit, onDelete }) => {
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
        <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
          {plainText || "No content preview"}
        </Typography>
      </CardContent>
      <CardActions>
        <Button startIcon={<EditIcon/>} onClick={() => onEdit?.(article._id)}>
          Edit
        </Button>
        <Button endIcon={<DeleteIcon/>} color="error" onClick={() => onDelete?.(article._id)}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default ArticleCard;
