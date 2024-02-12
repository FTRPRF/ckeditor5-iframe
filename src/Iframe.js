/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { Plugin } from 'ckeditor5/src/core';
import IframeEditing from './IframeEditing';
import IframeUI from './IframeUI';

export default class Iframe extends Plugin {
	static get requires() {
		return [ IframeEditing, IframeUI ];
	}

	static get pluginName() {
		return 'iframe';
	}
}
