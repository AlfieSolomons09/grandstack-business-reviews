import { gql } from "@apollo/client";
import { User } from "@auth0/auth0-react";

export const ADD_BUSINESS = gql`
  mutation CreateBusiness($input: [BusinessCreateInput!]!) {
    createBusinesses(input: $input) {
      businesses {
        businessId
        name
        address
        city
      }
      info {
        nodesCreated
      }
    }
  }
`;

export const UPDATE_BUSINESS = gql`
  mutation UpdateBusinesses($where: BusinessWhere, $connect: BusinessConnectInput, $update: BusinessUpdateInput){
    updateBusinesses(where: $where, connect: $connect, update: $update){
      businesses {
        name
        address
        categories{
          name
        }
      }
      info{
        relationshipsCreated
      }
    }
  }
`

export const DELETE_BUSINESS = gql`
  mutation DeleteBusiness($where: BusinessWhere){
    deleteBusinesses(where: $where){
      nodesDeleted
    }
  }
`

export const ADD_REVIEWS = gql`
  mutation CreateReviews($input: [ReviewCreateInput!]!) {
    createReviews(
      input: $input
    ) {
      info{
        nodesCreated
      }
    }
  }
`;

