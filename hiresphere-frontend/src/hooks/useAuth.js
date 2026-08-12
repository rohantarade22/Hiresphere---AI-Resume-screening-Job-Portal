import { useSelector, useDispatch } from "react-redux";
import { logout as logoutAction } from "../store/authSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    role: auth.user?.role,
    logout: () => dispatch(logoutAction()),
  };
}
