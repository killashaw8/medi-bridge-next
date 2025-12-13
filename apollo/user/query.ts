import { gql } from '@apollo/client';


/**************************
 *         MEMBER         *
 *************************/

export const GET_MEMBER = gql`
  query GetMember($targetId: ID!, $includeLocation: Boolean = false) {
    getMember(targetId: $targetId) {
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
      location @include(if: $includeLocation)
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
      refreshToken
      telegramId
      googleId
      kakaoId
      naverId
      clinicId
      specialization
      meLiked {
        memberId
        likeRefId
        myFavorite
      }
      meFollowed {
        followingId
        followerId
        myFollowing
      }
    }
  }
`;

export const GET_DOCTORS = gql`
  query GetDoctors($input: DoctorsInquiry!) {
    getDoctors(input: $input) {
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
        accessToken
        refreshToken
        telegramId
        googleId
        kakaoId
        naverId
        clinicId
        specialization
        meLiked {
          memberId
          likeRefId
          myFavorite
        }
        meFollowed {
					followingId
					followerId
					myFollowing
				}
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_CLINICS = gql`
  query GetClinics($input: ClinicsInquiry!) {
    getClinics(input: $input) {
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
        accessToken
        refreshToken
        telegramId
        googleId
        kakaoId
        naverId
        clinicId
        specialization
        meLiked {
          memberId
          likeRefId
          myFavorite
        }
        meFollowed {
					followingId
					followerId
					myFollowing
				}
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


export const GET_PRODUCT = gql`
  query GetProduct($productId: ID!) {
    getProduct(productId: $productId) {
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
      memberData {
        _id
        memberNick
        memberFullName
        memberType
        memberStatus
        memberImage
        memberDesc
      }
      meLiked {
        memberId
        likeRefId
        myFavorite
      }
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts($input: ProductsInquiry!) {
    getProducts(input: $input) {
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
        memberData {
          _id
          memberNick
          memberFullName
          memberType
          memberStatus
          memberImage
          memberDesc
        }
        meLiked {
          memberId
          likeRefId
          myFavorite
        }
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_CLINIC_PRODUCTS = gql`
  query GetClinicProducts($input: ClinicProductsInquiry!) {
    getClinicProducts(input: $input) {
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
        meLiked {
					memberId
					likeRefId
					myFavorite
				}
      }
      metaCounter {
        total
      }
    }
  }
`;

export const LIKE_TARGET_PRODUCT = gql`
  mutation LikeTargetProduct($input: String!) {
    likeTargetProduct(productId: $input) {
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

export const GET_VIEWED = gql`
  query GetViewed($input: OrdinaryInquiry!) {
    getViewed(input: $input) {
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

export const GET_FAVORITES = gql`
  query GetFavorites($input: OrdinaryInquiry!) {
    getFavorites(input: $input) {
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


/******************************
 *         APPOINTMENT        *
 ******************************/


export const GET_AVAILABLE_SLOTS = gql`
  query GetAvailableSlots($input: DoctorSlotsInput!) {
    getAvailableSlots(input: $input) {
      list {
        time
        free
      }
    }
  }
`;


/**************************
 *         ARTICLE        *
 *************************/


export const GET_ARTICLE = gql`
  query GetArticle($input: String!) {
    getArticle(articleId: $input) {
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
      memberData {
        _id
        memberNick
        memberFullName
        memberType
        memberStatus
        memberImage
        memberDesc
      }
      meLiked {
        memberId
        likeRefId
        myFavorite
      }
    }
  }
`;

export const GET_ARTICLES = gql`
  query GetArticles($input: ArticlesInquiry!) {
    getArticles(input: $input) {
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
        memberData {
          _id
          memberNick
          memberFullName
          memberType
          memberStatus
          memberImage
          memberDesc
        }
        meLiked {
          memberId
          likeRefId
          myFavorite
        }
      }
      metaCounter {
        total
      }
    }
  }
`;

export const LIKE_TARGET_ARTICLE = gql`
  mutation LikeTargetArticle($input: String!) {
    likeTargetArticle(articleId: $input) {
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


export const GET_COMMENTS = gql`
  query GetComments($input: CommentsInquiry!) {
    getComments(input: $input) {
      list {
        _id
        commentStatus
        commentGroup
        commentContent
        commentRefId
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
 *         FOLLOW        *
 *************************/


export const GET_MEMBER_FOLLOWINGS = gql`
  query GetMemberFollowings($input: FollowInquiry!) {
    getMemberFollowings(input: $input) {
      list {
        _id
        followingId
        followerId
        createdAt
        updatedAt
        meLiked {
          memberId
          likeRefId
          myFavorite
        }
        meFollowed {
          followingId
          followerId
          myFollowing
        }
        followingData {
          _id
          memberNick
          memberFullName
          memberImage
          memberDesc
          memberAppointments
          memberArticles
          memberFollowers
          memberFollowings
          memberPoints
          memberLikes
          memberViews
          memberComments
        }
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_MEMBER_FOLLOWERS = gql`
  query GetMemberFollowers($input: FollowInquiry!) {
    getMemberFollowers(input: $input) {
      list {
        _id
        followingId
        followerId
        createdAt
        updatedAt
        meLiked {
          memberId
          likeRefId
          myFavorite
        }
        meFollowed {
          followingId
          followerId
          myFollowing
        }
        followerData {
          _id
          memberNick
          memberFullName
          memberImage
          memberDesc
          memberAppointments
          memberArticles
          memberFollowers
          memberFollowings
          memberPoints
          memberLikes
          memberViews
          memberComments
        }
      }
      metaCounter {
        total
      }
    }
  }
`;
