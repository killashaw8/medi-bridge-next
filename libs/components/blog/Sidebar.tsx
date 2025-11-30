import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArticlesInquiry } from "@/libs/types/article/article.input";
import { IconButton, Stack, Tooltip } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';


interface SidebarProps {
  searchFilter?: ArticlesInquiry | any;
	setSearchFilter?: any;
	initialInput?: ArticlesInquiry;
}

const Sidebar = ( props: SidebarProps ) => {
  const { searchFilter, setSearchFilter, initialInput } = props;
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>('');


	const refreshHandler = async () => {
		try {
			setSearchText('');
			await router.push(
				`/blog?input=${JSON.stringify(initialInput)}`,
				`/blog?input=${JSON.stringify(initialInput)}`,
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

  const popularPosts = [
    {
      id: 1,
      imageSrc: "/images/blog/blog1.jpg",
      date: "June 5, 2025",
      title: "5 Signs You Should See a Doctor Virtually",
      slug: "/blogs/details",
    },
    {
      id: 2,
      imageSrc: "/images/blog/blog2.jpg",
      date: "May 28, 2025",
      title: "Understanding Cold vs. Flu Symptoms",
      slug: "/blogs/details",
    },
    {
      id: 3,
      imageSrc: "/images/blog/blog3.jpg",
      date: "May 12, 2025",
      title: "How Telemedicine Supports Working Parents",
      slug: "/blogs/details",
    },
  ];

  const widgetBoxData = {
    image: {
      src: "/images/mdbrdg_large.png",
      alt: "Experience Virtual Care",
    },
    description: "Experience Virtual Care Today",
    buttonText: "Register Now - It's Free",
    buttonLink: "/signup",
    shapeImage: {
      src: "/images/shape.png",
      alt: "Decorative shape",
    },
  };

  const categories = [
    { name: "Blogs", link: "/blog" },
    { name: "News", link: "/news" },
  ];

  const tags = [
    { name: "VirtualCare", link: "/blog" },
    { name: "MentalHealth", link: "/blog" },
    { name: "OnlineTherapy", link: "/blog" },
    { name: "ChronicCare", link: "/blog" },
    { name: "HealthTips", link: "/blog" },
    { name: "FamilyCare", link: "/blog" },
  ];

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
            <button type="submit">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <mask
                  id="mask0_10040_10702"
                  style={{ maskType: "luminance" }}
                  maskUnits="userSpaceOnUse"
                  x="1"
                  y="1"
                  width="22"
                  height="22"
                >
                  <path
                    d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <path opacity="0.5" d="M20 20L22 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </mask>
                <g mask="url(#mask0_10040_10702)">
                  <path d="M0 0H24V24H0V0Z" fill="#336AEA" />
                </g>
              </svg>
            </button>
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
        {popularPosts.slice(0, 3).map((post) => (
          <article key={post.id} className="item">
            <Link href={post.slug} className="thumb">
              <Image src={post.imageSrc} alt={post.title} width={85} height={85} />
            </Link>
            <div className="info">
              <span>{post.date}</span>
              <h4 className="title usmall">
                <Link href={post.slug}>{post.title}</Link>
              </h4>
            </div>
          </article>
        ))}
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

      {/* Categories Widget */}
      <div className="widget widget_categories">
        <h3 className="widget-title">Categories</h3>
        <ul className="list">
          {categories.map((category, index) => (
            <li key={index}>
              <Link href={category.link}>{category.name}</Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags Widget */}
      <div className="widget widget_tag_cloud">
        <h3 className="widget-title">Tags</h3>
        <div className="tag-cloud">
          {tags.map((tag, index) => (
            <Link key={index} href={tag.link}>
              {tag.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
