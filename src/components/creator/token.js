import React, { useContext, useRef } from 'react'
import { store } from '../../creator-store'
import TokenAudioPlayer from './token-audio-player'

const Token = (props) => {
	const elementRef = useRef(null)
	const manager = useContext(store)
	const dispatch = manager.dispatch

	let index = props.context == "fakeout" ? manager.state?.selectedFakeoutIndex : manager.state.selectedTokenIndex

	const getLegendColor = (id) => {
		if (!id) return '#ffffff'

		for (const term of manager.state.legend) {
			if (term.id == id) return term.color
		}
	}

	const toggleTokenSelection = () => {
		// midpoint position is passed to the store so the token selection arrow can slide to the selected token
		let xMidpointPos = elementRef.current.getBoundingClientRect().x + (elementRef.current.getBoundingClientRect().width / 2)

		if (props.context == "fakeout") {
			// calc to situationally adjust midpoint position to accommodate the expanded token wrapper width
			if (manager.state.selectedFakeoutIndex != -1 && manager.state.selectedFakeoutIndex < props.index) xMidpointPos = xMidpointPos - 121

			dispatch({ type: 'toggle_fakeout_select', payload: {
				index: props.index,
				pos: xMidpointPos
			}})
		}
		else {
			// calc to situationally adjust midpoint position to accommodate the expanded token wrapper width
			if (manager.state.selectedTokenIndex != -1 && manager.state.selectedTokenIndex < props.index) xMidpointPos = xMidpointPos - 121

			dispatch({ type: 'toggle_token_select', payload: {
				index: props.index,
				pos: xMidpointPos
			}})
		}
	}

	// function that returns a value 0-255 based on the "lightness" of a given hex value
	const contrastCalc = (color) => {
		var r, g, b
		var m = color.substr(1).match(color.length == 7 ? /(\S{2})/g : /(\S{1})/g)
		if (m) {
			r = parseInt(m[0], 16)
			g = parseInt(m[1], 16)
			b = parseInt(m[2], 16)
		}
		if (typeof r != "undefined") return ((r * 299) + (g * 587) + (b * 114)) / 1000;
	}

	const addAudio = (event) => {
		event.stopPropagation() // prevent event propagation registering selection toggle
		Materia.CreatorCore.showMediaImporter(['audio'])
		dispatch({
			type: 'pre_embed_token_audio',
			payload: {
				questionIndex: manager.state.currentIndex,
				phraseIndex: props.index,
				fakeoutIndex: props.index,
				context: props.context
			}
		})
	}

	const removeAudio = (event) => {
		event.stopPropagation() // prevent event propagation registering selection toggle
		dispatch({
			type: 'remove_audio_from_token',
			payload: {
				questionIndex: manager.state.currentIndex,
				phraseIndex: props.index,
				fakeoutIndex: props.index,
				context: props.context
			}
		})
	}

	const deleteToken = () => {
		dispatch({
			type: 'remove_token', payload: {
				questionIndex: manager.state.currentIndex,
				phraseIndex: props.index,
				fakeoutIndex: props.index,
				context: props.context
			}
		})
	}

	let tokenColor = getLegendColor(props.type)

	let audioRender = null
	if (props.audio != null) {
		audioRender = <TokenAudioPlayer audio={props.audio}></TokenAudioPlayer>
	}

	return (
		<div className={`token-wrapper ${index == props.index ? "expanded" : ""}`} onClick={toggleTokenSelection}>
			<span
				ref={elementRef}
				className={`token ${!props.type ? "unassigned" : ""} ${index == props.index ? "selected" : ""}`}
				style={{
					background: tokenColor,
					color: contrastCalc(tokenColor) > 160 ? '#000000' : '#ffffff'
				}}>
				{decodeURIComponent(props.value)}
			</span>
			<span className='token-expanded'>
				{ audioRender != null ? audioRender : '' }
				{ audioRender != null ? 
					<button className='remove-audio' onClick={removeAudio}><span className='icon icon-audio-remove'></span></button>
					:
					<button className='add-audio' onClick={addAudio}><span className='icon icon-audio-add'></span></button>
				}
				<button className='delete' onClick={deleteToken}><span className='icon icon-cross'></span></button>
			</span>
		</div>
	)
}

export default Token
