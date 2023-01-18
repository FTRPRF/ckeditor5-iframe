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

		this.urlInput = this._createInput( 'URL', 'ck ck-iframe-url' );
		this.widthInput = this._createInput( 'Width', 'ck ck-iframe-width' );
		this.heightInput = this._createInput( 'Height', 'ck ck-iframe-height' );
		this.nameInput = this._createInput( 'Name', 'ck ck-iframe-name' );
		this.advisoryTitleInput = this._createInput( 'Advisory Title', 'ck ck-iframe-advisorytitle' );
		this.longDescriptionInput = this._createInput( 'Long Description URL', 'ck ck-iframe-longdesc' );
		this.alignmentDropdown = this._createDropdown( 'Alignment', [
			{ icon: icons.alignLeft, text: 'left', className: 'ck ck-iframe-alignleft' },
			{ icon: icons.alignCenter, text: 'middle', className: 'ck ck-iframe-alignmiddle' },
			{ icon: icons.alignRight, text: 'right', className: 'ck ck-iframe-alignright' }
		], 'ck ck-iframe-alignment' );
		this.showScrollbarsToggle = this._createCheckbox( 'Enable scrollbars', 'ck ck-iframe-scrollbars', 'showScrollbars' );
		this.showBorderToggle = this._createCheckbox( 'Show frame border', 'ck ck-iframe-borders', 'showBorders' );
		this.okButton = this._createButton( 'OK', icons.check, 'ck-iframe-button-ok ck-button-save' );
		this.cancelButton = this._createButton( 'Cancel', icons.cancel, 'ck-iframe-button-cancel ck-button-cancel' );

		// Submit type of the button will trigger the submit event on entire form when clicked
		// (see submitHandler() in render() below).
		this.okButton.type = 'submit';

		// Delegate ButtonView#execute to FormView#cancel.
		this.cancelButton.delegate( 'execute' ).to( this, 'cancel' );
		this.okButton.delegate( 'execute' ).to( this, 'submit' );

		this.secondRow = this.createCollection( [
			this.widthInput,
			this.heightInput,
			this.alignmentDropdown
		] );

		this.thirdRow = this.createCollection( [
			this.showScrollbarsToggle,
			this.showBorderToggle
		] );

		this.fourthRow = this.createCollection( [
			this.nameInput,
			this.advisoryTitleInput
		] );

		this.buttonRow = this.createCollection( [
			this.okButton,
			this.cancelButton
		] );

		this.childViews = this.createCollection( [
			this.urlInput,
			this.widthInput,
			this.heightInput,
			this.alignmentDropdown,
			this.showScrollbarsToggle,
			this.showBorderToggle,
			this.nameInput,
			this.advisoryTitleInput,
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
			children: [
				this.urlInput,
				{
					tag: 'div',
					attributes: {
						class: [ 'ck', 'ck-iframe-2nd-row', 'ck-iframe-row' ]
					},
					children: this.secondRow
				},
				{
					tag: 'div',
					attributes: {
						class: [ 'ck', 'ck-iframe-3d-row', 'ck-iframe-row' ]
					},
					children: this.thirdRow
				},
				{
					tag: 'div',
					attributes: {
						class: [ 'ck', 'ck-iframe-4th-row', 'ck-iframe-row' ]
					},
					children: this.fourthRow
				},
				this.longDescriptionInput,
				{
					tag: 'div',
					attributes: {
						class: [ 'ck', 'ck-iframe-button-row', 'ck-iframe-row' ]
					},
					children: this.buttonRow
				}
			]
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
			withText: true,
			class: className
		} );

		return button;
	}

	_createCheckbox( label, className, propertyName ) {
		const checkbox = new SwitchButtonView();

		checkbox.set( {
			bindIsOn: true,
			class: className,
			withText: true,
			label,
		} );

		this.listenTo( checkbox, 'execute', evt => {
			const { element } = evt.source;
			const isPressed = element.getAttribute( 'aria-pressed' ) === 'false';
			if ( isPressed ) {
				this._setCheckboxChecked( element );
			} else {
				this._setCheckboxUnchecked( element );
			}

			this[ propertyName ] = isPressed;
		} );

		checkbox.render();

		this[ propertyName ] = false;
		this._setCheckboxChecked( checkbox.element );

		return checkbox;
	}

	_createDropdown( label, options ) {
		const dropdown = createDropdown( this.locale );
		const buttons = {};
		const labelButton = {
			label,
			withText: true
		};

		dropdown.buttonView.set( labelButton );

		const items = new Collection();

		options.forEach( option => {
			const buttonObject = {
				type: 'button',
				option,
				model: new Model( {
					class: option.className,
					icon: option.icon,
					label: option.text,
					withText: true
				} )
			};
			buttons[ option.text ] = buttonObject;
			items.add( buttonObject );
		} );

		addListToDropdown( dropdown, items );

		this.listenTo( dropdown, 'execute', evt => {
			const choice = evt.source.element.textContent;
			const buttonOptions = buttons[ choice ].option;
			dropdown.buttonView.label = `Align ${ buttonOptions.text }`;
			this.alignment = choice;
		} );

		this.alignment = 'middle';
		dropdown.render();
		return dropdown;
	}
	_createInput( label, className, infoText ) {
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText, 'testje' );

		labeledInput.label = label;
		labeledInput.class = className;
		if ( infoText ) {
			labeledInput.infoText = 'dit is een testje';
		}

		return labeledInput;
	}

	_setCheckboxChecked( checkbox ) {
		checkbox.setAttribute( 'aria-pressed', 'true' );
		checkbox.classList.add( 'ck-on' );
		checkbox.classList.remove( 'ck-off' );
	}

	_setCheckboxUnchecked( checkbox ) {
		checkbox.setAttribute( 'aria-pressed', 'false' );
		checkbox.classList.add( 'ck-off' );
		checkbox.classList.remove( 'ck-on' );
	}
}
