import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/axios";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/me");
        setUser(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch user");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      await api.post("/auth/logout", { token: refreshToken });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.clear(); // remove tokens regardless of result
      navigate("/login");
    }
  };

  if (error) return <p className="text-red-500 p-10">{error}</p>;
  if (!user) return <p className="p-10 text-gray-500">Loading user...</p>;

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-green-600">
          Welcome to your Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rouned hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div>
        <p>
          <strong>Email:</strong>
          {user.email}
        </p>
        <p>
          <strong>Role:</strong>
          {user.role}
        </p>
        <p>
          <strong>Account Created:</strong>
          {new Date(user.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
