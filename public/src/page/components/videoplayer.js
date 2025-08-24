// src/components/VideoPlayer.js
import ReactPlayer from 'react-player';

const VideoPlayer = ({ videoUrl }) => {
    return (
        <div className="video-player">
            <ReactPlayer url={videoUrl} controls />
        </div>
    );
};

export default VideoPlayer;