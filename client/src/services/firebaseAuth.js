import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";

const extractUserData = async (user) => ({
  uid: user.uid,
  nombre: user.displayName?.split(" ")[0] || "Usuario",
  apellido: user.displayName?.split(" ").slice(1).join(" ") || "",
  email: user.email,
  photoURL: user.photoURL || "",
  idToken: await user.getIdToken()
});

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return await extractUserData(result.user);
  } catch (error) {
    if (error.code === "auth/popup-blocked") {
      sessionStorage.setItem("google_oauth_pending", "true");
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
};

export const onGoogleRedirectResult = (callback) => {
  const wasPending = sessionStorage.getItem("google_oauth_pending");
  if (!wasPending) return () => {};

  sessionStorage.removeItem("google_oauth_pending");

  getRedirectResult(auth)
    .then(async (result) => {
      if (result) {
        callback(await extractUserData(result.user));
      }
    })
    .catch((error) => {
      console.error("Redirect result error:", error);
    });

  return () => {};
};
