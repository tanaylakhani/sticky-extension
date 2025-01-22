// Handle messages from the service worker
chrome.runtime.onMessage.addListener((message) => {
  // Check if this is an audio playback request
  if (message.action === 'play_audio') {
    const audio = new Audio(message.sound);

    // Play the audio
    audio.play().catch((error) => {
      console.error('Error playing audio:', error);
    });

    // Clean up after playback
    audio.onended = () => {
      audio.remove();
    };
  }
});
