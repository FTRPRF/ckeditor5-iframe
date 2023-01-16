import { Plugin } from 'ckeditor5/src/core';

import IFrameEditing from './IFrameEditing';
import IFrameUi from './IFrameUi';

export default class IFrame extends Plugin {
	static get requires() {
		return [ IFrameEditing, IFrameUi ];
	}
}
