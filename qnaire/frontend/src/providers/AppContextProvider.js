import React, { useContext, useState } from "react";

const AppContext = React.createContext();

export function AppContextProvider({ children }) {
  const [pageActions, setPageActions] = useState([]);
  const [drawerDisabled, setDrawerDisabled] = React.useState(false);

  const value = {
    pageActions,
    setPageActions,
    drawerDisabled,
    setDrawerDisabled,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
