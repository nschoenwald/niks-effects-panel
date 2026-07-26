// Draggable library - Standalone ES Module export
const Draggable = (function () {
  'use strict';

  var defaults = {
    grid: 0,
    filterTarget: null,
    limit: {
      x: null,
      y: null
    },
    threshold: 0,
    setCursor: false,
    setPosition: true,
    smoothDrag: true,
    useGPU: true,
    onDrag: noop,
    onDragStart: noop,
    onDragEnd: noop
  };

  var env = {
    transform: (function(){
      var prefixes = ' -o- -ms- -moz- -webkit-'.split(' ');
      var style = document.body.style;
      for (var n = prefixes.length; n--;) {
        var property = prefixes[n] + 'transform';
        if (property in style) {
          return property;
        }
      }
    })()
  };

  var util = {
    assign: function () {
      var obj = arguments[0];
      var count = arguments.length;
      for ( var n = 1; n < count; n++ ) {
        var argument = arguments[n];
        for ( var key in argument ) {
          obj[key] = argument[key];
        }
      }
      return obj;
    },

    bind: function (fn, context) {
      return function() {
        fn.apply(context, arguments);
      }
    },

    on: function (element, e, fn) {
      if (e && fn) {
        util.addEvent (element, e, fn);
      } else if (e) {
        for (var ee in e) {
          util.addEvent (element, ee, e[ee]);
        }
      }
    },

    off: function (element, e, fn) {
      if (e && fn) {
        util.removeEvent (element, e, fn);
      } else if (e) {
        for (var ee in e) {
          util.removeEvent (element, ee, e[ee]);
        }
      }
    },

    limit: function (n, limit) {
      if (isArray(limit)) {
        limit = [+limit[0], +limit[1]];
        if (n < limit[0]) n = limit[0];
        else if (n > limit[1]) n = limit[1];
      } else {
        n = +limit;
      }
      return n;
    },

    addEvent: ('attachEvent' in Element.prototype)
      ? function (element, e, fn) { element.attachEvent('on'+e, fn) }
      : function (element, e, fn) { element.addEventListener(e, fn, false) },

    removeEvent: ('attachEvent' in Element.prototype)
      ? function (element, e, fn) { element.detachEvent('on'+e, fn) }
      : function (element, e, fn) { element.removeEventListener(e, fn) }
  };

  function Draggable (element, options) {
    var me = this,
      start = util.bind(me.start, me),
      drag = util.bind(me.drag, me),
      stop = util.bind(me.stop, me);

    if (!isElement(element)) {
      throw new TypeError('Draggable expects argument 0 to be an Element');
    }

    options = util.assign({}, defaults, options);

    util.assign(me, {
      element: element,
      handle: (options.handle && isElement(options.handle))
              ? options.handle
              : element,
      handlers: {
        start: {
          mousedown: start,
          touchstart: start
        },
        move: {
          mousemove: drag,
          mouseup: stop,
          touchmove: drag,
          touchend: stop
        }
      },
      options: options
    });

    me.initialize();
  }

  util.assign (Draggable.prototype, {
    setOption: function (property, value) {
      var me = this;
      me.options[property] = value;
      me.initialize();
      return me;
    },

    get: function() {
      var dragEvent = this.dragEvent;
      return {
        x: dragEvent.x,
        y: dragEvent.y
      };
    },

    set: function (x, y) {
      var me = this,
        dragEvent = me.dragEvent;
      dragEvent.original = {
        x: dragEvent.x,
        y: dragEvent.y
      };
      me.move(x, y);
      return me;
    },

    dragEvent: {
      started: false,
      x: 0,
      y: 0
    },

    initialize: function() {
      var me = this,
        element = me.element,
        compStyle = getStyle(element),
        options = me.options,
        transform = env.transform,
        oldTransform;

      var _dimensions = me._dimensions = {
        height: element.offsetHeight,
        left: element.offsetLeft,
        top: element.offsetTop,
        width: element.offsetWidth
      };

      if (options.useGPU && transform) {
        oldTransform = compStyle[transform];
        if (oldTransform === 'none') {
          oldTransform = '';
        }
        element.style[transform] = oldTransform + ' translate3d(0,0,0)';
      }

      if (options.setPosition) {
        element.style.display = 'block';
        element.style.left = _dimensions.left + 'px';
        element.style.top = _dimensions.top + 'px';
        element.style.width = _dimensions.width + 'px';
        element.style.height = _dimensions.height + 'px';
        element.style.bottom = element.style.right = 'auto';
        element.style.margin = 0;
        element.style.position = 'absolute';
      }

      if (options.setCursor) {
        element.style.cursor = 'move';
      }

      me.setLimit(options.limit);

      util.assign(me.dragEvent, {
        x: _dimensions.left,
        y: _dimensions.top
      });

      util.on(me.handle, me.handlers.start);
    },

    start: function (e) {
      var me = this;
      var cursor = me.getCursor(e);
      var element = me.element;

      if (!me.useTarget(e.target || e.srcElement)) {
        return;
      }

      if (e.preventDefault && !e.target.getAttribute('contenteditable')) {
        e.preventDefault();
      } else if (!e.target.getAttribute('contenteditable')) {
        e.returnValue = false;
      }

      me.dragEvent.oldZindex = element.style.zIndex;
      element.style.zIndex = 10000;

      me.setCursor(cursor);
      me.setPosition();
      me.setZoom();

      util.on(document, me.handlers.move);
    },

    drag: function (e) {
      var me = this,
        dragEvent = me.dragEvent,
        element = me.element,
        initialCursor = me._cursor,
        initialPosition = me._dimensions,
        options = me.options,
        zoom = initialPosition.zoom,
        cursor = me.getCursor(e),
        threshold = options.threshold,
        x = (cursor.x - initialCursor.x)/zoom + initialPosition.left,
        y = (cursor.y - initialCursor.y)/zoom + initialPosition.top;

      if (!dragEvent.started && threshold &&
        (Math.abs(initialCursor.x - cursor.x) < threshold) &&
        (Math.abs(initialCursor.y - cursor.y) < threshold)
      ) {
        return;
      }

      if (!dragEvent.original) {
        dragEvent.original = { x: x, y: y };
      }

      if (!dragEvent.started) {
        options.onDragStart(element, x, y, e);
        dragEvent.started = true;
      }

      if (me.move(x, y)) {
        options.onDrag(element, dragEvent.x, dragEvent.y, e);
      }
    },

    move: function (x, y) {
      var me = this,
        dragEvent = me.dragEvent,
        options = me.options,
        grid = options.grid,
        style = me.element.style,
        pos = me.limit(x, y, dragEvent.original.x, dragEvent.original.y);

      if (!options.smoothDrag && grid) {
        pos = me.round (pos, grid);
      }

      if (pos.x !== dragEvent.x || pos.y !== dragEvent.y) {
        dragEvent.x = pos.x;
        dragEvent.y = pos.y;
        style.left = pos.x + 'px';
        style.top = pos.y + 'px';
        return true;
      }
      return false;
    },

    stop: function (e) {
      var me = this,
        dragEvent = me.dragEvent,
        element = me.element,
        options = me.options,
        grid = options.grid,
        pos;

      util.off(document, me.handlers.move);
      element.style.zIndex = dragEvent.oldZindex;

      if (options.smoothDrag && grid) {
        pos = me.round({ x: dragEvent.x, y: dragEvent.y }, grid);
        me.move(pos.x, pos.y);
        util.assign(me.dragEvent, pos);
      }

      if (me.dragEvent.started) {
        options.onDragEnd(element, dragEvent.x, dragEvent.y, e);
      }

      me.reset();
    },

    reset: function() {
      this.dragEvent.started = false;
    },

    round: function (pos) {
      var grid = this.options.grid;
      return {
        x: grid * Math.round(pos.x/grid),
        y: grid * Math.round(pos.y/grid)
      };
    },

    getCursor: function (e) {
      return {
        x: (e.targetTouches ? e.targetTouches[0] : e).clientX,
        y: (e.targetTouches ? e.targetTouches[0] : e).clientY
      };
    },

    setCursor: function (xy) {
      this._cursor = xy;
    },

    setLimit: function (limit) {
      var me = this,
        _true = function (x, y) {
          return { x:x, y:y };
        };

      if (isFunction(limit)) {
        me.limit = limit;
      } else if (isElement(limit)) {
        var draggableSize = me._dimensions,
          height = limit.scrollHeight - draggableSize.height,
          width = limit.scrollWidth - draggableSize.width;

        me.limit = function (x, y) {
          return {
            x: util.limit(x, [0, width]),
            y: util.limit(y, [0, height])
          };
        };
      } else if (limit) {
        var defined = {
          x: isDefined(limit.x),
          y: isDefined(limit.y)
        };
        if (!defined.x && !defined.y) {
          me.limit = _true;
        } else {
          me.limit = function (x, y) {
            return {
              x: defined.x ? util.limit(x, limit.x) : x,
              y: defined.y ? util.limit(y, limit.y) : y
            };
          };
        }
      } else {
        me.limit = _true;
      }
    },

    setPosition: function() {
      var me = this,
        element = me.element,
        style = element.style;

      util.assign(me._dimensions, {
        left: parse(style.left) || element.offsetLeft,
        top: parse(style.top) || element.offsetTop
      });
    },

    setZoom: function() {
      var me = this;
      var element = me.element;
      var zoom = 1;

      while (element = element.offsetParent) {
        var z = getStyle(element).zoom;
        if (z && z !== 'normal') {
          zoom = z;
          break;
        }
      }
      me._dimensions.zoom = zoom;
    },

    useTarget: function (element) {
      var filterTarget = this.options.filterTarget;
      if (filterTarget instanceof Function) {
        return filterTarget(element);
      }
      return true;
    },

    destroy: function () {
      util.off(this.handle, this.handlers.start);
      util.off(document, this.handlers.move);
    }
  });

  function parse (string) {
    return parseInt(string, 10);
  }

  function getStyle (element) {
    return 'currentStyle' in element ? element.currentStyle : getComputedStyle(element);
  }

  function isArray (thing) {
    return thing instanceof Array;
  }

  function isDefined (thing) {
    return thing !== void 0 && thing !== null;
  }

  function isElement (thing) {
    return thing instanceof Element || typeof HTMLDocument !== 'undefined' && thing instanceof HTMLDocument;
  }

  function isFunction (thing) {
    return thing instanceof Function;
  }

  function noop (){}

  return Draggable;
})();

export default Draggable;
