import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

export function MusicThumbnail({ data }) {
    return (
        <div>
            <Image
                src={data.coverUrl || '/images/default-cover.png'}
                alt={data.title}
                width={200}
                height={200}
                className="w-full h-auto"
            />
            <div className="p-4">
                <h3 className="text-lg font-semibold">{data.artist} - {data.title}</h3>
            </div>
        </div>
    );
}

export function MusicFullContent({ data }) {
    const [currentTime, setCurrentTime] = useState(0);
    const playerRef = useRef(null);
    const lyricsRef = useRef(null);

    const parseTime = (timeString) => {
        const [minutes, seconds] = timeString.split(':');
        return parseInt(minutes) * 60 + parseFloat(seconds);
    };

    const getCurrentLyricIndex = () => {
        return data.lyrics.findIndex((lyric, index) => {
            const nextLyric = data.lyrics[index + 1];
            return (
                parseTime(lyric.time) <= currentTime &&
                (!nextLyric || parseTime(nextLyric.time) > currentTime)
            );
        });
    };

    const currentLyricIndex = getCurrentLyricIndex();

    useEffect(() => {
        if (lyricsRef.current && currentLyricIndex !== -1) {
            const activeLyric = lyricsRef.current.children[currentLyricIndex];
            activeLyric.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
        }
    }, [currentLyricIndex]);

    const handleLyricClick = (time) => {
        if (playerRef.current) {
            playerRef.current.audio.current.currentTime = parseTime(time);
            playerRef.current.audio.current.play();
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 p-6 bg-gradient-to-br from-gray-100 to-white rounded-xl shadow-lg">
            <div className="flex-shrink-0">
                <Image
                    src={data.coverUrl || '/images/default-cover.png'}
                    alt={data.title}
                    width={300}
                    height={300}
                    className="rounded-lg shadow-md"
                />
            </div>
            <div className="flex-grow space-y-6">
                <div>
                    <h2 className="text-3xl font-bold mb-2 text-gray-800">{data.title}</h2>
                    <p className="text-xl text-gray-600 mb-1">{data.artist}</p>
                    <p className="text-gray-500">专辑：{data.album}</p>
                </div>
                <AudioPlayer
                    ref={playerRef}
                    src={`/music/${data.artist} - ${data.title}.mp3`}
                    onListen={(e) => setCurrentTime(e.target.currentTime)}
                    showJumpControls={false}
                    customProgressBarSection={[
                        "CURRENT_TIME",
                        "PROGRESS_BAR",
                        "DURATION",
                    ]}
                    customControlsSection={[
                        "MAIN_CONTROLS",
                        "VOLUME_CONTROLS",
                    ]}
                    autoPlayAfterSrcChange={false}
                    className="rounded-lg shadow-md"
                />
                <div className="mt-8">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-800">歌词</h3>
                    <div 
                        className="whitespace-pre-wrap h-80 overflow-y-auto relative px-6 py-4 bg-white rounded-lg shadow-inner"
                        ref={lyricsRef}
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#CBD5E0 #EDF2F7'
                        }}
                    >
                        {data.lyrics.map((line, index) => (
                            <p
                                key={index}
                                className={`mb-4 cursor-pointer transition-all duration-300 ${
                                    index === currentLyricIndex
                                        ? 'text-blue-600 font-bold text-xl transform scale-110 bg-blue-50 p-2 rounded-md shadow-sm'
                                        : 'text-gray-700 hover:text-gray-900'
                                }`}
                                onClick={() => handleLyricClick(line.time)}
                            >
                                {line.text}
                                {line.pinTag && (
                                    <span className="ml-2 text-sm text-blue-500 bg-blue-100 px-2 py-1 rounded-full">#{line.pinTag}</span>
                                )}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}