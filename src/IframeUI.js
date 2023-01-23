/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView, ContextualBalloon, clickOutsideHandler } from 'ckeditor5/src/ui';
import FormView from './IframeView';
import './styles.css';
import { getClosestSelectedIframe } from './utils';

export default class IframeUI extends Plugin {
	static get requires() {
		return [ ContextualBalloon ];
	}

	init() {
		const editor = this.editor;

		// Create the balloon and the form view.
		this._balloon = this.editor.plugins.get( ContextualBalloon );
		this.formView = this._createFormView();

		editor.ui.componentFactory.add( 'iframe', () => {
			const button = new ButtonView();

			button.label = 'Iframe';
			button.tooltip = true;
			button.withText = true;

			// Show the UI on button click.
			this.listenTo( button, 'execute', evt => {
				const { element } = evt.source;
				const { parentElement: parent } = element;
				const { parentElement: grandParent } = parent;
				const originatesFromWidgetToolbar = grandParent.getAttribute( 'aria-label' ).includes( 'widget' );

				if ( originatesFromWidgetToolbar ) {
					const { model } = editor;
					const { selection } = model.document;
					const iframeElement = getClosestSelectedIframe( selection );

					this._showUI( {
						advisoryTitle: iframeElement.getAttribute( 'advisoryTitle' ),
						alignment: iframeElement.getAttribute( 'alignment' ),
						height: iframeElement.getAttribute( 'height' ),
						longDescription: iframeElement.getAttribute( 'longDescription' ),
						name: iframeElement.getAttribute( 'name' ),
						showBorders: iframeElement.getAttribute( 'showBorders' ),
						showScrollbars: iframeElement.getAttribute( 'showScrollbars' ),
						url: iframeElement.getAttribute( 'url' ),
						width: iframeElement.getAttribute( 'width' )
					} );
					return;
				}

				this._showUI();
			} );

			return button;
		} );
	}

	_createFormView() {
		const editor = this.editor;
		const { t } = editor.locale;
		const formView = new FormView( editor.locale, t );

		// Execute the command after clicking the "Save" button.
		this.listenTo( formView, 'submit', () => {
			// Grab values from the iframe fields.
			const value = {
				advisoryTitle: formView.advisoryTitleInput.fieldView.element.value,
				alignment: formView.alignment,
				height: formView.heightInput.fieldView.element.value,
				longDescription: formView.longDescriptionInput.fieldView.element.value,
				name: formView.nameInput.fieldView.element.value,
				showBorders: formView.showBorders,
				showScrollbars: formView.showScrollbars,
				url: formView.urlInput.fieldView.element.value,
				width: formView.widthInput.fieldView.element.value
			};

			editor.execute( 'addIframe', value );

			// Hide the form view after submit.
			this._hideUI( formView, t );
		} );

		// Hide the form view after clicking the "Cancel" button.
		this.listenTo( formView, 'cancel', () => {
			this._hideUI( formView, t );
		} );

		// Hide the form view when clicking outside the balloon.
		clickOutsideHandler( {
			emitter: formView,
			activator: () => this._balloon.visibleView === formView,
			contextElements: [ this._balloon.view.element ],
			callback: () => this._hideUI( formView, t )
		} );

		return formView;
	}

	_showUI( previousValue ) {
		const { t } = this.editor.locale;

		// Check the value of the command.
		const commandValue = this.editor.commands.get( 'addIframe' ).value || previousValue;

		this._balloon.add( {
			view: this.formView,
			position: this._getBalloonPositionData()
		} );

		// Fill the form using the state (value) of the command.
		if ( commandValue ) {
			this.formView.advisoryTitleInput.fieldView.value = commandValue.advisoryTitle;
			this.formView.alignment = commandValue.alignment;
			this.formView.alignmentDropdown.listView.element.value = commandValue.alignment;
			this.formView.alignmentDropdown.buttonView.label = t( 'Align %0', commandValue.alignment );
			this.formView.heightInput.fieldView.value = commandValue.height;
			this.formView.longDescriptionInput.fieldView.value = commandValue.longDescription;
			this.formView.nameInput.fieldView.value = commandValue.name;
			this.formView.showBorderToggle.element.setAttribute( 'aria-pressed', ( commandValue.showBorders ? 'true' : 'false' ) );
			this.formView.showBorders = Boolean( commandValue.showBorders );
			if ( !commandValue.showBorders ) {
				this.formView.showBorderToggle.element.classList.remove( 'ck-on' );
				this.formView.showBorderToggle.element.classList.add( 'ck-off' );
			}
			this.formView.showScrollbarsToggle.element.setAttribute( 'aria-pressed', ( commandValue.showScrollbars ? 'true' : 'false' ) );
			this.formView.showScrollbars = Boolean( commandValue.showScrollbars );
			if ( !commandValue.showScrollbars ) {
				this.formView.showScrollbarsToggle.element.classList.remove( 'ck-on' );
				this.formView.showScrollbarsToggle.element.classList.add( 'ck-off' );
			}
			this.formView.urlInput.fieldView.value = commandValue.url;
			this.formView.widthInput.fieldView.value = commandValue.width;
		}

		this.formView.focus();
	}

	_hideUI( formView, t ) {
		const borderElement = formView.showBorderToggle.element;
		const scrollbarsElement = formView.showScrollbarsToggle.element;

		// Clear the input field values and reset the form.
		formView.advisoryTitleInput.fieldView.element.value = '';
		formView.alignmentDropdown.buttonView.label = t( 'Alignment' );
		formView.heightInput.fieldView.element.value = '';
		formView.longDescriptionInput.fieldView.element.value = '';
		formView.nameInput.fieldView.element.value = '';
		borderElement.setAttribute( 'aria-pressed', 'true' );
		borderElement.classList.remove( 'ck-off' );
		borderElement.classList.add( 'ck-on' );
		scrollbarsElement.setAttribute( 'aria-pressed', 'true' );
		scrollbarsElement.classList.remove( 'ck-off' );
		scrollbarsElement.classList.add( 'ck-on' );
		formView.urlInput.fieldView.element.value = '';
		formView.widthInput.fieldView.element.value = '';

		this._balloon.remove( formView );

		// Focus the editing view after inserting the iframe so the user can start typing the content
		// right away and keep the editor focused.
		this.editor.editing.view.focus();
	}

	_getBalloonPositionData() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;

		// Set a target position by converting view selection range to DOM
		const target = () => view.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange() );

		return {
			target
		};
	}
}
