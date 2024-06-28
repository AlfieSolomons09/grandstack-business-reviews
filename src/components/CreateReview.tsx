import { useAuth0 } from "@auth0/auth0-react";
import { FormEvent, useState } from "react";
import { ADD_REVIEWS } from "../graphql/mutation";
import { useMutation } from "@apollo/client";
import { BusinessType } from "../types/types";

interface ReviewProps {
    business: BusinessType,
    refetch: () => void
}

const CreateReview = (props: ReviewProps) => {
    const {business} = props
    const {refetch} = props
    const [stars, setStars] = useState("1.0")
    const [businessId, setBusinessId] = useState<String>("")

    const { user } = useAuth0();

    const [addReview, { data: reviewData, loading: addingReview, error: reviewError }] = useMutation(
        ADD_REVIEWS
    )

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const currentDate = new Date().toISOString().split('T')[0]
            console.log(currentDate)
            const { data } = await addReview({
                variables: {
                    input: [{
                        business: {
                            connect: { where: { node: { businessId: businessId } } }
                        },
                        date: currentDate,
                        stars: parseFloat(stars),
                        reviewId: user?.sub,
                        user: { connect: { where: { node: { userId: user?.sub } } } }
                    }]
                }
            });
            console.log(user?.sub)
            console.log("data after submitting review", data)
            refetch();
        } catch (error) {
            console.log("user sub:", user?.sub)
            console.log("error: ", error)
        }
    }

    return (
        <td>
            <form onSubmit={handleSubmit}>
                <select
                    onChange={(event) => {
                        setStars(event.target.value)
                        setBusinessId(business.businessId)
                    }}
                >
                    <option>Select</option>
                    <option value="1.0">1</option>
                    <option value="2.0">2</option>
                    <option value="3.0">3</option>
                    <option value="4.0">4</option>
                    <option value="5.0">5</option>
                </select>
                <button type="submit">Add Review</button>
            </form>
            {reviewData && <strong>Review added successfully</strong>}
        </td>
    )
}

export default CreateReview