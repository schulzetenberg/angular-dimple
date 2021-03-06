/*! angular-dimple - 2.0.1 - 2017-01-10
*   https://github.com/esripdx/angular-dimple
*   Licensed ISC */
angular.module('angular-dimple', [
  'angular-dimple.graph',
  'angular-dimple.legend',
  'angular-dimple.x',
  'angular-dimple.y',
  'angular-dimple.r',
  'angular-dimple.line',
  'angular-dimple.bar',
  'angular-dimple.stacked-bar',
  'angular-dimple.area',
  'angular-dimple.stacked-area',
  'angular-dimple.scatter-plot',
  'angular-dimple.ring'
])

.constant('MODULE_VERSION', '0.0.1')

.value('defaults', {
  foo: 'bar'
});
angular.module('angular-dimple.area', [])

.directive('area', [function () {
  return {
    restrict: 'E',
    replace: true,
    require: ['area', '^graph'],
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
    }],
    link: function($scope, $element, $attrs, $controllers) {
      var graphController = $controllers[1];
      var areaController = $controllers[0];
      var chart = graphController.getChart();

      function addArea () {
        if ($attrs.value) {
          area = chart.addSeries([$attrs.field], dimple.plot.area);
          graphController.filter($attrs);
          area.lineMarkers = false;
        } else {
          var values = dimple.getUniqueValues($scope.data, $attrs.field);
          angular.forEach(values, function(value){
            area = chart.addSeries([$attrs.field], dimple.plot.area);
            graphController.filter($attrs);
            area.lineMarkers = false;
          });
        }
        graphController.draw();
      }

      $scope.$watch('dataReady', function(newValue, oldValue) {
        if (newValue === true) {
          addArea();
        }
      });
    }
  };
}]);

angular.module('angular-dimple.bar', [])

.directive('bar', [function () {
  return {
    restrict: 'E',
    replace: true,
    require: ['bar', '^graph'],
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
    }],
    link: function($scope, $element, $attrs, $controllers) {
      var graphController = $controllers[1];
      var lineController = $controllers[0];
      var chart = graphController.getChart();

      function addBar () {
        var filteredData;
        bar = chart.addSeries([$attrs.field], dimple.plot.bar);
        graphController.filter($attrs);
        graphController.draw();
      }



      $scope.$watch('dataReady', function(newValue, oldValue) {
        if (newValue === true) {
          addBar();
        }
      });
    }
  };
}]);
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

        // ex. '60, 60, 20, 40'
        if($attrs.margin){
          var margin = $attrs.margin.split(',').map(Number); // Convert string to array of #s
          chart.setMargins(margin[0], margin[1], margin[2], margin[3]);
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
        legend.shapes.selectAll("rect").style("cursor", "pointer").on("click", function (e) {
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

        if (attrs.filter) {
          var thisFilter = attrs.filter.split(':');
          var field = thisFilter[0];
          var value = [thisFilter[1]];
          chart.data = dimple.filterData($scope.data, field, value);
        }
      };

    }]
  };
}]);

angular.module('angular-dimple.legend', [])

.directive('graphLegend', [function () {
  return {
    restrict: 'E',
    replace: true,
    require: ['graphLegend', '^graph'],
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
    }],
    link: function($scope, $element, $attrs, $controllers) {
      var graphController = $controllers[1];
      var chart = graphController.getChart();

      function addLegend () {
        var left = $attrs.left ? $attrs.left : "10%";
        var top = $attrs.top ? $attrs.top : "4%";
        var height = $attrs.height ? $attrs.height : "10%";
        var width = $attrs.width ? $attrs.width : "90%";
        var position = $attrs.position ? $attrs.position : 'left';
        var legend = chart.addLegend(left, top, width, height, position);
        graphController.setLegend(legend);
      }

      $scope.$watch('dataReady', function(newValue, oldValue) {
        if (newValue === true) {
          addLegend();
        }
      });
    }
  };
}]);

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

angular.module('angular-dimple.r', [])

.directive('r', [function () {
  return {
    restrict: 'E',
    replace: true,
    require: ['r', '^graph'],
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
    }],
    link: function($scope, $element, $attrs, $controllers) {
      var graphController = $controllers[1];
      var chart = graphController.getChart();

      function addAxis () {
        r = chart.addMeasureAxis('p', $attrs.field);

        if ($attrs.title && $attrs.title !== "null") {
          r.title = $attrs.title;
        } else if ($attrs.title == "null") {
          r.title = null;
        }
      }

      $scope.$watch('data', function(newValue, oldValue) {
        if (newValue) {
          addAxis();
        }
      });
    }
  };
}]);
angular.module('angular-dimple.ring', [])

