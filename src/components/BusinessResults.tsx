import { useAuth0 } from "@auth0/auth0-react";
import { starredVar } from "..";
import { BusinessType } from "../types/types";
import CreateReview from "./CreateReview";

interface props {
    businesses: BusinessType[],
    refetch: ()=>void
}

const BusinessResults = (props: props) => {
    const {refetch} = props
    const { businesses } = props;
    const starredItems = starredVar();

    const { isAuthenticated } = useAuth0();

    return (
        <div>
            <h2>Results</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Category</th>
                        {isAuthenticated ? <th>Average Stars</th> : null}
                        {isAuthenticated ? <th>Review</th> : null}
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {businesses.map((b, i) => (
                        <tr key={i}>
                            <td style={b.isStarred ? { fontWeight: "bold" } : {}}>{b.name}</td>
                            <td>{b.address}</td>
                            <td>
                                {b.categories.reduce(
                                    (acc, c, i) => acc + (i === 0 ? " " : ", ") + c.name,
                                    ""
                                )}
                            </td>
                            {isAuthenticated ? <td>{b.averageStars}</td> : null}
                            {isAuthenticated && <CreateReview business={b} refetch={refetch}/>}
                            <td>
                                <button onClick={() => {
                                    if (b.isStarred) {
                                        starredVar(
                                            starredItems.filter((i) => {
                                                return i !== b.businessId
                                            })
                                        )
                                    } else {
                                        starredVar([...starredItems, b.businessId])
                                    }
                                }}>{b.isStarred ? "Unstar" : "Star"}</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default BusinessResults
