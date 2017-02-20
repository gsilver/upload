var myApp = angular.module('myApp', []);

myApp.directive('fileModel', ['$parse', function($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function() {
        scope.$apply(function() {
          modelSetter(scope, element[0].files[0]);
        });
      });



    }
  };
}]);

myApp.service('fileUpload', ['$http', function($http) {
  this.uploadFileAndFieldsToUrl = function(file, fields, uploadUrl) {
    var fd = new FormData();
    fd.append('file', file);
    angular.forEach(fields, function(value, key) {
      fd.append(key, value);
    });

    $http.post(uploadUrl, fd, {
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      })
      .success(function() {})
      .error(function() {
        console.log(' nada!');
      });
  };
}]);

myApp.controller('myCtrl', ['$scope', 'fileUpload', '$timeout', function($scope, fileUpload, $timeout) {

  $scope.$watch('users_in_sections', function(newFileObj) {
    if (newFileObj) {

      var reader = new FileReader();
      reader.readAsText(newFileObj);


      reader.onload = function(e) {
        var CSVPreview = function() {
          $scope.content = parseCSV(reader.result);
          $scope.headers = ['User Id', 'Role', 'Section', 'Status']
        };
        $timeout(CSVPreview, 100);
      };

      $scope.filename = newFileObj.name;
    }
  });

  $scope.uploadForm = function() {
    var file = $scope.users_in_sections;
    var uploadUrl = "/formUpload";
    var fields = {
      "name": "filename",
      "user": "gsilver",
      "request": "users_to_sections",
      "account": 12,
      "data": $scope.filename
    };
    fileUpload.uploadFileAndFieldsToUrl(file, fields, uploadUrl);
  };


  parseCSV = function(CSVdata) {
      var lines=CSVdata.split("\n");
      var result = [];

      for(var i=1;i<lines.length;i++){
    	  var obj = {};
    	  var currentline=lines[i].split(",");
    	  result.push(currentline);
      }
      return result;
  };

}]);