.directive('ring', [function () {
  return {
    restrict: 'E',
    replace: true,
    require: ['ring', '^graph'],
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
    }],
    link: function($scope, $element, $attrs, $controllers) {
      var graphController = $controllers[1];
      var areaController = $controllers[0];
      var chart = graphController.getChart();

      function setData (data, series) {
        series.data = data;
      }

      function addRing () {
        var thickness;
        ring = chart.addSeries([$attrs.field], dimple.plot.pie);
        if ($attrs.thickness && !$attrs.diameter) {
          thickness = (100 - $attrs.thickness) + '%';
          ring.innerRadius = thickness;
        } else if ($attrs.thickness && $attrs.diameter) {
          thickness = ($attrs.diameter - $attrs.thickness) + '%';
          ring.innerRadius = thickness;
        } else {
          ring.innerRadius = "50%";
        }

        if ($attrs.diameter) {
          ring.outerRadius = ($attrs.diameter) + '%';
        }
        graphController.filter($attrs);
        graphController.draw();
        var legendExists = graphController.legendExists();
        if(legendExists) graphController.legend($attrs);
      }

      $scope.$watch('data', function(newValue, oldValue) {
        if (newValue) {
          addRing();
        }
      });
    }
  };
}]);

angular.module('angular-dimple.scatter-plot', [])

.directive('scatterPlot', [function () {
  return {
    restrict: 'E',
    replace: true,
    require: ['scatterPlot', '^graph'],
    controller: [function() {}],
    link: function($scope, $element, $attrs, $controllers) {
      var graphController = $controllers[1];
      var chart = graphController.getChart();

      function addScatterPlot () {
        var array = [];

        if ($attrs.series){ array.push($attrs.series); }
        array.push($attrs.field);
        if ($attrs.label || $attrs.label === '') { array.push($attrs.label); }
        scatterPlot = chart.addSeries(array, dimple.plot.bubble);
        scatterPlot.aggregate = dimple.aggregateMethod.avg;
        graphController.filter($attrs);
        graphController.draw();
        var legendExists = graphController.legendExists();
        if(legendExists) graphController.legend($attrs);
      }

      $scope.$watch('dataReady', function(newValue, oldValue) {
        if (newValue === true) {
          addScatterPlot();
        }
      });
    }
  };
}]);

angular.module('angular-dimple.stacked-area', [])

.directive('stackedArea', [function () {
  return {
    restrict: 'E',
    replace: true,
    require: ['stackedArea', '^graph'],
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
    }],
    link: function($scope, $element, $attrs, $controllers) {
      var graphController = $controllers[1];
      var areaController = $controllers[0];
      var chart = graphController.getChart();

      function addArea () {
        if ($attrs.series) {
          area = chart.addSeries([$attrs.series], dimple.plot.area);
        } else {
          area = chart.addSeries([$attrs.field], dimple.plot.area);
        }
        graphController.filter($attrs);
        area.lineMarkers = false;
        graphController.draw();
        var legendExists = graphController.legendExists();
        if(legendExists) graphController.legend($attrs);
      }

      $scope.$watch('dataReady', function(newValue, oldValue) {
        if (newValue === true) {
          addArea();
        }
      });
    }
  };
}]);

angular.module('angular-dimple.stacked-bar', [])

.directive('stackedBar', [function () {
  return {
    restrict: 'E',
    replace: true,
    require: ['stackedBar', '^graph'],
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
    }],
    link: function($scope, $element, $attrs, $controllers) {
      var graphController = $controllers[1];
      var lineController = $controllers[0];
      var chart = graphController.getChart();

      function addBar () {
        if ($attrs.series) {
          bar = chart.addSeries([$attrs.series], dimple.plot.bar);
        } else {
          bar = chart.addSeries([$attrs.field], dimple.plot.bar);
        }
        graphController.filter($attrs);
        graphController.draw();
        var legendExists = graphController.legendExists();
        if(legendExists) graphController.legend($attrs);
      }

      $scope.$watch('dataReady', function(newValue, oldValue) {
        if (newValue === true) {
          addBar();
        }
      });
    }
  };
}]);

angular.module('angular-dimple.x', [])

