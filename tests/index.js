import { Iframe as IframeDll, icons } from '../src';
import IFrame from '../src/IFrame';

import ckeditor from './../theme/icons/ckeditor.svg';

describe( 'CKEditor5 IFrame DLL', () => {
	it( 'exports IFrame', () => {
		expect( IframeDll ).to.equal( IFrame );
	} );

	describe( 'icons', () => {
		it( 'exports the "ckeditor" icon', () => {
			expect( icons.ckeditor ).to.equal( ckeditor );
		} );
	} );
} );
