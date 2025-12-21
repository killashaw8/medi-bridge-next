import AspectRatio from "@mui/joy/AspectRatio";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CardOverflow from "@mui/joy/CardOverflow";
import Chip from "@mui/joy/Chip";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { Product } from "@/libs/types/product/product";
import { getImageUrl } from "@/libs/imageHelper";
import { Box, IconButton } from "@mui/material";

interface ShoppingCardProps {
  product: Product;
  onLike?: (id: string) => void;
}

const ShoppingCard: React.FC<ShoppingCardProps> = ({ product, onLike }) => {
  const imageSrc = product.productImages?.[0]
    ? getImageUrl(product.productImages[0])
    : "/images/thumbnail.png";
  const isLiked = product.meLiked?.some((like) => like.myFavorite) ?? false;

  return (
    <Card sx={{ width: 320, maxWidth: "100%", boxShadow: "lg" }}>
      <CardOverflow>
        <Link href={`/products/details?${product._id}`} color="neutral">
          <AspectRatio ratio="1" sx={{ minWidth: 304 }}>
            <img
              src={imageSrc}
              loading="lazy"
              alt={product.productTitle}
            />
          </AspectRatio>
        </Link>
      </CardOverflow>
      <CardContent>
        <Typography level="body-xs">
          {product.productCollection?.replace(/_/g, " ")}
        </Typography>
        <Link
          href={`/products/details?${product._id}`}
          color="neutral"
          textColor="text.primary"
          endDecorator={<ArrowOutwardIcon />}
          sx={{ fontWeight: "md" }}
        >
          {product.productTitle}
        </Link>

        <Typography
          level="title-lg"
          sx={{ mt: 1, fontWeight: 'xl' }}
          endDecorator={
            product.productCount > 0 ? (
              <Chip component="span" size="sm" variant="soft" color="success">
                In stock
              </Chip>
            ) : (
              <Chip component="span" size="sm" variant="soft" color="danger">
                Sold out
              </Chip>
            )
          }
        >
          ${product.productPrice?.toLocaleString() ?? 0}
        </Typography>
        <Typography level="body-sm">
          Type: <b>{product.productType}</b>
        </Typography>
      </CardContent>
      <CardOverflow 
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: 2
        }}
      >
        <Button variant="solid" color="danger" size="lg">
          Add to cart
        </Button>
        <Button variant="solid" size="lg">
          Buy
        </Button>
      </CardOverflow>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: 'space-around',
          px: 2,
          color: "text.secondary",
        }}
      >
        <RemoveRedEyeIcon fontSize="small" />
        <Typography level="body-sm">{product.productViews || 0}</Typography>
        <IconButton
          color="default"
          size="small"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onLike?.(product._id);
          }}
          sx={{ padding: "4px" }}
        >
          {isLiked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
        </IconButton>
        <Typography level="body-sm">{product.productLikes || 0}</Typography>
        <Button variant="plain" color="neutral" size="sm">
          <ChatBubbleOutlineIcon />
        </Button>
        <Typography level="body-sm">{product.productComments || 0}</Typography>
      </Box>
    </Card>
  );
}

export default ShoppingCard;
