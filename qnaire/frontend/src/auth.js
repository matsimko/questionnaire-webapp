import React, { useEffect, useState } from "react";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const AUTH_COOKIE = "token";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getToken()));

  function authenticate(data) {
    setToken(data.token);
    setIsAuthenticated(true);
  }

  function annulAuthentication() {
    removeToken();
    setIsAuthenticated(false);
  }

  const auth = {
    isAuthenticated,
    authenticate,
    annulAuthentication,
  };

  return auth;
}

export function getAuthHeader() {
  return `Token ${cookies.get(AUTH_COOKIE)}`;
}

export function getToken() {
  return Boolean(cookies.get(AUTH_COOKIE));
}

export function setToken(token) {
  cookies.set(AUTH_COOKIE, token, { path: "/" });
}

export function removeToken() {
  cookies.remove(AUTH_COOKIE, { path: "/" });
}