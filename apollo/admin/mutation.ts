import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/


export const UPDATE_MEMBER_BY_ADMIN = gql`
  mutation UpdateMemberByAdmin($input: MemberUpdate!) {
    updateMemberByAdmin(input: $input) {
      _id
      memberType
      memberStatus
      authProvider
      memberEmail
      memberPhone
      memberNick
      memberFullName
      memberImage
      memberAddress
      memberDesc
      memberAppointments
      memberArticles
      memberFollowers
      memberFollowings
      memberPoints
      memberLikes
      memberViews
      memberComments
      memberRank
      memberWarnings
      memberBlocks
      deletedAt
      createdAt
      updatedAt
      accessToken
      telegramId
      googleId
      kakaoId
      naverId
      clinicId
      specialization
    }
  }
`;


/***************************
 *         PRODUCT         *
 **************************/


export const UPDATE_PRODUCT_BY_ADMIN = gql`
  mutation UpdateProductByAdmin($input: ProductUpdate!) {
    updateProductByAdmin(input: $input) {
      _id
      productType
      productCollection
      productStatus
      productTitle
      productPrice
      productCount
      productViews
      productLikes
      productComments
      productImages
      productDesc
      memberId
      soldAt
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_PRODUCT_BY_ADMIN = gql`
  mutation RemoveProductByAdmin($input: String!) {
    removeProductByAdmin(productId: $input) {
      _id
      productType
      productCollection
      productStatus
      productTitle
      productPrice
      productCount
      productViews
      productLikes
      productComments
      productImages
      productDesc
      memberId
      soldAt
      deletedAt
      createdAt
      updatedAt
    }
  }
`;


/**************************
 *         ARTICLE        *
 *************************/


export const UPDATE_ARTICLE_BY_ADMIN = gql`
  mutation UpdateArticleByAdmin($input: ArticleUpdate!) {
    updateArticleByAdmin(input: $input) {
      _id
      articleCategory
      articleStatus
      articleTitle
      articleContent
      articleImage
      articleViews
      articleLikes
      articleComments
      memberId
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_ARTICLE_BY_ADMIN = gql`
  mutation RemoveArticleByAdmin($input: String!) {
    removeArticleByAdmin(articleId: $input) {
      _id
      articleCategory
      articleStatus
      articleTitle
      articleContent
      articleImage
      articleViews
      articleLikes
      articleComments
      memberId
      createdAt
      updatedAt
    }
  }
`;


/**************************
 *         COMMENT        *
 *************************/


export const REMOVE_COMMENT_BY_ADMIN = gql`
  mutation RemoveCommentByAdmin($input: String!) {
    removeCommentByAdmin(commentId: $input) {
      _id
      commentStatus
      commentGroup
      commentContent
      commentRefId
      memberId
      createdAt
      updatedAt
    }
  }
`;
