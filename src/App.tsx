import { useQuery } from '@apollo/client';
import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import AddBusiness from './components/AddBusiness';
import BusinessResults from './components/BusinessResults';
import DeleteBusiness from './components/DeleteBusiness';
import Profile from './components/Profile';
import Search from './components/Search';
import UpdateBusiness from './components/UpdateBusiness';
import { GET_BUSINESSES_QUERY } from './graphql/query';


function App() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const {loginWithRedirect, logout, isAuthenticated} = useAuth0(); 

  const { loading, error, data, refetch } = useQuery(GET_BUSINESSES_QUERY(isAuthenticated), {
    variables: { selectedCategory: selectedCategory === "All" ? "" : selectedCategory },
  });

  if (error) return <p>Error: {error.message}</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {
        !isAuthenticated && (
          <div>
            <button onClick={()=>loginWithRedirect()}>Login</button>
            <strong>Login To Add Review</strong>
          </div>
        )
      } 
      {
        isAuthenticated && (
          <button onClick={()=>logout()}>Logout</button>
        )
      }
      <Profile/>
      <h1>Business Search</h1>
      <form>
        <label>
          Select Business Category:
          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
            <option value="All">All</option>
            <option value="Library">Library</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Car Wash">Car Wash</option>
          </select>
        </label>
      </form>

      <Search />

      <BusinessResults businesses={data.businesses} refetch={refetch} />
      <AddBusiness refetch={refetch} />

      <UpdateBusiness refetch={refetch} />

      <DeleteBusiness refetch={refetch} />

    </div>
  );
}

export default App;