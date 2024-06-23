import { Scene } from 'phaser';
import axios from 'axios';

export class Register extends Scene {
    private form: Phaser.GameObjects.DOMElement;

    constructor() {
        super({ key: 'Register' });
    }

    preload() {
        this.load.html('register-form', 'HtmlAssets/registerform.html');
    }

    create() {
        this.add.text(400, 200, 'Register', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
        
        this.form = this.add.dom(400, 300).createFromCache('register-form').setOrigin(0.5);
        const usernameInput = this.form.getChildByName('register-username') as HTMLInputElement;
        const emailInput = this.form.getChildByName('register-email') as HTMLInputElement;
        const passwordInput = this.form.getChildByName('register-password') as HTMLInputElement;
        const registerButton = this.form.node.querySelector('button') as HTMLButtonElement;

        registerButton.addEventListener('click', async () => {
            const username = usernameInput.value;
            const email = emailInput.value;
            const password = passwordInput.value;

            try {
                const response = await axios.post('https://rutold.onrender.com/:10000/User', {
                    username: username,
                    email: email,
                    password: password,
                });
                this.scene.start('Login');
            } catch (error) {
                console.error('Registration failed:', error);
            }
        });
        
        const loginButton = document.createElement('button');
        loginButton.textContent = 'Login';
        loginButton.style.marginTop = '10px';
        this.form.node.appendChild(loginButton);

        loginButton.addEventListener('click', () => {
            this.scene.start('Login');
        });
    }
}
