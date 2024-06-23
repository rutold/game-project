import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AuthenticationService from "../game/Api/AuthenticationService";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthentication = async () => {
            const authService = new AuthenticationService();
            try {
                await authService.init();
                
                if (authService.isAnAdmin()) {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Authentication failed:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAuthentication();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
