import { BrowserRouter, Route, Routes } from "react-router-dom";
    import Signup from "../../Pages/Signup/Signup.jsx";
import Login from "../../Pages/Login/Login.jsx";
import Mainpage from "../../Pages/Mainpage/Mainpage.jsx";
const App = () => {
    return ( 
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Signup />}></Route>/
            <Route path="/Login" element={<Login /> }></Route>
             <Route path="/Mainpage" element={<Mainpage/>}></Route>
        </Routes>
        </BrowserRouter>
     );
}
 
export default App;