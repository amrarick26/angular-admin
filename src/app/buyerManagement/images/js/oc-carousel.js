angular.module('orderCloud')
    .directive('ocCarousel', ocCarouselDirective)
;

function ocCarouselDirective($compile) {
    return {
        scope: {
            buyer: '='
        },
        restrict: 'E',
        link: function(scope, element) {
            if(scope.buyer.xp && scope.buyer.xp.Images && scope.buyer.xp.Images.Items.length) {
                var imageData = scope.buyer.xp.Images;
                scope.interval = null;
                scope.noWrapSlides = imageData.NoWrap;
                scope.$watch('active', function(newIndex, oldIndex) {
                    if (Number.isFinite(newIndex) && newIndex !== oldIndex) {
                        scope.buyer.slideData = newIndex;
                    }
                });
                scope.active = 0;
                scope.buyer.slideData = scope.active;
                element.html(
                    "<uib-carousel active='active' interval='interval' no-wrap='noWrapSlides'>" +
                        "<uib-slide ng-init='buyer.slideData = $index' ng-repeat='slide in buyer.xp.Images.Items track by slide.ID' index='$index'>" +
                            "<img class='img-responsive' ng-src='{{slide.Src}}'>" +
                            "<div class='carousel-caption'>" +
                                "<h4>Slide {{slide.ID}}</h4>" +
                                "<p>{{slide.Text}}</p>" +
                            "</div>" +
                        "</uib-slide>" +
                    "</uib-carousel>"
                );
                $compile(element.contents())(scope);
            }
        }
    }
}