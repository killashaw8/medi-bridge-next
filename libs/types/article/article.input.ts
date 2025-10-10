import { ArticleCategory, ArticleStatus } from "@/libs/enums/article.enum";
import { Direction } from "@/libs/enums/common.enum";


export interface ArticleInput {
	articleCategory: ArticleCategory;
	articleTitle: string;
	articleContent: string;
	articleImage?: string;
}

interface AISearch {
	articleCategory?: ArticleCategory;
	text?: string;
	memberId?: string;
}

export interface ArticlesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: AISearch;
}

interface AAISearch {
	articleStatus?: ArticleStatus;
	articleCategory?: ArticleCategory;
}

export interface AllArticlesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: AAISearch;
}
