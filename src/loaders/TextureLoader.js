/**
 * @author mrdoob / http://mrdoob.com/
 */

import { RGBAFormat, RGBFormat } from '../constants.js';
import { ImageLoader } from './ImageLoader.js';
import { ImageBitmapLoader } from './ImageBitmapLoader.js';
import { Texture } from '../textures/Texture.js';
import { DefaultLoadingManager } from './LoadingManager.js';

import { Cache } from './Cache.js';

function TextureLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

}

Object.assign( TextureLoader.prototype, {

	crossOrigin: 'anonymous',

	load: function ( url, onLoad, onProgress, onError ) {

		var texture = new Texture();

		var loader;
		if ( window.createImageBitmap !== undefined ) {

			loader = new ImageBitmapLoader( this.manager );
			texture.flipY = false;

		} else {

			loader = new ImageLoader( this.manager );

		}

		loader.setCrossOrigin( this.crossOrigin );
		loader.setPath( this.path );

		const cacheKey = this.manager.resolveURL( url );
		loader.load( url, function ( image ) {

			texture.image = image;

			// JPEGs can't have an alpha channel, so memory can be saved by storing them as RGB.
			var isJPEG = url.search( /\.jpe?g($|\?)/i ) > 0 || url.search( /^data\:image\/jpeg/ ) === 0;

			texture.format = isJPEG ? RGBFormat : RGBAFormat;
			texture.needsUpdate = true;

			texture.onUpdate = function () {

				console.info( "Removing texture", texture.id, url );
				Cache.remove( cacheKey );
				texture.image.close && texture.image.close();
				delete texture.image;

			};

			if ( onLoad !== undefined ) {

				onLoad( texture );

			}

		}, onProgress, onError );

		return texture;

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;
		return this;

	},

	setPath: function ( value ) {

		this.path = value;
		return this;

	}

} );


export { TextureLoader };
