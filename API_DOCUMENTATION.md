# VOID Backend API Documentation

**Base URL**: `https://void-backend-hyx0.onrender.com`

## Table of Contents
1. [Authentication](#authentication)
2. [Chat](#chat)
3. [Feed & Reels](#feed--reels)
4. [Marketplace](#marketplace)
5. [Media Upload](#media-upload)
6. [Status (Stories)](#status-stories)
7. [WebSocket (Real-time Chat)](#websocket-real-time-chat)
8. [Frontend Integration](#frontend-integration)

---

## Authentication

All endpoints (except Google OAuth) require a JWT token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

### 1. Google OAuth Login

**Endpoint**: `GET /auth/google`

**Description**: Initiates Google OAuth flow

**Usage**:
```javascript
// Open in WebView or browser
const authUrl = 'https://void-backend-hyx0.onrender.com/auth/google';
```

### 2. Google OAuth Callback

**Endpoint**: `GET /auth/google/callback`

**Description**: Google redirects here after authentication

**Response**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Refresh Access Token

**Endpoint**: `POST /auth/refresh`

**Headers**:
```
Authorization: Bearer <refresh_token>
```

**Response**:
```json
{
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

### 4. Logout

**Endpoint**: `POST /auth/logout`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**: `204 No Content`

---

## Chat

All chat endpoints require authentication.

### 1. Get Conversations

**Endpoint**: `GET /chat/conversations`

**Description**: Get all conversations for the authenticated user

**Response**:
```json
[
  {
    "_id": "conv123",
    "type": "private",
    "participants": [
      {
        "_id": "user1",
        "fullName": "John Doe",
        "avatarUrl": "https://..."
      }
    ],
    "lastMessage": {
      "_id": "msg123",
      "content": "Hey!",
      "createdAt": "2026-01-04T00:00:00.000Z"
    },
    "updatedAt": "2026-01-04T00:00:00.000Z"
  }
]
```

### 2. Get Messages

**Endpoint**: `GET /chat/messages/:conversationId`

**Query Parameters**:
- `limit` (optional): Number of messages (default: 50)
- `beforeId` (optional): Message ID for pagination

**Response**:
```json
[
  {
    "_id": "msg123",
    "conversationId": "conv123",
    "senderId": "user1",
    "content": "Hello!",
    "mediaType": "text",
    "status": "read",
    "createdAt": "2026-01-04T00:00:00.000Z"
  }
]
```

### 3. Mark as Read

**Endpoint**: `POST /chat/mark-read`

**Body**:
```json
{
  "conversationId": "conv123",
  "messageId": "msg123"
}
```

### 3. Mark as Read

**Endpoint**: `POST /chat/mark-read`

**Body**:
```json
{
  "conversationId": "conv123",
  "messageId": "msg123"
}
```

**Response**: `200 OK`

### 4. Chat Actions (Pin, Mute, Archive)

**Pin Conversation**:
- `POST /chat/conversations/:id/pin`
- `DELETE /chat/conversations/:id/pin`

**Archive Conversation**:
- `POST /chat/conversations/:id/archive`
- `DELETE /chat/conversations/:id/archive`
- `GET /chat/conversations/archived` (Get archived list)

**Mute Conversation**:
- `POST /chat/conversations/:id/mute`
  - Body: `{ "mutedUntil": "2026-01-05T00:00:00.000Z" }` (Optional)
- `DELETE /chat/conversations/:id/mute`

**Mark as Unread**:
- `POST /chat/conversations/:id/mark-unread`

---

## Feed & Reels

### 1. Create Post/Reel

**Endpoint**: `POST /feed/posts`

**Body**:
```json
{
  "content": "Check out my new post!",
  "mediaUrls": ["https://cloudinary.com/image1.jpg"],
  "type": "post",
  "visibility": "public"
}
```

**Fields**:
- `content` (required): Post text
- `mediaUrls` (optional): Array of media URLs
- `type` (required): `"post"` or `"reel"`
- `visibility` (optional): `"public"` or `"followers"` (default: "public")

**Response**:
```json
{
  "_id": "post123",
  "authorId": "user1",
  "content": "Check out my new post!",
  "mediaUrls": ["https://cloudinary.com/image1.jpg"],
  "type": "post",
  "visibility": "public",
  "likes": [],
  "createdAt": "2026-01-04T00:00:00.000Z"
}
```

### 2. Get Feed

**Endpoint**: `GET /feed`

**Query Parameters**:
- `limit` (optional): Number of posts (default: 20)
- `lastId` (optional): Last post ID for pagination
- `lastCreatedAt` (optional): Last post creation date (ISO string)

**Response**:
```json
[
  {
    "_id": "post123",
    "authorId": {
      "_id": "user1",
      "fullName": "John Doe",
      "avatarUrl": "https://..."
    },
    "content": "My post",
    "mediaUrls": [],
    "type": "post",
    "likes": ["user2", "user3"],
    "createdAt": "2026-01-04T00:00:00.000Z"
  }
]
```

### 3. Get Reels

**Endpoint**: `GET /feed/reels`

**Query Parameters**: Same as Get Feed

**Response**: Same structure as Get Feed, but only returns posts with `type: "reel"`

### 4. Toggle Like

**Endpoint**: `POST /feed/posts/:id/like`

**Response**:
```json
{
  "_id": "post123",
  "likes": ["user1", "user2"]
}
```

---

## Marketplace

### 1. Create Listing

**Endpoint**: `POST /marketplace/listings`

**Body**:
```json
{
  "title": "iPhone 15 Pro",
  "description": "Brand new, sealed",
  "price": 999,
  "category": "Electronics",
  "coordinates": [-73.935242, 40.730610],
  "images": ["https://cloudinary.com/img1.jpg"]
}
```

**Response**:
```json
{
  "_id": "listing123",
  "sellerId": "user1",
  "title": "iPhone 15 Pro",
  "price": 999,
  "status": "active",
  "location": {
    "type": "Point",
    "coordinates": [-73.935242, 40.730610]
  },
  "createdAt": "2026-01-04T00:00:00.000Z"
}
```

### 2. Search Listings

**Endpoint**: `GET /marketplace/listings`

**Query Parameters**:
- `term` (optional): Search term
- `lat` (optional): Latitude for location-based search
- `lng` (optional): Longitude for location-based search
- `distance` (optional): Max distance in meters (default: 10000)
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset

**Response**:
```json
[
  {
    "_id": "listing123",
    "title": "iPhone 15 Pro",
    "price": 999,
    "images": ["https://..."],
    "status": "active"
  }
]
```

### 3. Get Listing Details

**Endpoint**: `GET /marketplace/listings/:id`

**Response**:
```json
{
  "_id": "listing123",
  "sellerId": {
    "_id": "user1",
    "fullName": "John Doe"
  },
  "title": "iPhone 15 Pro",
  "description": "Brand new, sealed",
  "price": 999,
  "category": "Electronics",
  "images": ["https://..."],
  "status": "active",
  "location": {
    "type": "Point",
    "coordinates": [-73.935242, 40.730610]
  }
}
```

### 4. Update Listing Status

**Endpoint**: `PATCH /marketplace/listings/:id/status`

**Body**:
```json
{
  "status": "sold"
}
```

**Response**: Updated listing object

---

## Media Upload

### Upload File

**Endpoint**: `POST /media/upload`

**Content-Type**: `multipart/form-data`

**Body**:
- `file`: File to upload (image/video)

**Response**:
```json
{
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v123/file.jpg"
}
```

---

## Status (Stories)

### 1. Create Status

**Endpoint**: `POST /status`

**Body**:
```json
{
  "mediaUrl": "https://cloudinary.com/video.mp4",
  "type": "video"
}
```

**Response**:
```json
{
  "_id": "status123",
  "userId": "user1",
  "mediaUrl": "https://...",
  "type": "video",
  "expiresAt": "2026-01-05T00:00:00.000Z",
  "viewers": {
    "count": 0,
    "list": []
  }
}
```

### 2. Get Active Statuses

**Endpoint**: `GET /status/active`

**Description**: Get all active statuses (not expired, within 24 hours)

**Response**:
```json
[
  {
    "_id": "status123",
    "userId": {
      "_id": "user1",
      "fullName": "John Doe",
      "avatarUrl": "https://..."
    },
    "mediaUrl": "https://...",
    "type": "image",
    "viewers": {
      "count": 5
    },
    "createdAt": "2026-01-04T00:00:00.000Z"
  }
]
```

### 3. View Status

**Endpoint**: `POST /status/:id/view`

**Description**: Mark status as viewed by current user

**Response**: Updated status object

### 4. Get My Statuses

**Endpoint**: `GET /status/me`

**Description**: Get all statuses created by the authenticated user

**Response**: Array of status objects

---

## Settings & Privacy

### 1. Get Settings

**Endpoint**: `GET /settings`

**Response**:
```json
{
  "privacy": {
    "lastSeenVisibility": "everyone",
    "profilePhotoVisibility": "contacts",
    "statusVisibility": "nobody"
  },
  "notifications": {
    "globalMute": false,
    "pushEnabled": true
  },
  "media": {
    "autoDownload": "wifi",
    "mediaVisibility": true
  },
  "theme": "system"
}
```

### 2. Update Settings

**Endpoints**:
- `PATCH /settings/privacy` (Body: `{ "lastSeenVisibility": "nobody" }`)
- `PATCH /settings/notifications` (Body: `{ "globalMute": true }`)
- `PATCH /settings/media` (Body: `{ "autoDownload": "never" }`)
- `PATCH /settings/theme` (Body: `{ "theme": "dark" }`)

### 3. Blocking

**Block User**:
- `POST /settings/block`
  - Body: `{ "userId": "user123" }`

**Unblock User**:
- `DELETE /settings/block/:id`

**Get Blocked Users**:
- `GET /settings/blocked`

### 4. Account Management

**Delete Account**:
- `DELETE /settings/account` (Soft delete)

**Download Data**:
- `GET /settings/data`

---

## WebSocket (Real-time Chat)

**Namespace**: `/chat`

**Connection URL**: `wss://void-backend-hyx0.onrender.com/chat`

### Connection

**Authentication**: Pass JWT token in connection auth or headers

```javascript
import io from 'socket.io-client';

const socket = io('https://void-backend-hyx0.onrender.com/chat', {
  auth: {
    token: accessToken
  }
});
```

### Events to Emit

#### 1. Send Message

**Event**: `send_message`

**Payload**:
```json
{
  "conversationId": "conv123",
  "content": "Hello!",
  "mediaType": "text",
  "clientMessageId": "client-msg-123",
  "recipientId": "user2"
}
```

**Acknowledgment**:
Server emits `message_received_by_server` immediately.
On error (e.g., blocked), server emits `message_error`:
```json
{
  "clientMessageId": "client-msg-123",
  "error": "Cannot send message: You are blocked"
}
```

#### 2. Typing Status

**Event**: `typing_status`



## Users & Social Graph

### 1. Get My Profile

**Endpoint**: `GET /users/me`

**Response**: User object

### 2. Get User Profile

**Endpoint**: `GET /users/:id`

**Response**:
```json
{
  "_id": "...",
  "fullName": "...",
  "username": "...",
  "avatarUrl": "...",
  "isPrivate": false,
  "isFollowing": true,
  "isRequested": false,
  "canViewContent": true,
  "followersCount": 100,
  "followingCount": 50,
  "postsCount": 10,
  "followers": [...], // Only if allowed
  "following": [...]  // Only if allowed
}
```

### 3. Search Users

**Endpoint**: `GET /users/search?q=john`

### 4. Update Profile

**Endpoint**: `PATCH /users/profile`

**Body**:
```json
{
  "bio": "Hello world",
  "isPrivate": true,
  "username": "new_username"
}
```

### 5. Follow Actions

**Follow User**:
- `POST /users/:id/follow`
- Response: `{ "status": "following" }` or `{ "status": "requested" }`

**Unfollow User**:
- `DELETE /users/:id/follow`

**Get Pending Requests**:
- `GET /users/requests` (My received requests)

**Manage Request**:
- `POST /users/requests/manage`
- Body:
```json
{
  "requesterId": "user123",
  "accept": true
}
```

**Event**: `typing_status`

**Payload**:
```json
{
  "conversationId": "conv123",
  "recipientId": "user2",
  "isTyping": true
}
```

### Events to Listen

#### 1. Message Received by Server

**Event**: `message_received_by_server`

**Payload**:
```json
{
  "clientMessageId": "client-msg-123"
}
```

#### 2. New Message

**Event**: `new_message`

**Payload**:
```json
{
  "_id": "msg123",
  "conversationId": "conv123",
  "senderId": "user1",
  "content": "Hello!",
  "mediaType": "text",
  "status": "sent",
  "createdAt": "2026-01-04T00:00:00.000Z"
}
```

#### 3. Message Status Update

**Event**: `message_status_update`

**Payload**:
```json
{
  "messageId": "msg123",
  "status": "delivered"
}
```

#### 4. User Typing Update

**Event**: `user_typing_update`

**Payload**:
```json
{
  "conversationId": "conv123",
  "userId": "user2",
  "isTyping": true
}
```

---

## Frontend Integration

### React Native Setup

#### 1. Install Dependencies

```bash
npm install axios socket.io-client @react-native-async-storage/async-storage
```

#### 2. API Service

```javascript
// services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://void-backend-hyx0.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        });
        
        await AsyncStorage.setItem('accessToken', data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        await AsyncStorage.clear();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

#### 3. Auth Service

```javascript
// services/auth.js
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async googleLogin() {
    // Open WebView to /auth/google
    // Handle callback and extract tokens
  },
  
  async logout() {
    await api.post('/auth/logout');
    await AsyncStorage.clear();
  },
  
  async getStoredTokens() {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    return { accessToken, refreshToken };
  },
  
  async saveTokens(accessToken, refreshToken) {
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
  }
};
```

#### 4. Chat Service

```javascript
// services/chat.js
import api from './api';

export const chatService = {
  async getConversations() {
    const { data } = await api.get('/chat/conversations');
    return data;
  },
  
  async getMessages(conversationId, limit = 50, beforeId) {
    const { data } = await api.get(`/chat/messages/${conversationId}`, {
      params: { limit, beforeId }
    });
    return data;
  },
  
  async markAsRead(conversationId, messageId) {
    await api.post('/chat/mark-read', { conversationId, messageId });
  }
};
```

#### 5. WebSocket Service

```javascript
// services/socket.js
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  socket = null;
  
  async connect() {
    const token = await AsyncStorage.getItem('accessToken');
    
    this.socket = io('https://void-backend-hyx0.onrender.com/chat', {
      auth: { token },
      transports: ['websocket']
    });
    
    this.socket.on('connect', () => {
      console.log('Socket connected');
    });
    
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    return this.socket;
  }
  
  sendMessage(data) {
    this.socket?.emit('send_message', data);
  }
  
  sendTypingStatus(data) {
    this.socket?.emit('typing_status', data);
  }
  
  onNewMessage(callback) {
    this.socket?.on('new_message', callback);
  }
  
  onMessageStatusUpdate(callback) {
    this.socket?.on('message_status_update', callback);
  }
  
  onUserTyping(callback) {
    this.socket?.on('user_typing_update', callback);
  }
  
  disconnect() {
    this.socket?.disconnect();
  }
}

export default new SocketService();
```

#### 6. Feed Service

```javascript
// services/feed.js
import api from './api';

export const feedService = {
  async createPost(postData) {
    const { data } = await api.post('/feed/posts', postData);
    return data;
  },
  
  async getFeed(limit = 20, lastId, lastCreatedAt) {
    const { data } = await api.get('/feed', {
      params: { limit, lastId, lastCreatedAt }
    });
    return data;
  },
  
  async getReels(limit = 10, lastId, lastCreatedAt) {
    const { data } = await api.get('/feed/reels', {
      params: { limit, lastId, lastCreatedAt }
    });
    return data;
  },
  
  async toggleLike(postId) {
    const { data } = await api.post(`/feed/posts/${postId}/like`);
    return data;
  }
};
```

#### 7. Media Upload Service

```javascript
// services/media.js
import api from './api';

export const mediaService = {
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.fileName || 'upload.jpg'
    });
    
    const { data } = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return data.url;
  }
};
```

#### 8. Example Usage in Component

```javascript
// screens/ChatScreen.js
import React, { useEffect, useState } from 'react';
import { View, FlatList, TextInput, Button } from 'react-native';
import { chatService } from '../services/chat';
import socketService from '../services/socket';

export default function ChatScreen({ route }) {
  const { conversationId, recipientId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  useEffect(() => {
    loadMessages();
    connectSocket();
    
    return () => socketService.disconnect();
  }, []);
  
  async function loadMessages() {
    const msgs = await chatService.getMessages(conversationId);
    setMessages(msgs.reverse());
  }
  
  async function connectSocket() {
    await socketService.connect();
    
    socketService.onNewMessage((message) => {
      if (message.conversationId === conversationId) {
        setMessages(prev => [...prev, message]);
      }
    });
  }
  
  function sendMessage() {
    const clientMessageId = `msg-${Date.now()}`;
    
    socketService.sendMessage({
      conversationId,
      content: inputText,
      mediaType: 'text',
      clientMessageId,
      recipientId
    });
    
    setInputText('');
  }
  
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.content}</Text>
          </View>
        )}
      />
      <TextInput
        value={inputText}
        onChangeText={setInputText}
        placeholder="Type a message..."
      />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
}
```

---

## Error Handling

All endpoints return standard HTTP status codes:

- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error response format:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider implementing it for production.

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- File uploads are limited to 10MB
- WebSocket connections require valid JWT tokens
- Tokens expire after 15 minutes (access) and 7 days (refresh)
- Status/Stories expire after 24 hours
