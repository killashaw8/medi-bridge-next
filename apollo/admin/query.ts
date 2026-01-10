import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/


export const GET_ALL_MEMBERS_BY_ADMIN = gql`
  query GetAllMembersByAdmin($input: MembersInquiry!) {
    getAllMembersByAdmin(input: $input) {
      list {
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
        telegramId
        googleId
        kakaoId
        naverId
        clinicId
        specialization
      }
      metaCounter {
        total
      }
    }
  }
`;


/***************************
 *         PRODUCT         *
 **************************/


export const GET_ALL_PRODUCTS_BY_ADMIN = gql`
  query GetAllProductsByAdmin($input: AllProductsInquiry!) {
    getAllProductsByAdmin(input: $input) {
      list {
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
      metaCounter {
        total
      }
    }
  }
`;


/**************************
 *         ARTICLE        *
 *************************/


export const GET_ARTICLES_BY_ADMIN = gql`
  query GetArticlesByAdmin($input: AllArticlesInquiry!) {
    getArticlesByAdmin(input: $input) {
      list {
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
      metaCounter {
        total
      }
    }
  }
`;
