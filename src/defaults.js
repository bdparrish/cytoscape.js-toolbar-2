let defaults = {
	cy: 'cy', // id being used for cytoscape core instance
	container: 'body',
	tools: [ // an array of tools to list in the toolbar
		[
			{
				icon: 'fa fa-search-plus', // icon from font-awesome-4.0.3, if you want to use something else, then this becomes a class specific for this tool item
				event: ['tap'], // array of cytoscape events that correlates with action variable
				selector: 'cy', // cytoscape selector (cy = core instance, node, edge) - currently not supporting full selection selectors from the documentation
				options: {
					cy: {
						zoom: 0.1,
						minZoom: 0.1,
						maxZoom: 10,
						zoomDelay: 45
					}
				}, // pass through different parameters for separate selectors
				bubbleToCore: false, // say whether or not the event should be performed if the core instance was not clicked
				tooltip: 'Zoom In', // value for the title attribute of a span element
				action: [performZoomIn] // array of action methods that correlates with the event variable
			}
		],
		[
			{
				icon: 'fa fa-search-minus',
				event: ['tap'],
				selector: 'cy',
				options: {
					cy: {
						zoom: -0.1,
						minZoom: 0.1,
						maxZoom: 10,
						zoomDelay: 45
					}
				},
				bubbleToCore: false,
				tooltip: 'Zoom Out',
				action: [performZoomOut]
			}
		],
		[
			{
				icon: 'fa fa-arrow-right',
				event: ['tap'],
				selector: 'cy',
				options: {
					cy: {
						distance: -80,
					}
				},
				bubbleToCore: true,
				tooltip: 'Pan Right',
				action: [performPanRight]
			}
		],
		[
			{
				icon: 'fa fa-arrow-down',
				event: ['tap'],
				selector: 'cy',
				options: {
					cy: {
						distance: -80,
					}
				},
				bubbleToCore: true,
				tooltip: 'Pan Down',
				action: [performPanDown]
			}
		],
		[
			{
				icon: 'fa fa-arrow-left',
				event: ['tap'],
				selector: 'cy',
				options: {
					cy: {
						distance: 80,
					}
				},
				bubbleToCore: true,
				tooltip: 'Pan Left',
				action: [performPanLeft]
			}
		],
		[
			{
				icon: 'fa fa-arrow-up',
				event: ['tap'],
				selector: 'cy',
				options: {
					cy: {
						distance: 80,
					}
				},
				bubbleToCore: true,
				tooltip: 'Pan Up',
				action: [performPanUp]
			}
		]
	],
	appendTools: false, // set whether or not to append your custom tools list to the default tools list
	position: 'left', // set position of toolbar (right, left, up, down)
	toolbarClass: 'ui-cytoscape-toolbar', // set a class name for the toolbar to help with styling
	multipleToolsClass: 'tool-item-list', // set a class name for the tools that should be shown in the same position
	toolItemClass: 'tool-item', // set a class name for a toolbar item to help with styling
	autodisableForMobile: true, // disable the toolbar completely for mobile (since we don't really need it with gestures like pinch to zoom)
	zIndex: 9999, // the z-index of the ui div
	longClickTime: 325 // time until a multi-tool list will present other tools
};

function performZoomIn(e) {
	console.log("performing zoom in");
	performZoom(e, performZoomIn);
}

function performZoomOut(e) {
	console.log("performing zoom out");
	performZoom(e, performZoomOut);
}

function performZoom(e, action) {
	if (!e.data.canPerform(e, action)) {
		console.log("could not perform zoom");

		return;
	}

	var toolIndexes = e.data.data.selectedTool;
	var tool = e.data.data.options.tools[toolIndexes[0]][toolIndexes[1]];

	zoomGraph(e.cy, e.originalEvent.offsetX, e.originalEvent.offsetY, tool.options.cy);
}

function zoomGraph(core, x, y, factors) {
	console.log("zooming:");
	console.log({ x : x, y : y, factors : factors });

	var factor = 1 + factors.zoom;

	var zoom = core.zoom();

	var lvl = zoom * factor;

	if (lvl < factors.minZoom) {
		lvl = factors.minZoom;
	}

	if (lvl > factors.maxZoom) {
		lvl = factors.maxZoom;
	}

	if ((lvl == factors.maxZoom && zoom == factors.maxZoom) ||
		(lvl == factors.minZoom && zoom == factors.minZoom)
	) {
		return;
	}

	zoomTo(core, x, y, lvl);
}

var zx, zy;
function zoomTo(core, x, y, level) {
	core.zoom({
		level: level,
		renderedPosition: { x: x, y: y }
	});
}
// end zooming

// panning
function performPanRight(e) {
	console.log("performing pan right");
	performPan(e, performPanRight, 0);
}

function performPanDown(e) {
	console.log("performing pan down");
	performPan(e, performPanDown, 1);
}

function performPanLeft(e) {
	console.log("performing pan left");
	performPan(e, performPanLeft, 2);
}

function performPanUp(e) {
	console.log("performing pan up");
	performPan(e, performPanUp, 3);
}

function performPan(e, action, direction) {
	if (!e.data.canPerform(e, action)) {
	console.log("could not perform pan");
		return;
	}

	console.log("performing pan");

	var toolIndexes = e.data.data.selectedTool;
	var tool = e.data.data.options.tools[toolIndexes[0]][toolIndexes[1]];

	pan(e.cy, direction, tool.options.cy);
}

function pan(core, direction, factors) {
	switch (direction) {
		case 0:
		case 2:
			core.panBy({ x: factors.distance, y: 0 });
			break;
		case 1:
		case 3:
			core.panBy({ x: 0, y: factors.distance });
			break;
	}
}

module.exports = defaults, performZoomIn, performZoomOut, performZoom, zoomGraph, zoomTo, performPanRight, performPanLeft, performPanUp, performPanDown;