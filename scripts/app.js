'use strict';

/**
 * @ngdoc overview
 * @name billinguiApp
 * @description
 * # billinguiApp
 *
 * Main module of the application.
 */
angular
  .module('billinguiApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.router',
    'paclient',
    'pascalprecht.translate',
    'ngFileUpload',
    'ui.bootstrap',
    'ngCsv',
    'chart.js',
    'colorpicker.module',
    'selectize',
    'autocomplete',
  'ngProgress',
    'oitozero.ngSweetAlert',
    'angular-timezone-selector'
  ])
  .config(['$translateProvider', function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
      prefix: 'data/locale-',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('en');
    //$translateProvider.useSanitizeValueStrategy('sanitize');
  }])
  .config(function ($stateProvider, $urlRouterProvider, ChartJsProvider) {
    ChartJsProvider.setOptions({ colors : [ '#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'] });
    $urlRouterProvider.otherwise('/');

    $stateProvider
    .state('app', {
      url: '/',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/main.html',
          controller: 'DashboardCtrl'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('accountList', {
      url: '/accounts/:filter',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/accounts.html',
          controller: 'AccountsController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('newAccount', {
      url: '/account/new',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/accountNew.html',
          controller: 'NewAccountController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('accountView', {
      url: '/account/:id',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/accountView.html',
          controller: 'AccountController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
        .state('providerList', {
      url: '/providers',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/providers.html',
          controller: 'ProviderController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
     .state('pTab', {
      url: '/system/price-tables',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/pricetables.html',
          controller: 'PriceTableController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('batchView', {
      url: '/pins/:id',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/pins.html',
          controller: 'PinListController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
	.state('ticketList', {
      url: '/tickets/',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/tickets.html',
          controller: 'TicketListController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
 .state('ticketView', {
      url: '/tickets/:id',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/ticketView.html',
          controller: 'TicketController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
      
    .state('pinSearch', {
      url: '/pinsearch',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/pinsearch.html',
          controller: 'PinSearchController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
       .state('tList', {
      url: '/topuplogs',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/topuplog.html',
          controller: 'TopupListController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('provMaps', {
      url: '/provmap',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/mapping.html',
          controller: 'MappingController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
      .state('pinBatchList', {
      url: '/pins',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/pinbatches.html',
          controller: 'PinBatchListController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
       .state('transactionList', {
      url: '/transactions',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/transactions.html',
          controller: 'TransactionListController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
      .state('userList', {
      url: '/users',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/users.html',
          controller: 'UsersController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
     .state('rateList', {
      url: '/rates',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/rates.html',
          controller: 'RateListController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
     .state('credsList', {
      url: '/credentials',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/credentials.html',
          controller: 'CredentialsController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
      .state('settingList', {
      url: '/settings',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/settings.html',
          controller: 'SettingController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('newAgent', {
      url: '/account/:id/accounts/new',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/agentNew.html',
          controller: 'NewAgentController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('newItem', {
      url: '/account/:account/items/new',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/itemNew.html',
          controller: 'NewItemController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
        .state('itemView', {
      url: '/account/:account/items/:id',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/itemView.html',
          controller: 'ItemController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('logout', {
      url : '/logout',
      views : {
        'login' : {
          templateUrl : 'views/partials/login.html',
          controller : 'LogoutController'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_login.html'
        }
      }
    })
    .state('login', {
      url: '/login',
      views: {
        'login' : {
          templateUrl: 'views/partials/login.html',
          controller : 'LoginCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_login.html'
        }
      }
    });
  }).directive('datetimepickerNeutralTimezone', function() {
    return {
      restrict: 'A',
      priority: 1,
      require: 'ngModel',
      link: function (scope, element, attrs, ctrl) {
        ctrl.$formatters.push(function (value) {
          var date = new Date(Date.parse(value));
          date = new Date(date.getTime() + (60000 * date.getTimezoneOffset()));
          return date;
        });

        ctrl.$parsers.push(function (value) {
          var date = new Date(value.getTime() - (60000 * value.getTimezoneOffset()));
          return date;
        });
      }
    };
  });
