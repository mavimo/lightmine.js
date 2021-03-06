var services = angular.module('LightmineApp.services', ['ngResource']);

services.service('ConfigurationService', function ($http) {
  var _restServiceBase;
  var _apiKey;

  this.getRestServiceBase = function () {
    return _restServiceBase;
  };

  this.setRestServiceBase = function (url) {
    _restServiceBase = url;
  };

  this.getApiKey = function () {
    return _apiKey;
  };

  this.setApiKey = function (apiKey) {
    _apiKey = apiKey;
    $http.defaults.headers.common['X-Redmine-API-Key'] = apiKey;
  };
});


services.service('UserService', function ($http, $q, ConfigurationService) {

  var allUsersPromise;

  this.getCurrent = function () {
    return $http.get(ConfigurationService.getRestServiceBase() + "/users/current.json");
  };

  this.getAllUsers = function () {

    if (angular.isDefined(allUsersPromise)) {
      return allUsersPromise;
    }


    allUsersPromise = $http.get(ConfigurationService.getRestServiceBase() + "/users.json?limit=1000").then(function (response) {
      return response.data.users;
    });

    return allUsersPromise;
  };
});


services.service('ProjectService', function ($http, $q, ConfigurationService) {

  var projectService = this;

  var projectMap;
  var topLevelProjects;
  var allProjects;
  var loadPromise;
  var trackersPromise;

  this.loadProjects = function () {
    if (loadPromise !== undefined) {
      return loadPromise;
    }

    var deferredLoad = $q.defer();

    if (topLevelProjects !== undefined) {
      deferredLoad.resolve(topLevelProjects);
    } else {
      $http.get(ConfigurationService.getRestServiceBase() + "/projects.json?limit=1000").then(function (response) {

        projectMap = {};
        topLevelProjects = [];
        allProjects = response.data.projects;

        var i;
        /* First pass, hash projects */
        for (i = 0; i < response.data.projects.length; i++) {
          projectMap[response.data.projects[i].id] = response.data.projects[i];
        }

        /* Second pass, assign subprojects */
        for (i = 0; i < response.data.projects.length; i++) {
          var project = response.data.projects[i];
          if (project.parent !== undefined) {
            var parent = projectMap[project.parent.id];
            if (parent.children === undefined) {
              parent.children = [];
            }
            parent.children.push(project);
          } else {
            topLevelProjects.push(project);
          }
        }

        deferredLoad.resolve(topLevelProjects);
      });
    }

    loadPromise = deferredLoad.promise;

    return loadPromise;
  };

  this.getTopLevelProjects = function () {

    return projectService.loadProjects().then(function (projects) {
      return topLevelProjects;
    });
  };

  this.get = function (id) {
    return projectService.loadProjects().then(function (projects) {
      return projectMap[id];
    });
  };

  this.getVersions = function (id) {
    return $http.get(ConfigurationService.getRestServiceBase() + "/projects/" + id + "/versions.json").then(function (response) {
      return response.data.versions;
    });
  };

  this.getTrackers = function () {

    if (angular.isDefined(trackersPromise)) {
      return trackersPromise;
    }

    trackersPromise = $http.get(ConfigurationService.getRestServiceBase() + "/trackers.json").then(function (response) {
      return response.data.trackers;
    });

    return trackersPromise;
  };

  //TODO: reload projects after delete
  this['delete'] = function (id) {
    return $http['delete'](ConfigurationService.getRestServiceBase() + "/projects/" + id + ".json");
  };

  this.getAllProjects = function () {

    return projectService.loadProjects().then(function (projects) {
      return allProjects;
    });
  };
});


services.service('IssueService', function ($http, $q, ConfigurationService) {
  var issuesUrl = ConfigurationService.getRestServiceBase() + "/issues";
  var issueStatuses;

  this.find = function (config) {
    return $http.get(issuesUrl + ".json", config).then(function (response) {
      return response.data;
    });
  };

  this.getIssueStatuses = function () {
    var deferred = $q.defer();

    if (issueStatuses !== undefined) {

      deferred.resolve(issueStatuses);

    } else {

      $http.get(ConfigurationService.getRestServiceBase() + "/issue_statuses.json").then(function (response) {
        issueStatuses = response.data.issue_statuses;
        deferred.resolve(issueStatuses);
      });
    }

    return deferred.promise;
  };

  this.getPriorities = function () {
    return $http.get(ConfigurationService.getRestServiceBase() + '/numerations/issue_priorities.json').then(function (response) {
      return response.data.issue_priorities;
    });
  };

  this.getCategoriesByProject = function (projectId) {
    return $http.get(ConfigurationService.getRestServiceBase() + '/projects/' + projectId + '/issue_categories.json').then(function (response) {
      return response.data.issue_categories;
    });
  };

  this.get = function (id) {
    return $http.get(issuesUrl + "/" + id + ".json").then(function (response) {
      return response.data.issue;
    });
  };


  this['delete'] = function (id, submission) {
    return $http['delete'](issuesUrl + "/" + id + ".json", submission).then(function (response) {
    });
  };

  this.update = function (id, submission) {
    return $http.put(issuesUrl + "/" + id + ".json", submission).then(function (response) {
      return response;
    });
  };

  this.create = function (submission) {
    return $http.post(issuesUrl + ".json", submission).then(function (response) {
      return response.data.issue;
    });
  };
});
