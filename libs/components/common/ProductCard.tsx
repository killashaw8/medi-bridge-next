import React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Moment from "react-moment";
import IconButton from "@mui/material/IconButton";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/router";
import { getImageUrl } from "@/libs/imageHelper";
import { Product } from "@/libs/types/product/product";
import { ProductStatus } from "@/libs/enums/product.enum";

interface ProductCardProps {
  product: Product;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onLike?: (id: string) => void;
  canManage?: boolean;
  likeActive?: boolean;
  showActions?: "manage" | "like";
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onLike,
  canManage,
  likeActive,
  showActions = "like",
}) => {
  const router = useRouter();
  const fallbackImage = "/images/products/default.jpg";
  const imageSrc =
    product.productImages?.[0] ? getImageUrl(product.productImages[0]) : fallbackImage;
  const status = product.productStatus || ProductStatus.ACTIVE;
  const statusLabel = status.replace(/_/g, " ");
  const statusColors: Record<ProductStatus, { bg: string; text: string }> = {
    [ProductStatus.ACTIVE]: { bg: "#E8FAF0", text: "#22C55E" },
    [ProductStatus.SOLD]: { bg: "#FFF4E5", text: "#F97316" },
    [ProductStatus.DELETE]: { bg: "#FEE2E2", text: "#DC2626" },
  };
  const badge = statusColors[status] || { bg: "#EEF1F6", text: "#5A6A85" };
  const goToDetails = () => {
    if (!product?._id) return;
    router.push(`/products/${product._id}`);
  };

  return (
    <Card
      className="mypage-product-card"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        position: "relative",
      }}
      onClick={goToDetails}
    >
      <Stack
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          backgroundColor: badge.bg,
          color: badge.text,
          borderRadius: "999px",
          px: 1.5,
          py: 0.5,
          fontSize: "12px",
          fontWeight: 600,
          textTransform: "capitalize",
          zIndex: 2,
        }}
      >
        {statusLabel}
      </Stack>
      <CardMedia
        image={imageSrc}
        title={product.productTitle}
        sx={{
          pt: "100%", // 1:1 aspect ratio
          position: "relative",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Chip label={product.productType} size="small" />
          <Typography variant="caption" color="text.secondary">
            <Moment format="MMM DD, YYYY">{product.createdAt}</Moment>
          </Typography>
        </Stack>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {product.productTitle}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          ${product.productPrice?.toFixed(2)}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }} noWrap>
          {product.productDesc || "No description"}
        </Typography>
        {showActions === "like" && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ color: "text.secondary" }}>
            <RemoveRedEyeIcon fontSize="small" />
            <Typography variant="body2" sx={{ fontSize: "14px", minWidth: "28px" }}>
              {product?.productViews || 0}
            </Typography>
            <IconButton
              color="default"
              size="small"
              onClick={(e: React.MouseEvent<HTMLElement>) => {
                e.stopPropagation();
                onLike?.(product._id);
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
              {product?.productLikes || 0}
            </Typography>
          </Stack>
        )}
      </CardContent>
      {showActions === "manage" && canManage && (
        <CardActions>
          <Button
            startIcon={<EditIcon />}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              onEdit?.(product._id);
            }}
          >
            Edit
          </Button>
          <Button
            endIcon={<DeleteIcon />}
            color="error"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              onDelete?.(product._id);
            }}
          >
            Delete
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default ProductCard;
