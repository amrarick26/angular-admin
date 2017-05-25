angular.module('orderCloud')
    .directive('ocCarousel', ocCarouselDirective)
;

function ocCarouselDirective($compile, $templateRequest, $rootScope) {
    return {
        scope: {
            buyer: '='
        },
        restrict: 'E',
        link: function(scope, element) {
            if(scope.buyer.xp && scope.buyer.xp.Slides && scope.buyer.xp.Slides.Items.length) {
                var imageData = scope.buyer.xp.Slides;
                scope.interval = null;
                scope.noWrapSlides = false;
                scope.$watch('active', function(newIndex, oldIndex) {
                    if (Number.isFinite(newIndex) && newIndex !== oldIndex) {
                        scope.buyer.slideData = scope.buyer.xp.Slides.Items[newIndex];
                        $rootScope.$broadcast('OC:CarouselIndexChange', newIndex);  
                    } else {
                        scope.buyer.slideData = scope.buyer.xp.Slides.Items[0];
                    }
                });
                $templateRequest("common/directives/oc-carousel/oc-carousel.html").then(function(html) {
                    var template = angular.element(html);
                    element.append(template);
                    $compile(template)(scope);
                });
            }
        }
    }
}