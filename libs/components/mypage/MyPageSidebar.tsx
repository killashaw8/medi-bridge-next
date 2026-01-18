import React from "react";
import { TabContext, TabList, TabPanel } from '@mui/lab';
import Tab from '@mui/material/Tab';
import { Box } from '@mui/material';
import { MemberType } from "@/libs/enums/member.enum";
import { MyPageSection } from "@/pages/mypage";
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArticleIcon from '@mui/icons-material/Article';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AddCircleIcon from '@mui/icons-material/AddCircle';

interface MyPageSidebarProps {
  activeSection: MyPageSection;
  onSectionChange: (section: MyPageSection) => void;
  userType: MemberType;
}

const MyPageSidebar: React.FC<MyPageSidebarProps> = ({
  activeSection,
  onSectionChange,
  userType,
}) => {
  const isDoctor = userType === MemberType.DOCTOR;
  const isClinic = userType === MemberType.CLINIC;
  const isDoctorOrClinic = isDoctor || isClinic;
  const isAdmin = userType === MemberType.ADMIN;

  const menuItems = [
    {
      id: "personal-info" as MyPageSection,
      label: "Personal Information",
      icon: <PersonIcon />,
      visible: true,
    },
    {
      id: "favorite-products" as MyPageSection,
      label: "Favorite Products",
      icon: <FavoriteIcon />,
      visible: !isAdmin,
    },
    {
      id: "favorite-articles" as MyPageSection,
      label: "Favorite Articles",
      icon: <BookmarkIcon />,
      visible: !isAdmin,
    },
    {
      id: "recently-visited" as MyPageSection,
      label: "Recently Visited",
      icon: <HistoryIcon />,
      visible: !isAdmin,
    },
    {
      id: "followers" as MyPageSection,
      label: "Followers",
      icon: <PeopleIcon />,
      visible: !isAdmin,
    },
    {
      id: "followings" as MyPageSection,
      label: "Followings",
      icon: <PersonAddIcon />,
      visible: !isAdmin,
    },
    {
      id: "my-articles" as MyPageSection,
      label: "My Articles",
      icon: <ArticleIcon />,
      visible: isDoctorOrClinic,
    },
    {
      id: "write-article" as MyPageSection,
      label: "Write Article",
      icon: <EditNoteIcon />,
      visible: isDoctorOrClinic,
    },
    {
      id: "my-products" as MyPageSection,
      label: "My Products",
      icon: <ShoppingBagIcon />,
      visible: isClinic,
    },
    {
      id: "add-product" as MyPageSection,
      label: "Add Product",
      icon: <AddCircleIcon />,
      visible: isClinic,
    },
  ];

  const visibleMenuItems = menuItems.filter((item) => item.visible);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    onSectionChange(newValue as MyPageSection);
  };

  return (
    <div className="widget-area">
      <div className="widget widget_search">
        <h3 className="widget-title">My Page Menu</h3>
        <TabContext value={activeSection}>
          <Box>
            <TabList
              orientation="vertical"
              aria-label="mypage navigation tabs"
              onChange={handleTabChange}
              TabIndicatorProps={{
                style: {
                  display: 'none',
                },
              }}
              sx={{
                '& .MuiTabs-flexContainer': {
                  flexDirection: 'column',
                  alignItems: 'stretch',
                },
                '& .MuiTab-root': {
                  minHeight: '48px',
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 400,
                  justifyContent: 'flex-start',
                  padding: '12px 16px',
                  color: '#666',
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 500,
                    border: '1px solid',
                    borderRadius: '10px',
                    borderColor: 'primary.main',
                  },
                  '&:hover': {
                    backgroundColor: '#fff',
                    borderRadius: '10px'
                  },
                },
              }}
            >
              {visibleMenuItems.map((item) => (
                <Tab
                  key={item.id}
                  value={item.id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Box>
                  }
                  iconPosition="start"
                />
              ))}
            </TabList>
          </Box>
        </TabContext>
      </div>
    </div>
  );
};

export default MyPageSidebar;
