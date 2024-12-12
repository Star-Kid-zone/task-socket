import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import GroupPage from './components/GroupPage';
import OneToOnePage from './components/OneToOnePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/group" element={<GroupPage />} />
        <Route path="/one-to-one/:currentUser/:selectedUser" element={<OneToOnePage />} />
        </Routes>
    </Router>
  );
}

export default App;
