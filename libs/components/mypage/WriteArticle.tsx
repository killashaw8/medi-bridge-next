import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_ARTICLE, IMAGE_UPLOADER, UPDATE_ARTICLE } from "@/apollo/user/mutation";
import { GET_ARTICLE } from "@/apollo/user/query";
import { ArticleInput } from "@/libs/types/article/article.input";
import { ArticleUpdate } from "@/libs/types/article/article.update";
import { ArticleCategory } from "@/libs/enums/article.enum";
import { sweetMixinSuccessAlert, sweetMixinErrorAlert } from "@/libs/sweetAlert";
import { CircularProgress, Box, Typography, Button } from "@mui/material";
const TuiEditor = dynamic(() => import("../common/Teditor"), {
  ssr: false,
  loading: () => (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <CircularProgress size={24} />
      <Typography variant="body2" sx={{ marginTop: 1 }}>
        Loading editor...
      </Typography>
    </div>
  ),
});


interface WriteArticleProps {
  articleId?: string;
  onSuccess?: () => void;
}

const WriteArticle: React.FC<WriteArticleProps> = ({ articleId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const editorRef = useRef<any>(null);
  const [formData, setFormData] = useState({
    articleCategory: ArticleCategory.BLOG,
    articleTitle: "",
    articleContent: "",
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
      });
      // Populate editor when data arrives
      setTimeout(() => {
        const instance = editorRef.current?.getInstance?.();
        if (instance && article.articleContent) {
          instance.setHTML(article.articleContent);
        }
      }, 0);
    }
  }, [articleData]);

  const [createArticle] = useMutation(CREATE_ARTICLE);
  const [updateArticle] = useMutation(UPDATE_ARTICLE);
  const [uploadImage] = useMutation(IMAGE_UPLOADER);

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
      const articleContent =
        editorRef.current?.getInstance?.().getHTML?.() || formData.articleContent || "";

      if (!formData.articleTitle.trim()) {
        await sweetMixinErrorAlert("Please enter an article title");
        setLoading(false);
        return;
      }

      if (!articleContent || articleContent.trim() === '' || articleContent === '<p><br></p>') {
        await sweetMixinErrorAlert("Please enter article content");
        setLoading(false);
        return;
      }

      if (isEditing) {
        const updateInput: ArticleUpdate = {
          _id: articleId!,
          articleCategory: formData.articleCategory as ArticleCategory,
          articleTitle: formData.articleTitle.trim(),
          articleContent: articleContent,
        };
        await updateArticle({
          variables: { input: updateInput },
        });
        await sweetMixinSuccessAlert("Article updated successfully!");
      } else {
        const createInput: ArticleInput = {
          articleCategory: formData.articleCategory as ArticleCategory,
          articleTitle: formData.articleTitle.trim(),
          articleContent: articleContent,
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

      <div className="article-form-content" style={{ padding: "30px 0" }}>
        <form onSubmit={handleSubmit} className="article-form">
          <div className="row" style={{ gap: "20px 0" }}>
            <div className="col-md-6" style={{ padding: "0 15px" }}>
              <div className="form-group" style={{ marginBottom: "25px" }}>
                <label style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}>
                  Category <span style={{ color: "#f44336" }}>*</span>
                </label>
                <select
                  name="articleCategory"
                  className="form-control form-select"
                  value={formData.articleCategory}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={{
                    padding: "12px 15px",
                    borderRadius: "5px",
                    border: "1px solid #e0e0e0",
                    width: "100%",
                    backgroundColor: "#fff",
                  }}
                >
                  {Object.values(ArticleCategory).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-md-6" style={{ padding: "0 15px" }}>
              <div className="form-group" style={{ marginBottom: "25px" }}>
                <label style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}>
                  Title <span style={{ color: "#f44336" }}>*</span>
                </label>
                <input
                  type="text"
                  name="articleTitle"
                  className="form-control"
                  value={formData.articleTitle}
                  onChange={handleChange}
                  placeholder="Enter article title"
                  required
                  disabled={loading}
                  style={{
                    padding: "12px 15px",
                    borderRadius: "5px",
                    border: "1px solid #e0e0e0",
                    width: "100%",
                  }}
                />
              </div>
            </div>

            <div className="col-md-12" style={{ padding: "0 15px" }}>
              <div className="form-group" style={{ marginBottom: "25px" }}>
                <label style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}>
                  Content <span style={{ color: "#f44336" }}>*</span>
                </label>
                <div style={{ border: "1px solid #e0e0e0", borderRadius: "5px", overflow: "hidden" }}>
                  <TuiEditor ref={editorRef} />
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: "30px", display: "flex", justifyContent: "flex-end", gap: "15px" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              onClick={handleSubmit}
              sx={{
                backgroundColor: '#336AEA',
                '&:hover': {
                  backgroundColor: '#2856c7',
                },
                padding: '12px 30px',
                fontSize: '16px',
                fontWeight: 500,
                textTransform: 'none',
                minWidth: '150px',
              }}
            >
              {loading ? (isEditing ? "Updating..." : "Publishing...") : (isEditing ? "Update Article" : "Publish Article")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriteArticle;
