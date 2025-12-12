import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { GET_MEMBER_FOLLOWERS } from "@/apollo/user/query";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { FollowInquiry } from "@/libs/types/follow/follow.input";
import { Follower } from "@/libs/types/follow/follow";
import { getImageUrl } from "@/libs/imageHelper";
import { CircularProgress, Box, Typography } from "@mui/material";

const Followers: React.FC = () => {
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

  const { data, loading, error } = useQuery(GET_MEMBER_FOLLOWERS, {
    variables: { input },
    skip: !user?._id,
    fetchPolicy: "cache-and-network",
  });

  const followers: Follower[] = data?.getMemberFollowers?.list || [];
  const total = data?.getMemberFollowers?.metaCounter?.[0]?.total || 0;

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", padding: "40px" }}>
        <CircularProgress />
        <Typography sx={{ marginTop: 2 }}>Loading followers...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", padding: "40px" }}>
        <Typography color="error">Error loading followers</Typography>
      </Box>
    );
  }

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

              return (
                <div key={follower._id} className="col-md-6 col-lg-4">
                  <div className="member-card">
                    <Link href={`/member/${member._id}`}>
                      <div className="member-avatar">
                        <Image
                          src={getImageUrl(member.memberImage) || "/images/users/defaultUser.svg"}
                          alt={member.memberFullName}
                          width={80}
                          height={80}
                          style={{ borderRadius: "50%", objectFit: "cover" }}
                        />
                      </div>
                      <div className="member-info">
                        <h3>{member.memberFullName}</h3>
                        <p className="member-nick">@{member.memberNick}</p>
                        {member.memberDesc && (
                          <p className="member-desc">{member.memberDesc.substring(0, 100)}...</p>
                        )}
                        <div className="member-stats">
                          <span>
                            <i className="ri-article-line"></i>
                            {member.memberArticles}
                          </span>
                          <span>
                            <i className="ri-user-follow-line"></i>
                            {member.memberFollowers}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
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

