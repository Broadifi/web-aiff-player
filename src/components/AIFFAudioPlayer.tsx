import React, { useState, useRef } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { decodeAIFF } from '../utils/aiff-utils'; // Ensure this is correctly imported

interface AIFFAudioPlayerProps {
    url: string;
}

const AIFFAudioPlayer: React.FC<AIFFAudioPlayerProps> = ({ url }) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const isAIFF = url.endsWith('.aif') || url.endsWith('.aiff');

    const playAIFF = async () => {
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext();
        }

        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
            setIsPlaying(true);
            return;
        }

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const decoded = await decodeAIFF(arrayBuffer);

            const audioBuffer = audioContextRef.current.createBuffer(
                decoded.channelData.length,
                decoded.channelData[0].length,
                decoded.sampleRate
            );

            decoded.channelData.forEach((channel, index) => {
                if (audioBuffer.copyToChannel) {
                    audioBuffer.copyToChannel(channel, index);
                } else {
                    const bufferChannel = audioBuffer.getChannelData(index);
                    bufferChannel.set(channel);
                }
            });

            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.start();
            source.onended = () => setIsPlaying(false);
            setIsPlaying(true);
        } catch (error) {
            console.error('Error playing AIFF audio:', error);
        }
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            if (audioContextRef.current) {
                audioContextRef.current.suspend();
            }
            setIsPlaying(false);
        } else {
            playAIFF();
        }
    };

    return (
        <div>
            {isAIFF ? (
                <div className="custom-audio-controls">
                    <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
                </div>
            ) : (
                <AudioPlayer
                    autoPlay
                    src={url}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    customAdditionalControls={[]} // Remove additional controls if not needed
                    // Implement other controls similarly
                />
            )}
        </div>
    );
};

export default AIFFAudioPlayer;
