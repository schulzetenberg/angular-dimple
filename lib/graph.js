angular.module('angular-dimple.graph', [])

.directive('graph', ['$window', function ($window) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      data: '=',
      color: '='
    },
    require: ['graph'],
    transclude: true,
    link: function (scope, element, attrs, controllers, transclude) {
      var graphController = controllers[0];
      graphController._createChart();
      scope.dataReady = false;
      scope.filters = [];

      var chart = graphController.getChart();
      var transition;
      if (attrs.transition) {
        transition = attrs.transition;
      } else {
        transition = 750;
      }

      scope.$watch('data', function(newValue, oldValue) {
        if (newValue) {
          scope.dataReady = true;
          graphController.setData();
          chart.draw(transition);
        }
      });

      transclude(scope, function(clone){
        element.append(clone);
      });

      scope.onResize = function() {
        if (graphController.getAutoresize()){
          var chart = graphController.getChart();
          if (chart){
            chart.draw(0, true);
          }
        }
      };

      angular.element($window).bind('resize', function() {
          scope.onResize();
      });

    },
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
      var chart;
      var legend;
      var legendField;
      var filterValues = [null];
      var autoresize = false;
      var id = (Math.random() * 1e9).toString(36).replace(".", "_");
      $element.append('<div class="dimple-graph" id="dng-'+ id +'"></div>');

      this._createChart = function () {
        // create an svg element

        var width = $attrs.width ? $attrs.width : '100%';
        var height = $attrs.height ? $attrs.height : '100%';
        autoresize = $attrs.autoresize ? $attrs.autoresize.toLowerCase()==='true' : false;

        var svg = dimple.newSvg('#dng-'+ id +'', width, height);
        var data = $scope.data;

        // create the dimple chart using the d3 selection of our <svg> element
        chart = new dimple.chart(svg, data);

        if ($attrs.margin) {
          chart.setMargins($attrs.margin);
        } else {
          chart.setMargins(60, 60, 20, 40);
        }

        // auto style
        var autoStyle = $attrs.autoStyle === 'false' ? true : false;
        chart.noFormats = autoStyle;

        // Apply palette styles
        if ($attrs.color) {
          var palette = $scope.color;
          for (var i = 0; i < palette.length; i++ ) {
            chart.assignColor(palette[i].name, palette[i].fill, palette[i].stroke, palette[i].opacity);
          }
        } else {
          chart.defaultColors = [
            new dimple.color("#80B1D3"), // Blue
            new dimple.color("#FB8072"), // Red
            new dimple.color("#FDB462"), // Orange
            new dimple.color("#B3DE69"), // Green
            new dimple.color("#FFED6F"), // Yellow
            new dimple.color("#BC80BD"), // Purple
            new dimple.color("#8DD3C7"), // Turquoise
            new dimple.color("#CCEBC5"), // Pale Blue
            new dimple.color("#FFFFB3"), // Pale Yellow
            new dimple.color("#BEBADA"), // Lavender
            new dimple.color("#FCCDE5"), // Pink
            new dimple.color("#D9D9D9"), // Grey
            // Extra colors:
            new dimple.color("#7171C6"),  // sgi slateblue
            new dimple.color("#8E388E"),  // sgi beet
            new dimple.color("#388E8E"),  // sgi teal
            new dimple.color("#DCC7AA"),  // Beige
            new dimple.color("#838B83"),  // Honeydew
            new dimple.color("#71C671"),  // sgi chartreuse
            new dimple.color("#8E8E38"),  // sgi olivedrab
          ];
        }
      };

      this.getAutoresize = function (){
        return autoresize;
      };

      this.getChart = function () {
        return chart;
      };

      this.setData = function () {
        if(filterValues[0] !== null){
          chart.data = dimple.filterData($scope.data, legendField, filterValues);
        } else {
          chart.data = $scope.data;
        }
      };

      this.setLegend = function (newLegend) {
        legend = newLegend;
      };

      this.legendExists = function () {
        return Boolean(legend);
      };
      
      this.draw = function () {
        chart.draw();
      };

      this.legend = function (attrs) {
        if (!attrs.field) return;
        legendField = attrs.field;
        chart.legends = []; // Orphan the legend
        filterValues = dimple.getUniqueValues($scope.data, legendField);

        // Add a click event to each rectangle
        legend.shapes.selectAll("rect").on("click", function (e) {
          var hide = false;
          var newFilters = [];

          // If the filters contain the clicked shape hide it
          filterValues.forEach(function (f) {
            if (f === e.aggField.slice(-1)[0]) {
              hide = true;
            } else {
              newFilters.push(f);
            }
          });

          if (hide) {
            d3.select(this).style("opacity", 0.2);
          } else {
            newFilters.push(e.aggField.slice(-1)[0]);
            d3.select(this).style("opacity", 0.8);
          }

          filterValues = newFilters;
          chart.data = dimple.filterData($scope.data, legendField, filterValues);
          // Re-draw chart with 500ms animation speed
          chart.draw(500);
        });
      };

      this.getID = function () {
        return id;
      };

      this.filter = function (attrs) {
        if (attrs.value !== undefined) {
          $scope.filters.push(attrs.value);
        }
        if ($scope.filters.length) {
          chart.data = dimple.filterData($scope.data, attrs.field, $scope.filters);
        }

        if (attrs.filter !== undefined) {
          console.log("i see a filter");
          var thisFilter = attrs.filter.split(':');
          var field = thisFilter[0];
          var value = [thisFilter[1]];
          chart.data = dimple.filterData($scope.data, field, value);
        }
      };

    }]
  };
}]);
