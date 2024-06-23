import jwtDecode from 'jwt-decode';

class AuthenticationService {
    constructor() {
        this.user = null;
        this.token = null;
    }

    init() {
        return new Promise((resolve, reject) => {
            const jwtToken = localStorage.getItem('token');
            if (jwtToken) {
                try {
                    const decodedToken = jwtDecode(jwtToken);
                    const { sub: username, jti: userid, roles: role } = decodedToken;
                    this.user = { username, userid, role };
                    this.token = jwtToken;
                    resolve(this.user);
                } catch (error) {
                    console.error('Error decoding JWT token:', error);
                    this.user = null;
                    this.token = null;
                    reject(error);
                }
            } else {
                this.user = null;
                this.token = null;
                resolve(null);
            }
        });
    }
    isAnAdmin(){
         return this.user.role[0] === "ADMIN";
    }

    getUsername() {
        return this.user ? this.user.username : null;
    }

    getUser() {
        return this.user;
    }

    getToken() {
        return this.token;
    }
}

export default AuthenticationService;
