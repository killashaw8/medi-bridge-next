import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useReactiveVar } from "@apollo/client";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  IconButton,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { CREATE_ORDER, UPDATE_ORDER } from "@/apollo/user/mutation";
import { cartVar, userVar } from "@/apollo/store";
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";
import { OrderStatus } from "@/libs/enums/order.enum";
import { Product } from "@/libs/types/product/product";
import { CartItem } from "@/libs/types/order/cart";
import { getImageUrl } from "@/libs/imageHelper";

interface CheckoutPopoverProps {
  open: boolean;
  onClose: () => void;
  product?: Product;
  cartItems?: CartItem[];
}

const CheckoutPopover: React.FC<CheckoutPopoverProps> = ({
  open,
  onClose,
  product,
  cartItems,
}) => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [createOrder] = useMutation(CREATE_ORDER);
  const [updateOrder] = useMutation(UPDATE_ORDER);
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const items = useMemo<CartItem[]>(() => {
    if (cartItems && cartItems.length > 0) {
      return cartItems;
    }
    if (product) {
      return [{ product, quantity: 1 }];
    }
    return [];
  }, [cartItems, product]);

  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!open) return;
    const nextQuantities: Record<string, number> = {};
    items.forEach((item) => {
      nextQuantities[item.product._id] = Math.max(item.quantity ?? 1, 1);
    });
    setQuantities(nextQuantities);
  }, [items, open]);

  useEffect(() => {
    if (!open) {
      setAddress("");
      setIsSubmitting(false);
    }
  }, [open]);

  const updateQuantity = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] ?? 1;
      const next = Math.max(current + delta, 1);
      if (cartItems && cartItems.length > 0) {
        const currentCart = cartVar();
        const updatedCart = currentCart.map((item) =>
          item.product._id === productId ? { ...item, quantity: next } : item
        );
        cartVar(updatedCart);
      }
      return { ...prev, [productId]: next };
    });
  };

  const handleCheckout = async () => {
    if (!user?._id) {
      await sweetMixinErrorAlert("Please log in to place an order.");
      return;
    }
    if (!address.trim()) {
      await sweetMixinErrorAlert("Please enter your delivery address.");
      return;
    }
    if (items.length === 0) {
      await sweetMixinErrorAlert("Your cart is empty.");
      return;
    }

    const itemsToOrder = items
      .map((item) => ({
        ...item,
        quantity: quantities[item.product._id] ?? item.quantity ?? 1,
      }))
      .filter((item) => item.quantity > 0);

    const outOfStock = itemsToOrder.find(
      (item) => item.product.productCount < item.quantity
    );
    if (outOfStock) {
      await sweetMixinErrorAlert(
        `Not enough stock for ${outOfStock.product.productTitle}.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await Promise.all(
        itemsToOrder.map(async (item) => {
          const { data } = await createOrder({
            variables: {
              input: {
                productId: item.product._id,
                itemPrice: item.product.productPrice,
                itemQuantity: item.quantity,
                orderAddress: address.trim(),
              },
            },
          });
          const orderId = data?.createOrder?._id;
          if (orderId) {
            await updateOrder({
              variables: {
                input: {
                  orderId,
                  orderStatus: OrderStatus.PROCESS,
                },
              },
            });
          }
        })
      );

      await sweetMixinSuccessAlert("Order placed.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("orders:updated"));
      }
      if (cartItems && cartItems.length > 0) {
        cartVar([]);
      }
      onClose();
      router.push("/myOrders");
    } catch (error: any) {
      const message =
        error?.graphQLErrors?.[0]?.message ||
        error?.message ||
        "Failed to place order.";
      await sweetMixinErrorAlert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="checkout-popover-title"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1300,
      }}
    >
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          padding: 3,
          width: { xs: "92%", sm: 520 },
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography id="checkout-popover-title" variant="h6">
          Checkout
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {items.map((item) => {
            const quantity = quantities[item.product._id] ?? item.quantity ?? 1;
            const isMaxed = quantity >= item.product.productCount;
            return (
              <Box
                key={item.product._id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  border: "1px solid #eee",
                  borderRadius: 1.5,
                  padding: 1.5,
                }}
              >
                <img
                  src={
                    item.product.productImages?.[0]
                      ? getImageUrl(item.product.productImages[0])
                      : "/images/thumbnail.png"
                  }
                  alt={item.product.productTitle}
                  width={48}
                  height={48}
                  style={{ borderRadius: 6, objectFit: "cover" }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap>
                    {item.product.productTitle}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${item.product.productPrice.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => updateQuantity(item.product._id, -1)}
                    disabled={quantity <= 1}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" sx={{ minWidth: 20, textAlign: "center" }}>
                    {quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => updateQuantity(item.product._id, 1)}
                    disabled={isMaxed}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            );
          })}
        </Box>

        <TextField
          label="Delivery address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          fullWidth
          multiline
          minRows={2}
        />

        <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCheckout}
            disabled={isSubmitting || items.length === 0}
          >
            Buy
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CheckoutPopover;
