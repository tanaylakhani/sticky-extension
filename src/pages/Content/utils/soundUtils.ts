export const playBubbleSound = () => {
  chrome.runtime.sendMessage({
    action: 'play_sound',
    sound: '/assets/sounds/bubble.mp3',
  });
};

export const playOinkSound = () => {
  chrome.runtime.sendMessage({
    action: 'play_sound',
    sound: '/assets/sounds/oink.wav',
  });
};
