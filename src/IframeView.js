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
	ViewModel,
	submitHandler,
	SwitchButtonView,
	View
} from 'ckeditor5/src/ui';
import { Collection, FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils';
import { icons } from 'ckeditor5/src/core';
import { validateStringByRegex } from './utils';

export default class FormView extends View {
	constructor( locale, t ) {
		super( locale );

		this._addFields( t );
		this._ensureButtonsWork();

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

	_addFields( t ) {
		this._focusCycler = this._createFocusCycler();

		/**
		 * An array of form validators used by {@link #isValid}.
		 *
		 * @readonly
		 * @protected
		 * @member {Array.<Function>}
		 */
		this._validators = [];

		this.advisoryTitleInput = null;
		this.alignment = null;
		this.alignmentDropdown = null;
		this.buttonRow = null;
		this.cancelButton = null;
		this.childViews = null;
		this.heightInput = null;
		this.focusTracker = new FocusTracker();
		this.fourthRow = null;
		this.keystrokes = new KeystrokeHandler();
		this.longDescriptionInput = null;
		this.nameInput = null;
		this.okButton = null;
		this.secondRow = null;
		this.showBorderToggle = true;
		this.showScrollbarsToggle = true;
		this.t = t;
		this.thirdRow = null;
		this.urlInput = null;
		this.widthInput = null;

		this._createFormFields();
		this._createChildViews();
		this._createRows();
		this._addValidators();
	}

	_addValidators() {
		this._validators = [
			{
				errorText: 'TitleError',
				field: this.advisoryTitleInput,
				validate: () => {
					const value = this.advisoryTitleInput.fieldView.element.value.trim();

					if ( !value ) {
						return true;
					}

					return value.length < 256;
				}
			},
			{
				errorText: 'WidthHeightError',
				field: this.heightInput,
				validate: () => {
					const value = this.heightInput.fieldView.element.value.trim();
					const regex = /^-?[0-9]+(\.[0-9]+)?(px|em|rem|vw|vh|vmin|vmax|%|cm|mm|in|pt|pc)$/;

					if ( !value ) {
						return true;
					}

					return validateStringByRegex( value, regex );
				}
			},
			{
				errorText: 'UrlError',
				field: this.longDescriptionInput,
				validate: () => {
					const value = this.longDescriptionInput.fieldView.element.value.trim();

					/*
					 * This only validates:
					 * - if the url starts with https
					 * because URL validation done right is beyond our scope.  Let alone IRI validation.
					 * See https://stackoverflow.com/a/1411800/2248415 for more info.
					 */
					const regex = /^(https):\/\/[^ "]+$/;

					if ( !value ) {
						return true;
					}

					return validateStringByRegex( value, regex );
				}
			},
			{
				errorText: 'NameError',
				field: this.nameInput,
				validate: () => {
					const value = this.nameInput.fieldView.element.value.trim();
					const regex = /^(_self|_blank|_parent|_top)$/;

					if ( !value ) {
						return true;
					}

					return validateStringByRegex( value, regex );
				}
			},
			{
				errorText: 'UrlError',
				field: this.urlInput,
				validate: () => {
					const value = this.urlInput.fieldView.element.value.trim();

					/*
					 * This only validates:
					 * - if the url starts with https,
					 * because URL validation done right is beyond our scope.  Let alone IRI validation.
					 * See https://stackoverflow.com/a/1411800/2248415 for more info.
					 */
					const regex = /^(https):\/\/[^ "]+$/;

					return validateStringByRegex( value, regex );
				}
			},
			{
				errorText: 'WidthHeightError',
				field: this.widthInput,
				validate: () => {
					const value = this.widthInput.fieldView.element.value.trim();
					const regex = /^-?[0-9]+(\.[0-9]+)?(px|em|rem|vw|vh|vmin|vmax|%|cm|mm|in|pt|pc)$/;

					if ( !value ) {
						return true;
					}

					return validateStringByRegex( value, regex );
				}
			}
		];
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
			class: className,
			isOn: true, // default to true
			withText: true,
			label
		} );

		this.listenTo( checkbox, 'execute', evt => {
			const { element } = evt.source;

			checkbox.isOn = !checkbox.isOn;
			this[ propertyName ] = element.getAttribute( 'aria-pressed' ) === 'true';
		} );

		checkbox.render();
		this[ propertyName ] = true;

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
				model: new ViewModel( {
					class: option.className,
					icon: option.icon,
					label: option.text,
					role: 'menuitemradio',
					withText: true
				} )
			};
			buttons[ option.text ] = { ...buttonObject, option };
			items.add( buttonObject );
		} );

		addListToDropdown( dropdown, items );

		this.listenTo( dropdown, 'execute', evt => {
			const choice = evt.source.element.textContent;
			const buttonOptions = buttons[ choice ].option;
			dropdown.buttonView.label = this.t( 'Align %0', buttonOptions.text );
			this.alignment = choice;
		} );

		this.alignment = this.t( 'middle' ); // default alignment
		dropdown.render();
		return dropdown;
	}

	_createFormFields() {
		const t = this.t;

		this.urlInput = this._createInput( t( 'URL' ), 'ck ck-iframe-url' );
		this.widthInput = this._createInput(
			t( 'Width' ),
			'ck ck-iframe-width',
			t( 'WidthHeightInfo' )
		);
		this.heightInput = this._createInput(
			t( 'Height' ),
			'ck ck-iframe-height',
			t( 'WidthHeightInfo' )
		);
		this.nameInput = this._createInput(
			t( 'Name' ),
			'ck ck-iframe-name',
			t( 'NameInfo' )
		);
		this.advisoryTitleInput = this._createInput(
			t( 'Title' ),
			'ck ck-iframe-advisorytitle',
			t( 'TitleInfo' )
		);
		this.longDescriptionInput = this._createInput(
			t( 'LongDesc' ),
			'ck ck-iframe-longdesc',
			t( 'LongDescInfo' )
		);
		this.alignmentDropdown = this._createDropdown( t( 'Alignment' ), [
			{ icon: icons.alignLeft, text: t( 'left' ), className: 'ck ck-iframe-alignleft' },
			{ icon: icons.alignCenter, text: t( 'middle' ), className: 'ck ck-iframe-alignmiddle' },
			{ icon: icons.alignRight, text: t( 'right' ), className: 'ck ck-iframe-alignright' }
		], 'ck ck-iframe-alignment' );
		this.showScrollbarsToggle = this._createCheckbox( t( 'Scrollbars' ), 'ck ck-iframe-scrollbars', 'showScrollbars' );
		this.showBorderToggle = this._createCheckbox( t( 'Borders' ), 'ck ck-iframe-borders', 'showBorders' );
		this.okButton = this._createButton( t( 'OK' ), icons.check, 'ck-iframe-button-ok ck-button-save' );
		this.cancelButton = this._createButton( t( 'Cancel' ), icons.cancel, 'ck-iframe-button-cancel ck-button-cancel' );
	}
	_createInput( label, className, infoText ) {
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );

		labeledInput.label = label;
		labeledInput.class = className;

		if ( infoText ) {
			labeledInput.infoText = infoText;
		}

		return labeledInput;
	}

	_createChildViews() {
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
	}

	_createFocusCycler() {
		return new FocusCycler( {
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
	}

	_createRows() {
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
	}

	_ensureButtonsWork() {
		// Submit type of the button will trigger the submit event on entire form when clicked
		// (see submitHandler() in render() below).
		this.okButton.type = 'submit';

		// Delegate ButtonView#execute to FormView#cancel.
		this.cancelButton.delegate( 'execute' ).to( this, 'cancel' );
		this.okButton.delegate( 'execute' ).to( this, 'submit' );
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

	isValid() {
		// clear all errors
		this.resetFormStatus();

		let isValid = true;

		for ( const validator of this._validators ) {
			const { errorText, field, validate } = validator;
			const hasError = !validate( field );

			if ( hasError ) {
				field.errorText = this.t( errorText );
				isValid = false;
			}
		}

		return isValid;
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

	resetFormStatus() {
		this.advisoryTitleInput.errorText = '';
		this.alignmentDropdown.errorText = '';
		this.heightInput.errorText = '';
		this.longDescriptionInput.errorText = '';
		this.nameInput.errorText = '';
		this.showBorderToggle.errorText = '';
		this.showScrollbarsToggle.errorText = '';
		this.urlInput.errorText = '';
		this.widthInput.errorText = '';
	}
}