.directive('x', [function () {
  return {
    restrict: 'E',
    replace: true,
    require: ['x', '^graph'],
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
    }],
    link: function($scope, $element, $attrs, $controllers) {
      var graphController = $controllers[1];
      var chart = graphController.getChart();
      var hide = $attrs.hide ? $attrs.hide.toLowerCase()==='true' : false;

      function addAxis () {
        if ($attrs.groupBy) {
          if ($attrs.type == 'Measure') {
            x = chart.addMeasureAxis('x', [$attrs.groupBy, $attrs.field]);
          } else if ($attrs.type == 'Percent') {
            x = chart.addPctAxis('x', $attrs.field);
          } else if ($attrs.type == 'Time') {
            if($attrs.input){
              x = chart.addTimeAxis('x', $attrs.field, $attrs.input);
            } else {
              x = chart.addTimeAxis('x', $attrs.field);
            }
            if ($attrs.format) {
              x.tickFormat = $attrs.format;
            }
          } else {
            x = chart.addCategoryAxis('x', [$attrs.groupBy, $attrs.field]);
          }
          if ($attrs.orderBy) {
            x.addGroupOrderRule($attrs.orderBy);
          }
        } else {
          if ($attrs.type == 'Measure') {
            x = chart.addMeasureAxis('x', $attrs.field);
          } else if ($attrs.type == 'Percent') {
            x = chart.addPctAxis('x', $attrs.field);
          } else if ($attrs.type == 'Time') {
            if($attrs.input){
              x = chart.addTimeAxis('x', $attrs.field, $attrs.input);
            } else {
              x = chart.addTimeAxis('x', $attrs.field);
            }
            if ($attrs.format) {
              x.tickFormat = $attrs.format;
            }
          } else {
            x = chart.addCategoryAxis('x', $attrs.field);
          }
          if ($attrs.orderBy) {
            x.addOrderRule($attrs.orderBy);
          }
        }

        if(hide) x.hidden = true;

        if ($attrs.title && $attrs.title !== "null") {
          x.title = $attrs.title;
        } else if ($attrs.title == "null") {
          x.title = null;
        }
      }

      $scope.$watch('dataReady', function(newValue, oldValue) {
        if (newValue === true) {
          addAxis();
        }
      });
    }
  };
}]);

angular.module('angular-dimple.y', [])

.directive('y', [function () {
  return {
    restrict: 'E',
    replace: true,
    require: ['y', '^graph'],
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
    }],
    link: function($scope, $element, $attrs, $controllers) {
      var graphController = $controllers[1];
      var chart = graphController.getChart();
      var hide = $attrs.hide ? $attrs.hide.toLowerCase()==='true' : false;

      function addAxis () {
        if ($attrs.groupBy) {
          if ($attrs.type == 'Category') {
            y = chart.addCategoryAxis('y', $attrs.field);
          } else if ($attrs.type == 'Percent') {
            y = chart.addPctAxis('y', $attrs.field);
          } else if ($attrs.type == 'Time') {
            if($attrs.input){
              y = chart.addTimeAxis('y', $attrs.field, $attrs.input);
            } else {
              y = chart.addTimeAxis('y', $attrs.field);
            }
            if ($attrs.format) {
              y.tickFormat = $attrs.format;
            }
          } else {
            y = chart.addMeasureAxis('y', $attrs.field);
          }
          if ($attrs.orderBy) {
            y.addGroupOrderRule($attrs.orderBy);
          }
        } else {
          if ($attrs.type == 'Category') {
            y = chart.addCategoryAxis('y', $attrs.field);
          } else if ($attrs.type == 'Percent') {
            y = chart.addPctAxis('y', $attrs.field);
          } else if ($attrs.type == 'Time') {
            if($attrs.input){
              y = chart.addTimeAxis('y', $attrs.field, $attrs.input);
            } else {
              y = chart.addTimeAxis('y', $attrs.field);
            }
            if ($attrs.format) {
              y.tickFormat = $attrs.format;
            }
          } else {
            y = chart.addMeasureAxis('y', $attrs.field);
          }
          if ($attrs.orderBy) {
            y.addOrderRule($attrs.orderBy);
          }
        }

        if(hide) y.hidden = true;

        if ($attrs.title && $attrs.title !== "null") {
          y.title = $attrs.title;
        } else if ($attrs.title == "null") {
          y.title = null;
        }
      }

      $scope.$watch('dataReady', function(newValue, oldValue) {
        if (newValue === true) {
          addAxis();
        }
      });
    }
  };
}]);
