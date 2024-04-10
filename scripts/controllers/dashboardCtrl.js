//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('DashboardCtrl', ['$scope', 'api','$location', function ($scope, api, $location) {
     
      if (api.isAuthed()) {
          api.getProfile()
    .then(function (prof) {
        if (prof.account_type == 'user') {
            $location.path('/account/' + prof.main_account);
        }
        $scope.profile = prof;
        $scope.load();
     //   WidgetsStats.init();
        return api.getAccounts()
    })
    .then(function (acc) {
        $scope.accounts = acc.accounts;
        $scope.account_names = [];
        $scope.accounts.forEach(function (a) {
            $scope.account_names[a._id] = a.account_name;
        });
        return api.getDashboard()
    })
    .then(function (d) {
        $scope.dash_data = d;
        $scope.countries = [];
        $scope.cdata = [];
        d.top5_countries_topup_amount.forEach(function (line) {
            $scope.countries.push(line['_id']);
            var la = line['amount'].toFixed(2);
            $scope.cdata.push(la)
        })
        $scope.cco_labels = []
        $scope.cco_data = []
        d.top5_countries_topup_count.forEach(function (line) {
            var lab;
            if (line['_id'] == null) {
                lab = 'No Country';
            } else {
                lab = line['_id'];
            }
            $scope.cco_labels.push(lab)
            $scope.cco_data.push(line['count']);
        })
        $scope.cca_labels = [];
        $scope.cca_data = [];
        d.top5_accounts_topup_amount.forEach(function (line) {
            $scope.cca_labels.push($scope.account_names[line._id]);
            $scope.cca_data.push(line.amount.toFixed(2));
        })
        $scope.ccc_labels = [];
        $scope.ccc_data = [];
        d.top5_accounts_topup_count.forEach(function (line ) {
            $scope.ccc_labels.push($scope.account_names[line._id]);
            $scope.ccc_data.push(line.count);
        });
        $scope.coc_labels = [];
        $scope.coc_data = [];
        var top5;
        d.top5_operations_bycode.forEach(function (line) {
            var lab;
            if (line['_id'] == null) {
                lab = 'Unknown Code';
            } else {
                lab = line['_id'];
            }
            $scope.coc_labels.push(lab)
            $scope.coc_data.push(line.count);
            top5  += line.count;
        });
        if ( (d.total_operations_count - top5) > 0 ) {

            //we have other
            var res = d.total_operations_count - top5;
            $scope.coc_labels.push('Other');
            $scope.coc_data.push(res);
        }
        return api.getProviders();
    })
    .then(function (prov) {
        $scope.providers = prov.providers;
    })
     var resizePageContent = function() {
                     page            = $('#page-container');
        pageContent     = $('#page-content');
        header          = $('header');
        footer          = $('#page-content + footer');
        sidebar         = $('#sidebar');
        sidebarAlt      = $('#sidebar-alt');
        sScroll         = $('.sidebar-scroll');

        var windowH         = $(window).height();
        var sidebarH        = sidebar.outerHeight();
        var sidebarAltH     = sidebarAlt.outerHeight();
        var headerH         = header.outerHeight();
        var footerH         = footer.outerHeight();

        // If we have a fixed sidebar/header layout or each sidebars’ height < window height
        if (header.hasClass('navbar-fixed-top') || header.hasClass('navbar-fixed-bottom') || ((sidebarH < windowH) && (sidebarAltH < windowH))) {
            if (page.hasClass('footer-fixed')) { // if footer is fixed don't remove its height
                pageContent.css('min-height', windowH - headerH + 'px');
            } else { // else if footer is static, remove its height
                pageContent.css('min-height', windowH - (headerH + footerH) + 'px');
            }
        }  else { // In any other case set #page-content height the same as biggest sidebar's height
            if (page.hasClass('footer-fixed')) { // if footer is fixed don't remove its height
                pageContent.css('min-height', ((sidebarH > sidebarAltH) ? sidebarH : sidebarAltH) - headerH + 'px');
            } else { // else if footer is static, remove its height
                pageContent.css('min-height', ((sidebarH > sidebarAltH) ? sidebarH : sidebarAltH) - (headerH + footerH) + 'px');
            }
        }
    };
            $scope.load = function () {
                  var link = $("#home");
        var upSpeed     = 250;
        var downSpeed   = 250;
                    link.addClass('open').next().slideDown(downSpeed);
                    // Resize #page-content to fill empty space if exists
                    setTimeout(resizePageContent, ((upSpeed > downSpeed) ? upSpeed : downSpeed));
                    $("#appdash").css('active');
          
                }

      } else {
          $location.path('/login');
      }
    
  }]);
