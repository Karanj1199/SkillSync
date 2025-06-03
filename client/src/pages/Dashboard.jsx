import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/axios";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch User Info
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

  // Fetch goals
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await api.get("/goals");
        setGoals(res.data);
      } catch (err) {
        setError("Failed to load goals");
        console.error(err);
      }
    };
    fetchGoals();
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
          Welcome, {user.name}
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rouned hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Your Learning Goals</h2>

        {/* Create Goals Form */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();

            if (!newTitle.trim()) return;

            try {
              const res = await api.post("/goals", {
                title: newTitle,
                description: newDescription,
              });

              setGoals([res.data, ...goals]); // add new goal to UI
              setNewTitle("");
              setNewDescription("");
            } catch (err) {
              console.error("Goal creation failed");
              alert("Failed to create goal");
            }
          }}
        >
          <h3>Create New Goal</h3>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title"
            className="w-full px-3 py-2 mb-2 border rounded"
            required
          />

          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description"
            className="w-full px-3 py-2 mb-2 border rounded"
          ></textarea>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 mb-3 rounded hover:bg-blue-700"
          >
            Add Goal
          </button>
        </form>

        {/* List All Goals */}
        {goals.length === 0 ? (
          <p className="text-gray-500">
            No Goals Found. Start by creating one!
          </p>
        ) : (
          <ul className="space-y-4">
            {goals.map((goal) => (
              <li key={goal.id} className="bg-white shadow p-4 rounded">
                <h3 className="text-lg font-bold">{goal.title}</h3>
                <p className="text-sm text-gray-700">{goal.description}</p>
                <p className="text-xs text-gray-400">
                  Created: {new Date(goal.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../services/axios";

// function Dashboard() {
//   const [user, setUser] = useState(null);
//   const [goals, setGoals] = useState([]);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   // ✅ Fetch user info
//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await api.get("/user/me"); // ✅ Corrected to GET /user/me
//         setUser(res.data);
//       } catch (err) {
//         setError("Failed to load user");
//       }
//     };
//     fetchUser();
//   }, []);

//   // ✅ Fetch goals
//   useEffect(() => {
//     const fetchGoals = async () => {
//       try {
//         const res = await api.get("/goals");
//         setGoals(res.data);
//       } catch (err) {
//         setError("Failed to load goals");
//         console.error(err);
//       }
//     };
//     fetchGoals();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await api.post("/auth/logout", {
//         token: localStorage.getItem("refreshToken"),
//       });
//     } catch (err) {
//       console.error("Logout failed:", err);
//     } finally {
//       localStorage.clear();
//       navigate("/login");
//     }
//   };

//   if (error) return <p className="text-red-500 p-4">{error}</p>;
//   if (!user) return <p className="p-4 text-gray-500">Loading user...</p>;

//   return (
//     <div className="p-10">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-green-600">
//           Welcome, {user.name || user.email}
//         </h1>
//         <button
//           onClick={handleLogout}
//           className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//         >
//           Logout
//         </button>
//       </div>

//       <div className="mt-6">
//         <h2 className="text-xl font-semibold mb-3">Your Learning Goals</h2>
//         {goals.length === 0 ? (
//           <p className="text-gray-500">
//             No goals found. Start by creating one!
//           </p>
//         ) : (
//           <ul className="space-y-4">
//             {goals.map((goal) => (
//               <li key={goal.id} className="bg-white shadow p-4 rounded">
//                 <h3 className="text-lg font-bold">{goal.title}</h3>
//                 <p className="text-sm text-gray-700">{goal.description}</p>
//                 <p className="text-xs text-gray-400">
//                   Created: {new Date(goal.created_at).toLocaleString()}
//                 </p>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Dashboard;
