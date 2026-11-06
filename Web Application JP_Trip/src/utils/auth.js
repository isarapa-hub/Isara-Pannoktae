export const getUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user"));
  } catch {
    return null;
  }
};

export const setSession = (user, token) => {
  sessionStorage.setItem("user", JSON.stringify(user));
  if (token) sessionStorage.setItem("token", token);
  window.dispatchEvent(new Event("userchange"));
};

export const clearSession = () => {
  sessionStorage.clear();
  window.dispatchEvent(new Event("userchange"));
};
