import React, { useState, useRef, useMemo, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useRouter } from "next/router";
import { ArticleCategory } from "@/libs/enums/article.enum";
import { ArticlesInquiry } from "@/libs/types/article/article.input";
import { useMutation, useQuery } from "@apollo/client";
import { GET_ARTICLES, LIKE_TARGET_ARTICLE } from "@/apollo/user/query";
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Article, } from "@/libs/types/article/article";
import { T } from "@/libs/types/common";
import { Box, Pagination, Stack } from "@mui/material";
import Tab from '@mui/material/Tab';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from "@/libs/sweetAlert";
import { Messages } from "@/libs/config";
import BlogCard from "./BlogCard";

interface BlogClassicProps {
  initialInput?: ArticlesInquiry;
}

const BlogClassic = (props: BlogClassicProps) => {
  const { initialInput } = props;
  const router = useRouter();
  const blogAreaRef = useRef<HTMLDivElement>(null);
	const { query } = router;
	const articleCategory = query?.articleCategory as string;
	const [articles, setArticles] = useState<Article[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);

  // Default input if not provided
  const defaultInput: ArticlesInquiry = {
    page: 1,
    limit: 6,
    sort: 'createdAt',
    direction: "DESC",
    search: {
      articleCategory: ArticleCategory.BLOG,
    },
  };

  const [searchArticles, setSearchArticles] = useState<ArticlesInquiry>(() => {
    const baseInput = initialInput || defaultInput;
    // Ensure search object exists
    const baseSearch = baseInput.search || { articleCategory: ArticleCategory.BLOG };
    // If articleCategory is in query, update the search
    if (articleCategory && (articleCategory === ArticleCategory.BLOG || articleCategory === ArticleCategory.NEWS)) {
      return {
        ...baseInput,
        search: {
          ...baseSearch,
          articleCategory: articleCategory as ArticleCategory,
        },
      };
    }
    return {
      ...baseInput,
      search: baseSearch,
    };
  });
  
  
  
  // APOLLO Requests
  const [likeTargetArticle] = useMutation(LIKE_TARGET_ARTICLE);

  const { 
    loading: getArticlesLoading,
    data: getArticlesData,  
    error: getArticlesError,
    refetch: articlesRefetch,
  } = useQuery(GET_ARTICLES, {
    fetchPolicy: "cache-and-network",
    variables: { input: searchArticles },
    notifyOnNetworkStatusChange: true,
  });

	/** LIFECYCLES **/
	useEffect(() => {
		if (!query?.articleCategory)
			router.push(
				{
					pathname: router.pathname,
					query: { articleCategory: 'NEWS' },
				},
				router.pathname,
				{ shallow: true },
			);
	}, []);

  useEffect(() => {
    if (articleCategory && (articleCategory === ArticleCategory.NEWS || articleCategory === ArticleCategory.BLOG)) {
      setSearchArticles(prev => ({
        ...prev,
        page: 1,
        search: {
          ...prev.search,
          articleCategory: articleCategory as ArticleCategory,
        },
      }));
    }
  }, [articleCategory]);

  useEffect(() => {
    setArticles(getArticlesData?.getArticles?.list || []);
    setTotalCount(getArticlesData?.getArticles?.metaCounter?.[0]?.total || 0);
  }, [getArticlesData]);


  /** HANDLERS **/
	const tabChangeHandler = async (e: T, value: string) => {
		console.log(value);

		setSearchArticles({ ...searchArticles, page: 1, search: { articleCategory: value as ArticleCategory } });
		await router.push(
			{
				pathname: '/article',
				query: { articleCategory: value },
			},
			router.pathname,
			{ shallow: true },
		);
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchArticles({ ...searchArticles, page: value });
	};

	const likeArticleHandler = async (e: any, user: any, id: string) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetArticle({
				variables: {
					input: id
				}
			});
			await articlesRefetch({ input: searchArticles });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};   
  
  // Function to scroll to top of blog area
  const scrollToTop = () => {
    if (blogAreaRef.current) {
      blogAreaRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  return (
    <>
      <div ref={blogAreaRef} className="blog-area ptb-140">
        <Stack className="container">
          <TabContext value={searchArticles.search?.articleCategory}>
            <Stack className="blog-view row justify-content-center g-4">
              <Stack className="left col-xl-8 col-md-12">
                <Stack className="row justify-content-center g-4">
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }} className="blog-tablist">
                    <TabList
                      orientation="horizontal"
                      aria-label="basic tabs example"
                      TabIndicatorProps={{
                        style: { display: 'none' },
                      }}
                      onChange={tabChangeHandler}
                      centered
                    >
                      <Tab
                        value={'NEWS'}
                        label={'News'}
                        className={`tab-button ${searchArticles.search?.articleCategory == 'NEWS' ? 'active' : ''}`}
                      />    
                      <Tab
                        value={'BLOG'}
                        label={'Blog'}
                        className={`tab-button ${searchArticles.search?.articleCategory == 'BLOG' ? 'active' : ''}`}
                      />                                 
                    </TabList>
                  </Box>

                  <TabPanel value="NEWS">
                    {totalCount ? (
                      articles.map((article: Article) => {
                        return (
                          <BlogCard 
                            article={article}
                            key={article._id}
                            likeArticleHandler={likeArticleHandler}
                          />
                        );
                      })
                    ) : (
                      <Stack className={'no-data'}>
                        <img src="/images/icons/icoAlert.svg" alt="" />
                        <p>No Article found!</p>
                      </Stack>
                    )}
                  </TabPanel>
                  <TabPanel value="BLOG">
                    {totalCount ? (
                      articles.map((article: Article) => {
                        return (
                          <BlogCard 
                            article={article}
                            key={article._id}
                            likeArticleHandler={likeArticleHandler}
                          />
                        );
                      })
                    ) : (
                      <Stack className={'no-data'}>
                        <img src="/images/icons/icoAlert.svg" alt="" />
                        <p>No Article found!</p>
                      </Stack>
                    )}
                  </TabPanel>
                  
                  {/* Conditionally render pagination */}
                  {totalCount > 0 && (
                    <Stack direction="row" justifyContent="center">
                      <Pagination
                        count={Math.ceil(totalCount / searchArticles.limit)}
                        page={searchArticles.page}
                        shape="rounded"
                        variant="outlined"
                        size="large"
                        color="primary"
                        onChange={paginationHandler}
                      />
                    </Stack>
                  )}
                </Stack>
              </Stack>
              
              <div className="col-xl-4 col-md-12">
                <Sidebar 
                  searchFilter={searchArticles}
                  setSearchFilter={setSearchArticles}
                  initialInput={defaultInput}
                />
              </div>
            </Stack>
          </TabContext>
        </Stack>
      </div>
    </>
  );
};

BlogClassic.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'ASC',
		search: {
			articleCategory: 'FREE',
		},
	},
};

export default BlogClassic;
