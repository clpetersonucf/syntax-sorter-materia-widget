import React, { useContext, useEffect } from 'react'
import QuestionSelect from './question-select'
import PhrasePlayer from './phrase-player'
import PlayerTutorial from './player-tutorial'
import WarningModal from './warning-modal'
import AriaLive from './aria-live'
import { store, DispatchContext } from '../../player-store'

const PlayerApp = (props) => {

	const state = useContext(store)
	const dispatch = useContext(DispatchContext)

	useEffect(() => {
		if (state.requireInit) {
			dispatch({
				type: 'init', payload: {
					qset: props.qset,
					title: props.title
				}
			})

			document.addEventListener("mouseup", mouseUpHandler)
		}
	}, [state.requireInit])

	// Used to prevent reads from being highlighted then dragged
	const mouseUpHandler = () => {
		if (window.getSelection().toString().length > 0) {
			window.getSelection().removeAllRanges();
		}
	}

	const convertSortedForLogging = (sorted) => {

		let response = []
		for (let i = 0; i < sorted.length; i++) {

			for (const term of state.legend) {
				if (parseInt(sorted[i].legend) == term.id) var legend = term.name
			}

			response.push({
				value: sorted[i].value,
				legend: legend
			})
		}

		return JSON.stringify(response)
	}

	const emptyQuestionCheck = () => {

		let isEmpty = false
		let i = 0;

		for (let item of state.items) {
			if (item.sorted.length <= 0) {
				dispatch({type: 'select_question', payload: i})
				isEmpty = true
				break
			}
			i++
		}
		return isEmpty
	}

	const handleSubmit = () => {

		if (emptyQuestionCheck() == true) {
			dispatch({ type: 'toggle_warning' })
			return
		}
		else {
			submitForScoring()
		}
	}

	const submitForScoring = () => {
		for (let item of state.items) {
			Materia.Score.submitQuestionForScoring(item.qsetId, convertSortedForLogging(item.sorted))
		}

		Materia.Engine.end(true)
	}

	const toggleTutorial = () => {
		dispatch({ type: 'toggle_tutorial' })
	}

	const questionText = state.items[state.currentIndex]?.question.length > 0 ? state.items[state.currentIndex].question : "Drag and drop to arrange the items below in the correct order."

	const legendList = state.legend.map((term, index) => {
		return <div key={index} aria-label={term.name}>
			<dt className='legend-color' style={{ background: term.color }} aria-label="Color" aria-hidden="true"></dt>
			<dd aria-hidden="true">{term.name}</dd>
		</div>
	})

	const getLegendName = (type) => {
		for (const term of state.legend) {
			if (type == term.id) return term.name
		}
	}

	const handleOnKeyDown = (event) => {
		if (event.key == "R" || event.key == "r")
		{
			readCurrentPhrase();
		}
		else if (event.key == "H" || event.key == "h")
		{
			readHint();
		}
	}

	const readHint = () => {
		var msg = new SpeechSynthesisUtterance();

		if (state.items[state.currentIndex]?.attemptsUsed > 0 && state.items[state.currentIndex]?.attemptsUsed < state.items[state.currentIndex]?.attempts &&state.items[state.currentIndex]?.responseState != 'correct' && state.items[state.currentIndex]?.responseState != 'incorrect-no-attempts' && state.items[state.currentIndex]?.hint.length > 0)
		{
			msg.text = state.items[state.currentIndex].hint;
		}
		else
		{
			msg.text = "No hint available."
		}
		window.speechSynthesis.speak(msg);
	}

	const readCurrentPhrase = () => {
		var msg = new SpeechSynthesisUtterance();

		var currentQuestion = state.items[state.currentIndex];

		if (currentQuestion.sorted.length < 1)
		{
			msg.text = "Empty."
		}
		else
		{
			let sortedPhrase = currentQuestion.sorted.map((token) => {
				return (currentQuestion.displayPref == 'word' ? token.value : getLegendName(token.legend))
			}).join(" ");

			msg.text = sortedPhrase;
		}
		window.speechSynthesis.speak(msg);
	}

	return (
		<div className="player-container"
		onKeyDown={handleOnKeyDown}>
			<AriaLive></AriaLive>
			<WarningModal
				submitForScoring={submitForScoring}
				requireAllQuestions={state.requireAllQuestions}></WarningModal>
			<PlayerTutorial></PlayerTutorial>
			<header className="player-header" inert={state.showTutorial || state.showWarning ? '': undefined} aria-hidden={state.showTutorial || state.showWarning ? "true" : "false"}>
				<h1 className="title">{state.title}</h1>
				<div className="player-header-btns">
					<button className="headerBtn" onClick={toggleTutorial}>Tutorial</button>
					<button className="headerBtn" onClick={handleSubmit}>Submit</button>
				</div>
			</header>
			<QuestionSelect></QuestionSelect>
			<main className="content-container" inert={state.showTutorial || state.showWarning ? '' : undefined} aria-hidden={state.showTutorial || state.showWarning ? "true": "false"}>
				<section className="card question-container">
					<h2 id="question-text" aria-label={"Question: " + questionText}>{questionText}</h2>
				</section>
				<section className={`card hint-text 
					${(
						state.items[state.currentIndex]?.attemptsUsed > 0 &&
						state.items[state.currentIndex]?.attemptsUsed < state.items[state.currentIndex]?.attempts &&
						state.items[state.currentIndex]?.responseState != 'correct' &&
						state.items[state.currentIndex]?.responseState != 'incorrect-no-attempts' &&
						state.items[state.currentIndex]?.hint.length > 0) ? 'show' : ''}`}>
						<p><span className="strong">Hint: </span>
						<span>{state.items[state.currentIndex]?.hint}</span></p>
				</section>
				<PhrasePlayer
					phrase={state.items[state.currentIndex]?.phrase}
					sorted={state.items[state.currentIndex]?.sorted}
					displayPref={state.items[state.currentIndex]?.displayPref}
					attemptsUsed={state.items[state.currentIndex]?.attemptsUsed}
					attemptLimit={state.items[state.currentIndex]?.attempts}
					hasFakes={state.items[state.currentIndex]?.fakeout.length}
					responseState={state.items[state.currentIndex]?.responseState}
					readCurrentPhrase={readCurrentPhrase}></PhrasePlayer>
				<section className="card legend">
					<header id="color-legend-header">Color Legend</header>
					<dl aria-labelledby="color-legend-header">
						{legendList}
					</dl>
				</section>
			</main>
		</div>
	)
}

export default PlayerApp
