import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PersonRemoveAlt1Icon from "@mui/icons-material/PersonRemoveAlt1";
import { useRouter } from "next/router";
import { useApolloClient } from "@apollo/client";
import { Member } from "@/libs/types/member/member";
import { getImageUrl } from "@/libs/imageHelper";
import { MemberType } from "@/libs/enums/member.enum";
import { GET_MEMBER } from "@/apollo/user/query";
import { useEffect, useState } from "react";

interface MemberCardProps {
  member: Member;
  isFollowing?: boolean;
  onFollow?: (memberId: string) => void;
  onUnfollow?: (memberId: string) => void;
  showActions?: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  isFollowing = false,
  onFollow,
  onUnfollow,
  showActions = true,
}) => {
  const router = useRouter();
  const apolloClient = useApolloClient();
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

  const showFollow = showActions && !isFollowing && onFollow;
  const showUnfollow = showActions && isFollowing && onUnfollow;
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
      className="mypage-member-card"
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
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
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
      {(showFollow || showUnfollow) && (
        <CardActions sx={{ px: 2, pb: 2 }}>
          {showFollow && (
            <Button
              variant="contained"
              startIcon={<PersonAddAlt1Icon />}
              onClick={(e) => {
                e.stopPropagation();
                onFollow?.(member._id);
              }}
            >
              Follow
            </Button>
          )}
          {showUnfollow && (
            <Button
              variant="contained"
              color="error"
              startIcon={<PersonRemoveAlt1Icon />}
              onClick={(e) => {
                e.stopPropagation();
                onUnfollow?.(member._id);
              }}
            >
              Unfollow
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
};

export default MemberCard;
