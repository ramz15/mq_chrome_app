var marqueedApp = angular.module('marqueedApp', []);

marqueedApp.controller('MarqueedController', ['$scope', MarqueedController]);

function MarqueedController($scope) {

  $scope.userToken = {};
  $scope.tabSetting = true;

  var collections = [];

  $scope.init = function() {
    var signedIn = false
    chrome.storage.sync.get('token', function(value) {
      $scope.userToken = value.token;
      if ($scope.userToken == null) {
        $('#sign_up_box').show();
      } else {
        $.get('https://www.marqueed.com/api/v1/api_collections.json', { token : $scope.userToken }, function(data) {
          var collections = data;
          angular.forEach(collections, function(collection) {
            var collectionItem = "<li class='collection-item' data-collection-id='"+collection.id+"'>"+collection.name+"</li>"
            $('#collection_dropdown').append(collectionItem);
          });
        });
        $('#nav_bar').show();
        $('#top_nav').show();
        $('#dropzone_form').show();
        // get s3 policy and sig
        $.get('https://www.marqueed.com/api/v1/images/sign.json', { token : $scope.userToken }, function(data) {
          $('#s3_sig').val(data.sig);
          $('#s3_policy').val(data.policy);
          //create uuid for image upload
          $scope.uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r, v;
            r = Math.random() * 16 | 0;
            v = c === 'x' ? r : r & 0x3 | 0x8;
            return v.toString(16);
          });
          var s3_url = "preprocess/" + $scope.uuid + "/" + $scope.uuid;
          $('#s3_key').val(s3_url);
        });
      }
    });
    chrome.storage.sync.get('tabSetting', function(value) {
      if (value.tabSetting == false) {
        console.log("falseyyy");
        $scope.tabSetting = false;
        $('#tab_on_off').text('OFF');
      }
    });
  };

  $scope.logoutUser = function() {
    $scope.userToken = {};
    $('#signup_form').hide();
    $('#loading').hide();
    $('#login_form').show();
    $('#nav_bar').hide();
    $('#sign_up_box').show();
    $('#dropzone_form').hide();
    $('#top_nav').hide();
    $('#recent_uploads').hide();
    $('#collection_dropdown').html('');
    $('#selected_collection').html('From my computer <div class="arrow-down"></div>');
    $('#selected_collection').data('collection-id', '');
    $('.new-image-link').remove();
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
    $('#loading').show();
    first_name = $('#signup_first_name').val()
    last_name = $('#signup_last_name').val()
    email = $('#signup_email').val()
    password = $('#signup_password').val()
    $.ajax({
      type: 'post',
      url: 'https://www.marqueed.com/api/v1/api_users.json',
      data: {
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: password,
        from_chrome_app: true,
      },
      error: function(xhr, statusText, err){
        $('#invalid').text(xhr.responseJSON.message);
        $('#invalid').show();
        $('#loading').hide();
      },
      success: function(res) {
        if (res.token) {
          $('#sign_up_box').hide();
          $("#nav_bar").show();
          $('#top_nav').show();
          $('#drag_drop').show();
          $('#dropzone_form').show();
          $('#drag_drop_image').show();
          chrome.storage.sync.set({'token': res.token}, function() {
            $scope.userToken = res.token;
            // get user info and collections from MQ API
            $.get('https://www.marqueed.com/api/v1/api_collections.json', { token : res.token }, function(data) {
              var collections = data;
              angular.forEach(collections, function(collection) {
                var collectionItem = "<li class='collection-item' ng-click='collectionSelected()' data-collection-id='"+collection.id+"'>"+collection.name+"</li>"
                $('#collection_dropdown').append(collectionItem);
              });
            });
          $('#nav_bar').show();
          $('#dropzone_form').show();
          // get s3 policy and sig
          $.get('https://www.marqueed.com/api/v1/images/sign.json', { token : $scope.userToken }, function(data) {
            $('#s3_sig').val(data.sig);
            $('#s3_policy').val(data.policy);
            //create uuid for image upload
            $scope.uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              var r, v;
              r = Math.random() * 16 | 0;
              v = c === 'x' ? r : r & 0x3 | 0x8;
              return v.toString(16);
            });
            var s3_url = "preprocess/" + $scope.uuid + "/" + $scope.uuid;
            $('#s3_key').val(s3_url);
          });

          });
        } else {
          alert("Invalid Email or Password, please try again");
        }
      }
    });
  };

  $scope.loginUser = function() {
    $('#loading').show();
    $('#invalid').hide()
    email = $('#login_email').val()
    password = $('#login_password').val()
    $.ajax({
      type: 'post',
      url: 'https://www.marqueed.com/api/v1/tokens.json',
      data: {
        email: email,
        password: password,
        from_chrome_app: true,
      },
      error: function(xhr, statusText, err){
        $('#invalid').show();
        $('#loading').hide();
      },
      success: function(res) {
        if (res.token) {
          $('#sign_up_box').hide();
          $('#top_nav').show();
          $("#nav_bar").show();
          $('#drag_drop').show();
          $('#dropzone_form').show();
          $('#drag_drop_image').show();
          chrome.storage.sync.set({'token': res.token}, function() {
            $scope.userToken = res.token;
            // get user info and collections from MQ API
            $.get('https://www.marqueed.com/api/v1/api_collections.json', { token : res.token }, function(data) {
              var collections = data;
              angular.forEach(collections, function(collection) {
                var collectionItem = "<li class='collection-item' ng-click='collectionSelected()' data-collection-id='"+collection.id+"'>"+collection.name+"</li>"
                $('#collection_dropdown').append(collectionItem);
              });
            });
            $('#nav_bar').show();
            $('#dropzone_form').show();
            // get s3 policy and sig
            $.get('https://www.marqueed.com/api/v1/images/sign.json', { token : $scope.userToken }, function(data) {
              $('#s3_sig').val(data.sig);
              $('#s3_policy').val(data.policy);
              //create uuid for image upload
              $scope.uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r, v;
                r = Math.random() * 16 | 0;
                v = c === 'x' ? r : r & 0x3 | 0x8;
                return v.toString(16);
              });
              var s3_url = "preprocess/" + $scope.uuid + "/" + $scope.uuid;
              $('#s3_key').val(s3_url);
            });

          });
        } else {
          alert("Invalid Email or Password, please try again");
        }
      }
    });
  };

  $scope.googleLogin = function() {
    $('#loading').show();
    chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
      // Use the token.
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://www.googleapis.com/oauth2/v3/userinfo?scope=email');
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);

      xhr.onload = function () {
        // if (this.status === 401) {
        //   retry = false;
        //   chrome.identity.removeCachedAuthToken(
        //       { 'token': token },
        //       getTokenAndXhr);
        //   return;
        // }

        var googleRes;
        googleRes = jQuery.parseJSON(this.responseText);
        $.ajax({
          type: 'post',
          url: 'https://www.marqueed.com/api/v1/tokens/google.json',
          data: {
            email: googleRes.email,
            access_token: token,
            code: 123456789,
            from_chrome_app: true,
          },
          success: function(res) {
            if (res.token) {
              $('#sign_up_box').hide();
              $('#top_nav').show();
              $("#nav_bar").show();
              $('#drag_drop').show();
              $('#dropzone_form').show();
              $('#drag_drop_image').show();
              chrome.storage.sync.set({'token': res.token}, function() {
                $scope.userToken = res.token;
                // get user info and collections from MQ API
                $.get('https://www.marqueed.com/api/v1/api_collections.json', { token : res.token }, function(data) {
                  var collections = data;
                  angular.forEach(collections, function(collection) {
                    var collectionItem = "<li class='collection-item' ng-click='collectionSelected()' data-collection-id='"+collection.id+"'>"+collection.name+"</li>"
                    $('#collection_dropdown').append(collectionItem);
                  });
                });
                $('#nav_bar').show();
                $('#dropzone_form').show();
                // get s3 policy and sig
                $.get('https://www.marqueed.com/api/v1/images/sign.json', { token : $scope.userToken }, function(data) {
                  $('#s3_sig').val(data.sig);
                  $('#s3_policy').val(data.policy);
                  //create uuid for image upload
                  $scope.uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r, v;
                    r = Math.random() * 16 | 0;
                    v = c === 'x' ? r : r & 0x3 | 0x8;
                    return v.toString(16);
                  });
                  var s3_url = "preprocess/" + $scope.uuid + "/" + $scope.uuid;
                  $('#s3_key').val(s3_url);
                });

              });
            } else {
              alert("Invalid Email or Password, please try again");
            }
          }
        });

        // callback(null, this.status, this.responseText);
      }
      xhr.send();
    });
  };

  $scope.collectionSelected = function() {
    console.log("col select");
  };

  $scope.saveImage = function() {
    var uuid = ($('#s3_key').val().split('/')[2]);
    // on complete save image and get url
    var collectionId = $('#selected_collection').data('collection-id')
    $.ajax({
      type: 'post',
      url: 'https://www.marqueed.com/api/v1/api_images.json',
      data: {
        token: $scope.userToken,
        collection_id: collectionId,
        image_uuid: uuid,
        from_chrome_app: true,
      },
      success: function(res) {
        if ($scope.tabSetting) {
          $('section').hide();
          $('#back_to_uploader').show();
          $('#back_to_uploader').after("<webview id='webview' src='"+res.long_url+"?token="+$scope.userToken+"' style='width:900px; height:700px' autosize='on'></webview>");
          $("#webview").animate({right:0},1200,showSpinner);
          function showSpinner(){
            $("#webview_spinner_box").fadeIn();
            setTimeout(function(){$("#webview_spinner_box").hide();},4000);
          }
        }

        $('.latest-upload').append("<a class='new-upload-url' href='"+res.long_url+"?token="+$scope.userToken+"'>" + res.url + "</a>");
        $('.latest-upload').wrap("<a class='new-image-link' href='"+res.long_url+"?token="+$scope.userToken+"' />");
        $('.latest-upload').removeClass("latest-upload");
        $scope.uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r, v;
          r = Math.random() * 16 | 0;
          v = c === 'x' ? r : r & 0x3 | 0x8;
          return v.toString(16);
        });
        var s3_url = "preprocess/" + $scope.uuid + "/" + $scope.uuid;
        $('#s3_key').val(s3_url);
        $('#short_url').val(res.url);
        $('#short_url').select();
        document.execCommand("Copy");
      }
    })
  };

  // turn tab setting on/off
  $scope.changeTabSetting = function() {
    $scope.tabSetting = !$scope.tabSetting;
    chrome.storage.sync.set({'tabSetting': $scope.tabSetting}, function() {
      if ($('#tab_on_off').text() == "ON") {
        $('#tab_on_off').text("OFF");
      } else {
        $('#tab_on_off').text("ON");
      }
    });

  };

  $scope.backUploader = function () {
    $("#webview").animate({right:900},"slow",showUploader);
    $('#back_to_uploader').animate({right:900},"slow",resetUploaderBar);
    function showUploader(){
      $('section').show();
    }
    function resetUploaderBar() {
      $('#back_to_uploader').hide();
      $('#back_to_uploader').css('right', '0px');
    }
  };

  $('body').on('click', '.new-image-link', function(e) {
    e.preventDefault();
    var openUrl = $(this).attr("href");
    $('section').hide();
    $('#back_to_uploader').show();
    $('#back_to_uploader').after("<webview id='webview' src='"+openUrl+"' style='width:900px; height:700px' autosize='on'></webview>");
    $("#webview").animate({right:0},1200,showSpinner);
    function showSpinner(){
      $("#webview_spinner_box").fadeIn();
      setTimeout(function(){$("#webview_spinner_box").hide();},4000);
    }
  });

}

// select a collection to post to - change collection-id data and text
$('#collection_dropdown').on('click', '.collection-item', function(e) {
  var collectionName;
  collectionName = $(this).text();
  collectionId = $(this).data("collection-id");
  $('#selected_collection').html(collectionName + " <div class='arrow-down'></div>");
  $('#selected_collection').data('collection-id', collectionId);
  $('#collection_dropdown').hide();
});

// open image in a new tab in Chrome browser
function openTab(url) { 
    var a = document.createElement('a'); 
    a.href = url; 
    a.target='_blank'; 
    a.click(); 
}

// hide or show settings dropdown on click
$('html').click(function(e) {
  var target;
  target = $(e.target);
  if ($('#settings_dropdown').is(':visible') && target.attr('id') !== "show_settings" && target.attr('id') !== "tab_setting" && target.attr('id') !== "tab_on_off" ) {
    return $('#settings_dropdown').hide();
  } 
  if (target.attr('id') == "show_settings" && !$('#settings_dropdown').is(':visible')) {
    return $('#settings_dropdown').show();
  } else {
    if (target.attr('id') !== "tab_setting" && target.attr('id') !== "tab_on_off") {
      return $('#settings_dropdown').hide();
    }
  }
});




