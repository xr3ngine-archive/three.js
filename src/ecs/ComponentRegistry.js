import { ComponentManager } from "./ComponentManager.js";

var ComponentRegistry = {

	componentManagers: {},

	getManager: function ( componentName ) {

		return this.componentManagers[ componentName ];

	},

	registerComponent: function ( componentName, schema, options ) {

		return this.componentManagers[ componentName ] = new ComponentManager( componentName, schema, options );

	}

};

export { ComponentRegistry };
