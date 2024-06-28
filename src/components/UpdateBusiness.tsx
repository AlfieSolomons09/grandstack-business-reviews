import { useMutation } from "@apollo/client";
import { FormEvent, useState } from "react";
import { UPDATE_BUSINESS } from "../graphql/mutation";

const UpdateBusiness = ({refetch}: {refetch: ()=>void} ) => {
    const [updateBusiness, { data: updatedBusiness, loading: updatingBusiness, error: updateBusinessError }] = useMutation(UPDATE_BUSINESS)

    const [businessId, setBusinessId] = useState("")
    const [category, setCategory] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");


    const handleUpdateBusiness = async (event: FormEvent) => {
        event.preventDefault();

        try {
            const { data } = await updateBusiness({
                variables: ({
                    where: { businessId: businessId },
                    connect: { categories: { where: { node: { name: category } } } },
                    update: {address: address, name: name}
                })
            })

            console.log("Business updated Successfully")
            refetch();
        } catch (error) {
            console.error("Error adding business:", error);
        }
    }

    return (
        <div>
            <h1>Update Business</h1>
            <form onSubmit={handleUpdateBusiness}>
                <input type="text" required placeholder='Business Id' name='businessId' value={businessId} onChange={(e) => setBusinessId(e.target.value)} />
                <input type="text" required placeholder='Category' name='category' value={category} onChange={(e) => setCategory(e.target.value)} />
                <input type="text" required placeholder="Address" name="address" value={address} onChange={(e)=>setAddress(e.target.value)} />
                <input type="text" required placeholder="Name" name="name" value={name} onChange={(e)=>setName(e.target.value)} />
                <button typeof='submit'>Update</button>
            </form>

            {updatingBusiness && <p>Updating New Business</p>}
            {updateBusinessError && <p>Error: {updateBusinessError.message}</p>}
            {updatedBusiness && <p>Business Successfully Updated</p>}
        </div>
    )
}

export default UpdateBusiness;
