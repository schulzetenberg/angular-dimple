angular.module('angular-dimple.line', [])

.directive('line', [function () {
  return {
    restrict: 'E',
    replace: true,
    require: ['line', '^graph'],
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
    }],
    link: function($scope, $element, $attrs, $controllers) {
      var graphController = $controllers[1];
      var chart = graphController.getChart();
      var drawn = false;

      function addLine () {
        var filteredData;
        line = chart.addSeries([$attrs.field], dimple.plot.line);
        graphController.filter($attrs);
        line.lineMarkers = false;
        graphController.draw();
        var legendExists = graphController.legendExists();
        if(legendExists) graphController.legend($attrs);
      }

      $scope.$watch('dataReady', function(newValue, oldValue) {
        if (newValue === true) {
          addLine();
        }
      });

    }
  };
}]);
