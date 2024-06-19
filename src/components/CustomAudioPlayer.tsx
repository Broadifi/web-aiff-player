import { useState, useRef, useEffect } from 'react';

const CustomAudioPlayer = ({ url }: {url: string}) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if(!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = (e) => {
        const audio = audioRef.current;
        audio.volume = e.target.value;
        setVolume(e.target.value);
    };

    const handleProgress = () => {
        const audio = audioRef.current;
        setProgress((audio.currentTime / audio.duration) * 100);
    };

    useEffect(() => {
        const audio = audioRef.current;
        audio.addEventListener('timeupdate', handleProgress);
        return () => {
            audio.removeEventListener('timeupdate', handleProgress);
        };
    }, []);

    return (
        <div>
            <audio ref={audioRef} src={url} />
            <button onClick={togglePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
            <input type="range" min="0" max="100" value={progress} readOnly />
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} />
        </div>
    );
};

export default CustomAudioPlayer;
