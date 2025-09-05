import { useState, useEffect } from "react";
import { Collapse } from "react-collapse";
import { FaBars, FaTimes } from "react-icons/fa";
import axios from "axios";
import image1 from '../../dist/profile.jpg'

function MainPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [content, setContent] = useState("Welcome to your profile");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // گرفتن اطلاعات پروفایل
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) {
          setError("توکن پیدا نشد. لطفا وارد شوید.");
          return;
        }

        const res = await axios.get(
          "http://localhost:8000/api/accounts/profile/",
          {
            headers: {
              Authorization:`Bearer ${token}` , 
            },
          }
        );
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("خطا در دریافت اطلاعات پروفایل");
      }
    };

    fetchProfile();
  }, []);

  const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "assistant", label: "Assistant" },
    { id: "exams", label: "Exams" },
    { id: "advisor", label: "Advisor" },
    { id: "settings", label: "Settings" },
  ];

  const handleMenuClick = (id) => {
  if (id === "dashboard") {
    if (user) {
      setContent(
        <div className="space-y-5 text-left">
          <img
            src={image1}
            className="w-16 h-16 rounded-full object-cover"
            alt="User avatar"
          />
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      );
    } else if (error) {
      setContent(error);
    } else {
      setContent("Loading user data...");
    }
  } else {
    setContent(`You clicked on ${id}`);
  }
  setIsMenuOpen(false);
};
  return (
    <div className="flex flex-col min-h-screen">
      {/* هدر */}
      <header className="flex items-center bg-green-200 text-orange-500 px-4 py-3">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-2xl p-1 rounded hover:bg-green-200 focus:outline-none"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        <h1 className="text-lg font-bold ml-3">MainPage</h1>
      </header>

      {/* بدنه */}
      <div className="flex flex-1">
        {/* منو */}
        <Collapse isOpened={isMenuOpen}>
          <nav className="bg-amber-200 text-orange-500 w-64 min-h-screen p-4">
            <ul className="space-y-4">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleMenuClick(item.id)}
                    className="w-full text-left hover:underline"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </Collapse>

        {/* محتوای اصلی */}
        <main className="flex-1 p-6">
          {content === "Welcome to your profile" ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-2xl font-semibold text-center">{content}</span>
            </div>
          ) : (
            <div className="text-left">{content}</div> 
          )}
        </main>
      </div>
    </div>
  );
}

export default MainPage;