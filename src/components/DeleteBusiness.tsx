import { useMutation } from "@apollo/client";
import { FormEvent, useState } from "react";
import { DELETE_BUSINESS } from "../graphql/mutation";

const DeleteBusiness = ({ refetch }: { refetch: () => void }) => {
    const [businessId, setBusinessId] = useState("");
    const [deleteBusiness, { data: deletedBusiness, loading: deletingBusinesss, error: deleteBusinessError }] = useMutation(DELETE_BUSINESS)
    const handleDelete = async (event: FormEvent) => {
        event.preventDefault()

        try {
            const { data } = await deleteBusiness({
                variables: { where: { businessId: businessId } }
            })

            console.log("Business Deleted successfully");
            setBusinessId("")
            refetch();
        } catch (error) {
            console.error("Error deleting business", error);
        }
    }

    return (
        <div>
            <h1>Delete Business</h1>
            <form onSubmit={handleDelete}>
                <input type="text" placeholder='Business ID' name='businessId' value={businessId} onChange={(e) => setBusinessId(e.target.value)} />
                <button type='submit'>Delete</button>
            </form>

            {deletingBusinesss && <p>Deleting Business</p>}
            {deleteBusinessError && <p>Erorr deleting Business: {deleteBusinessError.message}</p>}
            {deletedBusiness && <p>Business Deleted Successfully</p>}
        </div>
    )
}

export default DeleteBusiness