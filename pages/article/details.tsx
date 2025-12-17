import BlogDetails from "@/libs/components/blog/BlogDetails";
import SubscribeForm from "@/libs/components/blog/SubscribeForm";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import PageBanner from "@/libs/components/layout/PageBanner";
import { GET_ARTICLE } from "@/apollo/user/query";
import { Article } from "@/libs/types/article/article";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";


const ArticleDetails: NextPage = () => {
  const router = useRouter();
  const { articleId } = router.query;
  const targetId = Array.isArray(articleId) ? articleId[0] : articleId;

  const { data, loading } = useQuery(GET_ARTICLE, {
    variables: { input: targetId || "" },
    skip: !targetId,
    fetchPolicy: "cache-and-network",
  });

  const article = data?.getArticle as Article | undefined;
  const bannerTitle = article?.articleTitle || "Article Details";

  return (
    <>

      <PageBanner
        pageTitle={bannerTitle}
        shortText="Enjoy reading."
        homePageUrl="/"
        homePageText="Home"
        activePageText="Article Details"
        image="/images/page-banner.png"
      />

      <BlogDetails article={article} loading={!router.isReady || loading} />

      <SubscribeForm />
    </>
  );
}

export default withLayoutBasic(ArticleDetails);
