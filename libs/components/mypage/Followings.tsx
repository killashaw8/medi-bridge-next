import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";
import { GET_MEMBER_FOLLOWINGS } from "@/apollo/user/query";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { FollowInquiry } from "@/libs/types/follow/follow.input";
import { Following } from "@/libs/types/follow/follow";
import { Box, Typography } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import MemberCard from "@/libs/components/member/MemberCard";
import { LIKE_TARGET_MEMBER, UNSUBSCRIBE } from "@/apollo/user/mutation";
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";

const Followings: React.FC = () => {
  const user = useReactiveVar(userVar);
  const [page, setPage] = useState(1);
  const limit = 20;

  const input: FollowInquiry = {
    page,
    limit,
    search: {
      followerId: user?._id,
    },
  };

  const { data, loading, error, refetch } = useQuery(GET_MEMBER_FOLLOWINGS, {
    variables: { input },
    skip: !user?._id,
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });
  const [unsubscribe] = useMutation(UNSUBSCRIBE);
  const [likeMember] = useMutation(LIKE_TARGET_MEMBER);

  const isNoDataError = error?.message?.includes("No data is found");
  const followings: Following[] = isNoDataError ? [] : (data?.getMemberFollowings?.list || []);
  const total = isNoDataError ? 0 : (data?.getMemberFollowings?.metaCounter?.[0]?.total || 0);

  if (loading) {
    return (
      <div className="mypage-section">
        <div className="section-header">
          <Skeleton variant="text" height={32} width="25%" />
          <Skeleton variant="text" width="40%" />
        </div>
        <div className="members-list">
          <div className="row">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div key={`following-skeleton-${index}`} className="col-md-6 col-lg-4">
                <Box sx={{ borderRadius: 2, border: "1px solid #eef1f6", p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Skeleton variant="circular" width={56} height={56} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                  </Box>
                  <Skeleton variant="rectangular" height={36} sx={{ mt: 2, borderRadius: 2 }} />
                </Box>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !isNoDataError) {
    return (
      <Box sx={{ textAlign: "center", padding: "40px" }}>
        <Typography color="error">Error loading followings</Typography>
      </Box>
    );
  }

  const handleUnfollow = async (memberId: string) => {
    try {
      await unsubscribe({ variables: { input: memberId } });
      await refetch();
      await sweetMixinSuccessAlert("Unfollowed member");
    } catch (err: any) {
      console.error("Unfollow error:", err);
      await sweetMixinErrorAlert(err.message || "Failed to unfollow");
    }
  };

  const handleLike = async (memberId: string) => {
    try {
      await likeMember({ variables: { input: memberId } });
      await refetch();
    } catch (err: any) {
      console.error("Like error:", err);
      await sweetMixinErrorAlert(err.message || "Failed to like");
    }
  };

  return (
    <div className="mypage-section">
      <div className="section-header">
        <h2>Followings</h2>
        <p>People you are following ({total})</p>
      </div>

      {followings.length === 0 ? (
        <div className="empty-state">
          <i className="ri-user-add-line u-icon-48"></i>
          <p>You're not following anyone yet</p>
        </div>
      ) : (
        <div className="members-list">
          <div className="row">
            {followings.map((following) => {
              const member = following.followingData;
              if (!member) return null;
              const isLiked = following.meLiked?.some((like) => like.myFavorite);

              return (
                <div key={following._id} className="col-md-6 col-lg-4">
                  <MemberCard
                    member={member}
                    isFollowing
                    onUnfollow={handleUnfollow}
                    isLiked={!!isLiked}
                    onLike={handleLike}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Followings;
