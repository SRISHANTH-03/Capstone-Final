import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { useAuth } from "../store/authStore";

import {
  articleCardClass,
  articleTitle,
  articleExcerpt,
  articleMeta,
  ghostBtn,
  loadingClass,
  errorClass,
  emptyStateClass,
  articleStatusActive,
  articleStatusDeleted,
  userInfoContainer,
  userNameText,
  userActionBtnBase,
  userActionBtnActive,
  userActionBtnInactive,
} from "../styles/common";

function AuthorList() {
  const navigate = useNavigate();
  const user = useAuth((state) => state.currentUser);

  const [userList, setuserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log("user in author profile",user)
  
  useEffect(() => {
    if (!user) return;

    const getUsersList = async () => {
     
      try {
        setLoading(true)
       //read articles of current author
       let res = await axios.get("http://localhost:4000/admin-api/authors",{withCredentials:true})
       if(res.status === 200){
        setuserList(res.data.payload)
       }
       //update articles state

      } catch (err) {
        console.log(err);
        setError(err.response?.data?.error || "Failed to fetch Users List");
      } finally {
        setLoading(false);
      }
    };

    getUsersList();
  }, [user]);

  const userDelORactivate = async (user) => {
    try{
      setLoading(true)
      let res = await axios.patch("http://localhost:4000/admin-api/user",
        {
          "userId": user._id,
          "isUserActive": !user.isUserActive
        }
        ,{withCredentials:true})
        if (res.status === 200) {
      setuserList((prev) =>
        prev.map((u) =>
          u._id === user._id
            ? { ...u, isUserActive: !u.isUserActive }
            : u
        )
      );
    }
    }catch (err) {
      console.log(err);
      setError("Failed to update user");
    }finally{
      setLoading(false)
    }
  };

  if (loading) return <p className={loadingClass}>Loading users...</p>;
  if (error) return <p className={errorClass}>{error}</p>;

  if (userList.length === 0) {
    return <div className={emptyStateClass}>No users.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {userList.map((user) => (
        <div key={user._id} className={`${articleCardClass} relative flex flex-col rounded-3xl`}>
          <div className={userInfoContainer}>
            <p className={userNameText}>
              {user.firstName}
              {/* Status Badge */}
              <span className={user.isUserActive? articleStatusActive : articleStatusDeleted}>
                {
                user.isUserActive ? "ACTIVE" : "DELETED"
                }
              </span>
            </p>
            <button className={`${userActionBtnBase} ${user.isUserActive? userActionBtnActive : userActionBtnInactive}`} onClick={() => userDelORactivate(user)}>
              {user.isUserActive ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AuthorList