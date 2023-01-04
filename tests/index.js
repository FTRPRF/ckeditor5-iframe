import { Iframe as IframeDll, icons } from '../src';
import Iframe from '../src/iframe';

import ckeditor from './../theme/icons/ckeditor.svg';

describe( 'CKEditor5 Iframe DLL', () => {
	it( 'exports Iframe', () => {
		expect( IframeDll ).to.equal( Iframe );
	} );

	describe( 'icons', () => {
		it( 'exports the "ckeditor" icon', () => {
			expect( icons.ckeditor ).to.equal( ckeditor );
		} );
	} );
} );
