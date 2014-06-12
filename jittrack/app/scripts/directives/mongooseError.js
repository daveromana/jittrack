'use strict';

angular.module('jittrackApp')

  /**
   * Removes server error when user updates input
   */
  .directive('mongooseError', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        element.on('keydown', function() {
          return ngModel.$setValidity('mongoose', true);
        });
      }
    };
  })
.directive('draggable', function($document,$window,$parse) {
    function isNum(x){
        return angular.isNumber(x) && !isNaN(x);
    }
    function toNum(x){
          return isNaN(parseInt(x))?0:parseInt(x);
    }
    function setPos(obj,a1,a2){
          var s = {};
          if(isNum(a1))s["left"] = a1 + 'px';
          if(isNum(a2))s["top"] = a2 + 'px';
          obj.css(s);
          return obj;
    }
      function getPos(obj,absolute){
              var isRelative = (obj.css('position') == 'relative') && !absolute?true:false
              , y=isRelative?toNum(obj.css('top')):obj[0].offsetTop
              , x=isRelative?toNum(obj.css('left')):obj[0].offsetLeft;
              return {x:x,y:y};                                  
      }
      function normaliseEvent(e)
      {
          if (e.targetTouches !== undefined) {
            return e.targetTouches.item(0);
          } else if (e.originalEvent !== undefined && e.originalEvent.targetTouches !== undefined) {
            return e.originalEvent.targetTouches.item(0);
          }
          return e;
      }
      function getBound(bound,$element){
          var elem = bound || 'window';
          if(elem == 'parent'){
              elem = $element.parent();
          }else if(elem == 'document'){
              elem = $document;
          }else if(elem == 'window'){
              elem = $window;
          }
          if(angular.isElement(elem)){
              return [elem[0].offsetLeft,elem[0].offsetTop,elem[0].offsetLeft+elem[0].offsetWidth-$element[0].offsetWidth, elem[0].offsetTop+elem[0].offsetHeight-$element[0].offsetHeight];
             }else if(angular.isArray(eval('elem'))){
              return eval('elem');
          }
      }
      function normalisePos(diffPos,startPos,scope){
          var bound = scope.bound
          ,   currx = startPos.x + diffPos.x
          ,   curry = startPos.y + diffPos.y
          ,   diffx = 0
          ,   diffy = 0;
          if(angular.isArray(bound)){
               if(currx < bound[0])
                   diffx = currx - bound[0];
               if(currx > bound[2])
                   diffx = currx - bound[2];
               if(curry < bound[1])
                   diffy = curry - bound[1];
               if(curry > bound[3])
                   diffy = curry - bound[3];
           }
           diffPos.y = scope.axisY?diffPos.y - diffy:0;
           diffPos.x = scope.axisX?diffPos.x - diffx:0;
      }
      function getShadow(obj){
          return angular.element("<div></div>").css({width:obj[0].offsetWidth+'px',height:obj[0].offsetHeight+'px'}).addClass("shadow");
      }
    return {
        restrict: "AC",
        controller: function($scope,$attrs,$element){
            $scope.axisX = $scope.axisX || !$attrs.axis || $attrs.axis == 'x';
            $scope.axisY = $scope.axisY || !$attrs.axis || $attrs.axis == 'y';
            var pos = $element.css('position');
            if(pos != 'absolute' && pos != 'relative')
                $element.css({position:'relative'});
            $scope.drag = true;
            $scope.bound = $attrs.bound;
            $scope.draggable = $attrs.draggable?angular.element(document.querySelector($attrs.draggable)):$element
       },
    
       link: function(scope, element, attr) {
    var endTypes = 'touchend touchcancel mouseup mouseleave'
    ,   moveTypes = 'touchmove mousemove'
    ,   startTypes = 'touchstart mousedown'  
    ,   startX = 0
    ,   startY = 0
    ,   startPos = null
    ,   absPos = null
    ,   diffPos = {x:0,y:0}
    ,   shadow = null;   
    
    scope.draggable.bind(startTypes, function(event) {
      // Prevent default dragging of selected content
      if(!scope.drag) return;
      event.preventDefault();
      event = normaliseEvent(event);
      startX = event.pageX;
      startY = event.pageY;
      diffPos.x = diffPos.y = 0;
      startPos = getPos(element);
      absPos = getPos(element,true);
      scope.bound = getBound(attr.bound,element); 
      $document.bind(moveTypes, dragStart);
      $document.bind(endTypes, dragStop);
    }).css({'cursor':'move'});
    function dragStart(event) {
        event.preventDefault();
        event = normaliseEvent(event);
        diffPos.x = event.pageX - startX; diffPos.y = event.pageY - startY;
        normalisePos(diffPos,absPos,scope);
        if(attr.helper){
        if(shadow == null){
            shadow = (attr.helper == 'clone')?getShadow(element):attr.helper();
            element.after(shadow);
        }
        setPos(shadow,absPos.x + diffPos.x,absPos.y + diffPos.y).css({display: 'block'});         
        } else {
        setPos(element,startPos.x + diffPos.x,startPos.y + diffPos.y);        
       }
    }
    function dragStop() {
      setPos(element,startPos.x + diffPos.x,startPos.y + diffPos.y);
      if (attr.onDragged) {
          var fn = $parse(attr.onDragged);
          scope.$apply(function () {
              fn(scope, {$Pos:diffPos});
          });
      }
      if(attr.helper && shadow)     
          shadow.css({display:'none'});
      angular.forEach(moveTypes.split(" "),function(val){
          $document.unbind(val, dragStart);
      });
      angular.forEach(endTypes.split(" "),function(val){
          $document.unbind(val, dragStop);
      });
    }
  }
}});
