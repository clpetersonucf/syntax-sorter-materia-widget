import React, {useContext} from 'react'
import ReactDOM from 'react-dom'
import TokenDrawer from './token-drawer'
import Token from './token'
import { store } from '../../player-store'

const PhrasePlayer = (props) => {

	const global = useContext(store)
	const dispatch = global.dispatch

	const handleTokenDragOver = (event) => {

		// Exits the function if the max number of guesses have been used
		if (props.attemptLimit > 1 && (props.attemptsUsed >= props.attemptLimit)) return false

		event.preventDefault()

		const cursor = event.clientX
		const cursorY = event.clientY

		let leftToken = null
		let rightToken = null

		for (let i=0; i<props.sorted.length; i++) {
			let pos = props.sorted[i].position
			let left = pos.x
			let right = pos.x + pos.width
			let height = pos.y

			if (cursorY > height - 40 && cursorY < height + 40) {
				if (cursor > left) {
					if (!leftToken || (leftToken && left > leftToken.position.x)) {
						leftToken = props.sorted[i]
						leftToken.index = i
					}
				}
				else if (cursor < right) {
					if (!rightToken || (rightToken && right < rightToken.position.x + rightToken.position.width)) {
						rightToken = props.sorted[i]
						rightToken.index = i
					}
				}
			}
		}

		manageAdjacentTokenDisplay(leftToken, rightToken)
	}

	const handleTokenDrop = (event) => {
		event.preventDefault()
		let dropTokenId = event.dataTransfer.getData("tokenId")
		let dropTokenName = event.dataTransfer.getData("tokenName")
		let dropTokenType = event.dataTransfer.getData("tokenType")
		let dropTokenPhraseIndex = event.dataTransfer.getData("tokenPhraseIndex")
		let dropTokenStatus = event.dataTransfer.getData("tokenStatus")
		let dropTokenFakeout = (event.dataTransfer.getData("tokenFakeout") == "true") ? true : false

		let index = 0

		for (let i = 0; i<props.sorted.length; i++) {

			if (props.sorted[i].id == dropTokenId) continue

			if (props.sorted[i].arrangement == "left") {
				index = i + 1
			}
			else if (props.sorted[i].arrangement == "right") {
				index = i > 0 ? i : 0
			}
		}

		switch (dropTokenStatus) {
			case 'sorted':
				dispatch({
					type: 'response_token_rearrange',
					payload: {
						questionIndex: global.state.currentIndex,
						targetIndex: index,
						id: dropTokenId,
						legend: dropTokenType,
						value: dropTokenName,
						originIndex: parseInt(dropTokenPhraseIndex),
						fakeout: dropTokenFakeout
					}
				})
				break
			case 'unsorted':
			default:
				dispatch({
					type: 'response_token_sort',
					payload: {
						questionIndex: global.state.currentIndex,
						targetIndex: index,
						id: dropTokenId,
						legend: dropTokenType,
						value: dropTokenName,
						phraseIndex: parseInt(dropTokenPhraseIndex),
						fakeout: dropTokenFakeout
					}
				})

				break
		}
		manageAdjacentTokenDisplay(null, null)
	}

	const manageAdjacentTokenDisplay = (left, right) => {
		dispatch({type: 'adjacent_token_update', payload: {
			questionIndex: global.state.currentIndex,
			left: left?.id,
			right: right?.id
		}})
	}

	const forceClearAdjacentTokens = () => {
		manageAdjacentTokenDisplay(null, null)
	}

	let sortedTokens = props.sorted?.map((token, index) => {
		console.log(props.responseState)
		return <Token
			id={token.id}
			key={index}
			index={index}
			type={token.legend}
			value={token.value}
			pref={props.displayPref}
			status={token.status}
			arrangement={token.arrangement}
			position={token.position}
			reqPositionUpdate={token.reqPositionUpdate}
			fakeout={token.fakeout}
			dragEligible={!(props.attemptsUsed >= props.attemptLimit || props.responseState == 'correct')}
			forceClearAdjacentTokens={forceClearAdjacentTokens}>
		</Token>
	})

	return(
		<section className={'card phrase-player ' +
			`${props.attemptLimit > 1 && (props.phrase.length == 0 || props.hasFakes) ? 'pending ' : ''}` +
			`${props.attemptLimit > 1 ? props.responseState + ' ' : ''}` +
			`${props.hasFakes ? 'fakeout ' : ''}`}>
			<div className={`token-container ${props.hasFakes ? "fakeout" : ''}`}>
				<div className="token-target" onDragOver={handleTokenDragOver} onDrop={handleTokenDrop}>
					{props.sorted?.length ? '' : 'Drag and drop the words below to arrange them.'}
					{sortedTokens}
				</div>
				<span className={`fakeout-tip ${props.hasFakes ? "show" : ''}`}>
					<span className='icon-notification'></span>Not all of the items below may be part of the correct phrase.
				</span>
			</div>
			<TokenDrawer
				phrase={props.phrase}
				empty={props.sorted?.length == 0}
				displayPref={props.displayPref}
				attemptsUsed={props.attemptsUsed}
				attemptLimit={props.attemptLimit}
				hasFakes={props.hasFakes}
				responseState={props.responseState}
				></TokenDrawer>
		</section>
	)
}

export default PhrasePlayer
