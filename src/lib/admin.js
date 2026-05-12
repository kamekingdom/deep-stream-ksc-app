const ADMIN_SESSION_KEY = "deepstream_admin_authorized";

function isAdminAuthorized() {
  return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

function authorizeAdmin() {
  window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
}

function clearAdminAuthorization() {
  window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export {
  ADMIN_SESSION_KEY,
  isAdminAuthorized,
  authorizeAdmin,
  clearAdminAuthorization,
};
