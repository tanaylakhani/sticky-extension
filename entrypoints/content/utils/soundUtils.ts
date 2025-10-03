export const playBubbleSound = () => {
  chrome.runtime.sendMessage({
    action: 'play_sound',
    sound: 'bubble',
  });
};

export const playOinkSound = () => {
  chrome.runtime.sendMessage({
    action: 'play_sound',
    sound: 'oink',
  });
};