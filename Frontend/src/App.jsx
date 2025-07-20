import { react, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Messages from "./pages/Messages.jsx";
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import Verification from "./pages/auth/Verification.jsx";
import Layout from "./layout/index.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import { useSelector } from "react-redux";
import { connectSocket, disconnectSocket } from "./utils/socket.js";
import { useDispatch } from "react-redux";
import { findUser } from "./redux/slices/user.js";
import { fetchUserList } from "./redux/slices/chat.js";
import Protect from "./utils/Protect.jsx";
import { store } from "./redux/store";

function App() {
  const token = useSelector((state) => state.auth.token);  
  const dispatch = useDispatch();
  const currId = useSelector((state) => state.auth.user._id);
  useEffect(() => {
    const colorMode = JSON.parse(window.localStorage.getItem("color-theme"));
    const className = "dark";
    const bodyClass = window.document.body.classList;
    colorMode === "dark"
      ? bodyClass.add(className)
      : bodyClass.remove(className);
  }, []);

  useEffect( () => {
    if (token) {
      connectSocket(token,store);
      dispatch(findUser(currId));
    } else {
      disconnectSocket();
    }
    return () => disconnectSocket(store);
  }, [token]);
  
  // let userList = useSelector((state)=> state.chat.userList);
  // useEffect(()=>{
  //   if(token != null || token != undefined){
  //     dispatch(fetchUserList());
  //     console.log("Fetching User List is done with token", token);
  //     // console.log("Inside the App.jsx UserList Fetched Successfully.",userList);
  //   }
  // },[dispatch,token]);
  // let userList = useSelector((state)=> state.chat.userList);
  // console.log("Inside App.jsx I have fetched the userList",userList);
  return (
    <Routes>
      {/* <Route index={true} path="/" element={<Messages />} /> */}

      {/* Redirect '/' to '/auth/login' */}
      <Route path="/" element={<Navigate to="/auth/login" />} />

      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
      <Route path="/auth/verify" element={<Verification />}></Route>

      <Route path="/dashboard" element={<Layout />}>
        <Route index element={
          <Protect>
            <Messages />
          </Protect>
        } />
        <Route path="profile" element={
          <Protect>
            <ProfilePage />
          </Protect>
        } />
      </Route>

    </Routes>
  );
}

export default App;
