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


/**************************
 *         COMMENT        *
 *************************/


export const GET_ALL_COMMENTS_BY_ADMIN = gql`
  query GetAllCommentsByAdmin($input: AdminCommentsInquiry!) {
    getAllCommentsByAdmin(input: $input) {
      list {
        _id
        commentStatus
        commentGroup
        commentContent
        commentRefId
        memberId
        memberData {
          _id
          memberNick
          memberFullName
          memberImage
        }
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
 *         STATS          *
 *************************/


export const GET_ADMIN_DASHBOARD_STATS = gql`
  query GetAdminDashboardStats($input: AdminStatsInput) {
    getAdminDashboardStats(input: $input) {
      period
      visitors {
        total
        memberVisitors
        nonMemberVisitors
      }
      members {
        total
        active
        blocked
      }
      sales {
        totalRevenue
        totalOrders
        totalItems
      }
      appointments {
        count
        topClinics {
          memberId
          name
          count
        }
        topDoctors {
          memberId
          name
          count
        }
      }
    }
  }
`;
