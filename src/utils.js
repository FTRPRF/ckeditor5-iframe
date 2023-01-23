import { isWidget } from 'ckeditor5/src/widget';

export function getClosestSelectedIframeWidget( selection ) {
	const selectionPosition = selection.getFirstPosition();

	if ( !selectionPosition ) {
		return null;
	}

	const viewElement = selection.getSelectedElement();

	if ( viewElement && isIframeWidget( viewElement ) ) {
		return viewElement;
	}

	let parent = selectionPosition.parent;

	while ( parent ) {
		if ( parent.is( 'element' ) && isIframeWidget( parent ) ) {
			return parent;
		}

		parent = parent.parent;
	}

	return null;
}

export function getClosestSelectedIframe( selection ) {
	const selectionPosition = selection.getFirstPosition();

	if ( !selectionPosition ) {
		return null;
	}

	const viewElement = selection.getSelectedElement();

	if ( viewElement && isIframe( viewElement ) ) {
		return viewElement;
	}

	let parent = selectionPosition.parent;

	while ( parent ) {
		if ( parent.is( 'element' ) && isIframe( parent ) ) {
			return parent;
		}

		parent = parent.parent;
	}

	return null;
}

// A helper function that retrieves and concatenates all text within the model range.
export default function getRangeText( range ) {
	return Array.from( range.getItems() ).reduce( ( rangeText, node ) => {
		if ( !( node.is( 'text' ) || node.is( 'textProxy' ) ) ) {
			return rangeText;
		}

		return rangeText + node.data;
	}, '' );
}

export function isIframeWidget( viewElement ) {
	return !!viewElement.is( 'element', 'iframe' ) && isWidget( viewElement );
}

export function isIframe( viewElement ) {
	return !!viewElement.is( 'element', 'iframe' );
}

export function validateStringByRegex( value, regex ) {
	return regex.test( value );
}
