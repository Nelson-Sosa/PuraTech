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
    console.log("[firebaseAuth] Llamando signInWithPopup...");
    const result = await signInWithPopup(auth, googleProvider);
    console.log("[firebaseAuth] signInWithPopup OK. result.user:", {
      uid: result.user?.uid,
      email: result.user?.email,
      displayName: result.user?.displayName,
      photoURL: result.user?.photoURL
    });

    console.log("[firebaseAuth] Obteniendo idToken...");
    const idToken = await result.user.getIdToken();
    console.log("[firebaseAuth] idToken obtenido:", idToken ? `✅ (${idToken.substring(0, 30)}...)` : "❌ NULL");

    const userData = {
      uid: result.user.uid,
      nombre: result.user.displayName?.split(" ")[0] || "Usuario",
      apellido: result.user.displayName?.split(" ").slice(1).join(" ") || "",
      email: result.user.email,
      photoURL: result.user.photoURL || "",
      idToken
    };
    console.log("[firebaseAuth] userData a enviar al backend:", {
      ...userData,
      idToken: userData.idToken ? `✅ (${userData.idToken.substring(0, 20)}...)` : "❌"
    });
    return userData;
  } catch (error) {
    console.error("[firebaseAuth] ❌ Error en signInWithPopup:", error.code, error.message);
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
