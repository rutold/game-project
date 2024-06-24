import { Scene } from 'phaser';
import axios from 'axios';
import AuthenticationService from "../Api/AuthenticationService";

export class Login extends Scene {
    private form: Phaser.GameObjects.DOMElement;
    authService: AuthenticationService;

    constructor() {
        super({ key: 'Login' });
        this.authService = new AuthenticationService();
    }

    preload() {
        this.authService.init();
        this.load.html('form', 'HtmlAssets/form.html');
    }

    create() {
        const token = this.authService.getToken();
        if (token) {
            this.scene.start('Preloader');
            return;
        }

        this.add.text(400, 200, 'Login', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
        this.form = this.add.dom(400, 300).createFromCache('form').setOrigin(0.5);

        const usernameInput = this.form.getChildByName('username') as HTMLInputElement;
        const passwordInput = this.form.getChildByName('password') as HTMLInputElement;

        const submitButton = this.form.node.querySelector('button') as HTMLButtonElement;

        submitButton.addEventListener('click', async () => {
            const username = usernameInput.value;
            const password = passwordInput.value;

            try {
                const response = await axios.post('https://rutold.onrender.com//tokens', { username, password });
                const jwtToken = response.headers['jwt-token'];
                localStorage.setItem('token', jwtToken);
                
                await this.authService.init();
                
                if (this.authService.getToken()) {
                    this.scene.start('Preloader');
                } else {
                    console.error('Token initialization failed');
                }
            } catch (error) {
                console.error('Login failed:', error);
            }
        });

        const registerButton = document.createElement('button');
        registerButton.textContent = 'Register';
        registerButton.style.marginTop = '10px';
        this.form.node.appendChild(registerButton);

        registerButton.addEventListener('click', () => {
            this.scene.start('Register');
        });
    }
}
