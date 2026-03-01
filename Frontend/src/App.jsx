import { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Messages from "./pages/Messages.jsx";
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import Verification from "./pages/auth/Verification.jsx";
import Layout from "./layout/index.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import { useSelector, useDispatch } from "react-redux";
import { connectSocket, disconnectSocket } from "./utils/socket.js";
import { findUser, reset as resetUser } from "./redux/slices/user.js";
import { reset as resetAuth } from "./redux/slices/auth";
import { reset as resetChat } from "./redux/slices/chat";
import { reset as resetApp } from "./redux/slices/app";
import Protect from "./utils/Protect.jsx";
import { store } from "./redux/store";
import { CallProvider } from "./context/CallContext";
import VideoCallModal from "./components/VideoCall/VideoCallModal";
import IncomingCallModal from "./components/VideoCall/IncomingCallModal";
import { isJwtToken } from "./utils/authToken";

function PublicOnly({ children }) {
  const token = useSelector((state) => state.auth.token);
  if (isJwtToken(token)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  const token = useSelector((state) => state.auth.token);
  const isValidToken = isJwtToken(token);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const currId = useSelector((state) => state.auth.user._id);
  const socket = useSelector((state) => state.user.socket);

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
      disconnectSocket();
      return;
    }

    if (isValidToken) {
      connectSocket(token, store);
    } else {
      // Token is null/invalid - disconnect and reset non-auth state
      disconnectSocket();
      dispatch(resetUser());
      dispatch(resetChat());
      dispatch(resetApp());
    }

    // Cleanup only disconnects the socket; does NOT reset Redux state.
    // State reset happens in the else branch above (on logout / invalid token).
    return () => disconnectSocket();
  }, [dispatch, token, isValidToken]);

  useEffect(() => {
    if (!isValidToken || !currId) return;
    dispatch(findUser(currId));
  }, [dispatch, isValidToken, currId]);

  useEffect(() => {
    if (!socket || typeof socket.emit !== "function") return;
    if (user && user._id) {
      socket.emit("user:join", user._id);

      const onReconnect = () => {
        socket.emit("user:join", user._id);
      };
      socket.on("connect", onReconnect);

      return () => {
        socket.off("connect", onReconnect);
      };
    }
  }, [user, socket]);

  return (
    <CallProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" />} />

        <Route path="/auth/login" element={
          <PublicOnly><Login /></PublicOnly>
        } />
        <Route path="/auth/signup" element={
          <PublicOnly><Signup /></PublicOnly>
        } />
        <Route path="/auth/verify" element={<Verification />} />

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
      <IncomingCallModal />
      <VideoCallModal />
    </CallProvider>
  );
}

export default App;
