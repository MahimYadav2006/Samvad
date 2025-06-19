import { react, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Messages from "./pages/Messages.jsx";
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import Verification from "./pages/auth/Verification.jsx";
import Layout from "./layout/index.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

function App() {
  
  useEffect(() => {
    const colorMode = JSON.parse(window.localStorage.getItem("color-theme"));
    const className = "dark";
    const bodyClass = window.document.body.classList;
    colorMode === "dark"
      ? bodyClass.add(className)
      : bodyClass.remove(className);
  }, []);

  return (
    <Routes>
      {/* <Route index={true} path="/" element={<Messages />} /> */}

      {/* Redirect '/' to '/auth/login' */}
      <Route path="/" element={<Navigate to="/auth/login" />} />

      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
      <Route path="/auth/verify" element={<Verification />}></Route>

      <Route path="/dashboard" element={<Layout />}>
        <Route index element={<Messages />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

    </Routes>
  );
}

export default App;
