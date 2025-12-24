import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Moment from "react-moment";
import { useReactToPrint } from "react-to-print";
import QRCode from "react-qr-code";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import PrintIcon from "@mui/icons-material/Print";
import { Order, OrderItem } from "@/libs/types/order/order";
import { Product } from "@/libs/types/product/product";
import { getImageUrl } from "@/libs/imageHelper";
import { OrderStatus } from "@/libs/enums/order.enum";

interface OrderCardProps {
  order: Order;
  onCancel: (orderId: string) => void;
  onPay: (orderId: string) => void;
  onUpdateQuantity: (orderId: string, productId: string, quantity: number) => void;
  openReceiptForId?: string | null;
  onReceiptClose?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onCancel,
  onPay,
  onUpdateQuantity,
  openReceiptForId,
  onReceiptClose,
}) => {
  const products = (order.productData || []) as Product[];
  const items = (order.orderItems || []) as OrderItem[];
  const deliveryFee = order.orderDelivery || 0;
  const [receiptOpen, setReceiptOpen] = useState(false);
  const receiptRef = useRef<HTMLDivElement | null>(null);
  const orderDate = <Moment format="YYYY.MM.DD hh.mm A">{order.createdAt}</Moment>;
  const receiptLink = useMemo(() => {
    const path = `/myOrders?receipt=${order._id}`;
    if (typeof window === "undefined") {
      return path;
    }
    return `${window.location.origin}${path}`;
  }, [order._id]);
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${order._id}`,
  });
  useEffect(() => {
    if (openReceiptForId === order._id) {
      setReceiptOpen(true);
    }
  }, [openReceiptForId, order._id]);

  const handleReceiptClose = () => {
    setReceiptOpen(false);
    onReceiptClose?.();
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: "1px solid #eef1f6",
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                Order #{order._id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {orderDate}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Delivery address: {order.orderAddress || "N/A"}
              </Typography>
            </Stack>
            <Chip
              label={order.orderStatus}
              color={order.orderStatus === OrderStatus.FINISH ? "success" : "info"}
              variant="outlined"
              sx={{ textTransform: "capitalize" }}
            />
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{ overflowX: "auto", pb: 1 }}
            alignItems="center"
          >
            {products.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No products in this order.
              </Typography>
            ) : (
              products.map((product, index) => {
                const item = items.find((entry) => entry.productId === product._id);
                const quantity = item?.itemQuantity ?? 0;
                const itemTotal = (item?.itemPrice ?? 0) * quantity;
                const imageSrc = product.productImages?.[0]
                  ? getImageUrl(product.productImages[0])
                  : "/images/thumbnail.png";

                return (
                  <React.Fragment key={product._id}>
                    {index > 0 && (
                      <Typography variant="h6" color="text.secondary">
                        +
                      </Typography>
                    )}
                    <Box
                      sx={{
                        minWidth: 140,
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                        p: 1.5,
                        textAlign: "center",
                        backgroundColor: "#fff",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                        <Image
                          src={imageSrc}
                          alt={product.productTitle}
                          width={80}
                          height={80}
                          style={{ borderRadius: 10, objectFit: "cover" }}
                        />
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {product.productTitle}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <IconButton
                          size="small"
                          onClick={() => onUpdateQuantity(order._id, product._id, quantity - 1)}
                          disabled={order.orderStatus !== OrderStatus.PROCESS || quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 18 }}>
                          {quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => onUpdateQuantity(order._id, product._id, quantity + 1)}
                          disabled={order.orderStatus !== OrderStatus.PROCESS}
                          aria-label="Increase quantity"
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                        ${itemTotal.toFixed(2)}
                      </Typography>
                    </Box>
                  </React.Fragment>
                );
              })
            )}
          </Stack>

          <Divider />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" color="text.secondary">
                Delivery fee
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                ${deliveryFee.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Delivery is free for orders over $50.
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ${order.orderTotal.toFixed(2)}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            {order.orderStatus === OrderStatus.FINISH ? (
              <Button variant="contained" color="success" onClick={() => setReceiptOpen(true)}>
                Receipt
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => onCancel(order._id)}
                  disabled={order.orderStatus !== OrderStatus.PROCESS}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => onPay(order._id)}
                  disabled={order.orderStatus !== OrderStatus.PROCESS}
                >
                  Pay
                </Button>
              </>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Dialog open={receiptOpen} onClose={handleReceiptClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Receipt</Typography>
            <IconButton aria-label="Print receipt" onClick={handlePrint}>
              <PrintIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Box ref={receiptRef} sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">Order #{order._id}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {orderDate}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Delivery address: {order.orderAddress || "N/A"}
                </Typography>
              </Stack>

              <Divider />

              {products.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No products in this order.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {products.map((product) => {
                    const item = items.find((entry) => entry.productId === product._id);
                    const quantity = item?.itemQuantity ?? 0;
                    const itemTotal = (item?.itemPrice ?? 0) * quantity;

                    return (
                      <Stack
                        key={product._id}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography variant="subtitle2">{product.productTitle}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {quantity} × ${item?.itemPrice?.toFixed(2) ?? "0.00"}
                          </Typography>
                        </Box>
                        <Typography variant="subtitle2">${itemTotal.toFixed(2)}</Typography>
                      </Stack>
                    );
                  })}
                </Stack>
              )}

              <Divider />

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Delivery fee
                </Typography>
                <Typography variant="subtitle2">${deliveryFee.toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="h6">${order.orderTotal.toFixed(2)}</Typography>
              </Stack>

              <Divider />

              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2">Receipt QR</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {receiptLink}
                  </Typography>
                </Box>
                <Box sx={{ p: 1, border: "1px solid #e5e7eb", borderRadius: 2 }}>
                  <QRCode value={receiptLink} size={96} />
                </Box>
              </Stack>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReceiptClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrderCard;
