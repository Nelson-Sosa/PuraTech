import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";

export const signInWithGoogle = async () => {
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
