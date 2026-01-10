import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { ArticlesInquiry } from "@/libs/types/article/article.input";
import { GET_ARTICLES } from "@/apollo/user/query";
import { Article } from "@/libs/types/article/article";
import { IconButton, Stack, Tooltip, } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import Moment from 'react-moment';
import { getImageUrl } from "@/libs/imageHelper";
import SearchIcon from '@mui/icons-material/Search';


interface SidebarProps {
  searchFilter?: ArticlesInquiry | any;
	setSearchFilter?: any;
	initialInput?: ArticlesInquiry;
}

const Sidebar = ( props: SidebarProps ) => {
  const { searchFilter, setSearchFilter, initialInput } = props;
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>('');

  // Fetch popular articles (most viewed)
  
  const popularArticlesInput: ArticlesInquiry = {
    page: 1,
    limit: 3,
    sort: 'articleViews',
    direction: "DESC",
    search: {
    },
  };

  const { data: popularArticlesData, loading: popularLoading, error: popularError } = useQuery(GET_ARTICLES, {
    variables: { input: popularArticlesInput },
    fetchPolicy: "cache-and-network",
  });

  const popularPosts: Article[] = popularArticlesData?.getArticles?.list || [];

  // Debug logging
  useEffect(() => {
    if (popularArticlesData) {
      console.log('Popular Articles Data:', popularArticlesData);
      console.log('Popular Posts:', popularPosts);
    }
    if (popularError) {
      console.error('Popular Articles Error:', popularError);
    }
 }, [popularArticlesData, popularPosts, popularError]);

	const refreshHandler = async () => {
		try {
			setSearchText('');
			await router.push(
        {
          pathname: '/article',
          query: { input: JSON.stringify(initialInput) },
        },
        undefined,
        { scroll: false },
      );
		} catch (err: any) {
			console.log('ERROR, refreshHandler:', err);
		}
	};

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (setSearchFilter && searchFilter) {
      setSearchFilter({
        ...searchFilter,
        page: 1,
        search: {
          ...searchFilter.search,
          text: searchText.trim() || undefined,
        },
      });
    }
  };


  // Dynamic data objects
  const searchData = {
    title: "Search",
    placeholder: "Search keywords",
  };

  const widgetBoxData = {
    image: {
      src: "/images/mdbrdg_large.png",
      alt: "Experience Virtual Care",
    },
    description: "Experience Virtual Care Today",
    buttonText: "Make Appointment - It's Free",
    buttonLink: "/makeAppointment",
    shapeImage: {
      src: "/images/shape.png",
      alt: "Decorative shape",
    },
  };

  return (
    <div className="widget-area">
      {/* Search Widget */}
      <div className="widget widget_search">
        <h3 className="widget-title">{searchData.title}</h3>
        <Stack className="searchbar">
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              name="q"
              className="form-control"
              placeholder={searchData.placeholder}
              onChange={(e: any) => setSearchText(e.target.value)}
              onKeyDown={(event: any) => {
                if (event.key == "Enter") {
                  event.preventDefault();
                  handleSearch(event);
                }
              }}
            />
            <IconButton 
              aria-label="search"
              type="submit"
            >
              <SearchIcon/>
            </IconButton>
          </form>
          <Tooltip className={"refresh"} title="Reset">
            <IconButton onClick={refreshHandler}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </div>

      {/* Popular Posts Widget */}
      <div className="widget widget_posts_thumb">
        <h3 className="widget-title">Popular Posts</h3>
        {popularLoading ? (
          <div className="sidebar-status">
            Loading...
          </div>
        ) : popularError ? (
          <div className="sidebar-status is-error">
            Error loading posts
          </div>
        ) : popularPosts.length > 0 ? (
          popularPosts.map((post: Article) => (
            <article key={post._id} className="item">
              <Link
                href={{
                  pathname: '/article/details',
                  query: { articleId: post._id },
                }}
                className="thumb"
              >
                <Image 
                  src={getImageUrl(post.articleImage) || '/images/blog/blog1.jpg'} 
                  alt={post.articleTitle} 
                  width={85} 
                  height={85}
                  className="sidebar-thumb"
                />
              </Link>
              <div className="info">
                <span>
                  <Moment format={'MMM DD, YYYY'}>
                    {post.createdAt}
                  </Moment>
                </span>
                <h4 className="title usmall">
                  <Link
                    href={{
                      pathname: '/article/details',
                      query: { articleId: post._id },
                    }}
                  >
                    {post.articleTitle}
                  </Link>
                </h4>
              </div>
            </article>
          ))
        ) : (
          <div className="sidebar-status">
            No popular posts available
          </div>
        )}
      </div>

      {/* Widget Box */}
      <div className="widget widget_box">
        <div className="image">
          <Image src={widgetBoxData.image.src} alt={widgetBoxData.image.alt} width={120} height={120} />
        </div>
        <p>{widgetBoxData.description}</p>
        <Link href={widgetBoxData.buttonLink} className="link-btn">
          {widgetBoxData.buttonText}
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="14" viewBox="0 0 13 14" fill="none">
            <path
              d="M12.5 0.0117188H0.5C0.224 0.0117188 0 0.235719 0 0.511719C0 0.787719 0.224 1.01172 0.5 1.01172H11.2928L0.1465 12.1582C-0.04875 12.3535 -0.04875 12.67 0.1465 12.8652C0.24425 12.963 0.372 13.0117 0.5 13.0117C0.628 13.0117 0.756 12.963 0.8535 12.8652L12 1.71872V12.5117C12 12.7877 12.224 13.0117 12.5 13.0117C12.776 13.0117 13 12.7877 13 12.5117V0.511719C13 0.235719 12.776 0.0117188 12.5 0.0117188Z"
              fill="white"
            />
          </svg>
        </Link>
        <div className="shape">
          <Image src={widgetBoxData.shapeImage.src} alt={widgetBoxData.shapeImage.alt} width={165} height={128} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
