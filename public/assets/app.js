angular.module('app',[
'ngRoute','ui.router'
])
angular.module('app')
    .controller('ErrorCtrl', function($scope, $rootScope) {
        $scope.hello = "this is from the controller hello"
        console.log($scope.hello)



    })

angular.module('app')
    .controller('HomeCtrl', function($scope, $http) {


        $scope.setup = function() {

            $http.get('/api/vehicle')
                .then(function(response) {
                    $scope.model = response.data;

                }, function(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

        }

        $scope.setup();



    })

angular.module('app')
    .controller('LoginCtrl', function($scope, UserSvc, $location) {        
        $scope.login = function(username, password) {
            UserSvc.login(username, password)
                .then(function(response) {
                    console.log("printing response")
                    console.log(response.data)
                    $scope.$emit('login', response.data)
                    $location.path('/home')

                })
        }
    })

angular.module('app')
    .controller('masterCtrl', function($scope, $rootScope, $route) {
        console.log("masterCtrl");


        $scope.$on('login', function(_, user) {
            console.log("Logged In");
            $scope.currentUser = user
            $rootScope.currentUser = user            
            localStorage.setItem('logged_user', $rootScope.currentUser.username)
        })
    })

angular.module('app')
.controller('PostsCtrl',function($scope,PostsSvc){ 
  PostsSvc.fetch()
 	.success(function (posts){
 		$scope.posts = posts

 	})
	
 	 $scope.addPost = function () {
          if ($scope.postBody) {
            PostsSvc.create({
              /*username: 'vishalRanjan',*/
              body:     $scope.postBody              
            }).success(function (post) {
              //$scope.posts.unshift(post)
              $scope.postBody = null
            })
          }
        }

    $scope.$on('ws:new_post',function(_,post){
    $scope.$apply(function(){
      $scope.posts.unshift(post)
    })
  })
 
})

 
angular.module('app')
.service('PostsSvc', function($http){
   this.fetch = function () {   	
     return $http.get('/api/posts')
   }
   this.create = function (post){
   	
      return $http.post('/api/posts',post)
   }
 })
angular.module('app')
.controller('RegisterCtrl',function($scope,UserSvc ,$location){
	$scope.register = function(name,username,password){
		UserSvc.register(name,username,password)
		.then(function(response){			
			$scope.$emit('login',response.data)
			$location.path('/home')
		})
		.catch(function (err){
			console.log(err)
		})
	}

})

angular.module('app')
.config(function($stateProvider, $urlRouterProvider){
 
    $urlRouterProvider.otherwise('/');
 
    $stateProvider
    .state('app',{
        url: '/',
        views: {
            'header': {
                templateUrl: '/nav.html'
            },
            'content': {
                templateUrl: '/login.html' ,
                controller: 'LoginCtrl'
            }
        }
    })

    .state('app.login',{
        url: '/login',
        views: {
            'header': {
                templateUrl: '/nav.html'
            },
            'content': {
                templateUrl: '/login.html',
                controller: 'LoginCtrl'

            }
        }
    })
 
    .state('app.register', {
        url: 'register',
        views: {
            'content@': {
                templateUrl: 'register.html',
                controller: 'RegisterCtrl'
            }
        }
 
    })
 
    .state('app.home', {
        url: 'home',
        views: {
            'content@': {
                templateUrl: 'users/home.html',
                controller: 'HomeCtrl'
            }
        }
 
    })

     .state('app.home.vehicles', {
        url: '/vehicles/new',
        views: {
            'content@': {
                templateUrl: 'vehicles/newVehicle.html',
                controller: 'VehiclesNewInfoCtrl'
            }
        }
 
    })

     .state('app.home.details', {
        url: '/vehicles/:id',        
 
        views: {
            'content@': {
                templateUrl: 'vehicles/editVehicle.html',
                controller: 'VehiclesEditInfoCtrl'        
            }
        }
 
    })

     .state('app.home.map', {
        url: '/vehicles/map/:id',        
 
        views: {
            'content@': {
                templateUrl: 'vehicles/mapVehicle.html',
                controller: 'VehiclesEditMapCtrl'        
            }
        }
 
    })


    
 
    
 
});

/*.config(function($routeProvider,$locationProvider) {
	$routeProvider
	.when('/',{controller:'LoginCtrl',templateUrl:'login.html'})	
	.when('/posts',{controller:'PostsCtrl',templateUrl:'posts.html'})
	.when('/register',{controller:'RegisterCtrl',templateUrl:'register.html'})
	.when('/home',{controller:'HomeCtrl',templateUrl:'users/home.html'})	
	.when('/vehicles/new/info',{controller:'VehiclesNewInfoCtrl',templateUrl:'vehicles/new/info.html'})	
	.when('/vehicles/edit/:deviceId/info',{controller:'VehiclesEditInfoCtrl',templateUrl:'vehicles/edit/info.html'})	
	.when('/vehicles/edit/:deviceId/map',{controller:'VehiclesEditMapCtrl',templateUrl:'vehicles/edit/map.html'})	
	.when('/401',{controller:'ErrorCtrl',templateUrl:'errors/401.html'})	

	$locationProvider.html5Mode(true)
	
})*/

angular.module('app')
.service('segment', function($http,$window,$location){
  
     return {
        getData: function($q, $http) {
            console.log("here");
            return 2
        }
    };

})
angular.module('app')
.service('UserSvc', function($http,$window,$location){
	var svc = this
	svc.getUser= function(){
		return $http.get('api/users')
	}

	svc.login = function(username,password){
	 return $http.post('api/sessions',{
			username : username, password : password
		}).then(function(val){			
			svc.token = val.data
			$window.sessionStorage["user_token"] = JSON.stringify(svc.token)
			$http.defaults.headers.common['x-auth'] = val.data
			return svc.getUser()
		}).catch(function(response) {
  			console.error('Gists error', response.status, response.data);
  			$location.path('/401')
		})
		.finally(function() {
		  console.log("finally finished gists");
		});	
	}


	svc.register = function (name,username,password){
		return $http.post('api/users',{
			name : name, username : username, password : password
		}).then(function(val){			
			//return val;			
			return svc.login(username,password) 

		})
	}

})
angular.module('app')
.controller('VehiclesEditInfoCtrl',function($scope,$http,$location,$stateParams){ 
 

$scope.setup = function(){
	console.log($stateParams)
	$http.get('/api/vehicle/'+$stateParams.id)
	.then(function(response) {
	    $scope.model = response.data;
	    console.log($scope.model)

	  }, function(response) {
	    console.log(response)
	  });
	
}

$scope.setup();
 
 
 
})

 
angular.module('app')
.controller('VehiclesEditMapCtrl',function($scope,$http,$location,$stateParams){ 
 
	$scope.markOnMap = function(lat,long){
		console.log(long)	 	
		$scope.myCenter = new google.maps.LatLng(lat, long);
	 	$scope.mapOptions = {
	 		center:new google.maps.LatLng(lat, long),
			  zoom:10,
			  mapTypeId:google.maps.MapTypeId.ROADMAP
    		  
		}

		$scope.map = new google.maps.Map(document.getElementById('googleMap'), $scope.mapOptions);


			$scope,marker=new google.maps.Marker({
			  position:$scope.myCenter
			  });

			marker.setMap($scope.map);
			}

			

 
	 $scope.setup = function(){	 		 	
	 	console.log($stateParams.id);
	 	$http.get('/api/vehicle/location/'+$stateParams.id)
	 	.then(function(response) {
	   		console.log(response.data)
	   		$scope.model = response.data
	   		$scope.markOnMap(response.data.latitude,response.data.longitude);
	   		

		  }, function(response) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		  });

	 }

	 $scope.setup();
 
	 

 
})

 
angular.module('app')
.controller('VehiclesNewInfoCtrl',function($scope,$http,$location){ 
 

$scope.saveVehicleDetails = function(){
	console.log("in controller 2")
	console.log($scope.dev_id + $scope.v_number)
	 

	$http.post('/api/vehicle',{
		dev_id: $scope.dev_id,
        v_number: $scope.v_number,
        driver_name : $scope.driver_name,
        sos_number : $scope.sos_number                       
	})
	.then(function(response) {
	    console.log(response)
	    $location.path('/home')

	  }, function(response) {
	    console.log(response)
	  });
	
}
 
 
 
})

 
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImVycm9yLmN0cmwuanMiLCJob21lLmN0cmwuanMiLCJsb2dpbi5jdHJsLmpzIiwibWFzdGVyQ3RybC5qcyIsInBvc3RzLmN0cmwuanMiLCJwb3N0cy5zdmMuanMiLCJyZWdpc3Rlci5jdHJsLmpzIiwicm91dGVzLmpzIiwicm91dGVTZWdtZW50LmpzIiwidXNlci5zdmMuanMiLCJ2ZWhpY2xlcy9lZGl0L2luZm8uanMiLCJ2ZWhpY2xlcy9lZGl0L21hcC5qcyIsInZlaGljbGVzL25ldy9pbmZvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdhcHAnLFtcclxuJ25nUm91dGUnLCd1aS5yb3V0ZXInXHJcbl0pIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXHJcbiAgICAuY29udHJvbGxlcignRXJyb3JDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlKSB7XHJcbiAgICAgICAgJHNjb3BlLmhlbGxvID0gXCJ0aGlzIGlzIGZyb20gdGhlIGNvbnRyb2xsZXIgaGVsbG9cIlxyXG4gICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5oZWxsbylcclxuXHJcblxyXG5cclxuICAgIH0pXHJcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0hvbWVDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCkge1xyXG5cclxuXHJcbiAgICAgICAgJHNjb3BlLnNldHVwID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAkaHR0cC5nZXQoJy9hcGkvdmVoaWNsZScpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5tb2RlbCA9IHJlc3BvbnNlLmRhdGE7XHJcblxyXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjYWxsZWQgYXN5bmNocm9ub3VzbHkgaWYgYW4gZXJyb3Igb2NjdXJzXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gb3Igc2VydmVyIHJldHVybnMgcmVzcG9uc2Ugd2l0aCBhbiBlcnJvciBzdGF0dXMuXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuc2V0dXAoKTtcclxuXHJcblxyXG5cclxuICAgIH0pXHJcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgVXNlclN2YywgJGxvY2F0aW9uKSB7ICAgICAgICBcclxuICAgICAgICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbih1c2VybmFtZSwgcGFzc3dvcmQpIHtcclxuICAgICAgICAgICAgVXNlclN2Yy5sb2dpbih1c2VybmFtZSwgcGFzc3dvcmQpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicHJpbnRpbmcgcmVzcG9uc2VcIilcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhKVxyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kZW1pdCgnbG9naW4nLCByZXNwb25zZS5kYXRhKVxyXG4gICAgICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvaG9tZScpXHJcblxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcclxuICAgIC5jb250cm9sbGVyKCdtYXN0ZXJDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkcm91dGUpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIm1hc3RlckN0cmxcIik7XHJcblxyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdsb2dpbicsIGZ1bmN0aW9uKF8sIHVzZXIpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJMb2dnZWQgSW5cIik7XHJcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50VXNlciA9IHVzZXJcclxuICAgICAgICAgICAgJHJvb3RTY29wZS5jdXJyZW50VXNlciA9IHVzZXIgICAgICAgICAgICBcclxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xvZ2dlZF91c2VyJywgJHJvb3RTY29wZS5jdXJyZW50VXNlci51c2VybmFtZSlcclxuICAgICAgICB9KVxyXG4gICAgfSlcclxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXHJcbi5jb250cm9sbGVyKCdQb3N0c0N0cmwnLGZ1bmN0aW9uKCRzY29wZSxQb3N0c1N2Yyl7IFxyXG4gIFBvc3RzU3ZjLmZldGNoKClcclxuIFx0LnN1Y2Nlc3MoZnVuY3Rpb24gKHBvc3RzKXtcclxuIFx0XHQkc2NvcGUucG9zdHMgPSBwb3N0c1xyXG5cclxuIFx0fSlcclxuXHRcclxuIFx0ICRzY29wZS5hZGRQb3N0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgaWYgKCRzY29wZS5wb3N0Qm9keSkge1xyXG4gICAgICAgICAgICBQb3N0c1N2Yy5jcmVhdGUoe1xyXG4gICAgICAgICAgICAgIC8qdXNlcm5hbWU6ICd2aXNoYWxSYW5qYW4nLCovXHJcbiAgICAgICAgICAgICAgYm9keTogICAgICRzY29wZS5wb3N0Qm9keSAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24gKHBvc3QpIHtcclxuICAgICAgICAgICAgICAvLyRzY29wZS5wb3N0cy51bnNoaWZ0KHBvc3QpXHJcbiAgICAgICAgICAgICAgJHNjb3BlLnBvc3RCb2R5ID0gbnVsbFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAkc2NvcGUuJG9uKCd3czpuZXdfcG9zdCcsZnVuY3Rpb24oXyxwb3N0KXtcclxuICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKXtcclxuICAgICAgJHNjb3BlLnBvc3RzLnVuc2hpZnQocG9zdClcclxuICAgIH0pXHJcbiAgfSlcclxuIFxyXG59KVxyXG5cclxuICIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxyXG4uc2VydmljZSgnUG9zdHNTdmMnLCBmdW5jdGlvbigkaHR0cCl7XHJcbiAgIHRoaXMuZmV0Y2ggPSBmdW5jdGlvbiAoKSB7ICAgXHRcclxuICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3Bvc3RzJylcclxuICAgfVxyXG4gICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uIChwb3N0KXtcclxuICAgXHRcclxuICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvcG9zdHMnLHBvc3QpXHJcbiAgIH1cclxuIH0pIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXHJcbi5jb250cm9sbGVyKCdSZWdpc3RlckN0cmwnLGZ1bmN0aW9uKCRzY29wZSxVc2VyU3ZjICwkbG9jYXRpb24pe1xyXG5cdCRzY29wZS5yZWdpc3RlciA9IGZ1bmN0aW9uKG5hbWUsdXNlcm5hbWUscGFzc3dvcmQpe1xyXG5cdFx0VXNlclN2Yy5yZWdpc3RlcihuYW1lLHVzZXJuYW1lLHBhc3N3b3JkKVxyXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1x0XHRcdFxyXG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvZ2luJyxyZXNwb25zZS5kYXRhKVxyXG5cdFx0XHQkbG9jYXRpb24ucGF0aCgnL2hvbWUnKVxyXG5cdFx0fSlcclxuXHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyKXtcclxuXHRcdFx0Y29uc29sZS5sb2coZXJyKVxyXG5cdFx0fSlcclxuXHR9XHJcblxyXG59KVxyXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcclxuLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKXtcclxuIFxyXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xyXG4gXHJcbiAgICAkc3RhdGVQcm92aWRlclxyXG4gICAgLnN0YXRlKCdhcHAnLHtcclxuICAgICAgICB1cmw6ICcvJyxcclxuICAgICAgICB2aWV3czoge1xyXG4gICAgICAgICAgICAnaGVhZGVyJzoge1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbmF2Lmh0bWwnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdjb250ZW50Jzoge1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbG9naW4uaHRtbCcgLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgLnN0YXRlKCdhcHAubG9naW4nLHtcclxuICAgICAgICB1cmw6ICcvbG9naW4nLFxyXG4gICAgICAgIHZpZXdzOiB7XHJcbiAgICAgICAgICAgICdoZWFkZXInOiB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9uYXYuaHRtbCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ2NvbnRlbnQnOiB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9sb2dpbi5odG1sJyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnXHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuIFxyXG4gICAgLnN0YXRlKCdhcHAucmVnaXN0ZXInLCB7XHJcbiAgICAgICAgdXJsOiAncmVnaXN0ZXInLFxyXG4gICAgICAgIHZpZXdzOiB7XHJcbiAgICAgICAgICAgICdjb250ZW50QCc6IHtcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncmVnaXN0ZXIuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnUmVnaXN0ZXJDdHJsJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gXHJcbiAgICB9KVxyXG4gXHJcbiAgICAuc3RhdGUoJ2FwcC5ob21lJywge1xyXG4gICAgICAgIHVybDogJ2hvbWUnLFxyXG4gICAgICAgIHZpZXdzOiB7XHJcbiAgICAgICAgICAgICdjb250ZW50QCc6IHtcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndXNlcnMvaG9tZS5odG1sJyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ3RybCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuIFxyXG4gICAgfSlcclxuXHJcbiAgICAgLnN0YXRlKCdhcHAuaG9tZS52ZWhpY2xlcycsIHtcclxuICAgICAgICB1cmw6ICcvdmVoaWNsZXMvbmV3JyxcclxuICAgICAgICB2aWV3czoge1xyXG4gICAgICAgICAgICAnY29udGVudEAnOiB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3ZlaGljbGVzL25ld1ZlaGljbGUuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnVmVoaWNsZXNOZXdJbmZvQ3RybCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuIFxyXG4gICAgfSlcclxuXHJcbiAgICAgLnN0YXRlKCdhcHAuaG9tZS5kZXRhaWxzJywge1xyXG4gICAgICAgIHVybDogJy92ZWhpY2xlcy86aWQnLCAgICAgICAgXHJcbiBcclxuICAgICAgICB2aWV3czoge1xyXG4gICAgICAgICAgICAnY29udGVudEAnOiB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3ZlaGljbGVzL2VkaXRWZWhpY2xlLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1ZlaGljbGVzRWRpdEluZm9DdHJsJyAgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiBcclxuICAgIH0pXHJcblxyXG4gICAgIC5zdGF0ZSgnYXBwLmhvbWUubWFwJywge1xyXG4gICAgICAgIHVybDogJy92ZWhpY2xlcy9tYXAvOmlkJywgICAgICAgIFxyXG4gXHJcbiAgICAgICAgdmlld3M6IHtcclxuICAgICAgICAgICAgJ2NvbnRlbnRAJzoge1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd2ZWhpY2xlcy9tYXBWZWhpY2xlLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1ZlaGljbGVzRWRpdE1hcEN0cmwnICAgICAgICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuIFxyXG4gICAgfSlcclxuXHJcblxyXG4gICAgXHJcbiBcclxuICAgIFxyXG4gXHJcbn0pO1xyXG5cclxuLyouY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCRsb2NhdGlvblByb3ZpZGVyKSB7XHJcblx0JHJvdXRlUHJvdmlkZXJcclxuXHQud2hlbignLycse2NvbnRyb2xsZXI6J0xvZ2luQ3RybCcsdGVtcGxhdGVVcmw6J2xvZ2luLmh0bWwnfSlcdFxyXG5cdC53aGVuKCcvcG9zdHMnLHtjb250cm9sbGVyOidQb3N0c0N0cmwnLHRlbXBsYXRlVXJsOidwb3N0cy5odG1sJ30pXHJcblx0LndoZW4oJy9yZWdpc3Rlcicse2NvbnRyb2xsZXI6J1JlZ2lzdGVyQ3RybCcsdGVtcGxhdGVVcmw6J3JlZ2lzdGVyLmh0bWwnfSlcclxuXHQud2hlbignL2hvbWUnLHtjb250cm9sbGVyOidIb21lQ3RybCcsdGVtcGxhdGVVcmw6J3VzZXJzL2hvbWUuaHRtbCd9KVx0XHJcblx0LndoZW4oJy92ZWhpY2xlcy9uZXcvaW5mbycse2NvbnRyb2xsZXI6J1ZlaGljbGVzTmV3SW5mb0N0cmwnLHRlbXBsYXRlVXJsOid2ZWhpY2xlcy9uZXcvaW5mby5odG1sJ30pXHRcclxuXHQud2hlbignL3ZlaGljbGVzL2VkaXQvOmRldmljZUlkL2luZm8nLHtjb250cm9sbGVyOidWZWhpY2xlc0VkaXRJbmZvQ3RybCcsdGVtcGxhdGVVcmw6J3ZlaGljbGVzL2VkaXQvaW5mby5odG1sJ30pXHRcclxuXHQud2hlbignL3ZlaGljbGVzL2VkaXQvOmRldmljZUlkL21hcCcse2NvbnRyb2xsZXI6J1ZlaGljbGVzRWRpdE1hcEN0cmwnLHRlbXBsYXRlVXJsOid2ZWhpY2xlcy9lZGl0L21hcC5odG1sJ30pXHRcclxuXHQud2hlbignLzQwMScse2NvbnRyb2xsZXI6J0Vycm9yQ3RybCcsdGVtcGxhdGVVcmw6J2Vycm9ycy80MDEuaHRtbCd9KVx0XHJcblxyXG5cdCRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKVxyXG5cdFxyXG59KSovXHJcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxyXG4uc2VydmljZSgnc2VnbWVudCcsIGZ1bmN0aW9uKCRodHRwLCR3aW5kb3csJGxvY2F0aW9uKXtcclxuICBcclxuICAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldERhdGE6IGZ1bmN0aW9uKCRxLCAkaHR0cCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImhlcmVcIik7XHJcbiAgICAgICAgICAgIHJldHVybiAyXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbn0pIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXHJcbi5zZXJ2aWNlKCdVc2VyU3ZjJywgZnVuY3Rpb24oJGh0dHAsJHdpbmRvdywkbG9jYXRpb24pe1xyXG5cdHZhciBzdmMgPSB0aGlzXHJcblx0c3ZjLmdldFVzZXI9IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCdhcGkvdXNlcnMnKVxyXG5cdH1cclxuXHJcblx0c3ZjLmxvZ2luID0gZnVuY3Rpb24odXNlcm5hbWUscGFzc3dvcmQpe1xyXG5cdCByZXR1cm4gJGh0dHAucG9zdCgnYXBpL3Nlc3Npb25zJyx7XHJcblx0XHRcdHVzZXJuYW1lIDogdXNlcm5hbWUsIHBhc3N3b3JkIDogcGFzc3dvcmRcclxuXHRcdH0pLnRoZW4oZnVuY3Rpb24odmFsKXtcdFx0XHRcclxuXHRcdFx0c3ZjLnRva2VuID0gdmFsLmRhdGFcclxuXHRcdFx0JHdpbmRvdy5zZXNzaW9uU3RvcmFnZVtcInVzZXJfdG9rZW5cIl0gPSBKU09OLnN0cmluZ2lmeShzdmMudG9rZW4pXHJcblx0XHRcdCRodHRwLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWyd4LWF1dGgnXSA9IHZhbC5kYXRhXHJcblx0XHRcdHJldHVybiBzdmMuZ2V0VXNlcigpXHJcblx0XHR9KS5jYXRjaChmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gIFx0XHRcdGNvbnNvbGUuZXJyb3IoJ0dpc3RzIGVycm9yJywgcmVzcG9uc2Uuc3RhdHVzLCByZXNwb25zZS5kYXRhKTtcclxuICBcdFx0XHQkbG9jYXRpb24ucGF0aCgnLzQwMScpXHJcblx0XHR9KVxyXG5cdFx0LmZpbmFsbHkoZnVuY3Rpb24oKSB7XHJcblx0XHQgIGNvbnNvbGUubG9nKFwiZmluYWxseSBmaW5pc2hlZCBnaXN0c1wiKTtcclxuXHRcdH0pO1x0XHJcblx0fVxyXG5cclxuXHJcblx0c3ZjLnJlZ2lzdGVyID0gZnVuY3Rpb24gKG5hbWUsdXNlcm5hbWUscGFzc3dvcmQpe1xyXG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJ2FwaS91c2Vycycse1xyXG5cdFx0XHRuYW1lIDogbmFtZSwgdXNlcm5hbWUgOiB1c2VybmFtZSwgcGFzc3dvcmQgOiBwYXNzd29yZFxyXG5cdFx0fSkudGhlbihmdW5jdGlvbih2YWwpe1x0XHRcdFxyXG5cdFx0XHQvL3JldHVybiB2YWw7XHRcdFx0XHJcblx0XHRcdHJldHVybiBzdmMubG9naW4odXNlcm5hbWUscGFzc3dvcmQpIFxyXG5cclxuXHRcdH0pXHJcblx0fVxyXG5cclxufSkiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcclxuLmNvbnRyb2xsZXIoJ1ZlaGljbGVzRWRpdEluZm9DdHJsJyxmdW5jdGlvbigkc2NvcGUsJGh0dHAsJGxvY2F0aW9uLCRzdGF0ZVBhcmFtcyl7IFxyXG4gXHJcblxyXG4kc2NvcGUuc2V0dXAgPSBmdW5jdGlvbigpe1xyXG5cdGNvbnNvbGUubG9nKCRzdGF0ZVBhcmFtcylcclxuXHQkaHR0cC5nZXQoJy9hcGkvdmVoaWNsZS8nKyRzdGF0ZVBhcmFtcy5pZClcclxuXHQudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdCAgICAkc2NvcGUubW9kZWwgPSByZXNwb25zZS5kYXRhO1xyXG5cdCAgICBjb25zb2xlLmxvZygkc2NvcGUubW9kZWwpXHJcblxyXG5cdCAgfSwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuXHQgICAgY29uc29sZS5sb2cocmVzcG9uc2UpXHJcblx0ICB9KTtcclxuXHRcclxufVxyXG5cclxuJHNjb3BlLnNldHVwKCk7XHJcbiBcclxuIFxyXG4gXHJcbn0pXHJcblxyXG4gIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXHJcbi5jb250cm9sbGVyKCdWZWhpY2xlc0VkaXRNYXBDdHJsJyxmdW5jdGlvbigkc2NvcGUsJGh0dHAsJGxvY2F0aW9uLCRzdGF0ZVBhcmFtcyl7IFxyXG4gXHJcblx0JHNjb3BlLm1hcmtPbk1hcCA9IGZ1bmN0aW9uKGxhdCxsb25nKXtcclxuXHRcdGNvbnNvbGUubG9nKGxvbmcpXHQgXHRcclxuXHRcdCRzY29wZS5teUNlbnRlciA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobGF0LCBsb25nKTtcclxuXHQgXHQkc2NvcGUubWFwT3B0aW9ucyA9IHtcclxuXHQgXHRcdGNlbnRlcjpuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGxhdCwgbG9uZyksXHJcblx0XHRcdCAgem9vbToxMCxcclxuXHRcdFx0ICBtYXBUeXBlSWQ6Z29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVBcclxuICAgIFx0XHQgIFxyXG5cdFx0fVxyXG5cclxuXHRcdCRzY29wZS5tYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnb29nbGVNYXAnKSwgJHNjb3BlLm1hcE9wdGlvbnMpO1xyXG5cclxuXHJcblx0XHRcdCRzY29wZSxtYXJrZXI9bmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcblx0XHRcdCAgcG9zaXRpb246JHNjb3BlLm15Q2VudGVyXHJcblx0XHRcdCAgfSk7XHJcblxyXG5cdFx0XHRtYXJrZXIuc2V0TWFwKCRzY29wZS5tYXApO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRcclxuXHJcbiBcclxuXHQgJHNjb3BlLnNldHVwID0gZnVuY3Rpb24oKXtcdCBcdFx0IFx0XHJcblx0IFx0Y29uc29sZS5sb2coJHN0YXRlUGFyYW1zLmlkKTtcclxuXHQgXHQkaHR0cC5nZXQoJy9hcGkvdmVoaWNsZS9sb2NhdGlvbi8nKyRzdGF0ZVBhcmFtcy5pZClcclxuXHQgXHQudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdCAgIFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhKVxyXG5cdCAgIFx0XHQkc2NvcGUubW9kZWwgPSByZXNwb25zZS5kYXRhXHJcblx0ICAgXHRcdCRzY29wZS5tYXJrT25NYXAocmVzcG9uc2UuZGF0YS5sYXRpdHVkZSxyZXNwb25zZS5kYXRhLmxvbmdpdHVkZSk7XHJcblx0ICAgXHRcdFxyXG5cclxuXHRcdCAgfSwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuXHRcdCAgICAvLyBjYWxsZWQgYXN5bmNocm9ub3VzbHkgaWYgYW4gZXJyb3Igb2NjdXJzXHJcblx0XHQgICAgLy8gb3Igc2VydmVyIHJldHVybnMgcmVzcG9uc2Ugd2l0aCBhbiBlcnJvciBzdGF0dXMuXHJcblx0XHQgIH0pO1xyXG5cclxuXHQgfVxyXG5cclxuXHQgJHNjb3BlLnNldHVwKCk7XHJcbiBcclxuXHQgXHJcblxyXG4gXHJcbn0pXHJcblxyXG4gIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXHJcbi5jb250cm9sbGVyKCdWZWhpY2xlc05ld0luZm9DdHJsJyxmdW5jdGlvbigkc2NvcGUsJGh0dHAsJGxvY2F0aW9uKXsgXHJcbiBcclxuXHJcbiRzY29wZS5zYXZlVmVoaWNsZURldGFpbHMgPSBmdW5jdGlvbigpe1xyXG5cdGNvbnNvbGUubG9nKFwiaW4gY29udHJvbGxlciAyXCIpXHJcblx0Y29uc29sZS5sb2coJHNjb3BlLmRldl9pZCArICRzY29wZS52X251bWJlcilcclxuXHQgXHJcblxyXG5cdCRodHRwLnBvc3QoJy9hcGkvdmVoaWNsZScse1xyXG5cdFx0ZGV2X2lkOiAkc2NvcGUuZGV2X2lkLFxyXG4gICAgICAgIHZfbnVtYmVyOiAkc2NvcGUudl9udW1iZXIsXHJcbiAgICAgICAgZHJpdmVyX25hbWUgOiAkc2NvcGUuZHJpdmVyX25hbWUsXHJcbiAgICAgICAgc29zX251bWJlciA6ICRzY29wZS5zb3NfbnVtYmVyICAgICAgICAgICAgICAgICAgICAgICBcclxuXHR9KVxyXG5cdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0ICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKVxyXG5cdCAgICAkbG9jYXRpb24ucGF0aCgnL2hvbWUnKVxyXG5cclxuXHQgIH0sIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0ICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKVxyXG5cdCAgfSk7XHJcblx0XHJcbn1cclxuIFxyXG4gXHJcbiBcclxufSlcclxuXHJcbiAiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=