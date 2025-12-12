import { NextPage } from "next";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import PageBanner from "@/libs/components/layout/PageBanner";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import MyPageSidebar from "@/libs/components/mypage/MyPageSidebar";
import PersonalInfo from "@/libs/components/mypage/PersonalInfo";
import FavoriteProducts from "@/libs/components/mypage/FavoriteProducts";
import FavoriteArticles from "@/libs/components/mypage/FavoriteArticles";
import RecentlyVisited from "@/libs/components/mypage/RecentlyVisited";
import Followers from "@/libs/components/mypage/Followers";
import Followings from "@/libs/components/mypage/Followings";
import MyArticles from "@/libs/components/mypage/MyArticles";
import WriteArticle from "@/libs/components/mypage/WriteArticle";
import MyProducts from "@/libs/components/mypage/MyProducts";
import AddProduct from "@/libs/components/mypage/AddProduct";
import EditProduct from "@/libs/components/mypage/EditProduct";
import { MemberType } from "@/libs/enums/member.enum";
import { sweetMixinErrorAlert } from "@/libs/sweetAlert";

export type MyPageSection = 
  | "personal-info"
  | "favorite-products"
  | "favorite-articles"
  | "recently-visited"
  | "followers"
  | "followings"
  | "my-articles"
  | "write-article"
  | "my-products"
  | "add-product"
  | "edit-product";

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

const MyPage: NextPage = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [activeSection, setActiveSection] = useState<MyPageSection>("personal-info");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    if (!user?._id) {
      sweetMixinErrorAlert("Please login to access your page");
      router.push("/login");
      return;
    }

    // Check for section query parameter
    if (router.query.section) {
      setActiveSection(router.query.section as MyPageSection);
    }
  }, [router, user]);

  const handleSectionChange = (section: MyPageSection) => {
    setActiveSection(section);
    router.push(`/mypage?section=${section}`, undefined, { shallow: true });
  };

  const handleEditProduct = (productId: string) => {
    setEditingProductId(productId);
    setActiveSection("edit-product");
    router.push(`/mypage?section=edit-product&productId=${productId}`, undefined, { shallow: true });
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "personal-info":
        return <PersonalInfo />;
      case "favorite-products":
        return <FavoriteProducts />;
      case "favorite-articles":
        return <FavoriteArticles />;
      case "recently-visited":
        return <RecentlyVisited />;
      case "followers":
        return <Followers />;
      case "followings":
        return <Followings />;
      case "my-articles":
        return <MyArticles />;
      case "write-article":
        return <WriteArticle onSuccess={() => handleSectionChange("my-articles")} />;
      case "my-products":
        return <MyProducts onEdit={handleEditProduct} />;
      case "add-product":
        return <AddProduct onSuccess={() => handleSectionChange("my-products")} />;
      case "edit-product":
        return (
          <EditProduct
            productId={editingProductId || (router.query.productId as string)}
            onSuccess={() => handleSectionChange("my-products")}
          />
        );
      default:
        return <PersonalInfo />;
    }
  };

  if (!user?._id) {
    return null; // Will redirect
  }

  return (
    <>
      <PageBanner
        pageTitle="My Page"
        shortText="Manage your profile, favorites, and content"
        homePageUrl="/"
        homePageText="Home"
        activePageText="My Page"
        image="/images/page-banner.png"
      />

      <div className="mypage-area ptb-140">
        <div className="container">
          <div className="row">
            {/* Sidebar */}
            <div className="col-xl-3 col-lg-4">
              <MyPageSidebar
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                userType={user.memberType as MemberType}
              />
            </div>

            {/* Main Content */}
            <div className="col-xl-9 col-lg-8">
              <div className="mypage-content">
                {renderActiveSection()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default withLayoutBasic(MyPage);

