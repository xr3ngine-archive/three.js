window.nativeSortTimes = [];
window.nativeSortIndex = 0;
window.insertionSortTimes = [];
window.insertionSortIndex = 0;

function average (array) {
  let sum = 0;
  for (let i=0; i<array.length; i++){
    sum += array[i];
  }
  return sum / array.length;
}

function testSort () {
  window.useNative = true;
  window.nativeSortindex = 0;
  console.log("Testing...");
  window.setTimeout( () => {
    console.log( "Native sort" );
    console.log( "%.10f", average( window.nativeSortTimes ) );
    window.useNative = false;
    window.insertionSortIndex = 0;
    window.setTimeout( () => {
      window.useNative = true;
      console.log( "Insertion sort");
      console.log( "%.10f", average( window.insertionSortTimes ) );
    }, 8000 );
  }, 8000);
}

/**
 * @author mrdoob / http://mrdoob.com/
 */

function painterSortStable( a, b ) {

	if ( a.groupOrder !== b.groupOrder ) {

		return a.groupOrder - b.groupOrder;

	} else if ( a.renderOrder !== b.renderOrder ) {

		return a.renderOrder - b.renderOrder;

	} else if ( a.program !== b.program ) {

		return a.program.id - b.program.id;

	} else if ( a.material.id !== b.material.id ) {

		return a.material.id - b.material.id;

	} else if ( a.z !== b.z ) {

		return a.z - b.z;

	} else {

		return a.id - b.id;

	}

}

function reversePainterSortStable( a, b ) {

	if ( a.groupOrder !== b.groupOrder ) {

		return a.groupOrder - b.groupOrder;

	} else if ( a.renderOrder !== b.renderOrder ) {

		return a.renderOrder - b.renderOrder;

	} else if ( a.z !== b.z ) {

		return b.z - a.z;

	} else {

		return a.id - b.id;

	}

}


function WebGLRenderList() {

	var renderItems = [];
	var renderItemsIndex = 0;

	var opaque = [];
	var transparent = [];

	var defaultProgram = { id: - 1 };

	function init() {

		renderItemsIndex = 0;

		opaque.length = 0;
		transparent.length = 0;

	}

	function getNextRenderItem( object, geometry, material, groupOrder, z, group ) {

		var renderItem = renderItems[ renderItemsIndex ];

		if ( renderItem === undefined ) {

			renderItem = {
				id: object.id,
				object: object,
				geometry: geometry,
				material: material,
				program: material.program || defaultProgram,
				groupOrder: groupOrder,
				renderOrder: object.renderOrder,
				z: z,
				group: group
			};

			renderItems[ renderItemsIndex ] = renderItem;

		} else {

			renderItem.id = object.id;
			renderItem.object = object;
			renderItem.geometry = geometry;
			renderItem.material = material;
			renderItem.program = material.program || defaultProgram;
			renderItem.groupOrder = groupOrder;
			renderItem.renderOrder = object.renderOrder;
			renderItem.z = z;
			renderItem.group = group;

		}

		renderItemsIndex ++;

		return renderItem;

	}

	function push( object, geometry, material, groupOrder, z, group ) {

		var renderItem = getNextRenderItem( object, geometry, material, groupOrder, z, group );

		( material.transparent === true ? transparent : opaque ).push( renderItem );

	}

	function unshift( object, geometry, material, groupOrder, z, group ) {

		var renderItem = getNextRenderItem( object, geometry, material, groupOrder, z, group );

		( material.transparent === true ? transparent : opaque ).unshift( renderItem );

	}

	function sortNative() {

		var start = performance.now();

		if ( opaque.length > 1 ) opaque.sort( painterSortStable );
		if ( transparent.length > 1 ) transparent.sort( reversePainterSortStable );
		window.nativeSortTimes[window.nativeSortIndex]= performance.now() - start;
		window.nativeSortIndex = (window.nativeSortIndex + 1) % 200;

	}

	function sort() {

		var start = performance.now();

		if ( opaque.length > 1 ) insertionSort( opaque, painterSortStable );
		if ( transparent.length > 1 ) insertionSort( transparent, reversePainterSortStable );
		window.insertionSortTimes[window.insertionSortIndex]= performance.now() - start;
		window.insertionSortIndex = (window.insertionSortIndex + 1) % 200;

	}

	function insertionSort( items, compareFunction ) {

		for ( var i = 0; i < items.length; i ++ ) {

			var value = items[ i ];
			for ( var j = i - 1; j >= 0 && compareFunction( items[ j ], value ); j -- ) {

				items[ j + 1 ] = items[ j ];

			}
			items[ j + 1 ] = value;

		}

		return items;

	}

	return {
		opaque: opaque,
		transparent: transparent,

		init: init,
		push: push,
		unshift: unshift,

		sort: sort,
		sortNative: sortNative
	};

}

function WebGLRenderLists() {

	var lists = {};

	function onSceneDispose( event ) {

		var scene = event.target;

		scene.removeEventListener( 'dispose', onSceneDispose );

		delete lists[ scene.id ];

	}

	function get( scene, camera ) {

		var cameras = lists[ scene.id ];
		var list;
		if ( cameras === undefined ) {

			list = new WebGLRenderList();
			lists[ scene.id ] = {};
			lists[ scene.id ][ camera.id ] = list;

			scene.addEventListener( 'dispose', onSceneDispose );

		} else {

			list = cameras[ camera.id ];
			if ( list === undefined ) {

				list = new WebGLRenderList();
				cameras[ camera.id ] = list;

			}

		}

		return list;

	}

	function dispose() {

		lists = {};

	}

	return {
		get: get,
		dispose: dispose
	};

}


export { WebGLRenderLists };
