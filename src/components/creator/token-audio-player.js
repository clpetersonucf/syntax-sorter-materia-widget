import React, { useState, useEffect } from 'react'
// import { store } from '../../creator-store'

const TokenAudioPlayer = (props) => {

	const [playing, setPlaying] = useState(false)
	const [audio, setAudio] = useState(null)

	useEffect(() => {
		if (playing != undefined && audio != null) {
			if (playing) audio.play()
			else audio.pause()
		}
	},[playing])

	useEffect(() => {
		if (props.audio) {
			const audioObj = new Audio()
			audioObj.src = Materia.CreatorCore.getMediaUrl(props.audio.id)
			setAudio(audioObj)
		}
	},[props.audio])

	const togglePlay = (event) => {
		event.stopPropagation()
		setPlaying(!playing)
	}

	return (
		<div className='token-audio-player'>
			<button className='play-btn' onClick={togglePlay}><span className={`icon ${playing ? 'icon-pause' : 'icon-play'}`}></span></button>
		</div>
	)
}

export default TokenAudioPlayer