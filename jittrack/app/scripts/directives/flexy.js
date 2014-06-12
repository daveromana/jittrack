(function (angular) {
    "use strict";
    angular.module('flexyLayout.block', [])
        .provider('Block', function () {

            /**
             * A composite block made of different types of blocks that must implement the structural interface
             *
             * moveLength->change the lengthValue according to specific block rules
             * canMoveLength->tells whether the block can change his lengthValue in the current state
             * getAvailableLength->return the length the block can be reduced of
             *
             * , canMoveLength, getAvailableLength
             * @param composingBlocks
             * @constructor
             */
            function CompositeBlock(composingBlocks) {
                this.blocks = [];

                if (angular.isArray(composingBlocks)) {
                    for (var i = 0, l = composingBlocks.length; i < l; i++) {
                        //should implement structural interface
                        if (composingBlocks[i].moveLength && composingBlocks[i].canMoveLength && composingBlocks[i].getAvailableLength) {
                            this.blocks.push(composingBlocks[i]);
                        }
                    }
                }
            }

            CompositeBlock.prototype.moveLength = function (length) {

                var
                    divider = 0,
                    initialLength = length,
                    blockLength;

                for (var i = 0, l = this.blocks.length; i < l; i++) {
                    if (this.blocks[i].canMoveLength(length) === true) {
                        divider++;
                    }
                }

                for (var j = 0; divider > 0; j++) {
                    blockLength = this.blocks[j].moveLength(length / divider);
                    length -= blockLength;
                    if (Math.abs(blockLength) > 0) {
                        divider--;
                    }
                }

                return initialLength - length;
            };

            CompositeBlock.prototype.canMoveLength = function (length) {

                for (var i = 0, l = this.blocks.length; i < l; i++) {
                    if (this.blocks[i].canMoveLength(length) === true) {
                        return true;
                    }
                }

                return false;
            };

            CompositeBlock.prototype.getAvailableLength = function () {
                var length = 0;
                for (var i = 0, l = this.blocks.length; i < l; i++) {
                    length += this.blocks[i].getAvailableLength();
                }

                return length;
            };

            CompositeBlock.prototype.clean = function () {
                delete this.blocks;
            };

            /**
             * A Blokc which can be locked (ie its lengthValue can not change) this is the standard composing block
             * @constructor
             */
            function Block(initial,name) {
                this.initialLength = initial > 0 ? initial : 0;
                this.isLocked = false;
                this.lengthValue = 0;
                this.minLength = 0;
                this.previousLength = initial > 0 ? initial : 0;
                this.name = name==null?'':name;
            }

            Block.prototype.moveLength = function (length) {

                if (this.isLocked === true) {
                    return 0;
                }

                var oldLength = this.lengthValue;
                if (angular.isNumber(length)) {
                    this.previousLength = this.lengthValue;
                    this.lengthValue = Math.max(0, this.lengthValue + length);
                }
                return this.lengthValue - oldLength;
            };

            Block.prototype.canMoveLength = function (length) {
                return !(this.isLocked === true || (length < 0 && (this.getAvailableLength()) === 0));
            };

            Block.prototype.getAvailableLength = function () {
                return this.isLocked === true ? 0 : this.lengthValue - this.minLength;
            };

            /**
             * Splitter a splitter block which split a set of blocks into two separate set
             * @constructor
             */
            function Splitter() {
                this.defaultValue = 5;
                this.lengthValue = this.defaultValue;
                this.initialPosition = { x: 0, y: 0};
                this.availableLength = {before: 0, after: 0};
                this.ghostPosition = { x: 0, y: 0};

            }

            Splitter.prototype.canMoveLength = function () {
                return false;
            };

            Splitter.prototype.moveLength = function () {
                return 0;
            };
            
            Splitter.prototype.toggleLength = function (collapse) {
                return this.lengthValue = collapse?0:this.defaultValue;
            };

            Splitter.prototype.getAvailableLength = function () {
                return 0;
            };

            this.$get = function () {
                return {
                    //variadic -> can call getNewComposite([block1, block2, ...]) or getNewComposite(block1, block2, ...)
                    getNewComposite: function () {
                        var args = [].slice.call(arguments);
                        if (args.length === 1 && angular.isArray(args[0])) {
                            args = args[0];
                        }
                        return new CompositeBlock(args);
                    },
                    getNewBlock: function (initialLength,name) {
                        return new Block(initialLength,name);
                    },
                    getNewSplitter: function () {
                        return new Splitter();
                    },

                    isSplitter: function (block) {
                        return block instanceof Splitter;
                    }
                };
            }
        });
})(angular);
(function (angular) {
    "use strict";
    angular.module('flexyLayout.directives', ['flexyLayout.mediator'])
        .service('flexyLayoutService',function($rootScope,Block){
            var ctrls = [];
            
            this.addCtrl = function(ctrl){
                if(ctrl){
                    ctrls.push(ctrl);
                }
            };
            this.toggleBlock = function(name,collapse){
                if(name){
                    for(var i=0;i<ctrls.length;i++){
                        var blocks = ctrls[i].blocks();
                        for(var j=0;j<blocks.length;j++){
                            if(!Block.isSplitter(blocks[j]) && blocks[j].name === name){
                                
                                
                                var blockToChange=-1,
                                    splitterToChange=-1;
                                
                                for(var n=j+1;n<blocks.length;n++){
                                    if(!Block.isSplitter(blocks[n]) && blocks[n].lengthValue>0){
                                        blockToChange = n;
                                        if(Block.isSplitter(blocks[n-1])){
                                            splitterToChange = n-1;
                                        }
                                        break;
                                    }
                                }
                                if(blockToChange==-1){
                                    for(var n=j-1;n>=0;n--){
                                        if(!Block.isSplitter(blocks[n]) && blocks[n].lengthValue>0){
                                            blockToChange = n;
                                            if(Block.isSplitter(blocks[n+1])){
                                                splitterToChange = n+1;
                                            }
                                            break;
                                        } 
                                    }
                                }
                                
                                if(blockToChange!=-1){
                                    var newLength = collapse ? (blocks[j].lengthValue) : (-1) * blocks[j].previousLength;
                                    ctrls[i].toggleLockBlock(j, false);
                                    blocks[j].moveLength((-1) * newLength);
                                    if(splitterToChange != -1){
                                        blocks[splitterToChange].toggleLength(collapse);
                                        newLength += collapse?blocks[splitterToChange].defaultValue:(-1)*blocks[splitterToChange].defaultValue;
                                    }
                                    blocks[blockToChange].moveLength(newLength);
                                    
                                }
                                
                                
                                
                              /*//Toggle left Splitter if there
                                var splitterIndex = -1,
                                    splitterFactor = 0;
                                if(j>0 && Block.isSplitter(blocks[j-1])){
                                    splitterIndex = j-1;
                                    splitterFactor = -1;
                                    blocks[j-1].toggleLength(collapse);
                                }else if(j+1<blocks.length && Block.isSplitter(blocks[j+1])){
                                    splitterIndex = j+1;
                                    splitterFactor = 1
                                    blocks[j+1].toggleLength(collapse);
                                }
                                
                                var newLength = collapse ? -1 * (blocks[j].lengthValue) : blocks[j].previousLength;
                                ctrls[i].moveSplitterLength(splitterIndex,splitterFactor*newLength);
                                //ctrls[i].moveBlockLength(j,newLength);
                                var blockToMove = null
                                if(j+1<blocks.length && !Block.isSplitter(blocks[j+1])){
                                    blockToMove = blocks[j+1];
                                }else if(j+2<blocks.length && !Block.isSplitter(blocks[j+2])){
                                    blockToMove = blocks[j+2];
                                }else if(j-1<blocks.length && !Block.isSplitter(blocks[j-1])){
                                    blockToMove = blocks[j-1];
                                }
                                
*/                                
                                return true;
                            }
                        }
                    }
                }
            }
            
            this.ctrls = ctrls;
        })
        .directive('flexyLayout', function (flexyLayoutService) {
            return {
                restrict: 'AE',
                scope: {},
                template: '<div class="flexy-layout" ng-transclude></div>',
                replace: true,
                transclude: true,
                controller: 'mediatorCtrl',
                link: function (scope, element, attrs, ctrl) {
                    flexyLayoutService.addCtrl(ctrl);
                    scope.$watch(function () {
                        return element[0][ctrl.lengthProperties.offsetName];
                    }, function () {
                        ctrl.init();
                    });
                }
            };
        })
        .directive('blockContainer', ['Block', function (Block) {
            return{
                restrict: 'AE',
                require: '^flexyLayout',
                transclude: true,
                replace: true,
                scope: {},
                template: '<div class="block">' +
                    '<div class="block-content" ng-transclude>' +
                    '</div>' +
                    '</div>',
                link: function (scope, element, attrs, ctrl) {
                    var initialLength = scope.$eval(attrs.init);
                    scope.block = Block.getNewBlock(initialLength,attrs.name);
                    scope.$watch('block.lengthValue', function (newValue, oldValue) {
                        element.css(ctrl.lengthProperties.lengthName, Math.floor(newValue) + 'px');
                    });

                    ctrl.addBlock(scope.block);
                }
            };
        }])
        .directive('blockSplitter', ['Block', function (Block) {
            return{
                restrict: 'AE',
                require: '^flexyLayout',
                replace: true,
                scope: {},
                template: '<div class="block splitter">' +
                    '<div class="ghost"></div>' +
                    '</div>',
                link: function (scope, element, attrs, ctrl) {
                    scope.splitter = Block.getNewSplitter();

                    var ghost = element.children()[0];
                    var mouseDownHandler = function (event) {
                        this.initialPosition.x = event.clientX;
                        this.initialPosition.y = event.clientY;
                        this.availableLength = ctrl.getSplitterRange(this);
                        ctrl.movingSplitter = this;

                        //to avoid the block content to be selected when dragging the splitter
                        event.preventDefault();
                    };
                    
                    scope.$watch('splitter.lengthValue', function (newValue, oldValue) {
                        element.css(ctrl.lengthProperties.lengthName, Math.floor(newValue) + 'px');
                    });

                    ctrl.addBlock(scope.splitter);

                    element.bind('mousedown', angular.bind(scope.splitter, mouseDownHandler));

                    scope.$watch('splitter.ghostPosition.' + ctrl.lengthProperties.position, function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            ghost.style[ctrl.lengthProperties.positionName] = newValue + 'px';
                        }
                    });

                }
            };
        }])
         .directive('collapse', function () {
        return {
            require: '^flexyLayout',
            replace: true,
            scope: {},
            transclude: true,
            template: '<div ng-click="toggle()" ng-transclude></div>',
            restrict: 'AE',
            link: function (scope, element, attr, ctrl) {

                var index = parseInt(attr.index,10),
                    minWidth = attr.minWidth || 35,
                    maxWidth = attr.maxWidth || 200;

                scope.isCollapsed = false;
                scope.toggle = function () {
                    ctrl.toggleLockBlock(index, false);
                    scope.isCollapsed = scope.isCollapsed !== true;
                };

                scope.$watch('isCollapsed', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        var newLength = newValue === true ? minWidth - element.parent()[0].offsetWidth : ctrl.getPreviousLength(index);
                        ctrl.moveBlockLength(index,newLength);
                        ctrl.toggleLockBlock(index, newValue);
                    }
                });
            }
        };
    });

    angular.module('flexyLayout', ['flexyLayout.directives']);

})(angular);
(function (angular) {
    "use strict";
    //TODO this guy is now big, split it, maybe the part for event handling should be moved somewhere else
    angular.module('flexyLayout.mediator', ['flexyLayout.block']).
        controller('mediatorCtrl', ['$scope', '$element', '$attrs', 'Block', function (scope, element, attrs, Block) {

            var blocks = [],
                pendingSplitter = null,
                splitterCount = 0,
                self = this,
                possibleOrientations = ['vertical', 'horizontal'],
                orientation = possibleOrientations.indexOf(attrs.orientation) !== -1 ? attrs.orientation : 'horizontal',
                className = orientation === 'horizontal' ? 'flexy-layout-column' : 'flexy-layout-row';

            element.addClass(className);

            this.lengthProperties = orientation === 'horizontal' ? {lengthName: 'width', offsetName: 'offsetWidth', positionName: 'left', position: 'x', eventProperty: 'clientX'} :
            {lengthName: 'height', offsetName: 'offsetHeight', positionName: 'top', position: 'y', eventProperty: 'clientY'};

            ///// mouse event handler /////

            this.movingSplitter = null;

            var mouseMoveHandler = function (event) {
                var length = 0,
                    eventProperty = this.lengthProperties.eventProperty,
                    position = this.lengthProperties.position;

                if (this.movingSplitter !== null) {
                    length = event[eventProperty] - this.movingSplitter.initialPosition[position];
                    if (length < 0) {
                        this.movingSplitter.ghostPosition[position] = (-1) * Math.min(Math.abs(length), this.movingSplitter.availableLength.before);
                    } else {
                        this.movingSplitter.ghostPosition[position] = Math.min(length, this.movingSplitter.availableLength.after);
                    }
                }
            };

            var mouseUpHandler = function (event) {
                var length = 0,
                    eventProperty = this.lengthProperties.eventProperty,
                    position = this.lengthProperties.position;

                if (this.movingSplitter !== null) {
                    length = event[eventProperty] - this.movingSplitter.initialPosition[position];
                    this.moveSplitterLength(this.movingSplitter, length);
                    this.movingSplitter.ghostPosition[position] = 0;
                    this.movingSplitter = null;
                }
            };

            element.bind('mouseup', function (event) {
                scope.$apply(angular.bind(self, mouseUpHandler, event));
            });

            //todo should do some throttle before calling apply
            element.bind('mousemove', function (event) {
                scope.$apply(angular.bind(self, mouseMoveHandler, event));
            });

            /////   adding blocks   ////

            this.addBlock = function (block) {

                if (!Block.isSplitter(block)) {
                    if (pendingSplitter !== null) {
                        blocks.push(pendingSplitter);
                        splitterCount++;
                        pendingSplitter = null;
                    }

                    blocks.push(block);
                    this.init();
                } else {
                    pendingSplitter = block;
                }
            };

            /**
             * to be called when flexy-layout container has been resized
             */
            this.init = function () {

                var i,
                    l = blocks.length,
                    elementLength = element[0][this.lengthProperties.offsetName],
                    block,
                    bufferBlock = Block.getNewBlock();//temporary buffer block

                blocks.push(bufferBlock);

                var splitterLength = 0;
                //reset all blocks
                for (i = 0; i < l; i++) {
                    block = blocks[i];
                    block.isLocked = false;
                    if (!Block.isSplitter(block)) {
                        block.moveLength(-10000);
                    }else{
                        splitterLength += block.lengthValue;
                    }
                }
                //buffer block takes all available space
                bufferBlock.moveLength(elementLength - splitterLength);

                for (i = 0; i < l; i++) {
                    block = blocks[i];
                    if (block.initialLength > 0) {
                        this.moveBlockLength(block, block.initialLength);
                        block.isLocked=true;
                    }
                }

                //buffer block free space for non fixed block
                this.moveBlockLength(bufferBlock, -10000);

                for (i = 0; i < l; i++) {
                    blocks[i].isLocked = false;
                }

                blocks.splice(l, 1);

            };

            ///// public api /////

            /**
             * Will move a given block length from @length
             *
             * @param block can be a block or an index (likely index of the block)
             * @param length < 0 or > 0 : decrease/increase block size of abs(length) px
             */
            this.moveBlockLength = function (block, length) {

                var
                    blockIndex = typeof block !== 'object' ? block : blocks.indexOf(block),
                    composingBlocks,
                    composite,
                    availableLength,
                    blockToMove;


                if (blockIndex < 0 || length === 0 || blockIndex >= blocks.length) {
                    return;
                }

                blockToMove = blocks[blockIndex];

                composingBlocks = (blocks.slice(0, blockIndex)).concat(blocks.slice(blockIndex + 1, blocks.length));
                composite = Block.getNewComposite(composingBlocks);

                if (composite.canMoveLength(-length) !== true || blockToMove.canMoveLength(length) !== true) {
                    return;
                }

                if (length < 0) {
                    availableLength = (-1) * blockToMove.moveLength(length);
                    composite.moveLength(availableLength);
                } else {
                    availableLength = (-1) * composite.moveLength(-length);
                    blockToMove.moveLength(availableLength);
                }

                //free memory
                composite.clean();
            };

            this.blocks = function(){
               return blocks;
            };
            
            this.getPreviousLength = function(block){
                var blockIndex = typeof block !== 'object' ? block : blocks.indexOf(block);
                if (blockIndex < 0 || blockIndex >= blocks.length) {
                    return;
                }
                return blocks[blockIndex].previousLength;
            };
            /**
             * move splitter it will affect all the blocks before until the previous/next splitter or the edge of area
             * @param splitter
             * @param length
             */
                //todo mutualise with moveBlockLength
            this.moveSplitterLength = function (splitter, length, flag) {

                var
                    splitterIndex = typeof splitter !== 'object' ? splitter : blocks.indexOf(splitter),
                    beforeComposite,
                    afterComposite,
                    availableLength,
                    splitter = blocks[splitterIndex];

                if (!Block.isSplitter(splitter) || splitterIndex === -1) {
                    return;
                }

                beforeComposite = Block.getNewComposite(fromSplitterToSplitter(splitter, true));
                afterComposite = Block.getNewComposite(fromSplitterToSplitter(splitter, false));

                if (!beforeComposite.canMoveLength(length) || !afterComposite.canMoveLength(-length)) {
                    return;
                }
                if (length < 0) {
                    availableLength = (-1) * beforeComposite.moveLength(length);
                    
                    afterComposite.moveLength(availableLength);
                } else {
                    availableLength = (-1) * afterComposite.moveLength(-length);
                    beforeComposite.moveLength(availableLength);
                }

                afterComposite.clean();
                beforeComposite.clean();

            };

            /**
             * return an object with the available length before the splitter and after the splitter
             * @param splitter
             * @returns {{before: *, after: *}}
             */
            this.getSplitterRange = function (splitter) {

                var
                    beforeSplitter = fromSplitterToSplitter(splitter, true),
                    afterSplitter = fromSplitterToSplitter(splitter, false),
                    toReturn = {
                        before: beforeSplitter.getAvailableLength(),
                        after: afterSplitter.getAvailableLength()
                    };

                beforeSplitter.clean();
                afterSplitter.clean();

                return toReturn;
            };

            /**
             * lock/unlock a given block
             * @param block block or blockIndex
             * @param lock new value for block.isLocked
             */
            this.toggleLockBlock = function (block, lock) {
                var
                    blockIndex = typeof block !== 'object' ? block : blocks.indexOf(block),
                    blockToLock;

                if (blockIndex >= 0 && blockIndex < blocks.length) {
                    blockToLock = blocks[blockIndex];
                    blockToLock.isLocked = lock;
                }

            };

            var fromSplitterToSplitter = function (splitter, before) {

                var
                    splitterIndex = blocks.indexOf(splitter),
                    blockGroup = before === true ? blocks.slice(0, splitterIndex) : blocks.slice(splitterIndex + 1, blocks.length),
                    fn = before === true ? Array.prototype.pop : Array.prototype.shift,
                    composite = [],
                    testedBlock;

                while (testedBlock = fn.apply(blockGroup)) {
                    if (Block.isSplitter(testedBlock)) {
                        break;
                    } else {
                        composite.push(testedBlock);
                    }
                }
                return Block.getNewComposite(composite);
            };
        }]);
})(angular);