# Agora Video Calling App

A real-time video calling application built with React, TypeScript, and Agora SDK that enables seamless video communication between multiple participants.

## Features

- ✨ Real-time video calling with multiple participants
- 🖥️ Screen sharing functionality
- 🎤 Audio mute/unmute controls
- 📹 Video enable/disable options
- 👤 User name display
- 📱 Responsive design
- 🎯 Intuitive user interface
- 👥 Real-time participant counter

## Tech Stack

- React 18
- TypeScript
- Agora RTC SDK
- Tailwind CSS
- Vite
- Material Icons

## Prerequisites

Before you begin, ensure you have:
- Node.js (v14 or higher)
- npm or yarn
- Agora Account & App ID (free at [Agora.io](https://www.agora.io/))
- Modern web browser

## Installation

1. Clone the repository
```bash
git clone https://github.com/AshishDev-16/VideoCalling.git
cd Project
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Agora credentials:
```bash
VITE_AGORA_APP_ID=your_agora_app_id
VITE_AGORA_TOKEN=your_agora_token
VITE_AGORA_CHANNEL_NAME=your_channel_name
```

4. Start the development server
```bash
npm run dev
```

## Usage

1. Open the application in your browser
2. Enter your name in the join screen
3. Allow camera and microphone permissions
4. Use the control panel to:
   - Mute/unmute your audio
   - Turn your video on/off
   - Share your screen
   - Leave the call

## Project Structure

```
src/
├── components/
│   ├── Controls.tsx    # Video call control buttons
│   ├── VideoCall.tsx   # Main video call component
│   └── VideoGrid.tsx   # Video display grid
├── types/
│   └── agora.d.ts      # TypeScript definitions
├── config.ts           # Agora configuration
└── App.tsx            # Root component
```

## Configuration

The application uses the following Agora settings:
- Video codec: VP8
- Video quality: 640x360
- Frame rate: 30fps
- Screen sharing quality: 1080p

## Acknowledgments

- [Agora.io](https://www.agora.io/) for their excellent video SDK
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
- [Material Icons](https://material.io/icons/) for the UI icons
