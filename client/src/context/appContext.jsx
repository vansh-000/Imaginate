import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [showLogin, setShowLogin] = useState(false);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [credit, setCredit] = useState(0);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const creditData = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/credits', {
        headers: { accessToken }
      });
      console.log(data.data);
      if (data.success) {
        setCredit(data.data.credits);
        setUser(data.data.name);
      }
    } catch (error) {
      console.error("Error fetching credit data:", error);
    }
  };

  const logout = async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user')
    setAccessToken(null);
    setUser(null);
  }

  useEffect(() => {
    if (accessToken) {
      creditData()
    }
  }, [accessToken])

  return (
    <AppContext.Provider value={{ user, logout, accessToken, setAccessToken, credit, setCredit, setUser, backendUrl, showLogin, setShowLogin, creditData }}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
