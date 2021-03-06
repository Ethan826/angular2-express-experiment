System.register(["angular2/core", "angular2/router", "./account.service", "angular2/http", "./login.service"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, router_1, account_service_1, http_1, login_service_1;
    var NavComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (account_service_1_1) {
                account_service_1 = account_service_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (login_service_1_1) {
                login_service_1 = login_service_1_1;
            }],
        execute: function() {
            /**
             * Navigation component. Links show or hide based on logged in user. Displays
             * a greeting to the signed in user.
             */
            NavComponent = (function () {
                function NavComponent(accountService, loginService) {
                    this.accountService = accountService;
                    this.loginService = loginService;
                }
                NavComponent.prototype.ngOnInit = function () {
                    var _this = this;
                    this.loginService.loginEvent.subscribe(function (jwtResult) {
                        _this.jwtResult = jwtResult;
                    });
                };
                NavComponent.prototype.hasPermission = function (permittedAudiences) {
                    if (this.jwtResult && this.jwtResult.aud) {
                        return permittedAudiences.indexOf(this.jwtResult.aud) >= 0;
                    }
                    else {
                        return false;
                    }
                };
                NavComponent.prototype.isLoggedIn = function () {
                    return Boolean(this.jwtResult && this.jwtResult.aud);
                };
                NavComponent = __decorate([
                    core_1.Component({
                        selector: "nav-component",
                        directives: [router_1.ROUTER_DIRECTIVES],
                        providers: [http_1.HTTP_PROVIDERS],
                        template: "\n    <nav class=\"navbar navbar-default navbar-fixed-top\">\n      <div class=\"container col-md-8 col-md-offset-2 col-xs-10 col-xs-offset-1\">\n        <div class=\"navbar-header\">\n          <button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#navbar\" aria-expanded=\"false\" aria-controls=\"navbar\">\n            <span class=\"sr-only\">Toggle navigation</span>\n            <span class=\"icon-bar\"></span>\n            <span class=\"icon-bar\"></span>\n            <span class=\"icon-bar\"></span>\n          </button>\n          <a class=\"navbar-brand\" href=\"#\">Diet Tracker</a>\n        </div>\n        <div id=\"navbar\" class=\"navbar-collapse collapse\">\n          <ul class=\"nav navbar-nav\">\n            <li *ngIf=\"hasPermission(['standard', 'admin'])\">\n              <a [routerLink]=\"['/DailyForm']\">Daily</a>\n            <li *ngIf=\"hasPermission(['standard', 'admin'])\">\n              <a [routerLink]=\"['/Entries']\">Entries</a>\n            <li *ngIf=\"hasPermission(['standard', 'admin'])\">\n              <a [routerLink]=\"['/MonthlyForm']\">Monthly</a>\n            </li>\n            <li *ngIf=\"!isLoggedIn()\">\n              <a [routerLink]=\"['/Login']\">Login</a>\n            <li *ngIf=\"!isLoggedIn()\">\n              <a [routerLink]=\"['/CreateUser']\">Create User</a>\n            </li>\n            <li *ngIf=\"isLoggedIn()\">\n              <a [routerLink]=\"['/Login']\"\n                   (click)=\"accountService.logout()\">Logout</a>\n            </li>\n          </ul>\n          <p *ngIf=\"jwtResult && jwtResult.username\"\n            class=\"nav navbar-text navbar-right\">Logged in as {{jwtResult.username}}\n          </p>\n        </div>\n      </div>\n    </nav>\n"
                    }), 
                    __metadata('design:paramtypes', [account_service_1.AccountService, login_service_1.LoginService])
                ], NavComponent);
                return NavComponent;
            }());
            exports_1("NavComponent", NavComponent);
        }
    }
});
