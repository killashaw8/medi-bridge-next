import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_ARTICLE, UPDATE_ARTICLE } from "@/apollo/user/mutation";
import { GET_ARTICLE } from "@/apollo/user/query";
import { ArticleInput } from "@/libs/types/article/article.input";
import { ArticleUpdate } from "@/libs/types/article/article.update";
import { ArticleCategory } from "@/libs/enums/article.enum";
import { sweetMixinSuccessAlert, sweetMixinErrorAlert } from "@/libs/sweetAlert";
import { CircularProgress, Box, Typography } from "@mui/material";

interface WriteArticleProps {
  articleId?: string;
  onSuccess?: () => void;
}

const WriteArticle: React.FC<WriteArticleProps> = ({ articleId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    articleCategory: ArticleCategory.BLOG,
    articleTitle: "",
    articleContent: "",
    articleImage: "",
  });

  const isEditing = !!articleId;

  const { data: articleData, loading: articleLoading } = useQuery(GET_ARTICLE, {
    variables: { input: articleId },
    skip: !articleId,
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (articleData?.getArticle) {
      const article = articleData.getArticle;
      setFormData({
        articleCategory: article.articleCategory,
        articleTitle: article.articleTitle,
        articleContent: article.articleContent,
        articleImage: article.articleImage || "",
      });
    }
  }, [articleData]);

  const [createArticle] = useMutation(CREATE_ARTICLE);
  const [updateArticle] = useMutation(UPDATE_ARTICLE);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        const updateInput: ArticleUpdate = {
          _id: articleId!,
          ...formData,
        };
        await updateArticle({
          variables: { input: updateInput },
        });
        await sweetMixinSuccessAlert("Article updated successfully!");
      } else {
        const createInput: ArticleInput = {
          articleCategory: formData.articleCategory as ArticleCategory,
          articleTitle: formData.articleTitle.trim(),
          articleContent: formData.articleContent.trim(),
          articleImage: formData.articleImage || undefined,
        };
        await createArticle({
          variables: { input: createInput },
        });
        await sweetMixinSuccessAlert("Article created successfully!");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Article error:", error);
      await sweetMixinErrorAlert(
        error.message || `Failed to ${isEditing ? "update" : "create"} article. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  if (articleLoading) {
    return (
      <Box sx={{ textAlign: "center", padding: "40px" }}>
        <CircularProgress />
        <Typography sx={{ marginTop: 2 }}>Loading article...</Typography>
      </Box>
    );
  }

  return (
    <div className="mypage-section">
      <div className="section-header">
        <h2>{isEditing ? "Edit Article" : "Write New Article"}</h2>
        <p>{isEditing ? "Update your article" : "Share your knowledge with the community"}</p>
      </div>

      <form onSubmit={handleSubmit} className="article-form">
        <div className="form-group">
          <label>Category <span>*</span></label>
          <select
            name="articleCategory"
            className="form-control form-select"
            value={formData.articleCategory}
            onChange={handleChange}
            required
            disabled={loading}
          >
            {Object.values(ArticleCategory).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Title <span>*</span></label>
          <input
            type="text"
            name="articleTitle"
            className="form-control"
            value={formData.articleTitle}
            onChange={handleChange}
            placeholder="Enter article title"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Image URL</label>
          <input
            type="url"
            name="articleImage"
            className="form-control"
            value={formData.articleImage}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Content <span>*</span></label>
          <textarea
            name="articleContent"
            className="form-control"
            rows={15}
            value={formData.articleContent}
            onChange={handleChange}
            placeholder="Write your article content here..."
            required
            disabled={loading}
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="submit" className="default-btn" disabled={loading}>
            {loading ? (isEditing ? "Updating..." : "Publishing...") : (isEditing ? "Update Article" : "Publish Article")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WriteArticle;

