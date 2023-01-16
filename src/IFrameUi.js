import { Plugin } from 'ckeditor5/src/core';
import { clickOutsideHandler, ContextualBalloon } from 'ckeditor5/src/ui';
import IFrameView from './IFrameView';

export default class IFrameUi extends Plugin {
	static get requires() {
		return [ ContextualBalloon ];
	}

	init() {
		const editor = this.editor;

		this._balloon = this.editor.plugins.get( ContextualBalloon );
		this.iframeView = this._createIframeView();

		// Add the "iframeButton"
		editor.ui.componentFactory.add( 'IFrameButton', () => {
			this._showUI();
		} );
	}

	_createIframeView() {
		const editor = this.editor;
		const model = editor.model;
		const iframeView = new IFrameView( editor.locale );

		this.listenTo( iframeView, 'submit', () => {
			const url = iframeView.urlInput.value();
			const width = iframeView.widthInput.value();
			const height = iframeView.heightInput.value();
			const alignment = iframeView.alignmentDropdown.value();
			const showScrollBars = iframeView.showScrollbarsToggle.value();
			const showBorders = iframeView.showBorderToggle.value();
			const name = iframeView.nameInput.value();
			const title = iframeView.advisoryTitleInput.value();
			const description = iframeView.longDescriptionInput.value();

			// eslint-disable-next-line no-undef
			console.log( showBorders );
			// eslint-disable-next-line no-undef
			console.log( showScrollBars );

			model.change( () => {
				model.insertContent(
					`<div class="ck ck-iframeWrapper ck-align-${ alignment }">
						<iframe
						 	height="${ height }"
						 	longdesc="${ description }"
						 	name="${ name }"
						 	src="${ url }"
						 	title="${ title }"
						 	width="${ width }"
						></iframe>
					</div>`
				);
			} );

			// hide the view after submit
			this._hideUI();
		} );

		this.listenTo( iframeView, 'cancel', () => {
			this._hideUI();
		} );

		// Hide the form view when clicking outside the balloon.
		clickOutsideHandler( {
			emitter: iframeView,
			activator: () => this._balloon.visibleView === iframeView,
			contextElements: [ this._balloon.view.element ],
			callback: () => this._hideUI()
		} );

		return iframeView;
	}

	_hideUI() {
		this.iframeView.urlInput.value = '';
		this.iframeView.widthInput.value = '';
		this.iframeView.heightInput.value = '';
		this.iframeView.alignmentDropdown.value = '';
		this.iframeView.showScrollbarsToggle.value = '';
		this.iframeView.showBorderToggle.value = '';
		this.iframeView.nameInput.value = '';
		this.iframeView.advisoryTitleInput.value = '';
		this.iframeView.longDescriptionInput.value = '';
		this.iframeView.element.reset();

		this._balloon.remove( this.iframeView );

		// Focus the editing view after closing the form view.
		this.editor.editing.view.focus();
	}
	_getBalloonPositionData() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;
		let target = null;

		// Set a target position by converting view selection range to DOM.
		target = () => view.domConverter.viewRangeToDom(
			viewDocument.selection.getFirstRange()
		);

		return {
			target
		};
	}

	_showUI() {
		this._balloon.add( {
			view: this.formView,
			position: this._getBalloonPositionData()
		} );

		this.formView.focus();
	}
}
