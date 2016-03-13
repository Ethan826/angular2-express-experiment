System.register(["angular2/core", "angular2/common", "angular2/router", "./account.service", "angular2/http"], function(exports_1, context_1) {
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
    var core_1, common_1, router_1, account_service_1, http_1;
    var NAV_OPTIONS, NavComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (common_1_1) {
                common_1 = common_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (account_service_1_1) {
                account_service_1 = account_service_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            }],
        execute: function() {
            NAV_OPTIONS = [
                { text: "Daily Tracker", route: "/DailyForm", audience: ["standard", "admin"] },
                { text: "Monthly View", route: "/MonthlyForm", audience: ["standard", "admin"] },
                { text: "Login", route: "/Login", audience: ["any"] },
                { text: "New User", route: "/CreateUser", audience: ["any"] },
            ];
            NavComponent = (function () {
                function NavComponent(accountService, router) {
                    this.accountService = accountService;
                    this.router = router;
                    this.navOptions = NAV_OPTIONS;
                }
                NavComponent.prototype.logout = function () {
                    localStorage.removeItem("jwt");
                    this.router.navigate["/Login"];
                };
                NavComponent = __decorate([
                    core_1.Component({
                        selector: "nav-component",
                        directives: [common_1.NgClass, router_1.ROUTER_DIRECTIVES],
                        providers: [account_service_1.AccountService, http_1.HTTP_PROVIDERS],
                        template: "\n    <nav class=\"navbar navbar-default navbar-fixed-top\">\n      <div class=\"container col-md-8 col-md-offset-2 col-xs-10 col-xs-offset-1\">\n        <div class=\"navbar-header\">\n          <button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#navbar\" aria-expanded=\"false\" aria-controls=\"navbar\">\n            <span class=\"sr-only\">Toggle navigation</span>\n            <span class=\"icon-bar\"></span>\n            <span class=\"icon-bar\"></span>\n            <span class=\"icon-bar\"></span>\n          </button>\n          <a class=\"navbar-brand\" href=\"#\">Diet Tracker</a>\n        </div>\n        <div id=\"navbar\" class=\"navbar-collapse collapse\">\n          <ul class=\"nav navbar-nav\">\n            <li *ngFor=\"#navOption of navOptions\">\n              <a [routerLink]=\"[navOption.route]\">{{navOption.text}}</a>\n            </li>\n            <li><a (click)=\"logout()\" href=\"#\">Logout</a></li>\n          </ul>\n        </div>\n      </div>\n    </nav>\n"
                    }), 
                    __metadata('design:paramtypes', [account_service_1.AccountService, router_1.Router])
                ], NavComponent);
                return NavComponent;
            }());
            exports_1("NavComponent", NavComponent);
        }
    }
});
