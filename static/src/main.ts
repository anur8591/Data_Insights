import "./style.css";

const openLoginButton =
  document.querySelector<HTMLButtonElement>("#open-login");
const profileButton =
  document.querySelector<HTMLButtonElement>("#profile-button");
const loginForm =
  document.querySelector<HTMLFormElement>("#login-view form");
const loginEmailInput =
  document.querySelector<HTMLInputElement>("#login-email");
const closeLoginButton =
  document.querySelector<HTMLButtonElement>("#close-login");
const loginDialog =
  document.querySelector<HTMLDialogElement>("#login-dialog");
const loginView =
  document.querySelector<HTMLElement>("#login-view");
const signupView =
  document.querySelector<HTMLElement>("#signup-view");
const openSignupButton =
  document.querySelector<HTMLButtonElement>("#open-signup");
// Keep the home-page header in sync with the demo sign-in state.
if (openLoginButton && profileButton) {
  const isSignedIn = sessionStorage.getItem("profileEmail") !== null;
  openLoginButton.hidden = isSignedIn;
  profileButton.hidden = !isSignedIn;
}
const backToLoginButton =
  document.querySelector<HTMLButtonElement>("#back-to-login");

if (
  openLoginButton &&
  profileButton &&
  loginForm &&
  loginEmailInput &&
  closeLoginButton &&
  loginDialog &&
  loginView &&
  signupView &&
  openSignupButton &&
  backToLoginButton
) {
  openLoginButton.addEventListener("click", () => {
    loginDialog.showModal();
  });

  profileButton.addEventListener("click", () => {
    window.location.assign("/profile.html");
  });

  openSignupButton.addEventListener("click", () => {
    loginView.hidden = true;
    signupView.hidden = false;
    loginDialog.setAttribute("aria-labelledby", "signup-title");
  });

  backToLoginButton.addEventListener("click", () => {
    signupView.hidden = true;
    loginView.hidden = false;
    loginDialog.setAttribute("aria-labelledby", "login-title");
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Demo only: save the email, not the password. FastAPI does not verify it yet.
    sessionStorage.setItem("profileEmail", loginEmailInput.value.trim());
    openLoginButton.hidden = true;
    profileButton.hidden = false;
    loginDialog.close();
    loginForm.reset();
  });

  closeLoginButton.addEventListener("click", () => {
    loginDialog.close();
  });

  loginDialog.addEventListener("click", (event) => {
    if (event.target === loginDialog) {
      loginDialog.close();
    }
  });

  // Return to the login card when the dialog closes, including with Escape.
  loginDialog.addEventListener("close", () => {
    signupView.hidden = true;
    loginView.hidden = false;
    loginDialog.setAttribute("aria-labelledby", "login-title");
  });
}

const logoutButton =
  document.querySelector<HTMLButtonElement>("#logout-button");

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("profileEmail");
    window.location.assign("/");
  });
}
// This runs only on profile.html, where the email display exists.
const profileEmailElement =
  document.querySelector<HTMLElement>("#profile-email");

if (profileEmailElement) {
  const profileEmail = sessionStorage.getItem("profileEmail");
  profileEmailElement.textContent =
    profileEmail ?? "No demo sign-in email found in this tab. Return home to log in.";
}

