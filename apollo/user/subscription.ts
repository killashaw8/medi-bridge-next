import { gql } from "@apollo/client";

export const MESSAGE_ADDED = gql`
  subscription MessageAdded($conversationId: String!) {
    messageAdded(conversationId: $conversationId) {
      _id
      conversationId
      senderId
      content
      readBy
      isDeleted
      editedAt
      deletedAt
      createdAt
      updatedAt
    }
  }
`;
