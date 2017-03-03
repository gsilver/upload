var myApp = angular.module('myApp', ['ngAnimate']);

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
        alert('Sorry, I can\'t do this Dave');
      });
  };
}]);

myApp.controller('myCtrl', ['$scope', '$rootScope','fileUpload', '$timeout', '$log', function($scope, $rootScope, fileUpload, $timeout, $log) {
  $scope.fields = [{
    'name': 'user_id',
    'validation': {
      'spaces': false,
      'chars': 'num',
      'max': 8,
      'min': 8
    }
  }, {
    'name': 'section_id',
    'validation': {
      'spaces': false,
      'chars': 'num',
      'max': 30,
      'min': 30
    }
  }, {
    'name': 'user_status',
    'validation': {
      'spaces': false,
      'chars': 'alpha',
      'choices': ['active','passive'],
      'max': 20000,
      'min': 1
    }
  }, {
    'name': 'section_name',
    'validation': {
      'spaces': true,
      'chars': 'alpha',
      'max': 30,
      'min': 10
    }
  }, {
    'name': 'group_name',
    'validation': {
      'spaces': true,
      'chars': 'alpha',
      'max': 30,
      'min': 5
    }
  }, {
    'name': 'section_id',
    'validation': {
      'spaces': false,
      'chars': 'num',
      'max': 10,
      'min': 10
    },
  }, {
    'name': 'group_id',
    'validation': {
      'spaces': false,
      'chars': 'alpha',
      'max': 30,
      'min': 2
    }
  }, {
    'name': 'section_status',
    'validation': {
      'spaces': false,
      'chars': 'alpha',
      'choices': ['choice1', 'choice2'],
      'max': 2000,
      'min': 1
    }
  }, {
    'name': 'group_status',
    'validation': {
      'spaces': false,
      'chars': 'alpha',
      'choices': ['accepted', 'deleted'],
      'max': 2000,
      'min': 1
    }
  }, {
    'name': 'user_uniqname',
    'validation': {
      'spaces': false,
      'chars': 'alpha',
      'max': 10,
      'min': 10
    }
  }, {
    'name': 'user_role',
    'validation': {
      'spaces': false,
      'chars': 'alpha',
      'choices': ['student', 'instructor'],
      'max': 2000,
      'min': 1
    }
  }, ];

  $scope.$watch('selectedFunction', function() {
    if($scope.selectedFunction){
      var fields = $scope.selectedFunction.fields;
      var new_fields=[];
      var curValidation =[];
      var obj={};
      _.each(fields,function(field, index){
        var val = _.findWhere($scope.fields, {'name': field}).validation;
        new_fields.push({'name':field,'validation':val});
        val.name = field;
        curValidation.push(val);
      });
      $scope.selectedFunction.tabular_fields = new_fields;
      $scope.curValidation= curValidation;
    }
  });
  $scope.changeSelectedFunction = function(){
    $rootScope.selectedFunction = value;
  };
  $scope.functions = [{
    name: 'Add multiple users to Canvas sections through CSV',
    id: 'users_in_sections',
    type: 'csv',
    fields: ['user_id', 'user_role', 'section_id', 'user_status'],
    fields_model : ['User ID', 'Role', 'Section Id', 'User Status']

  }, {
    name: 'Add multiple new sections to Canvas sections through CSV',
    id: 'sections_to_canvas',
    type: 'csv',
    fields: ['section_name'],
    fields_model: ['Section Name']
  }, {
    name: 'Add multiple new groups to Canvas sections through CSV',
    id: 'groups_to_sections',
    type: 'csv',
    fields: ['group_name'],
    fields_model: ['Group Name']
  }, {
    name: 'Add multiple users to Canvas groups through CSV',
    id: 'users_to_groups',
    type: 'csv',
    fields: ['user_id', 'group_id', 'group_status'],
    fields_model: ['User Id', 'Group Id', 'Status']
  }, {
    name: 'Add multiple users to Canvas sections through data grid',
    id: 'users_to_sections_grid',
    type: 'grid',
    fields: ['section_name', 'user_uniqname', 'user_role'],
  }, {
    name: 'Add multiple users to Canvas groups through data grid',
    id: 'users_to-groups_grid',
    type: 'grid',
    fields: ['group_name', 'user_uniqname']
  }, {
    name: 'Add course rosters to multiple Canvas sites',
    id: 'rosters',
    type: 'csv',
    fields: ['notsure', 'dontknow', 'whoknows']
  }];

  $scope.content = false;
  $scope.gridRowNumber = 25;
  $scope.getNumber = function(num) {
      return new Array(num);
  };

  $scope.$watch('csvfile', function(newFileObj) {
    if (newFileObj) {
      $scope.content = false;
      $scope.loading = true;
      var reader = new FileReader();
      reader.readAsText(newFileObj);
      reader.onload = function(e) {
        var CSVPreview = function() {
          $scope.headers = $scope.selectedFunction.fields;
          $scope.content = parseCSV(reader.result, $scope.headers, $scope.headers.length);
        };
        $timeout(CSVPreview, 100);
      };
      $scope.filename = newFileObj.name;
    }
  });

$scope.changeSelectedFunction = function(){
  $scope.content =[];
};


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

  parseCSV = function(CSVdata, headers, colCount) {
    var lines = CSVdata.split("\n");
    var result = [];
    $scope.errors = [];
    for (var i = 0; i < lines.length; i++) {
      var lineArray = lines[i].split(',');
      var obj = {};
      obj.data=[];
      var number_pattern = /^\d+$/;
      _.each(headers, function(header, index){
        var validation = _.findWhere($scope.fields, {name: header}).validation;
        if(lineArray[index]){
          if(lineArray[index].split(' ').length !== 1 && !validation.spaces){
            $log.warn(lineArray[index]  + ' has spaces');
            obj.invalid = true;
          }
          if(lineArray[index].length > validation.max) {
            $log.warn(lineArray[index] + ' too many chars');
            obj.invalid = true;
          }
          if(lineArray[index].length < validation.min) {
            $log.warn(lineArray[index] + ' too few chars');
            obj.invalid = true;
          }
          if(!number_pattern.test(lineArray[index]) && validation.chars ==='num') {
            $log.warn(lineArray[index] + ' not a number');
            obj.invalid = true;
          }
          if(validation.choices){
            if(_.indexOf(validation.choices, lineArray[index]) ===-1){
              $log.warn(lineArray[index] + ' is not one of the choices in ' + validation.choices);
              obj.invalid = true;
            }
          }
        }
        obj.data.push(lineArray[index]);
      });
      if (lineArray.length !== colCount && lineArray !==['']) {
        obj.invalid = true;
      }

      if(lineArray.length === 1 &&    lineArray[0]===''){

      }
      else {
        result.push(obj);
      }
    }
    if (_.where(result, {
        invalid: true
      }).length) {
      $scope.errors = _.where(result, {
        invalid: true
      });
    }
    $scope.loading = false;
    return result;
  };

}]);
