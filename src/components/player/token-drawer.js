import React, { useContext } from 'react'
import Token from './token'
import { store, DispatchContext } from '../../player-store'

const TokenDrawer = (props) => {

	const state = useContext(store)
	const dispatch = useContext(DispatchContext)

	const paginate = () => {
		dispatch({ type: 'paginate_question_forward' })
		try
		{
			document.getElementById(`question-${state.currentIndex + 2}-btn`).focus();
		}
		catch (error)
		{
			throw error;
		}
	}

	const handleTokenDragOver = (event) => {
		// Exits the function if the max number of guesses have been used
		if (props.attemptLimit > 1 && (props.attemptsUsed >= props.attemptLimit)) return false

		event.preventDefault()
	}

	const handleTokenDrop = (event) => {
		event.preventDefault()

		let dropTokenId = event.dataTransfer.getData("tokenId")
		let dropTokenName = event.dataTransfer.getData("tokenName")
		let dropTokenType = event.dataTransfer.getData("tokenType")
		let dropTokenPhraseIndex = event.dataTransfer.getData("tokenPhraseIndex")
		let dropTokenStatus = event.dataTransfer.getData("tokenStatus")
		let dropTokenFakeout = (event.dataTransfer.getData("tokenFakeout") == "true") ? true : false
		let dropTokenFocus = event.dataTransfer.getData("tokenFocus")
		let dropTokenAudio = (event.dataTransfer.getData("tokenAudio") == "null") ? null : event.dataTransfer.getData("tokenAudio")

		if (dropTokenStatus == "sorted")
		{
			dispatch({type: 'sorted_token_unsort', payload: {
				origin: dropTokenStatus,
				tokenIndex: parseInt(dropTokenPhraseIndex),
				questionIndex: state.currentIndex,
				fakeout: dropTokenFakeout,
				legend: dropTokenType,
				value: dropTokenName,
				id: dropTokenId,
				focus: dropTokenFocus,
				audio: dropTokenAudio
			}})
		}
	}

	const handleCheckAnswer = () => {
		let item = state.items[state.currentIndex]

		// attempt limit already reached, assume call is invalid
		if (props.responseState == 'incorrect-no-attempts') return

		let response = verify(item)
		let responseState = 'none'

		if (!response) {
			if ((props.attemptLimit - 1) > props.attemptsUsed) {
				responseState = 'incorrect-attempts-remaining'
				// dispatch({
				// 	type: 'set_live_region', payload: `Your answer was not quite right. You have ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`
				// })
			}
			else {
				responseState = 'incorrect-no-attempts'
				// dispatch({
				// 	type: 'set_live_region', payload: "Your answer was not quite right. You've exhausted your attempts for this question."
				// })
			}
		}
		else {
			responseState = 'correct'
		}

		dispatch({
			type: 'attempt_submit', payload: {
				questionIndex: state.currentIndex,
				response: responseState
			}
		})

		// Redirect focus
		if (props.attemptLimit - 1 > props.attemptsUsed && props.responseState != 'correct')
		{
			document.getElementById("check-question-btn").focus();
		}
		else
		{
			document.getElementById("next-question-btn").focus();
		}
	}

	const verify = (item) => {

		if (item.sorted.length != item.correctPhrase.length) {
			return false
		}

		for (let i = 0; i < item.sorted.length; i++) {

			if (item.displayPref == 'word') {
				if (item.sorted[i].value != item.correctPhrase[i].value || item.sorted[i].legend != item.sorted[i].legend) return false
			}
			else if (item.displayPref == 'legend') {
				if (item.sorted[i].legend != item.correctPhrase[i].legend) return false
			}
		}
		return true
	}


	let isLastQuestion = state.currentIndex == state.items.length - 1

	let currentResponseText = ''

	let remaining = props.attemptLimit - props.attemptsUsed

	let hasHint = state.items[state.currentIndex]?.hint.length > 0

	switch (props.responseState) {
		case 'ready':

			if (isLastQuestion && remaining > 0) {
				currentResponseText = <span className='controls-message'>You have <span className='strong'>{remaining}</span> attempt{remaining > 1 ? 's' : ''} remaining. Select <span className='strong'>Check Answer</span> to check your answer, or select <span className='strong'>Submit</span> at the top-right for scoring.</span>
			}
			else if (isLastQuestion) {
				currentResponseText = <span className='controls-message'>When you're ready, select <span className='strong'>Submit</span> at the top-right for scoring or go back and review your answers.</span>
			}
			else {
				currentResponseText = <span className='controls-message'>You have <span className='strong'>{remaining}</span> attempt{remaining > 1 ? 's' : ''} remaining. Select <span className='strong'>Check Answer</span> to check your answer, or select <span className='strong'>Next Question</span> to continue.</span>
			}
			break
		case 'pending':
			currentResponseText = <span>PENDING</span>
			break
		case 'incorrect-attempts-remaining':
			currentResponseText = <span className='controls-message'>Your answer was not quite right. You have <span className='strong'>{remaining}</span> attempt{remaining > 1 ? 's' : ''} remaining. {hasHint ? 'Press the H key to hear a hint.' : ''}</span>
			break
		case 'incorrect-no-attempts':
			if (isLastQuestion) {
				currentResponseText = <span className='controls-message'>Your answer was not quite right. You've exhausted your attempts for this question. When you're ready, select <span className='strong'>Submit</span> at the top-right for scoring or go back and review your answers.</span>
			}
			else {
				currentResponseText = <span className='controls-message'>Your answer was not quite right. You've exhausted your attempts for this question. Select <span className='strong'>Next Question</span> to continue.</span>
			}
			break
		case 'correct':
			if (isLastQuestion) {
				currentResponseText = <span className='controls-message'>Nice work! You aced it. When you're ready, select <span className='strong'>Submit</span> at the top-right for scoring or go back and review your answers.</span>
			}
			else {
				currentResponseText = <span className='controls-message'>Nice work! You aced it. Select <span className='strong'>Next Question</span> to continue.</span>
			}
			break
		case 'none':
		default:
			currentResponseText = <span>NONE</span>
			break
	}

	return (
		<section className={'token-drawer ' +
			`${(props.tokens?.length == 0) ? 'empty ' : ''}` +
			`${props.responseState} ` +
			`${props.hasFakes ? 'has-fakes ' : ''}`}
			onDragOver={handleTokenDragOver}
			onDrop={handleTokenDrop}>
			{props.tokens && props.tokens.length > 0 ? <div role="group" aria-describedby="token-drawer-desc">
				<h3 id="token-drawer-desc">Token Drawer</h3>
				{props.tokens}
				</div> : <></>}
			<section className='response-controls'>
				<div className='response-message-container'>
					<div id="response-dialog-desc" aria-live="assertive" aria-atomic="true">{currentResponseText}</div>
				</div>
				<div className='button-container'>
					<button id='check-question-btn' className={`verify ${props.attemptLimit > props.attemptsUsed && props.responseState != 'correct' ? 'show' : ''}`} onClick={handleCheckAnswer} aria-describedby="response-dialog-desc">Check Answer</button>
					<button id="next-question-btn" className={`paginate ${!isLastQuestion ? 'show' : ''}`} onClick={paginate} aria-describedby="response-dialog-desc">Next Question</button>
				</div>
			</section>
		</section>
	)
}

export default TokenDrawer
