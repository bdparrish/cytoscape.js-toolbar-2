const defaults = require('./defaults');
const assign = require('./assign');

const data = {
	selectedTool: undefined,
	options: options,
	handlers: [],
	container: undefined
};

const cssOptions = {
	position: 'absolute',
	top: 0,
	left: 0,
	width: 0,
	height: 0,
	minWidth: 0,
	minHeight: 0,
	maxWidth: 0,
	maxHeight: 0,
	zIndex: options.zIndex
};

function initToolElement(tool, listIdx, toolIdx) {
	let padding = '';

	if (toolIdx != options.tools.length - 1) {
		if (options.position === 'top' || options.position === 'bottom') {
			padding = '10px 0 10px 10px';
		} else if (options.position === 'right' || options.position === 'left') {
			padding = '10px 10px 0 10px';
		}
	} else {
		padding = '10px';
	}

	const el = document.createElement('span');

	el.id = 'tool-' + listIdx + '-' + toolIdx;
	
	el.classList.add(options.toolItemClass + ' icon ' + tool.icon);

	el.style.cursor = 'pointer';
	el.style.color = '#aaa';
	el.style.width = '35px';
	el.style.height = '35px';
	el.style.fontSize = '24px';
	el.style.padding = padding;

	el.title = tool.tooltip;

	el['data-tool'] = listIdx + ',' + toolIdx;

	return el;
}

function bind(event, selector, action) {
	var index = data.handlers.push({
		events: event,
		selector: selector,
		action: action
	});

	var eventData = {
		data: data,
		handlerIndex: index - 1,
		canPerform: canPerform,
		getToolOptions: getToolOptions
	};

	if (selector === 'cy') {
		cy.bind(event, eventData, action);
	} else {
		cy.on(event, selector, eventData, action);
	}
}

function initTool(tool, toolListWrapper) {
	const toolElement = initToolElement(tool, listIdx, toolIdx);

	data.options.tools[listIdx][toolIdx].element = toolElement;

	let pressTimer, startTime, endTime;
	let toolItemLongHold = false;

	toolElement.onmousedown = () => {
		startTime = new Date().getTime();
		endTime = startTime;

		pressTimer = window.setTimeout(function () {
			if (startTime == endTime) {
				toolItemLongHold = true;
				toolListWrapper.css('overflow', 'visible');
			}
		}, options.longClickTime);
	};

	toolElement.onmouseup = () => {
		endTime = new Date().getTime();

		if (data.selectedTool != [toolListIndex, toolIndex] && !toolItemLongHold) {
			if (data.selectedTool != undefined) {
				data.options.tools[data.selectedTool[0]][data.selectedTool[1]].element.css('color', '#aaa');
			}
			data.selectedTool = [toolListIndex, toolIndex];
			$('.' + options.toolbarClass).find('.selected-tool').css('color','#aaa').removeClass('selected-tool');
			$(this).addClass('selected-tool').css('color', '#000');
		}
	};

	toolElement.mouseover = () => {
		hoveredTool = $(this);
		hoveredTool.style.color = '#000';
	};

	toolElement.mouseout = () => {
		if (hoveredTool.classList.findIndex((value) => value == 'selected-tool') > -1) {
			hoveredTool.style.color = '#000';
		} else {
			hoveredTool.style.color = '#aaa';
		}
	}

	window.onmouseup = (e) => {
		if (toolItemLongHold) {
			let moveLeft = 0;
			hoveredTool.parent().children().forEach((element) => {
				if (hoveredTool.index() == index) {
					return false;
				}
				moveLeft += $(element).outerWidth(true);
			});

			const indexes = hoveredTool.attr('data-tool').split(',');
			data.selectedTool = indexes;
			const offsetLeft = 0 - moveLeft;
			$toolList.css('left', offsetLeft);
			$toolListWrapper.css('overflow', 'hidden');
			$('.' + options.toolbarClass).find('.selected-tool').removeClass('selected-tool');
			hoveredTool.addClass('selected-tool');
			clearTimeout(pressTimer);
			toolItemLongHold = false;
			startTime = -1;
			endTime = -1;
			return false;
		}
	};

	if (toolElement.event.length != toolElement.action.length) {
		var tooltip = (toolElement.tooltip) ? toolElement.tooltip : "<no tooltip>";
		console.log("Unequal lengths for event and action variables on " + index + "-" + tooltip);
	} else {
		for (var i = 0; i < toolElement.event.length; i++) {
			bind(toolElement.event[i], toolElement.selector, toolElement.action[i]);
		}
	}

	return toolElement;
}

