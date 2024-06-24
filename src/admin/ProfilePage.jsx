import React, { useState } from "react";

import jwtDecode from 'jwt-decode';
import axios from "axios";


const ProfilePage = () => {
    const [showAccountDetails, setShowAccountDetails] = useState(false);

    const toggleAccountDetails = () => {
        setShowAccountDetails(!showAccountDetails);
    };

    return (
        <div className="ProfilePage">
            <div className="ProfileStuff">
                <div className="VerticalNavbar">
                    <div className="VerticalNavbarOption" onClick={toggleAccountDetails}>
                        <span>Account Details</span>
                    </div>
                    <div className="VerticalNavbarOption"></div>
                </div>
                <div className="ProfileContent">
                    {showAccountDetails && <AccountDetails />}
                </div>
            </div>
        </div>
    );
};

const AccountDetails = () => {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [image, setImage] = useState(null);
    const jwtToken = localStorage.getItem('jwtToken');
    const getEmailFromToken = () => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            const decodedToken = jwtDecode(jwtToken);
            const { sub: email, roles: role } = decodedToken;
            return email
        }
        return null;
    };
    const updateUserProfile = async (email, firstName, lastName, password, jwtToken) => {
        const userData = {
            email: email,
            firstName: firstName,
            lastName: lastName,
            password: password
        };

        try {
            const emailFromToken = getEmailFromToken();
            const response = await axios.put(`https://rutold.onrender.com/register/profile/${emailFromToken}`, userData, {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            console.log('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error.message);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        try {
            await updateUserProfile(email, firstName, lastName, password, jwtToken);
            console.log('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error.message);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
    };

    return (
        <div className="AccountDetails">
            <h2>Account Details</h2>
            <form onSubmit={handleFormSubmit}>
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <label>First Name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <label>Last Name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                <label>Date of Birth</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                <label>Phone Number</label>
                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                <label>Upload Picture</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {image && <img src={URL.createObjectURL(image)} alt="Uploaded" />}
                <button type="submit">Save Changes</button>
            </form>
        </div>
    );
};

export default ProfilePage;
