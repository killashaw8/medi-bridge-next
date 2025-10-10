import { ArticleCategory, ArticleStatus } from "@/libs/enums/article.enum";


export interface ArticleUpdate {
	_id: string;
	articleStatus?: ArticleStatus;
	articleCategory?: ArticleCategory;
	articleTitle?: string;
	articleContent?: string;
	articleImage?: string;
}