function setPosition(position) {
	if (position === 'top') {
		cssOptions.top = $container.offset().top - 45;
		cssOptions.left = $container.offset().left;
		cssOptions.width = $container.outerWidth(true);
		cssOptions.minWidth = $container.outerWidth(true);
		cssOptions.maxWidth = $container.outerWidth(true);
	} else if (position === 'bottom') {
		cssOptions.top = $container.offset().top + $container.outerHeight(true);
		cssOptions.left = $container.offset().left;
		cssOptions.width = $container.outerWidth(true);
		cssOptions.minWidth = $container.outerWidth(true);
		cssOptions.maxWidth = $container.outerWidth(true);
	} else if (position === 'right') {
		cssOptions.top = $container.offset().top;
		cssOptions.left = $container.offset().left + $container.outerWidth(true) + 25;
		cssOptions.height = $container.outerHeight(true);
		cssOptions.minHeight = $container.outerHeight(true);
		cssOptions.maxHeight = $container.outerHeight(true);
	} else { // default - it is either 'left' or it is something we don't know so we use the default of 'left'
		cssOptions.top = $container.offset().top;
		cssOptions.left = $container.offset().left - 45;
		cssOptions.height = $container.outerHeight(true);
		cssOptions.minHeight = $container.outerHeight(true);
		cssOptions.maxHeight = $container.outerHeight(true);
	}
}

function createToolbarContainer(clazz) {
	const el = document.createElement('div');

	el.classList.add(clazz);

	setPosition(options.position);

	el.style.top = cssOptions.top;
	el.style.left = cssOptions.left;
	el.style.width = cssOptions.width + 'px';
	el.style.minWidth = cssOptions.minWidth + 'px';
	el.style.maxWidth = cssOptions.maxWidth + 'px';

	return el;
}

function initToolWrapperElement(clazz) {
	const el = document.createElement(div);

	el.classList.add(clazz);

	el.style.width = '45px';
	el.style.height = '45px';
	el.style.position = 'relative';
	el.style.overflow = 'hidden';
	el.style.float = 'left';
}

function createMoreArrow() {
	const el = document.createElement('span');

	el.classList.add('fa fa-caret-right');

	el.style.backgroundColor = 'transparent';
	el.style.position = 'absolute';
	el.style.top = 28;
	el.style.left = 35;
	el.style.zIndex = 9999;

	return el;
}

function initToolListElement(toolList, clazz) {
	const el = document.createElement('div');

	el.classList.add(clazz);

	el.style.position = 'absolute';
	el.style.width = (toolList.length * 55) + 'px';
	el.style.height = '45px';
	el.style.backgroundColor = '#f9f9f9';

	return el;
}

function initToolList(toolList) {
	const toolWrapper = initToolWrapperElement(options.multipleToolsClass + '-wrapper');

	data.container.appendChild(toolWrapper);

	if (toolList.length > 1) {
		const moreArrow = createMoreArrow();

		toolWrapper.appendChild(moreArrow);
	}

	const toolListElement = initToolListElement(toolList, options.multipleToolsClass);

	toolWrapper.appendChild(toolListElement);

	toolList.forEach((tool) => {
		const toolElement = initTool(tool, toolWrapper);

		toolList.appendChild(toolElement);
	});
}

function destroy() {
	// const data = $(this).data('cytoscapeToolbar');
	// const options = data.options;
	// const handlers = data.handlers;
	// const cy = data.cy;

	// // remove bound cy handlers
	// for (const i = 0; i < handlers.length; i++) {
	// 	const handler = handlers[i];
	// 	cy.off(handler.events, handler.selector, handler.fn);
	// }

	// // remove container from dom
	// data.$container.remove();
}

function canPerform(e, fn) {
	// if (!this.data.selectedTool) {
	// 	return false;
	// }

	// const toolIndexes = this.data.selectedTool;
	// const tool = this.data.options.tools[toolIndexes[0]][toolIndexes[1]];
	// const handlerIndex = this.handlerIndex;

	// if (!(toolIndexes === undefined) && $.inArray(fn, tool.action) > -1) {
	// 	const selector = this.data.handlers[handlerIndex].selector;

	// 	switch (selector) {
	// 		case 'node':
	// 			return e.cyTarget.isNode();
	// 		case 'edge':
	// 		    return e.cyTarget.isEdge();
	// 	    case 'node,edge':
	// 	    case 'edge,node':
	// 	        return e.cyTarget.isNode() || e.cyTarget.isEdge();
	// 		case 'cy':
	// 			return e.cyTarget == cy || tool.bubbleToCore;
	// 	}
	// }

	// return false;
}

function options(tool) {
	// const tool = this.data.options.tools[selectedTool[0]][selectedTool[1]];

	// return tool.options;
}

function init() {
	data.container = createToolbarContainer(options.toolbarClass);

	document.getElementById(options.container).appendChild(data.container);

	options.tools.forEach((toolList) => initToolList(toolList));
}

let toolbar = function(params) {
	let options = assign({}, defaults, params);
	let cy = this;
	let container = cy.container();
	let hoveredTool;

	if (options.tools || options.tools === undefined || options.tools.length < 1) {
		console.error('No tools are defined for cytoscape-toolbar.  Are you overriding tools accidently without defining new ones?')
	}

	console.debug("cytoscape-toolbar options:");
	console.debug(options);

	if (options.appendTools) {
        options.tools = defaults.tools.concat(options.tools);
	}

	$container.cytoscape(function (e) {
		cy = this;
		data.cy = cy;

		addEventListeners();

		$container.data('cytoscapeToolbar', data);
	});
}