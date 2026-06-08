import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";

const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const signInWithGoogle = async () => {
  if (isLocalhost) {
    await signInWithRedirect(auth, googleProvider);
    return null;
  }
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  return {
    uid: user.uid,
    nombre: user.displayName?.split(" ")[0] || "Usuario",
    apellido: user.displayName?.split(" ").slice(1).join(" ") || "",
    email: user.email,
    photoURL: user.photoURL || ""
  };
};

export const getGoogleRedirectResult = async () => {
  if (!isLocalhost) return null;
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
