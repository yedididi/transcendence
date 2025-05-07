export async function checkAccessToken() {
  let token = localStorage.getItem("accessToken");
  if (token) {
    const response = await fetch(`authenticate/verifyAccessToken?access_token=${token}`, {
      method: "GET",
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error verifying access token:", errorData.error);
      return false;
    }
    const data = await response.json();
    if (!data.message) {
      token = data.access_token;
      localStorage.setItem("accessToken", data.access_token);
    }
    return true;
  } else {
    return false;
  }
}
