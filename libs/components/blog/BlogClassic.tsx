import React, { useState, useRef, useMemo, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useRouter } from "next/router";
import { ArticleCategory } from "@/libs/enums/article.enum";
import { ArticlesInquiry } from "@/libs/types/article/article.input";
import { useMutation, useQuery } from "@apollo/client";
import { GET_ARTICLES, LIKE_TARGET_ARTICLE } from "@/apollo/user/query";
import { Article, } from "@/libs/types/article/article";
import { T } from "@/libs/types/common";
import { Pagination, Stack, } from "@mui/material";
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
		onCompleted: (data: T) => {
			setArticles(data?.getArticles?.list);
			setTotalCount(data?.getArticles?.metaCounter[0]?.total)
		}
  });

	/** LIFECYCLES **/
	useEffect(() => {
		if (!query?.articleCategory)
			router.push(
				{
					pathname: router.pathname,
					query: { articleCategory: 'BLOG' },
				},
				router.pathname,
				{ shallow: true },
			);
	}, []);

  useEffect(() => {
    if (articleCategory && (articleCategory === ArticleCategory.BLOG || articleCategory === ArticleCategory.NEWS)) {
      setSearchArticles(prev => ({
        ...prev,
        page: 1, // Reset to first page when category changes
        search: {
          ...prev.search,
          articleCategory: articleCategory as ArticleCategory,
        },
      }));
    }
  }, [articleCategory]);


  /** HANDLERS **/
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
      <Stack ref={blogAreaRef} className="blog-area ptb-140">
        <Stack className="container">
          <Stack className="blog-view row justify-content-center g-4">
            <Stack className="col-xl-8 col-md-12">
              <Stack className="row justify-content-center g-4">
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
                
                {/* Conditionally render pagination */}
                {totalCount > 0 && (
                  <Stack className="col-lg-12 col-md-12">
                    <Stack className="pagination-area">
                      <Pagination
                        count={Math.ceil(totalCount / searchArticles.limit)}
                        page={searchArticles.page}
                        shape="circular"
                        color="primary"
                        onChange={paginationHandler}
                      />
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </Stack>
            
            <Stack className="col-xl-4 col-md-12">
              <Sidebar 
                searchFilter={searchArticles}
                setSearchFilter={setSearchArticles}
                initialInput={defaultInput}
              />
            </Stack>
          </Stack>
        </Stack>
      </Stack>
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