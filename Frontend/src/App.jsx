import { useEffect } from "react";
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
import { reset as resetAuth } from "./redux/slices/auth";
import Protect from "./utils/Protect.jsx";
import { store } from "./redux/store";
import { CallProvider } from "./context/CallContext";
import VideoCallModal from "./components/VideoCall/VideoCallModal";
import IncomingCallModal from "./components/VideoCall/IncomingCallModal";
import { isJwtToken } from "./utils/authToken";

function App() {
  const token = useSelector((state) => state.auth.token);
  const isValidToken = isJwtToken(token);
  const dispatch = useDispatch();
  const  user  = useSelector((state) => state.auth.user);
  const currId = useSelector((state) => state.auth.user._id);
  const socket = useSelector((state) => state.user.socket);
  // const socket = getSocket();
  useEffect(() => {
    const colorMode = JSON.parse(window.localStorage.getItem("color-theme"));
    const className = "dark";
    const bodyClass = window.document.body.classList;
    colorMode === "dark"
      ? bodyClass.add(className)
      : bodyClass.remove(className);
  }, []);

  useEffect(() => {
    if (token && !isValidToken) {
      dispatch(resetAuth());
      disconnectSocket(store);
      return;
    }

    if (isValidToken) {
      connectSocket(token, store);
    } else {
      disconnectSocket(store);
    }
    return () => disconnectSocket(store);
  }, [dispatch, token, isValidToken]);

  useEffect(() => {
    if (!isValidToken || !currId) return;
    dispatch(findUser(currId));
  }, [dispatch, isValidToken, currId]);

  // useEffect(() => {
  //   if (currId && socket!= null) {
  //     // Join user's room
  //     socket.emit("user:join", currId);
  //   }
  // }, [currId,socket]);


    useEffect(() => {
    if(!socket) return;
    if (user && user._id) {
      console.log("🔌 Joining socket room for user:", user._id);
      socket.emit("user:join", user._id);
      
      // Verify join
      
      socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
        socket.emit("user:join", user._id);
      });
    }

    return () => {
      socket.off("connect");
    };
  }, [user,socket]);



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
    <CallProvider>
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
      <IncomingCallModal></IncomingCallModal>
      <VideoCallModal></VideoCallModal>
    </CallProvider>
  );
}

export default App;
