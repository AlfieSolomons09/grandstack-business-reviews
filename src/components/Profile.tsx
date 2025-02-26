import { useAuth0 } from "@auth0/auth0-react";

const Profile = () =>{
    const {user, isAuthenticated} = useAuth0();

    // console.log(user?.picture)
    return (
        <div>
        {isAuthenticated && (
            <div style={{padding: "10px"}}>
                <img
                    src={user?.picture}
                    alt="User Avatar"
                    style={{width: "40px"}}
                />
                <strong>{user?.name}</strong>
            </div>
        )}
        </div>
    )
}

export default Profile;