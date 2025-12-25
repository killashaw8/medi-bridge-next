import { gql } from '@apollo/client';


/**************************
 *         MEMBER         *
 *************************/


export const SIGN_UP = gql`
  mutation Signup($input: MemberInput!) {
    signup(input: $input) {
      _id
      memberType
      memberStatus
      authProvider
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
      clinicId
      specialization
      refreshToken
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      _id
      memberType
      memberStatus
      authProvider
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
      clinicId
      specialization
      refreshToken
    }
  }
`;

export const UPDATE_MEMBER = gql`
  mutation UpdateMember($input: MemberUpdate!) {
    updateMember(input: $input) {
      _id
      memberType
      memberStatus
      authProvider
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
      clinicId
      specialization
    }
  }
`;

export const LIKE_TARGET_MEMBER = gql`
  mutation LikeTargetMember($input: String!) {
    likeTargetMember(memberId: $input) {
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
    }
  }
`;


/***************************
 *         PRODUCT         *
 **************************/


export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
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

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($input: ProductUpdate!) {
    updateProduct(input: $input) {
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
      createdAt
      updatedAt
      soldAt
      deletedAt
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


/**************************
 *          ORDER         *
 *************************/


export const CREATE_ORDER = gql`
  mutation CreateOrder($input: OrderItemInput!) {
    createOrder(input: $input) {
      _id
      orderTotal
      orderDelivery
      orderAddress
      orderStatus
      memberId
      createdAt
      updatedAt
      orderItems {
        _id
        itemQuantity
        itemPrice
        orderId
        productId
        createdAt
        updatedAt
      }
      productData {
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
  }
`;

export const UPDATE_ORDER = gql`
  mutation UpdateOrder($input: OrderUpdateInput!) {
    updateOrder(input: $input) {
      _id
      orderTotal
      orderDelivery
      orderAddress
      orderStatus
      memberId
      createdAt
      updatedAt
      orderItems {
        _id
        itemQuantity
        itemPrice
        orderId
        productId
        createdAt
        updatedAt
      }
      productData {
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
  }
`;

export const UPDATE_ORDER_ITEM = gql`
  mutation UpdateOrderItem($input: OrderItemUpdateInput!) {
    updateOrderItem(input: $input) {
      _id
      orderTotal
      orderDelivery
      orderAddress
      orderStatus
      memberId
      createdAt
      updatedAt
      orderItems {
        _id
        itemQuantity
        itemPrice
        orderId
        productId
        createdAt
        updatedAt
      }
      productData {
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
  }
`;


/******************************
 *         APPOINTMENT        *
 ******************************/


export const BOOK_APPOINTMENT = gql`
  mutation BookAppointment($input: AppointmentInput!) {
    bookAppointment(input: $input) {
      _id
      date
      time
      status
      channel
      doctorId
      clinicId
      patientId
      createdAt
      updatedAt
    }
  }
`;

export const CANCEL_APPOINTMENT = gql`
  mutation CancelAppointment($input: CancelAppointmentInput!) {
    cancelAppointment(input: $input) {
      _id
      date
      time
      status
      channel
      note
      doctorId
      clinicId
      patientId
      createdAt
      updatedAt
    }
  }
`;

export const RESCHEDULE_APPOINTMENT = gql`
  mutation RescheduleAppointment($input: RescheduleAppointmentInput!) {
    rescheduleAppointment(input: $input) {
      _id
      date
      time
      status
      channel
      note
      doctorId
      clinicId
      patientId
      createdAt
      updatedAt
      doctor {
        _id
        memberNick
        memberFullName
        memberImage
        specialization
      }
      clinic {
        _id
        memberNick
        memberFullName
        location
      }
      patient {
        _id
        memberNick
        memberFullName
        memberImage
      }
    }
  }
`;

export const HOLD_APPOINTMENT_SLOT = gql`
  mutation HoldAppointmentSlot($input: HoldSlotInput!) {
    holdAppointmentSlot(input: $input)
  }
`;

export const RELEASE_APPOINTMENT_SLOT = gql`
  mutation ReleaseAppointmentSlot($input: HoldSlotInput!) {
    releaseAppointmentSlot(input: $input)
  }
`;


/**************************
 *         ARTICLE        *
 *************************/


export const CREATE_ARTICLE = gql`
  mutation CreateArticle($input: ArticleInput!) {
    createArticle(input: $input) {
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

export const UPDATE_ARTICLE = gql`
  mutation UpdateArticle($input: ArticleUpdate!) {
    updateArticle(input: $input) {
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


export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CommentInput!) {
    createComment(input: $input) {
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

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($input: CommentUpdate!) {
    updateComment(input: $input) {
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


/**************************
 *         FOLLOW        *
 *************************/


export const SUBSCRIBE = gql`
  mutation Subscribe($input: String!) {
    subscribe(input: $input) {
      _id
      followingId
      followerId
      createdAt
      updatedAt
    }
  }
`;

export const UNSUBSCRIBE = gql`
  mutation Unsubscribe($input: String!) {
    unsubscribe(input: $input) {
      _id
      followingId
      followerId
      createdAt
      updatedAt
    }
  }
`;


/*******************************
 *         AI-ASSISTANT        *
 ******************************/


export const ASK_AI = gql`
  mutation AskAI($input: AskAiInput!) {
    askAI(input: $input) {
      reply
    }
  }
`;


/***************************
 *         UPLOADER        *
 **************************/


export const IMAGE_UPLOADER = gql`
  mutation ImageUploader($file: Upload!, $target: String!) {
    imageUploader(file: $file, target: $target)
  }
`;
