describe('Component: Buyer Carousel Management', function() {
    describe('Controller: BuyerCarouselCtrl', function() {
        var buyerCarouselCtrl;
        beforeEach(inject(function($controller) {
            buyerCarouselCtrl = $controller('BuyerCarouselCtrl', {
                SelectedBuyer: {
                    ID: 'mockBuyerID',
                    Name: 'Mock Buyer'
                }
            })
        }))
    })
})