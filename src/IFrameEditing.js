import { Plugin } from 'ckeditor5/src/core';

export default class IFrameEditing extends Plugin {
	init() {
		this._defineSchema();
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'iframe', {
			inheritAllFrom: '$blockObject',
			allowAttributes: [
				'allow',
				'allowfullscreen',
				'allowpaymentrequest',
				'class',
				'credentialless',
				'csp',
				'fetchpriority',
				'height',
				'loading',
				'name',
				'referrerpolicy',
				'sandbox',
				'src',
				'srcdoc',
				'title',
				'width'
			]
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		// data downcast for data pipeline
		conversion
			.for( 'dataDowncast' )
			.elementToElement( {
				model: 'iframe',
				view: 'iframe'
			} );

		// editing downcast for editing pipeline
		conversion
			.for( 'editingDowncast' )
			.elementToElement( {
				model: 'iframe',
				view: {
					name: 'iframe',
					classes: 'iframe'
				}
			} );

		// upcast for editing pipeline
		conversion
			.for( 'upcast' )
			.elementToElement( {
				view: {
					name: 'iframe',
					classes: 'iframe'
				},
				model: 'iframe'
			} );
	}
}
