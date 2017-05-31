describe('Component: Buyer Carousel Management', function() {
    var _ocBuyerCarousel;

    beforeEach(inject(function(ocBuyerCarousel) {
        _ocBuyerCarousel = ocBuyerCarousel;
    }))

    describe('Controller: BuyerCarouselCtrl', function() {
        var buyerCarouselCtrl;
        beforeEach(inject(function($controller) {
            buyerCarouselCtrl = $controller('BuyerCarouselCtrl', {
                SelectedBuyer: mock.Buyer,
                $scope: scope
            });
            spyOn(oc.Buyers, 'Patch').and.returnValue(dummyPromise);
            spyOn(_ocBuyerCarousel, 'Upload');
        }));
        describe('updateSlide', function() {
            it('should patch the buyer with the array of slides', function() {
                buyerCarouselCtrl.updateSlide();
                expect(oc.Buyers.Patch).toHaveBeenCalledWith(mock.Buyer.ID, {xp: {Slides: {Items: mock.Buyer.xp.Slides.Items}}});
            })
        });
        describe('deleteSlide', function() {
            it('should patch the buyer with the array of slides', function() {
                buyerCarouselCtrl.deleteSlide();
                expect(oc.Buyers.Patch).toHaveBeenCalledWith(mock.Buyer.ID, {xp: {Slides: {Items: mock.Buyer.xp.Slides.Items}}});
            })
        })
        describe('uploadSlide', function() {
            it('should call the ocBuyerCarousel service Upload method', function() {
                buyerCarouselCtrl.uploadSlide();
                expect(_ocBuyerCarousel.Upload).toHaveBeenCalledWith(mock.Buyer);
            })
        });
        describe('updateSettings', function() {
            it('should patch the buyer with the carousel data', function() {
                buyerCarouselCtrl.updateSettings();
                expect(oc.Buyers.Patch).toHaveBeenCalledWith(mock.Buyer.ID, {xp: {Slides: {AutoPlay: true, NoWrap: false, Interval: 5000}}});
            })
        })
    });

    describe('Factory: ocBuyerCarousel', function() {
        describe('Method: Upload', function() {
            it('should open the modal for carousel create', function() {
                spyOn(uibModalService, 'open').and.callThrough();
                _ocBuyerCarousel.Upload(mock.Buyer);
                expect(uibModalService.open).toHaveBeenCalledWith({
                    templateUrl: 'buyerManagement/carousel/templates/buyerCarouselCreate.modal.html',
                    controller: 'BuyerCarouselCreateModalCtrl',
                    controllerAs: 'buyerCarouselCreate',
                    resolve: {
                        SelectedBuyer: jasmine.any(Function)
                    }
                })
            })
        })
    })
    describe('Controller: BuyerCarouselCreateModalCtrl', function() {
        var buyerCarouselCreateModalCtrl,
            uibModalInstance = jasmine.createSpyObj('modalInstance', ['close', 'dismiss']);
        beforeEach(inject(function($controller) {
            buyerCarouselCreateModalCtrl = $controller('BuyerCarouselCreateModalCtrl', {
                SelectedBuyer: mock.Buyer,
                $uibModalInstance: uibModalInstance
            });
            spyOn(oc.Buyers, 'Patch').and.returnValue(dummyPromise);
        }));
        describe('submit', function() {
            it('should patch the buyer with the new slide data', function() {
                buyerCarouselCreateModalCtrl.submit();
                expect(oc.Buyers.Patch).toHaveBeenCalledWith(mock.Buyer.ID, {xp: {Slides: {Items: mock.Buyer.xp.Slides.Items}}});
                scope.$digest();
                expect(uibModalInstance.dismiss).toHaveBeenCalled();
            })
        });
        describe('cancel', function() {
            it('should dismiss the modal', function() {
                buyerCarouselCreateModalCtrl.cancel();
                expect(uibModalInstance.close).toHaveBeenCalled();
            });
        });
    })
})