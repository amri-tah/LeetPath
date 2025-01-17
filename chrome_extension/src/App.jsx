import { HashRouter as Router, Route, Routes } from 'react-router-dom';  // Use HashRouter
import Login from './Login';
import Profile from './Profile';
import Register from './Register';
import Rec from './rec';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/rec" element={<Rec />} />
      </Routes>
    </Router>
  );
}

export default App;
