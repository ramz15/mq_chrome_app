var marqueedApp = angular.module('marqueedApp', []);

marqueedApp.controller('MarqueedController', ['$scope', MarqueedController]);

function MarqueedController($scope) {

  $scope.userToken = {};

  $scope.userInfo = {};

  var collections = [];

  $scope.init = function() {
    var signedIn = false
    chrome.storage.sync.get('token', function(value) {
      $scope.userToken = value.token
      console.log($scope.userToken === null);
      if ($scope.userToken == null) {
        console.log('logged out');
        $('#sign_up_box').show();
      } else {
        console.log('loggedin');
        $.get('http://www.marq.com:3000/api/v1/api_collections.json', { token : $scope.userToken }, function(data) {
          var collections = data;
          angular.forEach(collections, function(collection) {
            var collectionItem = "<li class='collection-item' data-collection-id='"+collection.id+"'>"+collection.name+"</li>"
            $('#collection_dropdown').append(collectionItem);
          });
        });
        $('#nav_bar').show();
        $('#dropzone_form').show();
        // get s3 policy and sig
        $.get('http://www.marq.com:3000/api/v1/images/sign.json', { token : $scope.userToken }, function(data) {
          $('#s3_sig').val(data.sig);
          $('#s3_policy').val(data.policy);
          //create uuid for image upload
          $scope.uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r, v;
            r = Math.random() * 16 | 0;
            v = c === 'x' ? r : r & 0x3 | 0x8;
            return v.toString(16);
          });
          s3_url = "preprocess/" + $scope.uuid + "/" + $scope.uuid
          $('#s3_key').val(s3_url)
        });
      }
    });
  };

  $scope.logoutUser = function() {
    $scope.userToken = {};
    $('#signup_form').hide();
    $('#login_form').show();
    $('#nav_bar').hide();
    $('#sign_up_box').show();
    $('#dropzone_form').hide();
    chrome.storage.sync.remove('token', function() {
      console.log('user logged out and chrome storage removed');
    });
  };

  $scope.showSignupForm = function() {
    $('#login_form').hide();
    $('#signup_form').show();
    $('#via_account').text('create an account below');
  };

  $scope.showLoginForm = function() {
    $('#signup_form').hide();
    $('#login_form').show();
    $('#via_account').text('login via your Marqueed account');
  };

  $scope.signupUser = function() {
    first_name = $('#signup_first_name').val()
    last_name = $('#signup_last_name').val()
    email = $('#signup_email').val()
    password = $('#signup_password').val()
    $.ajax({
      type: 'post',
      url: 'http://www.marq.com:3000/api/v1/api_users.json',
      data: {
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: password
      },
      success: function(res) {
        console.log(res.token);
        if (res.token) {
          $('#sign_up_box').hide();
          $("#nav_bar").show();
          $('#drag_drop').show();
          $('#dropzone_form').show();
          chrome.storage.sync.set({'token': res.token}, function() {
            console.log('Settings saved');
            // get user info and collections from MQ API
            $.get('http://www.marq.com:3000/api/v1/api_collections.json', { token : res.token }, function(data) {
              var collections = data;
              angular.forEach(collections, function(collection) {
                var collectionItem = "<li class='collection-item' ng-click='collectionSelected()' data-collection-id='"+collection.id+"'>"+collection.name+"</li>"
                $('#collection_dropdown').append(collectionItem);
              });
            });
          $('#nav_bar').show();
          $('#dropzone_form').show();
          // get s3 policy and sig
          $.get('http://www.marq.com:3000/api/v1/images/sign.json', { token : $scope.userToken }, function(data) {
            $('#s3_sig').val(data.sig);
            $('#s3_policy').val(data.policy);
            //create uuid for image upload
            $scope.uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              var r, v;
              r = Math.random() * 16 | 0;
              v = c === 'x' ? r : r & 0x3 | 0x8;
              return v.toString(16);
            });
            s3_url = "preprocess/" + $scope.uuid + "/" + $scope.uuid
            $('#s3_key').val(s3_url)
          });

          });
        } else {
          message("Invalid Email or Password, please try again");
        }
      }
    });
  };

  $scope.loginUser = function() {
    email = $('#login_email').val()
    password = $('#login_password').val()
    $.ajax({
      type: 'post',
      url: 'http://www.marq.com:3000/api/v1/tokens.json',
      data: {
        email: email,
        password: password
      },
      success: function(res) {
        console.log(res.token);
        if (res.token) {
          $('#sign_up_box').hide();
          $("#nav_bar").show();
          $('#drag_drop').show();
          $('#dropzone_form').show();
          chrome.storage.sync.set({'token': res.token}, function() {
            console.log('Settings saved');
            // get user info and collections from MQ API
            $.get('http://www.marq.com:3000/api/v1/api_collections.json', { token : res.token }, function(data) {
              var collections = data;
              angular.forEach(collections, function(collection) {
                var collectionItem = "<li class='collection-item' ng-click='collectionSelected()' data-collection-id='"+collection.id+"'>"+collection.name+"</li>"
                $('#collection_dropdown').append(collectionItem);
              });
            });
            $('#nav_bar').show();
            $('#dropzone_form').show();
            // get s3 policy and sig
            $.get('http://www.marq.com:3000/api/v1/images/sign.json', { token : $scope.userToken }, function(data) {
              $('#s3_sig').val(data.sig);
              $('#s3_policy').val(data.policy);
              //create uuid for image upload
              $scope.uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r, v;
                r = Math.random() * 16 | 0;
                v = c === 'x' ? r : r & 0x3 | 0x8;
                return v.toString(16);
              });
              s3_url = "preprocess/" + $scope.uuid + "/" + $scope.uuid
              $('#s3_key').val(s3_url)
            });

          });
        } else {
          message("Invalid Email or Password, please try again");
        }
      }
    });
  };

  $scope.collectionSelected = function() {
    console.log("col select");
  };

  $scope.saveImage = function() {
    console.log("yeeeee")
    console.log($('#s3_key').val().split('/')[2]);
    // on complete save image and get url
    collectionId = $('#selected_collection').data('collection-id')
    $.ajax({
      type: 'post',
      url: 'http://www.marq.com:3000/api/v1/api_images.json',
      data: {
        token: $scope.userToken,
        collection_id: collectionId,
        uuid: $scope.uuid,
      },
      success: function(res) {
        console.log(res);
        openTab(res.url);
      }
    })
  };

}


