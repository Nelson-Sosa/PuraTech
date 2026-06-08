import { signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";

export const signInWithGoogleRedirect = () => {
  return signInWithRedirect(auth, googleProvider);
};

export const getGoogleRedirectResult = async () => {
  const result = await getRedirectResult(auth);
  if (!result) return null;
  const user = result.user;
  return {
    uid: user.uid,
    nombre: user.displayName?.split(" ")[0] || "Usuario",
    apellido: user.displayName?.split(" ").slice(1).join(" ") || "",
    email: user.email,
    photoURL: user.photoURL || ""
  };
};
