const API_URL = "http://10.0.2.2:3000/api";

export const signupUser = async (userData: {
  name: string;
  email: string;
  dob: string;
  phone: string;
  role: string;
  password: string;
}) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Signup failed");
  }

  return data;
};