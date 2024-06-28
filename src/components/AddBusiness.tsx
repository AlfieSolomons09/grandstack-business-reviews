import { useMutation } from '@apollo/client';
import { ChangeEvent, FormEvent, useState } from 'react';
import { ADD_BUSINESS } from '../graphql/mutation';

const AddBusiness = ({refetch}: {refetch: ()=>void}) => {
    const [newBusiness, setNewBusiness] = useState({
        businessId: "",
        name: "",
        address: "",
        city: "",
        state: "",
      })

      const [createBusiness, { data: addNewBusiness, loading: addingBusiness, error: addBusinessError }] = useMutation(ADD_BUSINESS);

      const addBusiness = async (event: FormEvent) => {
        event.preventDefault();
        try {
          const { data } = await createBusiness({
            variables: {
              input: {
                businessId: newBusiness.businessId,
                name: newBusiness.name,
                address: newBusiness.address,
                city: newBusiness.city,
                state: newBusiness.state,
                location: { latitude: 37.567109, longitude: -122.323680 },
              },
            },
          });
    
          console.log("Business added successfully", data);
          refetch();
        } catch (error) {
          console.error("Error adding business:", error);
        }
      };
    
      const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewBusiness({
          ...newBusiness,
          [name]: value
        });
      };
  return (
    <div>
      <h1>Add New Business</h1>
      <form onSubmit={addBusiness}>
        <input type='text' name='businessId' placeholder='Business ID' value={newBusiness.businessId} onChange={handleChange}></input>
        <input type='text' name='name' placeholder='Business Name' value={newBusiness.name} onChange={handleChange}></input>
        <input type='text' name='address' placeholder='Business Address' value={newBusiness.address} onChange={handleChange}></input>
        <input type='text' name='city' placeholder='City' value={newBusiness.city} onChange={handleChange}></input>
        <input type='text' name='state' placeholder='State' value={newBusiness.state} onChange={handleChange}></input>
        <button type='submit'>Add New Business</button>
      </form>

      {addingBusiness && <p>Adding New Business</p>}
      {addBusinessError && <p>Error: {addBusinessError.message}</p>}
      {addNewBusiness && <p>New Business added: {newBusiness.name}</p>}
    </div>
  )
}

export default AddBusiness
