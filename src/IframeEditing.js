/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { Plugin } from 'ckeditor5/src/core';
import IframeCommand from './IframeCommand';
import { toWidget, Widget } from 'ckeditor5/src/widget';

export default class IframeEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

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
			allowAttributes: [
				'advisoryTitle',
				'alignment',
				'height',
				'longDescription',
				'name',
				'showBorders',
				'showScrollbars',
				'url',
				'width'
			]
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		// Editing Conversion: Model-to-View
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'iframe',
			view: ( modelElement, { writer } ) => {
				const alignment = modelElement.getAttribute( 'alignment' );
				const showBorders = modelElement.getAttribute( 'showBorders' );
				const showScrollbars = modelElement.getAttribute( 'showScrollbars' );
				const classNames = [
					'ck',
					'ck-iframe',
					alignment ? `ck-iframe-${ alignment }` : '',
					showBorders ? '' : 'ck-iframe-showNoBorders',
					showScrollbars ? '' : 'ck-iframe-showNoScrollbars'
				].join( ' ' );

				const iframe = writer.createContainerElement( 'iframe', {
					class: classNames,
					'data-alignment': alignment,
					'data-showBorders': showBorders,
					'data-showScrollbars': showScrollbars,
					height: modelElement.getAttribute( 'height' ),
					longDescription: modelElement.getAttribute( 'longDescription' ),
					name: modelElement.getAttribute( 'name' ),
					src: modelElement.getAttribute( 'url' ),
					title: modelElement.getAttribute( 'advisoryTitle' ),
					width: modelElement.getAttribute( 'width' )
				} );

				// Make the iframe widget editable
				writer.setCustomProperty( 'iframe', true, iframe );
				return toWidget( iframe, writer, { label: 'iframe widget' } );
			}
		} );

		// Data Conversion: Model-to-View
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'iframe',
			view: ( modelElement, { writer } ) => {
				const alignment = modelElement.getAttribute( 'alignment' );
				const showBorders = modelElement.getAttribute( 'showBorders' );
				const showScrollbars = modelElement.getAttribute( 'showScrollbars' );
				const classNames = [
					'ck',
					'ck-iframe',
					alignment ? `ck-iframe-${ alignment }` : '',
					showBorders ? '' : 'ck-iframe-showNoBorders',
					showScrollbars ? '' : 'ck-iframe-showNoScrollbars'
				].join( ' ' );

				const iframe = writer.createContainerElement( 'iframe', {
					class: classNames,
					'data-alignment': alignment,
					'data-showBorders': showBorders,
					'data-showScrollbars': showScrollbars,
					height: modelElement.getAttribute( 'height' ),
					longDescription: modelElement.getAttribute( 'longDescription' ),
					name: modelElement.getAttribute( 'name' ),
					src: modelElement.getAttribute( 'url' ),
					title: modelElement.getAttribute( 'advisoryTitle' ),
					width: modelElement.getAttribute( 'width' )
				} );

				writer.setCustomProperty( 'iframe', true, iframe );

				return iframe;
			}
		} );

		// Conversion from a view element to a model attribute
		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'iframe',
				key: 'class',
				value: 'ck-iframe',
				attributes: [
					'data-alignment',
					'data-showBorders',
					'data-showScrollbars',
					'height',
					'longDescription',
					'name',
					'src',
					'title',
					'width'
				]
			},
			model: ( viewElement, { writer: upcastWriter } ) => {
				return upcastWriter.createContainerElement( 'iframe', {
					advisoryTitle: viewElement.getAttribute( 'title' ),
					alignment: viewElement.getAttribute( 'data-alignment' ),
					height: viewElement.getAttribute( 'height' ),
					longDescription: viewElement.getAttribute( 'longDescription' ),
					name: viewElement.getAttribute( 'name' ),
					showBorders: viewElement.getAttribute( 'data-showBorders' ),
					showScrollbars: viewElement.getAttribute( 'data-showScrollbars' ),
					url: viewElement.getAttribute( 'src' ),
					width: viewElement.getAttribute( 'width' )
				} );
			}
		} );
	}
}
