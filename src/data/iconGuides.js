import { IconCamera, IconChat, IconHand, IconMic } from '../components/Icons'

export const ICON_GUIDES = {
  camera: {
    id: 'camera',
    Icon: IconCamera,
    title: 'Cameras On',
    short: 'Camera on',
    color: '#a78bfa',
    description: 'Keep your camera on so your teacher and classmates can see you’re present and ready to learn.',
    tips: [
      'Sit where your face is easy to see',
      'Look at the screen when someone is speaking',
      'A quick wave hello counts as being present!',
    ],
  },
  mic: {
    id: 'mic',
    Icon: IconMic,
    title: 'Mics On When Asked',
    short: 'Mic when asked',
    color: '#60a5fa',
    description: 'Stay on mute while others are talking — unmute only when your teacher asks you to speak.',
    tips: [
      'Wait for your turn before unmuting',
      'Speak clearly and at a normal volume',
      'Say “I’m done” when you finish so others can go',
    ],
  },
  chat: {
    id: 'chat',
    Icon: IconChat,
    title: 'Engage in the Chat',
    short: 'Use the chat',
    color: '#4ade80',
    description: 'Use the chat to share ideas, answer questions, and show you’re thinking — even if you’re not speaking out loud.',
    tips: [
      'Reply to teacher prompts with your answer',
      'Share one idea or wonder you have',
      'Use kind words — the chat is part of class',
    ],
  },
  hand: {
    id: 'hand',
    Icon: IconHand,
    title: 'Raise Your Hand to Speak',
    short: 'Raise hand',
    color: '#f472b6',
    description: 'Use the hand-raise button when you want to speak, ask a question, or share an idea.',
    tips: [
      'Put your hand up and wait to be called on',
      'Have your idea ready before you unmute',
      'One hand up at a time — be patient!',
    ],
  },
}

export const ICON_KEYS = ['camera', 'mic', 'chat', 'hand']
