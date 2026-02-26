const GOOGLE_SCRIPT_ID = "google-identity-services";
const GOOGLE_SCRIPT_URL = "https://accounts.google.com/gsi/client";

let googleScriptPromise = null;

const loadGoogleIdentityScript = () => {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Sign-In SDK")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Sign-In SDK"));

    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

export const requestGoogleAccessToken = async () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error(
      "Google Sign-In is not configured. Missing VITE_GOOGLE_CLIENT_ID."
    );
  }

  await loadGoogleIdentityScript();

  if (!window.google?.accounts?.oauth2) {
    throw new Error("Google Sign-In SDK initialization failed.");
  }

  return new Promise((resolve, reject) => {
    let resolved = false;

    const resolveOnce = (value) => {
      if (resolved) return;
      resolved = true;
      resolve(value);
    };

    const rejectOnce = (error) => {
      if (resolved) return;
      resolved = true;
      reject(error);
    };

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (tokenResponse) => {
        if (tokenResponse?.error) {
          rejectOnce(
            new Error(
              tokenResponse.error_description ||
                tokenResponse.error ||
                "Google Sign-In failed."
            )
          );
          return;
        }

        if (!tokenResponse?.access_token) {
          rejectOnce(
            new Error("Google Sign-In did not return an access token.")
          );
          return;
        }

        resolveOnce(tokenResponse.access_token);
      },
      error_callback: (error) => {
        rejectOnce(
          new Error(error?.message || "Google Sign-In popup was closed.")
        );
      },
    });

    tokenClient.requestAccessToken({ prompt: "select_account" });
  });
};
