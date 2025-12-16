import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_ARTICLE, UPDATE_ARTICLE } from "@/apollo/user/mutation";
import { GET_ARTICLE } from "@/apollo/user/query";
import { ArticleInput } from "@/libs/types/article/article.input";
import { ArticleUpdate } from "@/libs/types/article/article.update";
import { ArticleCategory } from "@/libs/enums/article.enum";
import { sweetMixinSuccessAlert, sweetMixinErrorAlert } from "@/libs/sweetAlert";
import { CircularProgress, Box, Typography, Button } from "@mui/material";
import { getImageUrl } from "@/libs/imageHelper";
import { getJwtToken } from "@/libs/auth";
import { REACT_APP_API_URL } from "@/libs/config";
import { useRouter } from "next/router";
import axios from "axios";
import '@toast-ui/editor/dist/toastui-editor.css';

// Import Editor directly (no dynamic import - following nestar-next pattern)
// We'll handle SSR with conditional rendering
let Editor: any = null;
if (typeof window !== 'undefined') {
  Editor = require('@toast-ui/react-editor').Editor;
}

interface WriteArticleProps {
  articleId?: string;
  onSuccess?: () => void;
}

const WriteArticle: React.FC<WriteArticleProps> = ({ articleId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const editorRef = useRef<any>(null); // Direct ref to Editor (like nestar-next)
  const router = useRouter();
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
    fetchPolicy: "network-only",
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
      
      // Set editor content when data loads (like nestar-next pattern)
      if (editorRef.current && article.articleContent) {
        setTimeout(() => {
          const instance = editorRef.current?.getInstance?.();
          if (instance) {
            instance.setHTML(article.articleContent);
          }
        }, 100);
      }
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

  // Image upload handler (from nestar-next)
  const uploadImage = async (image: any) => {
    try {
      const token = getJwtToken();
      const formData = new FormData();
      formData.append(
        'operations',
        JSON.stringify({
          query: `mutation ImageUploader($file: Upload!, $target: String!) {
            imageUploader(file: $file, target: $target) 
          }`,
          variables: {
            file: null,
            target: 'article',
          },
        }),
      );
      formData.append(
        'map',
        JSON.stringify({
          '0': ['variables.file'],
        }),
      );
      formData.append('0', image);

      const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'apollo-require-preflight': true,
          Authorization: `Bearer ${token}`,
        },
      });

      const responseImage = response.data.data.imageUploader;
      const fullUrl = `${REACT_APP_API_URL}${responseImage}`;
      
      // Update article image in formData (for preview)
      setFormData((prev) => ({
        ...prev,
        articleImage: fullUrl,
      }));
      
      return fullUrl;
    } catch (err) {
      console.log('Error, uploadImage:', err);
      throw err;
    }
  };

  // Extract first image from editor content
  const extractFirstImageFromContent = (html: string): string => {
    if (!html) return "";
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return imgMatch && imgMatch[1] ? imgMatch[1] : "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get content directly from editor (like nestar-next pattern)
      const editor = editorRef.current;
      const articleContent = editor?.getInstance().getHTML() as string || "";

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

      // Extract first image from content if articleImage is not set
      let articleImage = formData.articleImage || "";
      if (!articleImage) {
        articleImage = extractFirstImageFromContent(articleContent);
      }

      if (isEditing) {
        const updateInput: ArticleUpdate = {
          _id: articleId!,
          articleCategory: formData.articleCategory as ArticleCategory,
          articleTitle: formData.articleTitle.trim(),
          articleContent: articleContent.trim(),
          articleImage: articleImage || undefined,
        };
        await updateArticle({
          variables: { input: updateInput },
        });
        await sweetMixinSuccessAlert("Article updated successfully!");
      } else {
        const createInput: ArticleInput = {
          articleCategory: formData.articleCategory as ArticleCategory,
          articleTitle: formData.articleTitle.trim(),
          articleContent: articleContent.trim(),
          articleImage: articleImage || undefined,
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

  // Don't render editor on server side
  if (typeof window === 'undefined' || !Editor) {
    return (
      <Box sx={{ textAlign: "center", padding: "40px" }}>
        <CircularProgress />
        <Typography sx={{ marginTop: 2 }}>Loading editor...</Typography>
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
                  Article Image
                </label>
                <div className="article-image-preview" style={{ 
                  minHeight: "200px", 
                  border: "1px solid #e0e0e0", 
                  borderRadius: "5px", 
                  padding: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f9f9f9"
                }}>
                  {formData.articleImage ? (
                    <img
                      src={
                        formData.articleImage.startsWith("http")
                          ? formData.articleImage
                          : getImageUrl(formData.articleImage)
                      }
                      alt="Article Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "300px",
                        borderRadius: "5px",
                        objectFit: "contain"
                      }}
                    />
                  ) : (
                    <span style={{ color: "#999", fontStyle: "italic" }}>
                      No image uploaded yet. Upload an image inside the editor to set a preview.
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "25px" }}>
                <label style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}>
                  Content <span style={{ color: "#f44336" }}>*</span>
                </label>
                <div style={{ border: "1px solid #e0e0e0", borderRadius: "5px", overflow: "hidden" }}>
                  {/* Render editor only on client side */}
                  {typeof window !== 'undefined' && Editor && (
                    <Editor
                      ref={editorRef}
                      initialValue={isEditing && formData.articleContent ? formData.articleContent : 'Type here'}
                      placeholder={''}
                      previewStyle={'vertical'}
                      height={'640px'}
                      // @ts-ignore
                      initialEditType={'WYSIWYG'}
                      toolbarItems={[
                        ['heading', 'bold', 'italic', 'strike'],
                        ['hr', 'quote'],
                        ['ul', 'ol', 'task', 'indent', 'outdent'],
                        ['table', 'image', 'link'],
                        ['code', 'codeblock'],
                      ]}
                      hooks={{
                        addImageBlobHook: async (image: any, callback: any) => {
                          try {
                            const uploadedImageURL = await uploadImage(image);
                            callback(uploadedImageURL);

                            // Normalize preview URL (api already returns full URL, but guard just in case)
                            const previewUrl = uploadedImageURL.startsWith('http')
                              ? uploadedImageURL
                              : `${REACT_APP_API_URL}/${uploadedImageURL}`;

                            // Update preview immediately when image is uploaded
                            setFormData((prev) => ({
                              ...prev,
                              articleImage: previewUrl,
                            }));
                            
                            return false;
                          } catch (error) {
                            console.error('Image upload failed:', error);
                            await sweetMixinErrorAlert('Failed to upload image. Please try again.');
                          }
                        },
                      }}
                      events={{
                        load: function (param: any) {
                          // Set initial content when editing
                          if (isEditing && formData.articleContent) {
                            setTimeout(() => {
                              const instance = editorRef.current?.getInstance?.();
                              if (instance) {
                                instance.setHTML(formData.articleContent);
                              }
                            }, 100);
                          }
                        },
                      }}
                    />
                  )}
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