// 
$('#collection_dropdown').on('click', '.collection-item', function(e) {
  var collectionName;
  collectionName = $(this).text();
  collectionId = $(this).data("collection-id");
  $('#selected_collection').html(collectionName + " <div class='arrow-down'></div>");
  $('#selected_collection').data('collection-id', collectionId);
  $('#collection_dropdown').hide();
  console.log($('#selected_collection'));
});

function openTab(url) { 
    var a = document.createElement('a'); 
    a.href = url; 
    a.target='_blank'; 
    a.click(); 
}

// function onError(e) {
//   console.log(e);
// }

// FILESYSTEM SUPPORT ----------------------------------------------------------
// var fs = null;
// var FOLDERNAME = 'test';

// function writeFile(blob) {
//   if (!fs) {
//     return;
//   }

//   fs.root.getDirectory(FOLDERNAME, {create: true}, function(dirEntry) {
//     dirEntry.getFile(blob.name, {create: true, exclusive: false}, function(fileEntry) {
//       // Create a FileWriter object for our FileEntry, and write out blob.
//       fileEntry.createWriter(function(fileWriter) {
//         fileWriter.onerror = onError;
//         fileWriter.onwriteend = function(e) {
//           console.log('Write completed.');
//         };
//         fileWriter.write(blob);
//       }, onError);
//     }, onError);
//   }, onError);
// }
// -----------------------------------------------------------------------------

// var marqueedApp = angular.module('marqueedApp', []);

// marqueedApp.controller('DocsController', ['$scope', '$http', DocsController]);


// marqueedApp.factory('gdocs', function() {
//   var gdocs = new GDocs();

//   var dnd = new DnDFileController('body', function(files) {
//     var $scope = angular.element(this).scope();
//     Util.toArray(files).forEach(function(file, i) {
//       gdocs.upload(file, function() {
//         $scope.fetchDocs();
//       });
//     });
//   });

