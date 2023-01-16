import {
	addListToDropdown,
	ButtonView,
	createDropdown,
	createLabeledInputText,
	LabeledFieldView,
	Model,
	submitHandler,
	SwitchButtonView,
	View
} from 'ckeditor5/src/ui';
import { icons } from 'ckeditor5/src/core';
import { Collection } from 'ckeditor5/src/utils';
export default class IFrameView extends View {
	constructor( locale ) {
		super( locale );

		this.urlInput = this._createInput( 'URL' );
		this.widthInput = this._createInput( 'Width' );
		this.heightInput = this._createInput( 'Height' );
		this.alignmentDropdown = this._createDropdown( 'Alignment', [
			{ icon: icons.alignLeft, text: 'left' },
			{ icon: icons.alignMiddle, text: 'middle' },
			{ icon: icons.alignRight, text: 'right' }
		] );
		this.showScrollbarsToggle = this._createCheckbox( 'Enable scrollbars' );
		this.showBorderToggle = this._createCheckbox( 'Show frame border' );
		this.nameInput = this._createInput( 'Name' );
		this.advisoryTitleInput = this._createInput( 'Advisory Title' );
		this.longDescriptionInput = this._createInput( 'Long Description URL' );
		this.okButton = this._createButton( 'OK', icons.check, 'ck-iframe-button-ok' );
		this.okButton.type = 'submit';
		this.cancelButton = this._createButton( 'Cancel', icons.cancel, 'ck-iframe-button-cancel' );

		// delegate cancelButton#execute execute to iframe#cancel
		this.cancelButton.delegate( 'execute' ).to( this, 'cancel' );

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

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-iframe' ]
			},
			children: this.childViews
		} );
	}

	render() {
		super.render();

		// submit the form when the user clicked the save button
		submitHandler( {
			view: this
		} );
	}

	focus() {
		this.childViews.first.focus();
	}

	_createButton( label, icon, className ) {
		const button = new ButtonView();

		button.set( {
			label,
			icon,
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

		return checkbox;
	}

	_createDropdown( label, options ) {
		const dropdown = createDropdown( this.locale );

		dropdown.buttonView.set( {
			label,
			withText: true
		} );

		const items = new Collection();

		options.forEach( option => {
			items.add( {
				type: 'button',
				model: new Model( {
					icon: option.icon,
					label: option.text,
					withText: true
				} )
			} );
		} );

		addListToDropdown( dropdown, items );
		dropdown.render();

		return dropdown;
	}
	_createInput( label ) {
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );

		labeledInput.label = label;

		return labeledInput;
	}
}
