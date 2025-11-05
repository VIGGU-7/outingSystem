import { Navigate, Route, Routes } from "react-router-dom";
import { apiInstance } from "./utils";
import { useEffect } from "react";
import useauthStore from "./utils/store";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Onboard from "./pages/Onboard";
import Profile from "./pages/Profile";
import Generate from "./pages/Generate";
import { LoaderCircle } from 'lucide-react';
import PrivateRoute from "./utils/Privateroute";
import PublicRoute from "./utils/Publicroute";
function App() {
  const { setisLoading,isLoading,setUser } = useauthStore();

  useEffect(() => {
    async function getUser() {
      try {
        const response = await apiInstance.get("/check");
        setUser(response.data);
        setisLoading(false)
      } catch (error) {
        console.error("Something went wrong. Contact the developer.", error);
        setisLoading(false)
      }finally{
        setisLoading(false)
      }
    }
    getUser();
  }, [setUser]);
  if(isLoading){
    return(
      <div className="w-full h-screen flex justify-center items-center">
        <LoaderCircle className="size-10 animate-spin"/>
      </div>
    )
  }
  return (
    <Routes>
      <Route path="/" element={<Root />} />
      <Route path="/signup" element={
        <PublicRoute>
        <Signup />
      </PublicRoute>
    } />
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>} />
      <Route path="/onboard" element={
        <PrivateRoute>
             <Onboard/>
        </PrivateRoute>
     
        }/>
      <Route path="/profile" element={
        <PrivateRoute>
        <Profile/>
        </PrivateRoute>
        }/>
      <Route path="/generate" element={
        <PrivateRoute>
          <Generate/>
        </PrivateRoute>}/>

    </Routes>
  );
}

function Root() {
  const { authUser } = useauthStore();
  if (authUser) {
    return <Navigate to="/home" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
}

export default App;
