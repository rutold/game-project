import SockJS from 'sockjs-client/dist/sockjs';
import Stomp from 'stompjs';
import Phaser from "phaser";
import authenticationService from "../Api/AuthenticationService";
import {sceneEvents} from "../../events/EventsCenter.ts";
import AuthenticationService from "../Api/AuthenticationService";


export default class ChatUI extends Phaser.Scene {
    private socket: WebSocket;
    private stompClient: any;
    private username: string;
    private chat;
    private currentChannel: string;
    private subscriptions: any = {};
    private chatHistory: any = {}; 
    private currentGame: any;
    authService: AuthenticationService;
    private isChatHidden:boolean;
    constructor() {
        super({ key: 'ChatUI' });
        this.authService = new AuthenticationService();
    }
    

    preload() {
        this.load.html('chat', 'HtmlAssets/ChatUI.html');
        this.authService.init();
        this.username = this.authService.getUsername();
    }

     init(data) {
        this.socket = new SockJS('https://rutold.onrender.com/wss');
        this.stompClient = Stomp.over(this.socket);
        this.currentChannel = '/topic/public';

        this.stompClient.connect({}, () => {
            this.subscribeToChannel(this.currentChannel);
            this.subscribeToPrivateQueue();
        });
        this.isChatHidden = false;
         this.currentGame = data.name;
    }

    private subscribeToChannel(channel: string) {
        if (this.subscriptions[this.currentChannel]) {
            this.subscriptions[this.currentChannel].unsubscribe();
        }

        this.subscriptions[channel] = this.stompClient.subscribe(channel, (message: any) => {
            const msg = JSON.parse(message.body);
            if (!this.chatHistory[channel]) {
                this.chatHistory[channel] = [];
            }
            this.chatHistory[channel].push(msg);
            if (this.currentChannel === channel) {
                this.displayMessage(msg);
            }
        });
    }

    private subscribeToPrivateQueue() {
        if (this.subscriptions['private']) {
            return;
        }

        this.subscriptions['private'] = this.stompClient.subscribe(`/user/${this.username}/queue/reply`, (message: any) => {
            const msg = JSON.parse(message.body);
            this.displayPrivateMessage(msg);
        });
    }

    private displayMessage(msg) {
        const chatbox = document.getElementById('chatbox');
        const messageElement = document.createElement('div');
        messageElement.textContent = `${msg.sender}: ${msg.content}`;
        chatbox.appendChild(messageElement);
    }

    private displayPrivateMessage(msg) {
        const chatbox = document.getElementById('chatbox');
        const messageElement = document.createElement('div');
        messageElement.textContent = `(Private) ${msg.sender}: ${msg.content}`;
        messageElement.style.color = 'red';
        chatbox.appendChild(messageElement);
    }

    //loading and clearing of chats
    private loadChatHistory(channel) {
        const chatbox = document.getElementById('chatbox');
        chatbox.innerHTML = ''; 
        if (this.chatHistory[channel]) {
            this.chatHistory[channel].forEach(msg => this.displayMessage(msg));
        }
    }

    create() {
        this.chat = this.add.dom(300, 800).createFromCache('chat').setOrigin(0.5);

        document.getElementById('general-channel').addEventListener('click', () => this.switchChannel('/topic/public'));
        this.input.keyboard.on('keydown-T', (event) => {
            if (event.target.id !== 'chatInput') {
                if(this.isChatHidden){
                    document.getElementById('chat_container').style.display = "flex";
                    this.isChatHidden  = false;
                }
                else {
                    document.getElementById('chat_container').style.display = "none";
                    this.isChatHidden = true;
                }
            }
        });
        document.getElementById('games-channel').addEventListener('click', () => this.switchChannel('/topic/games'));
        document.getElementById('current-channel').addEventListener('click', () => this.switchChannel('/topic/'+this.currentGame));
        document.getElementById('current-channel').textContent = this.currentGame;
        document.getElementById('chatInput').addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                const message = event.target.value;
                if (message.startsWith('/whisper')) {
                    const [command, recipient, ...msgArray] = message.split(' ');
                    const privateMessage = msgArray.join(' ');
                    this.sendPrivateMessage(recipient, privateMessage);
                } else {
                    this.sendMessage(message);
                }
                event.target.value = '';
            }
        });
    }

    private switchChannel(channel: string) {
        this.currentChannel = channel;
        this.subscribeToChannel(channel);
        this.loadChatHistory(channel);

        document.querySelectorAll('.channel').forEach(channel => channel.classList.remove('active'));
        
        if (channel === '/topic/public') {
            document.getElementById('general-channel').classList.add('active');
        } else if (channel === '/topic/games') {
            document.getElementById('games-channel').classList.add('active');
        } else {
            document.getElementById('current-channel').classList.add('active');
        }
    }
    public sendMessage(message: string) {
        const chatMessage = {
            sender: this.username,
            content: message,
            type: 'CHAT',
            channel: this.currentChannel
        };
        this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
    }

    public sendPrivateMessage(recipient: string, message: string) { 
        const chatMessage = {
            sender: this.username,
            recipient: recipient,
            content: message,
            type: 'PRIVATE'
        };
        this.stompClient.send('/app/whisper', {}, JSON.stringify(chatMessage));
    }

    public closeConnection() {
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.disconnect();
        }
    }
}
