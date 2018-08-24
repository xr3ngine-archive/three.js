const defaultOptions = {
	shouldLoad: true,
	shouldSerialize: true,
	shouldExport: true
};

function ComponentManager( name, schema, options ) {

	this.name = name;
	this.schema = schema;
	this.components = {};
	this.pool = [];
	this.options = Object.assign( {}, defaultOptions, options );

	for ( propName in this.schema ) {

		var propDef = this.schema[ propName ];

		if ( propDef.default === undefined ) {

			switch ( propDef.type ) {

				case "string":
					propDef.default = "";
					break;
				case "number":
					propDef.default = 0;
					break;
				case "boolean":
					propDef.default = false;
					break;
				case "Vector2":
					propDef.default = new THREE.Vector2();
					break;
				case "Vector3":
					propDef.default = new THREE.Vector3();
					break;
				case "Vector4":
					propDef.default = new THREE.Vector4();
					break;
				case "Euler":
					propDef.default = new THREE.Euler();
					break;
				case "Color":
					propDef.default = new THREE.Color();
					break;
				default:
					propDef.default = null;
					break;

			}

		}

	}

}

ComponentManager.prototype.add = function ( object ) {

	var targetComponent;

	if ( this.pool.length > 0 ) {

		targetComponent = this.pool.pop();

	} else {

		targetComponent = {};

	}

	for ( propName in this.schema ) {

		var propDef = this.schema[ propName ];
		var value = targetComponent[ propName ];
		var defaultValue = propDef.default;

		if ( value && typeof value.copy === "function" ) {

			value.copy( defaultValue );

		} else if ( ! value && typeof defaultValue.clone === "function" ) {

			targetComponent[ propName ] = defaultValue.clone();

		} else {

			targetComponent[ propName ] = defaultValue;

		}

	}

	return this.components[ object.uuid ] = targetComponent;

};

ComponentManager.prototype.get = function ( object ) {

	return this.components[ object.uuid ];

};

ComponentManager.prototype.remove = function ( object ) {

	var component = this.components[ object.uuid ];

	if ( component ) {

		delete this.components[ object.uuid ];
		this.pool.push( component );
		return true;

	}

	return false;

};

ComponentManager.prototype.copy = function ( target, source ) {

	var sourceProps = this.get( source );
	var targetProps = this.get( target );

	if ( ! targetProps ) {

		targetProps = this.add( target );

	}

	if ( sourceProps ) {

		for ( var propertyName in sourceProps ) {

			var sourceProp = sourceProps[ propertyName ];
			var targetProp = targetProps[ propertyName ];

			if ( typeof targetProp.copy === "function" ) {

				targetProp.copy( sourceProp );

			} else {

				targetProp = sourceProp;

			}

		}

	}

	return targetProps;

};

ComponentManager.prototype.fromJSON = function ( target, json ) {

	var component = this.add( target );

	for ( propName in this.schema ) {

		var value = json[ propName ];

		if ( value === undefined ) {

			continue;

		}

		var propDef = this.schema[ propName ];

		switch ( propDef.type ) {

			case "Vector2":
			case "Vector3":
			case "Vector4":
			case "Euler":
			case "Color":
				component[ propName ].fromArray( value );
				break;
			default:
				component[ propName ] = value;
				break;

		}

	}

};

ComponentManager.prototype.toJSON = function ( object ) {

	var props = this.get( object );
	var json = {};

	for ( propName in this.schema ) {

		var propDef = this.schema[ propName ];
		var value = props[ propName ];

		switch ( propDef.type ) {

			case "Vector2":
			case "Vector3":
			case "Vector4":
			case "Euler":
			case "Color":
				json[ propName ] = value.toArray();
				break;
			default:
				json[ propName ] = value;
				break;

		}

	}

	return json;

};
