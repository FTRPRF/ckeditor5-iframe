/* eslint-disable no-undef */
/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import {
	addListToDropdown,
	ButtonView,
	createDropdown,
	createLabeledInputText,
	FocusCycler,
	LabeledFieldView,
	Model,
	submitHandler,
	SwitchButtonView,
	View
} from 'ckeditor5/src/ui';
import { Collection, FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils';
import { icons } from 'ckeditor5/src/core';

export default class FormView extends View {
	constructor( locale, ui ) {
		super( locale );

		this.ui = ui;
		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		this.urlInput = this._createInput( 'URL' );
		this.widthInput = this._createInput( 'Width' );
		this.heightInput = this._createInput( 'Height' );
		this.nameInput = this._createInput( 'Name' );
		this.advisoryTitleInput = this._createInput( 'Advisory Title' );
		this.longDescriptionInput = this._createInput( 'Long Description URL' );
		this.alignmentDropdown = this._createDropdown( 'Alignment', [
			{ icon: icons.alignLeft, text: 'left' },
			{ icon: icons.alignCenter, text: 'middle' },
			{ icon: icons.alignRight, text: 'right' }
		] );
		this.showScrollbarsToggle = this._createCheckbox( 'Enable scrollbars' );
		this.showBorderToggle = this._createCheckbox( 'Show frame border' );
		this.okButton = this._createButton( 'OK', icons.check, 'ck-iframe-button-ok ck-button-save' );
		this.cancelButton = this._createButton( 'Cancel', icons.cancel, 'ck-iframe-button-cancel ck-button-cancel' );

		// Submit type of the button will trigger the submit event on entire form when clicked
		// (see submitHandler() in render() below).
		this.okButton.type = 'submit';

		// Delegate ButtonView#execute to FormView#cancel.
		this.cancelButton.delegate( 'execute' ).to( this, 'cancel' );
		this.okButton.delegate( 'execute' ).to( this, 'submit' );

		this.childViews = this.createCollection( [
			this.urlInput,
			this.widthInput,
			this.heightInput,
			this.alignmentDropdown,
			this.nameInput,
			this.advisoryTitleInput,
			this.showScrollbarsToggle,
			this.showBorderToggle,
			this.longDescriptionInput,
			this.okButton,
			this.cancelButton
		] );

		this._focusCycler = new FocusCycler( {
			focusables: this.childViews,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the Shift + Tab keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the Tab key.
				focusNext: 'tab'
			}
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-iframe-wrapper' ],
				tabindex: '-1'
			},
			children: this.childViews
		} );
	}

	render() {
		super.render();

		submitHandler( {
			view: this
		} );

		this.childViews._items.forEach( view => {
			// Register the view in the focus tracker.
			this.focusTracker.add( view.element );
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element );
	}

	destroy() {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	focus() {
		// If the abbreviation text field is enabled, focus it straight away to allow the user to type.
		if ( this.urlInput.isEnabled ) {
			this.urlInput.focus();
		}
		// Focus the abbreviation title field if the former is disabled.
		else {
			this.widthInput.focus();
		}
	}

	_createButton( label, icon, className ) {
		const button = new ButtonView();

		button.set( {
			label,
			icon,
			// tooltip: true,
			class: className
		} );

		return button;
	}

	_createCheckbox( label ) {
		const checkbox = new SwitchButtonView();

		checkbox.set( {
			withText: true,
			label
		} );

		checkbox.on( 'execute', () => {

		} );

		checkbox.render();

		return checkbox;
	}

	_createDropdown( label, options ) {
		const dropdown = createDropdown( this.locale );
		const buttons = [];
		const labelButton = {
			label,
			withText: true
		};

		dropdown.buttonView.set( labelButton );

		const items = new Collection();

		options.forEach( option => {
			const buttonObject = {
				type: 'button',
				model: new Model( {
					icon: option.icon,
					label: option.text,
					withText: true
				} )
			};
			buttons[ option.label ] = buttonObject;
			items.add( buttonObject );
		} );

		addListToDropdown( dropdown, items );

		// this does not work sadly, but mostly cause the command isn't found it seems
		this.listenTo( dropdown, 'execute', evt => {
			const choice = evt.source.element.textContent;
			console.log( { choice } );
			dropdown.buttonView.set( buttons[ choice ] );
			this.ui.alignment = choice;
			console.log( { alignmentUi: this.ui.alignment } );
		} );

		dropdown.render();
		return dropdown;
	}
	_createInput( label ) {
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );

		labeledInput.label = label;

		return labeledInput;
	}
}
