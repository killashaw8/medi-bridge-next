import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_MEMBER_FOLLOWERS } from "@/apollo/user/query";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { FollowInquiry } from "@/libs/types/follow/follow.input";
import { Follower } from "@/libs/types/follow/follow";
import { CircularProgress, Box, Typography } from "@mui/material";
import MemberCard from "@/libs/components/member/MemberCard";
import { SUBSCRIBE, UNSUBSCRIBE } from "@/apollo/user/mutation";
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";

const Followers: React.FC = () => {
  const user = useReactiveVar(userVar);
  const [page, setPage] = useState(1);
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

  const isNoDataError = error?.message?.includes("No data is found");
  const followers: Follower[] = isNoDataError ? [] : (data?.getMemberFollowers?.list || []);
  const total = isNoDataError ? 0 : (data?.getMemberFollowers?.metaCounter?.[0]?.total || 0);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", padding: "40px" }}>
        <CircularProgress />
        <Typography sx={{ marginTop: 2 }}>Loading followers...</Typography>
      </Box>
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
      await sweetMixinSuccessAlert("Unfollowed member");
    } catch (err: any) {
      console.error("Unfollow error:", err);
      await sweetMixinErrorAlert(err.message || "Failed to unfollow");
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
          <i className="ri-user-follow-line" style={{ fontSize: "48px", color: "#ccc" }}></i>
          <p>No followers yet</p>
        </div>
      ) : (
        <div className="members-list">
          <div className="row">
            {followers.map((follower) => {
              const member = follower.followerData;
              if (!member) return null;
              const isFollowing = follower.meFollowed?.some((follow) => follow.myFollowing);

              return (
                <div key={follower._id} className="col-md-6 col-lg-4">
                  <MemberCard
                    member={member}
                    isFollowing={!!isFollowing}
                    onFollow={handleFollow}
                    onUnfollow={handleUnfollow}
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
