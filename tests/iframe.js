import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Iframe from '../src/iframe';

/* global document */

describe( 'Iframe', () => {
	it( 'should be named', () => {
		expect( Iframe.pluginName ).to.equal( 'Iframe' );
	} );

	describe( 'init()', () => {
		let domElement, editor;

		beforeEach( async () => {
			domElement = document.createElement( 'div' );
			document.body.appendChild( domElement );

			editor = await ClassicEditor.create( domElement, {
				plugins: [
					Paragraph,
					Heading,
					Essentials,
					Iframe
				],
				toolbar: [
					'iframeButton'
				]
			} );
		} );

		afterEach( () => {
			domElement.remove();
			return editor.destroy();
		} );

		it( 'should load Iframe', () => {
			const myPlugin = editor.plugins.get( 'Iframe' );

			expect( myPlugin ).to.be.an.instanceof( Iframe );
		} );

		it( 'should add an icon to the toolbar', () => {
			expect( editor.ui.componentFactory.has( 'iframeButton' ) ).to.equal( true );
		} );

		it( 'should add a text into the editor after clicking the icon', () => {
			const icon = editor.ui.componentFactory.create( 'iframeButton' );

			expect( editor.getData() ).to.equal( '' );

			icon.fire( 'execute' );

			expect( editor.getData() ).to.equal( '<p>Hello CKEditor 5!</p>' );
		} );
	} );
} );
