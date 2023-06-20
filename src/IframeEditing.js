/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { Plugin } from 'ckeditor5/src/core';
import IframeCommand from './IframeCommand';
import { toWidget, Widget, viewToModelPositionOutsideModelElement } from 'ckeditor5/src/widget';

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

		this.editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( this.editor.model, viewElement => viewElement.hasClass( 'iframe' ) )
		);
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		// Extend the text node's schema to accept the abbreviation attribute.
		schema.register( 'iframe', {
			allowWhere: '$text',
			inheritAllFrom: '$inlineObject',
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
				const widgetElement = createIframeView( modelElement, writer );

				return toWidget( widgetElement, writer );
			}
		} );

		// Data Conversion: Model-to-View
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'iframe',
			view: ( modelElement, { writer } ) => createIframeView( modelElement, writer )
		} );

		// Conversion from a view element to a model attribute
		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'iframe',
				classes: [ 'ck-iframe', 'iframe' ]
			},
			model: ( viewElement, { writer: upcastWriter } ) => {
				return upcastWriter.createElement( 'iframe', {
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

		function createIframeView( modelItem, viewWriter ) {
			const alignment = modelItem.getAttribute( 'alignment' );
			const showBorders = modelItem.getAttribute( 'showBorders' );
			const showScrollbars = modelItem.getAttribute( 'showScrollbars' );
			const classNames = [
				'ck',
				'iframe',
				'ck-iframe',
				alignment ? `ck-iframe-${ alignment }` : '',
				showBorders ? '' : 'ck-iframe-showNoBorders',
				showScrollbars ? '' : 'ck-iframe-showNoScrollbars'
			].join( ' ' );

			const iframeView = viewWriter.createContainerElement( 'iframe', {
				class: classNames,
				'data-alignment': alignment,
				'data-showBorders': showBorders,
				'data-showScrollbars': showScrollbars,
				height: modelItem.getAttribute( 'height' ),
				longDescription: modelItem.getAttribute( 'longDescription' ),
				name: modelItem.getAttribute( 'name' ),
				src: modelItem.getAttribute( 'url' ),
				title: modelItem.getAttribute( 'advisoryTitle' ),
				width: modelItem.getAttribute( 'width' )
			} );

			// Make the iframe widget editable
			viewWriter.setCustomProperty( 'iframe', true, iframeView );

			return iframeView;
		}
	}
}
