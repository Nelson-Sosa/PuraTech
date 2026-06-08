import { signInWithRedirect, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";

export const signInWithGoogle = () => {
  sessionStorage.setItem("google_oauth_pending", "true");
  return signInWithRedirect(auth, googleProvider);
};

export const onGoogleRedirectResult = (callback) => {
  const wasPending = sessionStorage.getItem("google_oauth_pending");
  if (!wasPending) return () => {};

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    sessionStorage.removeItem("google_oauth_pending");
    unsubscribe();
    callback({
      uid: user.uid,
      nombre: user.displayName?.split(" ")[0] || "Usuario",
      apellido: user.displayName?.split(" ").slice(1).join(" ") || "",
      email: user.email,
      photoURL: user.photoURL || ""
    });
  });

  setTimeout(() => {
    sessionStorage.removeItem("google_oauth_pending");
    unsubscribe();
  }, 10000);

  return unsubscribe;
};
