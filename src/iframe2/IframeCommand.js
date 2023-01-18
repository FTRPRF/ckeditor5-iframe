/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { Command } from 'ckeditor5/src/core';
import { findAttributeRange } from 'ckeditor5/src/typing';
import getRangeText from './utils.js';
import { toMap } from 'ckeditor5/src/utils';

export default class IframeCommand extends Command {
	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const firstRange = selection.getFirstRange();

		// When the selection is collapsed, the command has a value if the caret is in an iframe.
		if ( firstRange.isCollapsed ) {
			// eslint-disable-next-line no-undef
			if ( selection.hasAttribute( 'iframe' ) ) {
				const attributeValue = selection.getAttribute( 'iframe' );

				// Find the entire range containing the iframe under the caret position.
				const iframeRange = findAttributeRange( selection.getFirstPosition(), 'iframe', attributeValue, model );

				this.value = {
					abbr: getRangeText( iframeRange ),
					title: attributeValue,
					range: iframeRange
				};
			} else {
				this.value = null;
			}
		}
		// When the selection is not collapsed, the command has a value if the selection contains a subset of a single iframe
		// or an entire iframe.
		else {
			// eslint-disable-next-line no-undef
			if ( selection.hasAttribute( 'iframe' ) ) {
				const attributeValue = selection.getAttribute( 'iframe' );

				// Find the entire range containing the iframe under the caret position.
				const iframeRange = findAttributeRange( selection.getFirstPosition(), 'iframe', attributeValue, model );

				if ( iframeRange.containsRange( firstRange, true ) ) {
					this.value = {
						abbr: getRangeText( firstRange ),
						title: attributeValue,
						range: firstRange
					};
				} else {
					this.value = null;
				}
			} else {
				this.value = null;
			}
		}

		// The command is enabled when the "iframe" attribute can be set on the current model selection.
		this.isEnabled = true;
	}

	execute( { advisoryTitle, alignment, height, longDescription, name, showBorders, showScrollbars, url, width } ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			if ( url !== '' ) {
				const firstPosition = selection.getFirstPosition();

				// Collect all attributes of the user selection (could be "bold", "italic", etc.)
				const attributes = toMap( selection.getAttributes() );

				// Put the new attribute to the map of attributes.
				attributes.set( 'advisoryTitle', advisoryTitle );
				attributes.set( 'alignment', alignment );
				attributes.set( 'height', height );
				attributes.set( 'longDescription', longDescription );
				attributes.set( 'name', name );
				attributes.set( 'showBorders', showBorders );
				attributes.set( 'showScrollbars', showScrollbars );
				attributes.set( 'url', url );
				attributes.set( 'width', width );

				// Inject the new node with the iframe and all selection attributes.
				const iframe = writer.createElement( 'iframe', attributes );
				const { end: positionAfter } = model.insertContent( iframe, firstPosition );

				// Put the selection at the end of the inserted iframe. Using an end of a range returned from
				// insertContent() just in case nodes with the same attributes were merged.
				writer.setSelection( positionAfter );
			}
		} );
	}
}
