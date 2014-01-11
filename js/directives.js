var directives = angular.module('LightmineApp.directives', []);

directives.directive('spinner', function () {
  return {
    scope: {
      scopeVar: "=spinner"
    },
    restrict: 'A',
    replace: false,
    template: '<img src="images/spinner.gif" />',
    link: function ($scope, elm, attrs) {
      $scope.$watch("scopeVar", function () {
        if ($scope.scopeVar !== undefined) {
          elm.hide();
        } else {
          elm.show();
        }
      });
    }
  };
});

directives.directive('rmIssue', function () {
  return {
    scope: {
      issue: "=issue"
    },
    restrict: 'E',
    replace: true,
    templateUrl: 'partials/issue/view.html'
  };
});

directives.directive('rmIssueCard', function () {
  return {
    scope: {
      issue: "=issue"
    },
    restrict: 'E',
    replace: true,
    templateUrl: 'partials/issue/view-card.html'
  };
});
