import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_MEMBER_FOLLOWERS } from "@/apollo/user/query";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { FollowInquiry } from "@/libs/types/follow/follow.input";
import { Follower } from "@/libs/types/follow/follow";
import { Box, Typography } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import MemberCard from "@/libs/components/member/MemberCard";
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from "@/apollo/user/mutation";
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";

const Followers: React.FC = () => {
  const user = useReactiveVar(userVar);
  const [page, setPage] = useState(1);
  const [localFollowingIds, setLocalFollowingIds] = useState<Set<string>>(new Set());
  const limit = 20;

  const input: FollowInquiry = {
    page,
    limit,
    search: {
      followingId: user?._id,
    },
  };

  const { data, loading, error, refetch } = useQuery(GET_MEMBER_FOLLOWERS, {
    variables: { input },
    skip: !user?._id,
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });
  const [subscribe] = useMutation(SUBSCRIBE);
  const [unsubscribe] = useMutation(UNSUBSCRIBE);
  const [likeMember] = useMutation(LIKE_TARGET_MEMBER);

  const isNoDataError = error?.message?.includes("No data is found");
  const followers: Follower[] = isNoDataError ? [] : (data?.getMemberFollowers?.list || []);
  const total = isNoDataError ? 0 : (data?.getMemberFollowers?.metaCounter?.[0]?.total || 0);

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
              <div key={`follower-skeleton-${index}`} className="col-md-6 col-lg-4">
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
        <Typography color="error">Error loading followers</Typography>
      </Box>
    );
  }

  const handleFollow = async (memberId: string) => {
    try {
      await subscribe({ variables: { input: memberId } });
      await refetch();
      setLocalFollowingIds((prev) => new Set(prev).add(memberId));
      await sweetMixinSuccessAlert("Followed member");
    } catch (err: any) {
      console.error("Follow error:", err);
      await sweetMixinErrorAlert(err.message || "Failed to follow");
    }
  };

  const handleUnfollow = async (memberId: string) => {
    try {
      await unsubscribe({ variables: { input: memberId } });
      await refetch();
      setLocalFollowingIds((prev) => {
        const next = new Set(prev);
        next.delete(memberId);
        return next;
      });
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
        <h2>Followers</h2>
        <p>People following you ({total})</p>
      </div>

      {followers.length === 0 ? (
        <div className="empty-state">
          <i className="ri-user-follow-line u-icon-48"></i>
          <p>No followers yet</p>
        </div>
      ) : (
        <div className="members-list">
          <div className="row">
            {followers.map((follower) => {
              const member = follower.followerData;
              if (!member) return null;
              const isFollowing =
                localFollowingIds.has(member._id) ||
                follower.meFollowed?.some((follow) => follow.myFollowing);
              const isLiked = follower.meLiked?.some((like) => like.myFavorite);

              return (
                <div key={follower._id} className="col-md-6 col-lg-4">
                  <MemberCard
                    member={member}
                    isFollowing={!!isFollowing}
                    onFollow={handleFollow}
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

export default Followers;
