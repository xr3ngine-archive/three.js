import { Geometry } from './../core/Geometry';
import { BufferGeometry } from './../core/BufferGeometry';

export class PlaneBufferGeometry extends BufferGeometry {

	constructor(
		width?: number,
		height?: number,
		widthSegments?: number,
		heightSegments?: number,
		flipY?: boolean
	);

	parameters: {
		width: number;
		height: number;
		widthSegments: number;
		heightSegments: number;
		flipY: boolean;
	};

}

export class PlaneGeometry extends Geometry {

	constructor(
		width?: number,
		height?: number,
		widthSegments?: number,
		heightSegments?: number,
		flipY?: boolean
	);

	parameters: {
		width: number;
		height: number;
		widthSegments: number;
		heightSegments: number;
		flipY: boolean;
	};

}
