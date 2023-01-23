/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagetoolbar
 */

import { Plugin } from 'ckeditor5/src/core';
import { WidgetToolbarRepository } from 'ckeditor5/src/widget';
import { getClosestSelectedIframeWidget } from './utils';
import { isObject } from 'lodash-es';

export default class IframeToolbar extends Plugin {
	static get requires() {
		return [ WidgetToolbarRepository ];
	}

	static get pluginName() {
		return 'IframeToolbar';
	}

	afterInit() {
		const editor = this.editor;
		const t = editor.t;
		const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );

		widgetToolbarRepository.register( 'iframe', {
			ariaLabel: t( 'Iframe widget toolbar' ),
			balloonClassName: 'ck-toolbar-container ck-iframe-widget-toolbar',
			items: normalizeDeclarativeConfig( editor.config.get( 'iframe.toolbar' ) || [ 'iframe' ] ),
			getRelatedElement: selection => getClosestSelectedIframeWidget( selection )
		} );
	}
}
function normalizeDeclarativeConfig( config ) {
	return config.map( item => isObject( item ) ? item.name : item );
}
