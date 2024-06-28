import { gql } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";

export const BUSINESS_DETAILS_FRAGMENT = gql`
  fragment businessDetails on Business {
    businessId
    name
    address
    categories {
      name
    }
  }
`;

export const GET_BUSINESSES_QUERY = (isAuthenticated: boolean) => ( gql`
  query BusinessesByCategory($selectedCategory: String!) {
    businesses(where: { categories_SOME: { name_CONTAINS: $selectedCategory } }) {
      ...businessDetails
      ${isAuthenticated ? "averageStars" : ""}
      isStarred @client
    }
  }
  ${BUSINESS_DETAILS_FRAGMENT}
`
)

export const FUZZY_BUSINESS_QUERY = gql`
  query FuzzyBusinessName($searchString: String){
    businesses{
      fuzzyBusinessName(searchString: $searchString){
        name
      }
    }
  }
`