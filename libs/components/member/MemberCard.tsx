import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PersonRemoveAlt1Icon from "@mui/icons-material/PersonRemoveAlt1";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import IconButton from "@mui/material/IconButton";
import { useRouter } from "next/router";
import { useApolloClient, useReactiveVar } from "@apollo/client";
import { Member } from "@/libs/types/member/member";
import { getImageUrl } from "@/libs/imageHelper";
import { MemberType } from "@/libs/enums/member.enum";
import { GET_MEMBER } from "@/apollo/user/query";
import { useEffect, useState } from "react";
import { userVar } from "@/apollo/store";
import { canFollowMemberType } from "@/libs/utils/follow";

interface MemberCardProps {
  member: Member;
  isFollowing?: boolean;
  onFollow?: (memberId: string) => void;
  onUnfollow?: (memberId: string) => void;
  showActions?: boolean;
  isLiked?: boolean;
  onLike?: (memberId: string) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  isFollowing = false,
  onFollow,
  onUnfollow,
  showActions = true,
  isLiked = false,
  onLike,
}) => {
  const router = useRouter();
  const apolloClient = useApolloClient();
  const currentUser = useReactiveVar(userVar);
  const [clinicName, setClinicName] = useState<string>("");
  const imageSrc = member.memberImage
    ? getImageUrl(member.memberImage)
    : "/images/users/defaultUser.svg";

  const goToDetails = () => {
    if (!member?._id) return;
    router.push(`/member/${member._id}`);
  };

  const formatLabel = (value?: string) =>
    value
      ? value
          .toLowerCase()
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase())
      : "";

  const canStartFollow =
    !!currentUser?._id &&
    currentUser._id !== member._id &&
    canFollowMemberType(currentUser?.memberType, member.memberType);
  const showFollow = showActions && canStartFollow && !isFollowing && onFollow;
  const showUnfollow = showActions && isFollowing && onUnfollow;
  const showLike = showActions && onLike && currentUser?._id && currentUser._id !== member._id;
  const memberTypeLabel = formatLabel(member.memberType);
  const specializationLabel =
    member.memberType === MemberType.DOCTOR ? formatLabel(member.specialization) : "";
  const shouldShowClinic = member.memberType === MemberType.DOCTOR && !!member.clinicId;

  useEffect(() => {
    if (!shouldShowClinic || !member.clinicId) {
      setClinicName("");
      return;
    }

    let isMounted = true;
    const fetchClinicName = async () => {
      try {
        const { data } = await apolloClient.query({
          query: GET_MEMBER,
          variables: { targetId: member.clinicId },
          fetchPolicy: "cache-first",
        });
        if (isMounted) {
          setClinicName(data?.getMember?.memberFullName || member.clinicId || "");
        }
      } catch (error) {
        if (isMounted) {
          setClinicName(member.clinicId || "");
        }
      }
    };

    fetchClinicName();

    return () => {
      isMounted = false;
    };
  }, [apolloClient, member.clinicId, shouldShowClinic]);

  return (
    <Card
      className={`mypage-member-card${isFollowing ? " has-followed-badge" : ""}`}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        position: "relative",
      }}
      onClick={goToDetails}
    >
      {isFollowing && (
        <Stack
          className="followed-badge"
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: "#E8F5E9",
            color: "#2E7D32",
            borderRadius: "999px",
            px: 1.5,
            py: 0.5,
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            zIndex: 2,
          }}
        >
          Followed
        </Stack>
      )}
      <CardContent sx={{ flexGrow: 1, pt: isFollowing ? 5 : 2, pr: isFollowing ? 6 : 2 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar
            src={imageSrc}
            alt={member.memberFullName}
            sx={{ width: 72, height: 72 }}
          />
          <Stack spacing={0.5} sx={{ minWidth: 0 }}>
            <Typography variant="h6" noWrap>
              {member.memberFullName}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              @{member.memberNick}
            </Typography>
            {memberTypeLabel && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {memberTypeLabel}
              </Typography>
            )}
            {specializationLabel && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {specializationLabel}
              </Typography>
            )}
            {shouldShowClinic && clinicName && (
              <Typography variant="body2" color="text.secondary" noWrap>
                Clinic: {clinicName}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
      {(showFollow || showUnfollow || showLike) && (
        <CardActions sx={{ px: 2, pb: 2, justifyContent: "center" }}>
          <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
            {showLike && (
              <IconButton
                aria-label={isLiked ? "Unlike" : "Like"}
                onClick={(e) => {
                  e.stopPropagation();
                  onLike?.(member._id);
                }}
                color={isLiked ? "error" : "default"}
              >
                {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            )}
            {showFollow && (
              <IconButton
                aria-label="Follow"
                onClick={(e) => {
                  e.stopPropagation();
                  onFollow?.(member._id);
                }}
                color="primary"
              >
                <PersonAddAlt1Icon />
              </IconButton>
            )}
            {showUnfollow && (
              <IconButton
                aria-label="Unfollow"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnfollow?.(member._id);
                }}
                color="error"
              >
                <PersonRemoveAlt1Icon />
              </IconButton>
            )}
          </Stack>
        </CardActions>
      )}
    </Card>
  );
};

export default MemberCard;
