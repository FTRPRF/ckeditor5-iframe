/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { Plugin } from 'ckeditor5/src/core';
import IframeCommand from './IframeCommand';

export default class IframeEditing extends Plugin {
	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add(
			'addIframe', new IframeCommand( this.editor )
		);
	}
	_defineSchema() {
		const schema = this.editor.model.schema;

		// Extend the text node's schema to accept the abbreviation attribute.
		schema.register( 'iframe', {
			inheritAllFrom: '$blockObject',
			allowAttributes: [ 'abbreviation', 'url', 'width', 'height', 'name', 'advisoryTitle', 'longDescription' ]
		} );
	}
	_defineConverters() {
		const conversion = this.editor.conversion;

		// Conversion from a model attribute to a view element
		conversion.for( 'downcast' ).elementToElement( {
			model: {
				name: 'iframe',
				attributes: [ 'url', 'width', 'height', 'name', 'advisoryTitle', 'longDescription' ]
			},

			// // Callback function provides access to the model attribute value
			// // and the DowncastWriter
			view: ( modelElement, { writer: downcastWriter } ) => {
				// eslint-disable-next-line no-undef
				console.log( { downcastWriter } );
				return downcastWriter.createContainerElement( 'iframe', {
					src: modelElement.getAttribute( 'url' ),
					width: modelElement.getAttribute( 'width' ),
					height: modelElement.getAttribute( 'height' ),
					name: modelElement.getAttribute( 'name' ),
					longDescription: modelElement.getAttribute( 'longDescription' ),
					class: 'ck ck-iframe'
				} );
			}
		} );

		// Conversion from a view element to a model attribute
		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'iframe',
				key: 'class',
				value: 'ck-iframe',
				attributes: [ 'src', 'width', 'height', 'name', 'longDescription' ]
			},
			model: ( viewElement, { writer: upcastWriter } ) => {
				return upcastWriter.createContainerElement( 'iframe', {
					url: viewElement.getAttribute( 'src' ),
					width: viewElement.getAttribute( 'width' ),
					height: viewElement.getAttribute( 'height' ),
					name: viewElement.getAttribute( 'name' ),
					longDescription: viewElement.getAttribute( 'longDescription' )
				} );
			}
		} );
	}
}
