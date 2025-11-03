import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserLogin from './UserLogin';
import UserRegister from './UserRegister';
import PartnerLogin from './PartnerLogin';
import PartnerRegister from './PartnerRegister';
import Home from '../general/Home';
import CreateFood from '../food-partner/CreateFoodPartner';
import UploadVideo from '../general/UploadVideo';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/user/register" element={<UserRegister />} />
                <Route path="/user/login" element={<UserLogin />} />
                <Route path="/food-partner/register" element={<PartnerRegister />} />
                <Route path="/food-partner/login" element={<PartnerLogin />} />
                <Route path="/" element={<Home/>} /> 
                <Route path="/create-food" element={<CreateFood/>} />
                <Route path="/upload" element={<UploadVideo />} />
            </Routes>
        </Router>
    );
};
export default AppRoutes;