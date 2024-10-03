import React, { useContext } from 'react'
import { store } from '../../creator-store'
import FakeoutBuilder from './fakeout-builder'

const CreatorFakeoutModal = (props) => {

	const manager = useContext(store)
	const dispatch = manager.dispatch

	const dismiss = () => {
		dispatch({ type: 'toggle_fakeout_modal' })
	}

	return (
		<div className='modal-wrapper' style={{ display: manager.state.showFakeoutModal ? 'flex' : 'none' }}>
			<div className='modal creator wide centered'>
				<h3>Add "Fake" Tokens</h3>
				<p>Increase the difficulty of your question by adding additional tokens alongside the "real" ones. The student will be notified that these extra tokens exist, and that not all
					tokens available may be part of the final phrase.</p>
				<FakeoutBuilder></FakeoutBuilder>
				<button className='modal-dismiss' onClick={dismiss}>Okay</button>
			</div>
			<div className='modal-bg'></div>
		</div>
	)
}

export default CreatorFakeoutModal
