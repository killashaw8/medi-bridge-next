import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Box, CircularProgress, Pagination, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { GET_MY_ORDERS } from "@/apollo/user/query";
import { UPDATE_ORDER, UPDATE_ORDER_ITEM } from "@/apollo/user/mutation";
import { Order, Orders } from "@/libs/types/order/order";
import { OrderInquiry, OrderItemUpdateInput } from "@/libs/types/order/order.input";
import { OrderStatus } from "@/libs/enums/order.enum";
import OrderCard from "./OrderCard";
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";

const MyOrders = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OrderStatus>(OrderStatus.PROCESS);
  const [currentPage, setCurrentPage] = useState(1);

  const ordersInput = useMemo<OrderInquiry>(() => {
    return {
      page: currentPage,
      limit: 3,
      orderStatus: activeTab,
      sort: "createdAt",
      direction: "DESC",
    };
  }, [activeTab, currentPage]);

  const { data, loading, refetch } = useQuery(GET_MY_ORDERS, {
    variables: { input: ordersInput },
    fetchPolicy: "cache-and-network",
  });

  const { data: processCountData, refetch: refetchProcessCount } = useQuery(GET_MY_ORDERS, {
    variables: {
      input: {
        page: 1,
        limit: 1,
        orderStatus: OrderStatus.PROCESS,
        sort: "createdAt",
        direction: "DESC",
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const { data: finishCountData, refetch: refetchFinishCount } = useQuery(GET_MY_ORDERS, {
    variables: {
      input: {
        page: 1,
        limit: 1,
        orderStatus: OrderStatus.FINISH,
        sort: "createdAt",
        direction: "DESC",
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const [updateOrder] = useMutation(UPDATE_ORDER);
  const [updateOrderItem] = useMutation(UPDATE_ORDER_ITEM);

  const orders = (data?.getMyOrders?.list ?? []) as Order[];
  const total = data?.getMyOrders?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 3));
  const processTotal = processCountData?.getMyOrders?.total ?? 0;
  const finishTotal = finishCountData?.getMyOrders?.total ?? 0;
  const receiptId = typeof router.query.receipt === "string" ? router.query.receipt : null;

  useEffect(() => {
    if (receiptId) {
      setActiveTab(OrderStatus.FINISH);
    }
  }, [receiptId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    const handleOrdersUpdated = () => {
      refetch();
      refetchProcessCount();
      refetchFinishCount();
    };
    window.addEventListener("orders:updated", handleOrdersUpdated);
    return () => {
      window.removeEventListener("orders:updated", handleOrdersUpdated);
    };
  }, [refetch, refetchProcessCount, refetchFinishCount]);

  const handleCancel = async (orderId: string) => {
    try {
      await updateOrder({
        variables: {
          input: {
            orderId,
            orderStatus: OrderStatus.DELETE,
          },
        },
      });
      await refetch();
      await refetchProcessCount();
      await refetchFinishCount();
      await sweetMixinSuccessAlert("Order cancelled.");
    } catch (error: any) {
      const message =
        error?.graphQLErrors?.[0]?.message ||
        error?.message ||
        "Failed to cancel order.";
      await sweetMixinErrorAlert(message);
    }
  };

  const handlePay = async (orderId: string) => {
    try {
      await updateOrder({
        variables: {
          input: {
            orderId,
            orderStatus: OrderStatus.FINISH,
          },
        },
      });
      await refetch();
      await refetchProcessCount();
      await refetchFinishCount();
      await sweetMixinSuccessAlert("Order paid.");
    } catch (error: any) {
      const message =
        error?.graphQLErrors?.[0]?.message ||
        error?.message ||
        "Failed to update order.";
      await sweetMixinErrorAlert(message);
    }
  };

  const handleUpdateQuantity = async (orderId: string, productId: string, quantity: number) => {
    try {
      await updateOrderItem({
        variables: {
          input: {
            orderId,
            productId,
            itemQuantity: quantity,
          } as OrderItemUpdateInput,
        },
      });
      await refetch();
      await sweetMixinSuccessAlert("Order updated.");
    } catch (error: any) {
      const message =
        error?.graphQLErrors?.[0]?.message ||
        error?.message ||
        "Failed to update order.";
      await sweetMixinErrorAlert(message);
    }
  };

  return (
    <div className="appointment-area ptb-140">
      <div className="container">
        <Stack spacing={3}>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label={`In Process (${processTotal})`} value={OrderStatus.PROCESS} />
            <Tab label={`Finished (${finishTotal})`} value={OrderStatus.FINISH} />
          </Tabs>

          {loading ? (
            <Box sx={{ textAlign: "center", padding: "40px" }}>
              <CircularProgress />
              <Typography sx={{ marginTop: 2 }}>Loading orders...</Typography>
            </Box>
          ) : orders.length === 0 ? (
            <Box sx={{ textAlign: "center", padding: "40px" }}>
              <Typography>No orders found.</Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onCancel={handleCancel}
                  onPay={handlePay}
                  onUpdateQuantity={handleUpdateQuantity}
                  openReceiptForId={receiptId}
                  onReceiptClose={() => {
                    if (!receiptId) return;
                    const { receipt, ...rest } = router.query;
                    router.replace(
                      { pathname: router.pathname, query: rest },
                      undefined,
                      { shallow: true },
                    );
                  }}
                />
              ))}
              {totalPages > 0 && (
                <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, page) => setCurrentPage(page)}
                    shape="rounded"
                    variant="outlined"
                  />
                </Stack>
              )}
            </Stack>
          )}
        </Stack>
      </div>
    </div>
  );
};

export default MyOrders;
