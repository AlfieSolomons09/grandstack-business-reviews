import { useQuery } from "@apollo/client";
import { BusinessType } from "../types/types";
import { useState } from "react";
import { FUZZY_BUSINESS_QUERY } from "../graphql/query";

const Search = () => {

  const [search, setSearch] = useState("");

  const [searchString, setSearchString] = useState("");

  const { loading: searchLoading, error: searchError, data: searchData } = useQuery(FUZZY_BUSINESS_QUERY, {
    variables: { searchString: searchString }
  })

  if(searchError) {
    console.log(searchError.message)
    return <div>searchError</div>
  }
  if (searchLoading) return <div>loading</div>

  const submitHandler = async () => {
    setSearchString(search)
  }
  return (
    <div>
      <input placeholder='Search Business' required type='text' value={search} onChange={(event) => setSearch(event.target.value)} />
      <button onClick={submitHandler}>Search</button>

      <div>
        {searchData.businesses[0].fuzzyBusinessName.map((business: BusinessType, i: number) => (
          <div key={i}>
            {business.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Search