// Core
import React, { useState, useRef, useEffect } from 'react';

// Instruments
import './styles.css';

import video from './spring.mp4';
import { maxHeaderSize } from 'http';

export const Player = () => {
    const [ isPlaying, setPlaying ] = useState(false);
    const [ isMuted, setMuted ] = useState(false);
    const [ progress, setProgress ] = useState(0);
    const [ isProgressCapturing, setProgressCapturing ] = useState(0);
    const [ volume, setVolume] = useState(0.5);
    const [ playbackRate, setPlaybackRate] = useState(1);
 
    /**
     * Создаём реф для элемента video.
     * Реф в React — это прямой доступ к html-элементу.
     * С его помощью мы сможем управлять видеоплеером в явном виде.
     */
    const videoRef = useRef(null);

    /* Включаем или выключаем проигрывание видео. */
    const togglePlay = () => {
        const method = videoRef.current.paused ? 'play' : 'pause';

        videoRef.current[ method ]();
        setPlaying(method === 'play');
    };

    /* Прокручиваем прогресс проигрывания. */
    const skip = (event) => {
        /* Забираем время прокрутки из дата-атрибута JSX-элемента. */
        const seconds = event.target.dataset.skip;

        videoRef.current.currentTime += Number.parseFloat(seconds);
    };

    /* Регулировка громкости */
    const control = (event) => {
        
        const name = event.target.name;
        const value = event.target.value;

        videoRef.current[ name ] = Number.parseFloat(value);

        name === 'volume' ? setVolume(value) : name === 'playbackRate'  &&  setPlaybackRate(value);
    };


    /* Устанавливаем режим fullScreen */
    const setFullScreen = () => {
        videoRef.current.requestFullscreen ? videoRef.current.requestFullscreen() : 
        videoRef.current.mozRequestFullScreen ? videoRef.current.mozRequestFullScreen() : 
        videoRef.current.webkitRequestFullscreen ? videoRef.current.webkitRequestFullscreen() : 
        videoRef.current.msRequestFullscreen && videoRef.current.msRequestFullscreen()
    };

    /* Включаем или выключаем звук */

    const toggleMuted = () => {

        const muted  = videoRef.current.muted ? 0 : 1;

        videoRef.current.muted = muted;

        setMuted(muted);
    };

    /* Устанавливаем прогресс проигранного видео в процентах. */
    const handleProgress = () => {
        const progress
            = videoRef.current.currentTime / videoRef.current.duration * 100;

        setProgress(progress);
    };

    /* Устанавливаем прогресс видео указателем мыши. */
    const scrub = (event) => {
        /**
         * offsetX — свойство события мыши. Возвращает расстояние от «начала» элемента до позиции указателя мыши по координате X.
         * nativeEvent — ссылка на нативное, НЕ кросс-браузерное событие.
         *
         * offsetWidth — возвращает ширину элемента.
         * О разнице между event.target и event.currentTarget: https://github.com/facebook/react/issues/5733#issuecomment-167188516.
         */
        const scrubTime
            = event.nativeEvent.offsetX / event.currentTarget.offsetWidth
            * videoRef.current.duration;

        videoRef.current.currentTime = scrubTime;
    };

    const playControl = isPlaying ? <>&#10074;&#10074;</> : <>&#9654;</>;
    const mutedControl = isMuted ? <>umute</> : <>mute</>;

    /* Добавляем слушатель вкл/выкл видео по нажатию на пробел. */
    useEffect(() => {
        // componentDidMount + componentWillUnmount
        const handleKeydown = (event) => {
            if (event.code === 'Space') {
                togglePlay();
            }
        };

        /* Подписка, выполняется при первом рендере один раз. */
        document.addEventListener('keydown', handleKeydown);

        /* Отписка, выполняется при удалении компонента один раз. */
        return () => document.removeEventListener('keydown', handleKeydown);
        /* Эффект выполняется один раз, потому что вторым аргументом мы передали []. */
    }, []);

    return (
        <div className = 'player'>
            <video
                ref = { videoRef }
                src = { video }
                onClick = { togglePlay }
                onTimeUpdate = { handleProgress }
            />
            <div className = 'controls'>
                <div
                    className = 'progress'
                    onClick = { scrub }
                    onMouseDown = { () => setProgressCapturing(true) }
                    onMouseMove = { (event) => isProgressCapturing && scrub(event) }
                    onMouseUp = { () => setProgressCapturing(false) }>
                    <div
                        className = 'filled'
                        style = {{
                            '--filledProgressBar': `${progress}%`,
                        }}
                    />
                </div>
                <button
                    title = 'Toggle Play'
                    onClick = { togglePlay }>
                    {playControl}
                </button>
                <button
                    onClick = { toggleMuted }>
                    {mutedControl}
                </button>
                <input
                    className = 'slider'
                    max = '1'
                    min = '0'
                    name = 'volume'
                    step = '0.05'
                    type = 'range'
                    value = { volume }
                    onChange = { control }  
                />
                <input
                    className = 'slider'
                    max = '2'
                    min = '0.5'
                    name = 'playbackRate'
                    step = '0.1'
                    type = 'range'
                    value = { playbackRate }
                    onChange = { control } 
                />
                <button
                    data-skip = '-10'
                    onClick = { skip }>
                    « 10s
                </button>
                <button
                    data-skip = '25'
                    onClick = { skip }>
                    25s »
                </button>
                <button
                    onClick = { setFullScreen }>
                &#10021;
                </button>
            </div>
        </div>
    );
};