//   return gdocs;
// });

//marqueedApp.service('gdocs', GDocs);
//marqueedApp.controller('DocsController', ['$scope', '$http', DocsController]);

// Main Angular controller for app.
// function DocsController($scope, $http, gdocs) {
//   $scope.docs = [];

//   // Response handler that caches file icons in the filesystem API.
//   function successCallbackWithFsCaching(resp, status, headers, config) {
//     var docs = [];

//     var totalEntries = resp.feed.entry.length;

//     resp.feed.entry.forEach(function(entry, i) {
//       var doc = {
//         title: entry.title.$t,
//         updatedDate: Util.formatDate(entry.updated.$t),
//         updatedDateFull: entry.updated.$t,
//         icon: gdocs.getLink(entry.link,
//                             'http://schemas.google.com/docs/2007#icon').href,
//         alternateLink: gdocs.getLink(entry.link, 'alternate').href,
//         size: entry.docs$size ? '( ' + entry.docs$size.$t + ' bytes)' : null
//       };

//       // 'http://gstatic.google.com/doc_icon_128.png' -> 'doc_icon_128.png'
//       doc.iconFilename = doc.icon.substring(doc.icon.lastIndexOf('/') + 1);

//       // If file exists, it we'll get back a FileEntry for the filesystem URL.
//       // Otherwise, the error callback will fire and we need to XHR it in and
//       // write it to the FS.
//       var fsURL = fs.root.toURL() + FOLDERNAME + '/' + doc.iconFilename;
//       window.webkitResolveLocalFileSystemURL(fsURL, function(entry) {
//         console.log('Fetched icon from the FS cache');

//         doc.icon = entry.toURL(); // should be === to fsURL, but whatevs.

//         $scope.docs.push(doc);

//         // Only want to sort and call $apply() when we have all entries.
//         if (totalEntries - 1 == i) {
//           $scope.docs.sort(Util.sortByDate);
//           $scope.$apply(function($scope) {}); // Inform angular we made changes.
//         }
//       }, function(e) {

//         $http.get(doc.icon, {responseType: 'blob'}).success(function(blob) {
//           console.log('Fetched icon via XHR');

//           blob.name = doc.iconFilename; // Add icon filename to blob.

//           writeFile(blob); // Write is async, but that's ok.

//           doc.icon = window.URL.createObjectURL(blob);

//           $scope.docs.push(doc);
//           if (totalEntries - 1 == i) {
//             $scope.docs.sort(Util.sortByDate);
//           }
//         });

//       });
//     });
//   }

  // $scope.fetchDocs = function() {
  //   $scope.docs = []; // Clear out old results.

  //   var config = {
  //     params: {'alt': 'json'},
  //     headers: {
  //       'Authorization': 'Bearer ' + gdocs.accessToken,
  //       'GData-Version': '3.0'
  //     }
  //   };

  //   $http.get(gdocs.DOCLIST_FEED, config).success(successCallbackWithFsCaching);
  // };

  // Invoke on ctor call. Fetch docs after we have the oauth token.
  // gdocs.auth(function() {
  //   $scope.fetchDocs();
  // });
// }

// DocsController.$inject = ['$scope', '$http', 'gdocs']; // For code minifiers.

// Init setup and attach event listeners.
// document.addEventListener('DOMContentLoaded', function(e) {
//   var closeButton = document.querySelector('#close-button');
//   closeButton.addEventListener('click', function(e) {
//     window.close();
//   });

//   // FILESYSTEM SUPPORT --------------------------------------------------------
//   window.webkitRequestFileSystem(TEMPORARY, 1024 * 1024, function(localFs) {
//     fs = localFs;
//   }, onError);
//   // ---------------------------------------------------------------------------
// });


// $(document).ready(function() {
//   $('#signup_account').click(function() {
//     $('#login_form').hide();
//     $('#signup_form').show();
//     $('#via_account').text('create an account below');
//   });

//   $('#login_account').click(function() {
//     $('#signup_form').hide();
//     $('#login_form').show();
//     $('#via_account').text('login via your Marqueed account');
//   });
// });