import React, { createContext, useState, useEffect } from 'react';
import AuthenticationService from './AuthenticationService';

const AuthContext = createContext();

export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const authenticationService = new AuthenticationService();

    useEffect(() => {
        authenticationService.init().then(() => {
            setUser(authenticationService.getUser());
            setToken(authenticationService.getToken());
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, token }}>
            {children}
        </AuthContext.Provider>
    );
};